import re

js_file = 'src/booking/checkout/payment.js'

with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

# Modify handleSuccess to check returnUrl
old_handleSuccess = """async function handleSuccess(txId) {
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
        window.location.href = '../booking-success/index.html';
      } catch (e) {
        console.error(e);
        alert('Xác nhận thất bại: ' + e.message);
      }
    }
  });
}"""

new_handleSuccess = """async function handleSuccess(txId) {
  const btn = qs('.btn-success');
  if (btn) btn.innerText = 'Đang xử lý...';
  
  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get('returnUrl');
  
  simulatePayment(txId, (result) => {
    if (result.status === 'success') {
      try {
        if (returnUrl) {
            window.location.href = returnUrl;
            return;
        }
        const checkoutData = getCheckout();
        checkoutData.transactionId = txId;
        const booking = confirmBooking(checkoutData);
        // Lưu ID booking vào session để trang invoice hiển thị
        lsSet(KEYS.LAST_BOOKING, booking);
        window.location.href = '../booking-success/index.html';
      } catch (e) {
        console.error(e);
        alert('Xác nhận thất bại: ' + e.message);
      }
    }
  });
}"""

js = js.replace(old_handleSuccess, new_handleSuccess)

# Modify init to use total from URL parameter if it exists, since split payment doesn't update session
old_init_amount = """  const checkoutData = getCheckout() || {};
  const amountEl = document.getElementById('sim-amount');
  if (amountEl) {
    amountEl.innerText = (checkoutData.total || 0).toLocaleString('vi-VN') + ' đ';
  }"""

new_init_amount = """  const amountParam = params.get('amount');
  const checkoutData = getCheckout() || {};
  const amountEl = document.getElementById('sim-amount');
  if (amountEl) {
    if (amountParam) {
        amountEl.innerText = parseInt(amountParam).toLocaleString('vi-VN') + ' đ';
    } else {
        amountEl.innerText = (checkoutData.total || 0).toLocaleString('vi-VN') + ' đ';
    }
  }"""

js = js.replace(old_init_amount, new_init_amount)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js)

print("payment.js updated to support returnUrl and amount param.")
