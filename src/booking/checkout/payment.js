import { confirmPayment, cancelPayment } from '../services/paymentService.js';

let countdownTimer = null;
const PAYMENT_TIMEOUT = 300; // seconds

function qs(sel) { return document.querySelector(sel); }

function formatSeconds(s) {
  const mm = String(Math.floor(s/60)).padStart(2,'0');
  const ss = String(s%60).padStart(2,'0');
  return `${mm}:${ss}`;
}

async function handleSuccess(txId) {
  try {
    confirmPayment(txId);
    // redirect to invoice
    window.location.href = './booking_invoice.html';
  } catch (e) {
    console.error(e);
    alert('Xác nhận thất bại: ' + e.message);
  }
}

function handleCancel(txId) {
  cancelPayment(txId);
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

  // apply theme (body class already set in HTML default)
  document.querySelector('.momo-theme-logo')?.textContent = provider.toUpperCase();

  // show txId and amount if present in pending payments
  // For simplicity, we get pending map from storage via paymentService via window scope
  // But paymentService stores pending in localStorage; we can read it using a small helper here by importing storage if needed.

  const successBtn = document.querySelector('a[href="booking_invoice.html"]');
  const cancelBtn = document.querySelector('a[href="checkout.html"]');
  if (successBtn) {
    successBtn.addEventListener('click', (e) => { e.preventDefault(); handleSuccess(txId); });
  }
  if (cancelBtn) {
    cancelBtn.addEventListener('click', (e) => { e.preventDefault(); handleCancel(txId); });
  }

  startCountdown(PAYMENT_TIMEOUT, () => {
    // auto-cancel
    handleCancel(txId);
  });
}

document.addEventListener('DOMContentLoaded', init);

