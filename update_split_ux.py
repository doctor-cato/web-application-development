import re

js_file = 'src/booking/checkout/split-pay.js'

with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update Imports
if "import { confirmBooking } from '../seat-booking/bookingService.js';" not in js:
    js = "import { confirmBooking } from '../seat-booking/bookingService.js';\n" + js
if "import { lsSet, KEYS } from '../../shared/utils/storage.js';" not in js:
    js = "import { lsSet, KEYS } from '../../shared/utils/storage.js';\n" + js

# 2. Inside handleConfirmPayment, save flag to sessionStorage
old_handle_confirm = """    // Save back to localStorage
    localStorage.setItem('splitOrder_' + orderId, JSON.stringify(orderData));
    
    // Redirect to simulator"""

new_handle_confirm = """    // Save back to localStorage
    localStorage.setItem('splitOrder_' + orderId, JSON.stringify(orderData));
    
    // Mark this user as having paid their part
    sessionStorage.setItem('my_split_payment_' + orderId, 'true');
    
    // Redirect to simulator"""

js = js.replace(old_handle_confirm, new_handle_confirm)

# 3. Inside renderApp, handle isFullyPaid and hasPaidMyPart
old_render = """    const isFullyPaid = paidCount >= allSeats.length;
    
    const appHtml = `"""

new_render = """    const isFullyPaid = paidCount >= allSeats.length;
    const hasPaidMyPart = sessionStorage.getItem('my_split_payment_' + orderId) === 'true';
    
    if (isFullyPaid) {
        if (orderData.status !== 'COMPLETED') {
            orderData.status = 'COMPLETED';
            localStorage.setItem('splitOrder_' + orderId, JSON.stringify(orderData));
            
            const checkoutData = orderData.checkoutData;
            // Fake a transactionId since we simulated it
            checkoutData.transactionId = 'SPLIT-TX-' + Date.now();
            const booking = confirmBooking(checkoutData);
            lsSet(KEYS.LAST_BOOKING, booking);
        }
        // Redirect immediately to success page
        window.location.href = '../booking-success/index.html';
        return;
    }
    
    const appHtml = `"""

js = js.replace(old_render, new_render)

# 4. Handle the Pay Button state
old_button = """        <button id="btn-pay-my-part" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem; padding: 1rem; font-size: 1.1rem;" disabled>THANH TOÁN PHẦN CỦA TÔI</button>"""

new_button = """        ${hasPaidMyPart 
            ? `<button id="btn-pay-my-part" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem; padding: 1rem; font-size: 1.1rem; background: #10b981; border-color: #10b981;" disabled><i class="fas fa-check"></i> ĐÃ THANH TOÁN. ĐANG CHỜ NHÓM CỦA BẠN...</button>`
            : `<button id="btn-pay-my-part" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem; padding: 1rem; font-size: 1.1rem;" disabled>THANH TOÁN PHẦN CỦA TÔI</button>`
        }"""

js = js.replace(old_button, new_button)

# 5. Prevent selecting seats if hasPaidMyPart
old_attach = """function attachEvents() {
    // Seat selection
    document.querySelectorAll('.split-seat-card:not(.paid)').forEach(card => {"""

new_attach = """function attachEvents() {
    const hasPaidMyPart = sessionStorage.getItem('my_split_payment_' + orderId) === 'true';
    
    // Seat selection
    document.querySelectorAll('.split-seat-card:not(.paid)').forEach(card => {
        if (hasPaidMyPart) {
            card.style.cursor = 'not-allowed';
            card.style.opacity = '0.7';
            return; // Don't attach click event if already paid
        }"""

js = js.replace(old_attach, new_attach)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js)

print("split-pay.js updated with UX logic.")
