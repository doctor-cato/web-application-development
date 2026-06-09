import { getCheckout, saveCheckout } from '../services/storage.js';
import { createTransaction, getPaymentRedirectUrl } from '../services/paymentService.js';
import { formatPrice } from '../services/movieService.js';

const COMBOS = { none: 0, single: 65000, double: 95000 };

function parseDataAmount(el) {
  if (!el) return 0;
  const a = el.getAttribute('data-amount');
  return a ? Number(a) : 0;
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
