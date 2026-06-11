import { getLastBooking } from '../../shared/utils/storage.js';
import { generateQRCodeString } from '../../shared/utils/paymentService.js';

function renderQr(booking) {
  const canvas = document.getElementById('qr-canvas');
  const fallback = document.getElementById('qr-fallback');
  const qrString = booking ? generateQRCodeString(booking) : 'NO_DATA_AVAILABLE_FOR_QR';
  
  if (typeof QRCode !== 'undefined' && canvas) {
    QRCode.toCanvas(canvas, qrString, { 
      width: 220, 
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M' 
    }, function (error) {
      if (error) console.error(error);
      if (fallback) fallback.classList.add('hidden');
    });
  } else if (canvas) {
    canvas.style.display = 'none';
    if (fallback) {
      fallback.textContent = qrString;
      fallback.classList.remove('hidden');
    }
  }
}

function renderBookingInfo(booking) {
  if (!booking) {
      // If no mock data, just use the hardcoded HTML data for presentation
      const txCodeEl = document.getElementById('tx-code');
      if (txCodeEl && txCodeEl.textContent === 'A3BX9KM2ZQ7T') {
          // Add a simple string for QR if no booking in storage
          renderQr({ transactionId: 'A3BX9KM2ZQ7T', total: 255000 });
      }
      return;
  }
  
  const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  
  setText('movie-title', booking.movieTitle || 'Spider-Man: Across the Spider-Verse');
  setText('booking-total', booking.total ? (booking.total.toLocaleString('vi-VN') + ' đ') : '255.000 đ');
  setText('tx-code', booking.transactionId || booking.id || 'A3BX9KM2ZQ7T');
  
  if (booking.showtime) setText('showtime', booking.showtime);
  if (booking.room) setText('room', booking.room);

  const seatsEl = document.getElementById('seats-list');
  if (seatsEl && booking.seats && booking.seats.length > 0) {
    seatsEl.innerHTML = '';
    booking.seats.forEach(s => {
      const span = document.createElement('span');
      span.className = 'inline-block border border-primary-container text-white text-xs font-bold px-2.5 py-0.5 rounded-full';
      span.textContent = s;
      seatsEl.appendChild(span);
    });
  }
  
  renderQr(booking);
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

function sendMockEmail() {
    // Show email toast
    const toast = document.getElementById('email-toast');
    if (toast) {
        toast.classList.add('show');
        
        // Hide after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }
}

function init() {
  const booking = typeof getLastBooking === 'function' ? getLastBooking() : null;
  renderBookingInfo(booking);

  const dlBtn = document.getElementById('btn-download-qr');
  if (dlBtn) dlBtn.addEventListener('click', downloadQR);

  const resendBtn = document.getElementById('btn-resend-email');
  if (resendBtn) {
      resendBtn.addEventListener('click', () => {
          sendMockEmail();
      });
  }
  
  const closeToastBtn = document.getElementById('close-toast');
  if (closeToastBtn) {
      closeToastBtn.addEventListener('click', () => {
          const toast = document.getElementById('email-toast');
          if (toast) toast.classList.remove('show');
      });
  }

  // Simulate system sending email automatically on page load after a slight delay
  setTimeout(() => {
      sendMockEmail();
  }, 1000);
}

document.addEventListener('DOMContentLoaded', init);
