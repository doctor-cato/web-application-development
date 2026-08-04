import { getCheckout, lsSet, KEYS } from '/shared/utils/storage.js';
import { API_BASE_URL, getHeaders } from '/shared/utils/apiConfig.js';

let countdownTimer = null;
let pollingInterval = null;
const PAYMENT_TIMEOUT = 300;

function qs(sel) { return document.querySelector(sel); }

function formatSeconds(s) {
  const mm = String(Math.floor(s/60)).padStart(2,'0');
  const ss = String(s%60).padStart(2,'0');
  return `${mm}:${ss}`;
}

async function handleSuccess(bookingId) {
  const btn = qs('#sim-btn');
  if (btn) btn.innerText = 'Đang xử lý...';

  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get('returnUrl');

  if (returnUrl) {
      window.location.href = returnUrl;
      return;
  }

  try {
    const checkoutData = getCheckout() || {};
    checkoutData.transactionId = bookingId;
    checkoutData.createdAt = new Date().toISOString();

    const seatsArr = Array.isArray(checkoutData.seats) ? checkoutData.seats : (checkoutData.seats ? [checkoutData.seats] : []);
    let booking = {
        id: bookingId,
        movieTitle: checkoutData.movieTitle || 'Unknown Movie',
        showtimeId: checkoutData.showtimeId || null,
        showtimeText: checkoutData.showtimeText || '',
        room: checkoutData.room || '',
        seats: seatsArr,
        tickets: seatsArr.map(s => ({
            seat: s,
            ticketCode: 'TK-' + s + '-' + Math.floor(100000 + Math.random() * 900000)
        })),
        combo: checkoutData.combo || 'none',
        total: checkoutData.total || 0,
        poster: checkoutData.poster || '',
        transactionId: bookingId,
        createdAt: checkoutData.createdAt
    };

    lsSet(KEYS.LAST_BOOKING, booking);
    localStorage.removeItem('cinematch_active');
    
    // Show a beautiful alert & redirect
    alert('Thanh toán thành công! Mã đơn hàng: ' + bookingId);
    window.location.href = '../booking-success/index.html';
  } catch (e) {
    console.error(e);
    alert('Xác nhận thất bại: ' + e.message);
  }
}

function handleCancel(bookingId) {
  if (pollingInterval) clearInterval(pollingInterval);
  window.location.href = './checkout.html';
}

function startPaymentStatusPolling(bookingId) {
  if (pollingInterval) clearInterval(pollingInterval);

  pollingInterval = setInterval(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/status/${bookingId}`, {
        headers: getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'Paid') {
          clearInterval(pollingInterval);
          handleSuccess(bookingId);
        } else if (data.status === 'Failed') {
          clearInterval(pollingInterval);
          alert('Thanh toán thất bại hoặc đơn đặt vé đã bị hủy.');
          window.location.href = './checkout.html';
        }
      }
    } catch (e) {
      console.error('Lỗi kiểm tra trạng thái thanh toán:', e);
    }
  }, 2000);
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

async function init() {
  const params = new URLSearchParams(window.location.search);
  const provider = params.get('provider') || 'momo';
  const bookingId = params.get('bookingId') || params.get('txId'); // fallback to txId if any
  const amountParam = params.get('amount');

  const checkoutData = getCheckout() || {};
  const amount = amountParam ? parseInt(amountParam) : (checkoutData.total || 0);

  const gatewayName = document.getElementById('gateway-name');
  const scanText = document.getElementById('scan-text');

  if (gatewayName) {
    if (provider === 'vnpay') {
        gatewayName.innerText = 'Cổng Thanh Toán VNPAY';
        if (scanText) scanText.innerText = 'Dùng ứng dụng VNPay hoặc Ngân hàng để quét mã QR';
    }
    else if (provider === 'zalopay') {
        gatewayName.innerText = 'Cổng Thanh Toán ZALOPAY';
        if (scanText) scanText.innerText = 'Dùng ứng dụng ZaloPay để quét mã QR';
    }
    else if (provider === 'bank') {
        gatewayName.innerText = 'Chuyển Khoản Ngân Hàng';
        if (scanText) scanText.innerText = 'Dùng ứng dụng ngân hàng để quét mã VietQR';
    }
    else if (provider === 'card') {
        gatewayName.innerText = 'Cổng Thanh Toán VISA / MASTER';
        if (scanText) scanText.innerText = 'Dùng ứng dụng ngân hàng để quét mã QR xác thực';
    }
    else {
        gatewayName.innerText = 'Cổng Thanh Toán MOMO';
        if (scanText) scanText.innerText = 'Dùng ứng dụng MoMo để quét mã QR';
    }
  }

  const qrImage = document.getElementById('qr-code-img');
  if (qrImage) {
     qrImage.style.width = '100%';
     qrImage.style.maxWidth = '240px';
     qrImage.style.height = 'auto';
     qrImage.style.margin = '0 auto';

     if (provider === 'bank') {
         // Call dynamic VietQR generation
         try {
             const res = await fetch(`${API_BASE_URL}/payment/generate-qr?amount=${amount}&description=${bookingId}`);
             if (res.ok) {
                 const data = await res.json();
                 qrImage.src = data.qrUrl;
                 if (scanText) {
                     scanText.innerHTML = `Chuyển tới: <strong>${data.bank} - ${data.accountNo}</strong><br>Chủ TK: <strong>${data.accountName}</strong><br>Nội dung: <strong style="color: #e50914; font-size: 1.05rem; letter-spacing: 0.5px;">${data.addInfo}</strong>`;
                 }
             } else {
                 qrImage.src = `https://img.vietqr.io/image/MB-0327124317-compact2.png?amount=${amount}&addInfo=${bookingId}&accountName=HUY%20NGUYEN`;
             }
         } catch (e) {
             console.error('Lỗi khi lấy mã QR ngân hàng động:', e);
             qrImage.src = `https://img.vietqr.io/image/MB-0327124317-compact2.png?amount=${amount}&addInfo=${bookingId}&accountName=HUY%20NGUYEN`;
         }
     } else if (provider === 'zalopay') {
         qrImage.src = '/shared/images/qr-zalo.jpg';
     } else if (provider === 'momo') {
         qrImage.src = '/shared/images/qr-momo.jpg';
     } else {
         qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=3HD2K-Cinema-${provider.toUpperCase()}`;
     }
  }

  const simHeader = document.getElementById('sim-header');
  const simAmount = document.getElementById('sim-amount');
  const simSpinner = document.getElementById('sim-spinner');
  const simBtn2 = document.getElementById('sim-btn');

  if (provider === 'vnpay' || provider === 'zalopay' || provider === 'card' || provider === 'bank') {
    simHeader?.classList.add(provider);
    simAmount?.classList.add(provider);
    simSpinner?.classList.add(provider);
    simBtn2?.classList.add(provider);
  }

  const amountEl = document.getElementById('sim-amount');
  if (amountEl) {
     amountEl.innerText = amount.toLocaleString('vi-VN') + ' đ';
  }

  const simBtn = document.getElementById('sim-btn');
  if (simBtn) {
    simBtn.disabled = false;
    simBtn.innerText = 'Giả lập quét mã thành công (Sandbox)';
    simBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      simBtn.disabled = true;
      simBtn.innerText = 'Đang gửi webhook giả lập...';

      try {
        const response = await fetch(`${API_BASE_URL}/payment/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId: 'SANDBOX_' + Date.now(),
            orderId: bookingId,
            amount: amount,
            status: 'success',
            provider: provider,
            signature: 'sandbox'
          })
        });

        if (!response.ok) {
          alert('Không thể kích hoạt webhook giả lập. Vui lòng kiểm tra console.');
          simBtn.disabled = false;
          simBtn.innerText = 'Giả lập quét mã thành công (Sandbox)';
        }
      } catch (err) {
        console.error('Lỗi khi giả lập webhook:', err);
        alert('Lỗi kết nối khi giả lập webhook.');
        simBtn.disabled = false;
        simBtn.innerText = 'Giả lập quét mã thành công (Sandbox)';
      }
    });
  }

  // Start polling backend payment status
  if (bookingId) {
     startPaymentStatusPolling(bookingId);
  }

  startCountdown(PAYMENT_TIMEOUT, () => {
    handleCancel(bookingId);
  });
}

document.addEventListener('DOMContentLoaded', init);
