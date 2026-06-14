import { getCheckout, saveCheckout } from '/shared/utils/storage.js';
import { createTransaction } from '/shared/utils/paymentService.js';
import { formatPrice } from '/explore/home-page/movieService.js';

const COMBOS = { none: 0, single: 65000, double: 95000 };

function parseDataAmount(el) {
  if (!el) return 0;
  const a = el.getAttribute('data-amount');
  return a ? Number(a) : 0;
}

function renderCheckout() {
  const co = getCheckout();
  if (!co) return;

  // Basic fields
  const titleEl = document.getElementById('order-summary-movie');
  if (titleEl && co.movieTitle) titleEl.innerText = co.movieTitle;

  const posterEl = document.getElementById('order-summary-poster');
  if (posterEl && co.poster) posterEl.src = co.poster;

  if (co.tags && Array.isArray(co.tags)) {
    const tagsEl = document.getElementById('order-summary-tags');
    if (tagsEl) tagsEl.innerHTML = co.tags.map(t => `<span class="text-[10px] bg-primary-container/20 text-primary-container border border-primary-container/40 rounded px-2 py-0.5 font-semibold uppercase tracking-wider">${t}</span>`).join(' ');
  }

  if (co.genre) {
    const g = document.getElementById('order-summary-genre');
    if (g) g.innerText = co.genre;
  }

  const showtimeEl = document.getElementById('order-summary-showtime');
  if (showtimeEl && co.showtimeText) showtimeEl.innerText = co.showtimeText;

  const roomEl = document.getElementById('order-summary-room');
  if (roomEl && co.room) roomEl.innerText = co.room;

  // Seats
  const seatsEl = document.getElementById('order-summary-seats');
  if (seatsEl && Array.isArray(co.seats)) {
    seatsEl.innerHTML = '';
    co.seats.forEach(s => {
      const span = document.createElement('span');
      span.className = 'seat-badge';
      span.innerText = s;
      seatsEl.appendChild(span);
    });
  }

  // amounts
  const seatsAmount = Number(co.seatAmount || co.total || 0) - Number(co.comboPrice || 0);
  const seatAmountEl = document.getElementById('order-summary-seat-amount');
  if (seatAmountEl) {
    seatAmountEl.setAttribute('data-amount', seatsAmount);
    seatAmountEl.innerText = formatPrice(seatsAmount);
  }

  const totalEl = document.getElementById('order-total');
  const total = Number(co.total || 0);
  if (totalEl) {
    totalEl.setAttribute('data-amount', total);
    totalEl.innerText = formatPrice(total);
  }
}

function init() {
  // Attach handlers
  const payBtn = document.getElementById('btn-pay');
  if (payBtn) payBtn.addEventListener('click', handlePayClick);

  // combo radio behavior: update UI selected classes
  document.querySelectorAll('label.combo-card').forEach(l => {
    l.addEventListener('click', () => {
      document.querySelectorAll('label.combo-card').forEach(x => x.classList.remove('selected'));
      l.classList.add('selected');
    });
  });

  document.querySelectorAll('label.payment-card').forEach(l => {
    l.addEventListener('click', () => {
      document.querySelectorAll('label.payment-card').forEach(x => x.classList.remove('selected-momo','selected-vnpay'));
      const inp = l.querySelector('input[name="payment"]');
      if (inp && inp.value === 'momo') l.classList.add('selected-momo');
      if (inp && inp.value === 'vnpay') l.classList.add('selected-vnpay');
    });
  });

  // render data from session
  renderCheckout();
}

function getSelectedCombo() {
  const v = document.querySelector('input[name="combo"]:checked')?.value || 'none';
  return { id: v, price: COMBOS[v] || 0 };
}

function getSelectedPayment() {
  return document.querySelector('input[name="payment"]:checked')?.value || 'momo';
}

function handlePayClick(e) {
  e.preventDefault();
  // read order total (base seats amount) from DOM data attribute
  const totalEl = document.getElementById('order-total');
  const seatsAmount = parseDataAmount(totalEl);
  const combo = getSelectedCombo();
  const total = seatsAmount + combo.price;

  const checkoutData = {
    // minimal fields used by payment/booking
    movieTitle: document.querySelector('#order-summary-movie')?.innerText || 'Unknown',
    showtimeText: document.querySelector('#order-summary-showtime')?.innerText || '',
    room: document.querySelector('#order-summary-room')?.innerText || '',
    seats: Array.from(document.querySelectorAll('#order-summary-seats .badge-seat')).map(s => s.innerText) || [],
    combo: combo.id,
    total,
    provider: getSelectedPayment()
  };

  // save checkout into session in case needed later
  saveCheckout(checkoutData);

  const { txId, provider } = createTransaction(checkoutData);
  // redirect to payment simulator page
  window.location.href = `payment_simulation.html?provider=${encodeURIComponent(provider)}&txId=${encodeURIComponent(txId)}`;
}

document.addEventListener('DOMContentLoaded', init);
