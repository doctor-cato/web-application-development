import { getCheckout, lsSet, KEYS } from '../../shared/utils/storage.js';
import { simulatePayment } from '../../shared/utils/paymentService.js';
import { confirmBooking } from '../seat-booking/bookingService.js';

let countdownTimer = null;
const PAYMENT_TIMEOUT = 300; // seconds

function qs(sel) { return document.querySelector(sel); }

function formatSeconds(s) {
  const mm = String(Math.floor(s/60)).padStart(2,'0');
  const ss = String(s%60).padStart(2,'0');
  return `${mm}:${ss}`;
}

async function handleSuccess(txId) {
  const btn = qs('.btn-success');
  if (btn) btn.innerText = 'Đang xử lý...';
  
  simulatePayment(txId, (result) => {
    if (result.status === 'success') {
      try {
        const checkoutData = getCheckout();
        checkoutData.transactionId = txId;
        const booking = confirmBooking(checkoutData);
        // Lưu ID booking vào session để trang invoice hiển thị
        lsSet(KEYS.LAST_BOOKING, booking);
        window.location.href = './booking_invoice.html';
      } catch (e) {
        console.error(e);
        alert('Xác nhận thất bại: ' + e.message);
      }
    }
  });
}

function handleCancel(txId) {
  // in a real app we'd mark the tx as cancelled in DB
  window.location.href = './checkout.html';
}

function startCountdown(seconds, onExpire) {
  let remaining = seconds;
  const el = qs('.countdown-warning');
  if (!el) return;
  el.textContent = formatSeconds(remaining);
  countdownTimer = setInterval(() => {
    remaining -= 1;
    el.textContent = formatSeconds(remaining);
    if (remaining <= 60) el.classList.add('countdown-warning');
    if (remaining <= 0) {
      clearInterval(countdownTimer);
      onExpire && onExpire();
    }
  }, 1000);
}

function init() {
  const params = new URLSearchParams(window.location.search);
  const provider = params.get('provider') || 'momo';
  const txId = params.get('txId');

  // apply theme
  const logoEl = document.querySelector('.momo-theme-logo');
  if (logoEl) logoEl.textContent = provider.toUpperCase();

  const successBtn = document.querySelector('a[href="booking_invoice.html"]');
  const cancelBtn = document.querySelector('a[href="checkout.html"]');
  
  if (successBtn) {
    // replace anchor behavior with our handleSuccess
    successBtn.href = '#';
    successBtn.addEventListener('click', (e) => { e.preventDefault(); handleSuccess(txId); });
  }
  if (cancelBtn) {
    cancelBtn.href = '#';
    cancelBtn.addEventListener('click', (e) => { e.preventDefault(); handleCancel(txId); });
  }

  startCountdown(PAYMENT_TIMEOUT, () => {
    handleCancel(txId);
  });
}

document.addEventListener('DOMContentLoaded', init);

