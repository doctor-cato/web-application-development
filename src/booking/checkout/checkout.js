import { getCheckout, saveCheckout } from '../../shared/utils/storage.js';
import { createTransaction } from '../../shared/utils/paymentService.js';
import { formatPrice } from '../../explore/home-page/movieService.js';

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
import { getCheckout, saveCheckout } from '../../shared/utils/storage.js';
import { createTransaction } from '../../shared/utils/paymentService.js';
import { formatPrice } from '../../explore/home-page/movieService.js';

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

let currentDiscount = 0;
let currentPromoCode = '';

function updateTotal() {
  const seatsAmountEl = document.getElementById('order-summary-seat-amount');
  const seatsAmount = parseDataAmount(seatsAmountEl);
  const combo = getSelectedCombo();
  
  // Update Combo Row
  const comboRow = document.getElementById('order-summary-combo-row');
  const comboAmountEl = document.getElementById('order-summary-combo-amount');
  if (comboRow && comboAmountEl) {
    if (combo.price > 0) {
      comboRow.style.display = 'flex';
      comboAmountEl.innerText = formatPrice(combo.price);
    } else {
      comboRow.style.display = 'none';
      comboAmountEl.innerText = '0 đ';
    }
  }

  let total = seatsAmount + combo.price;
  
  // Calculate discount
  let discountAmount = 0;
  if (currentPromoCode === 'GIAM50K' && total >= 200000) {
    discountAmount = 50000;
  } else if (currentPromoCode === 'BAPFREE') {
    discountAmount = 65000;
  } else if (currentPromoCode) {
    // Code applied but condition not met or invalid code
    if (currentPromoCode === 'GIAM50K') {
      alert('Đơn hàng chưa đạt tối thiểu 200.000đ để áp dụng mã này.');
      removePromo();
      return;
    }
  }

  currentDiscount = discountAmount;
  
  // Update Discount Row
  const discountRow = document.getElementById('order-summary-discount-row');
  const discountAmountEl = document.getElementById('order-summary-discount-amount');
  if (discountRow && discountAmountEl) {
    if (discountAmount > 0) {
      discountRow.style.display = 'flex';
      discountAmountEl.innerText = '-' + formatPrice(discountAmount);
    } else {
      discountRow.style.display = 'none';
      discountAmountEl.innerText = '-0 đ';
    }
  }

  total = Math.max(0, total - discountAmount);

  const totalEl = document.getElementById('order-total');
  if (totalEl) {
    totalEl.setAttribute('data-amount', total);
    totalEl.innerText = formatPrice(total);
  }
}

function applyPromo(code) {
  currentPromoCode = code.toUpperCase();
  document.getElementById('promo-input').value = currentPromoCode;
  
  updateTotal();
  
  if (currentDiscount > 0) {
    document.getElementById('promo-input-group').style.display = 'none';
    document.getElementById('offers-list').style.display = 'none';
    document.getElementById('applied-promo-container').style.display = 'flex';
    document.getElementById('applied-promo-code').innerText = currentPromoCode;
  }
}

function removePromo() {
  currentPromoCode = '';
  currentDiscount = 0;
  document.getElementById('promo-input').value = '';
  document.getElementById('promo-input-group').style.display = 'flex';
  document.getElementById('applied-promo-container').style.display = 'none';
  updateTotal();
}

function getSelectedCombo() {
  const v = document.querySelector('input[name="combo"]:checked')?.value || 'none';
  return { id: v, price: COMBOS[v] || 0 };
}

function getSelectedPayment() {
  return document.querySelector('input[name="payment"]:checked')?.value || 'momo';
}

function init() {
  startCountdown(5 * 60);
  
  // Attach handlers
  const payBtn = document.getElementById('btn-pay');
  if (payBtn) payBtn.addEventListener('click', handlePayClick);

  // combo radio behavior
  document.querySelectorAll('input[name="combo"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('label.combo-card').forEach(x => x.classList.remove('selected'));
      const card = e.target.closest('.combo-card');
      if (card) card.classList.add('selected');
      updateTotal();
    });
  });

  // payment radio behavior
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('label.payment-card').forEach(x => {
        x.classList.remove('selected-momo', 'selected-vnpay');
        const icon = x.querySelector('i');
        if (icon) icon.style.display = 'none';
      });

      const selectedRadio = e.target;
      const card = selectedRadio.closest('.payment-card');
      if (card) {
        if (selectedRadio.value === 'momo') card.classList.add('selected-momo');
        if (selectedRadio.value === 'vnpay') card.classList.add('selected-vnpay');
        const icon = card.querySelector('i');
        if (icon) icon.style.display = 'block';
      }
    });
  });

  // Promo Code Handlers
  const btnShowOffers = document.getElementById('btn-show-offers');
  const offersList = document.getElementById('offers-list');
  if (btnShowOffers && offersList) {
    btnShowOffers.addEventListener('click', () => {
      offersList.style.display = offersList.style.display === 'none' ? 'flex' : 'none';
    });
  }

  const btnApplyPromo = document.getElementById('btn-apply-promo');
  if (btnApplyPromo) {
    btnApplyPromo.addEventListener('click', () => {
      const val = document.getElementById('promo-input').value.trim();
      if (val) applyPromo(val);
    });
  }

  const btnRemovePromo = document.getElementById('btn-remove-promo');
  if (btnRemovePromo) {
    btnRemovePromo.addEventListener('click', removePromo);
  }

  document.querySelectorAll('.btn-select-offer').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const offerItem = e.target.closest('.offer-item');
      if (offerItem) {
        const code = offerItem.getAttribute('data-code');
        applyPromo(code);
      }
    });
  });

  // render data from session
  renderCheckout();
  updateTotal();
}

function handlePayClick(e) {
  e.preventDefault();
  // read order total (base seats amount) from DOM data attribute
  const seatAmountEl = document.getElementById('order-summary-seat-amount');
  const seatsAmount = parseDataAmount(seatAmountEl);
  const combo = getSelectedCombo();
  const total = seatsAmount + combo.price;

  const checkoutData = {
    // minimal fields used by payment/booking
    movieTitle: document.querySelector('#order-summary-movie')?.innerText || 'Unknown',
    showtimeText: document.querySelector('#order-summary-showtime')?.innerText || '',
    room: document.querySelector('#order-summary-room')?.innerText || '',
    seats: Array.from(document.querySelectorAll('#order-summary-seats .seat-badge')).map(s => s.innerText) || [],
    combo: combo.id,
    total,
    provider: getSelectedPayment()
  };

  // save checkout into session in case needed later
  saveCheckout(checkoutData);

  const transaction = createTransaction(total, getSelectedPayment());
  const txId = transaction.transactionId;
  const provider = transaction.method;
  
  // redirect to payment simulator page
  window.location.href = `payment_simulation.html?provider=${encodeURIComponent(provider)}&txId=${encodeURIComponent(txId)}`;
}

function startCountdown(seconds) {
  const cdEl = document.getElementById('checkout-countdown');
  if (!cdEl) return;
  
  let remain = seconds;
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  
  cdEl.innerText = formatTime(remain);
  
  const timer = setInterval(() => {
    remain--;
    if (remain <= 0) {
      clearInterval(timer);
      cdEl.innerText = '00:00';
      alert('Thời gian giữ ghế đã hết! Vui lòng chọn lại ghế.');
      window.location.href = '../seat-booking/booking.html';
    } else {
      cdEl.innerText = formatTime(remain);
    }
  }, 1000);
}

init();
