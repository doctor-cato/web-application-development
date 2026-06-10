import { getLastBooking } from '../../shared/utils/storage.js';
import { generateQRCodeString } from '../../shared/utils/paymentService.js';

function renderQr(booking) {
  const canvas = document.getElementById('qr-canvas');
  const fallback = document.getElementById('qr-fallback');
  const qrString = booking ? generateQRCodeString(booking) : 'NO_DATA';
  if (typeof QRCode !== 'undefined' && canvas) {
    QRCode.toCanvas(canvas, qrString, { width: 220, errorCorrectionLevel: 'M' });
    if (fallback) fallback.classList.add('hidden');
  } else if (canvas) {
    canvas.style.display = 'none';
    if (fallback) {
      fallback.textContent = qrString;
      fallback.classList.remove('hidden');
    }
  }
}

function renderBookingInfo(booking) {
  if (!booking) return;
  document.getElementById('movie-title')?.replaceWith(document.createElement('span'));
  // populate some fields if they exist
  const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  setText('movie-title', booking.movieTitle || '');
  setText('booking-total', booking.total ? (booking.total.toLocaleString('vi-VN') + ' đ') : '');
  setText('booking-method', booking.paymentMethod || booking.payment || '');
  setText('tx-code', booking.transactionId || booking.id || '');
  setText('booking-date', booking.createdAt ? new Date(booking.createdAt).toLocaleString() : '');
  const seatsEl = document.getElementById('seats-list');
  if (seatsEl) {
    seatsEl.innerHTML = '';
    (booking.seats || []).forEach(s => {
      const span = document.createElement('span');
      span.className = 'inline-block border border-primary-container text-white text-xs font-bold px-2.5 py-0.5 rounded-full';
      span.textContent = s;
      seatsEl.appendChild(span);
    });
  }
}

function downloadQR() {
  const canvas = document.getElementById('qr-canvas');
  if (!canvas || canvas.style.display === 'none') return;
  const link = document.createElement('a');
  const filename = 've-3hd2k-' + (document.getElementById('tx-code')?.textContent || 'ticket') + '.png';
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function init() {
  const booking = getLastBooking();
  renderQr(booking);
  renderBookingInfo(booking);

  const dl = document.getElementById('btn-download-qr');
  if (dl) dl.addEventListener('click', downloadQR);
}

document.addEventListener('DOMContentLoaded', init);

export { downloadQR };

