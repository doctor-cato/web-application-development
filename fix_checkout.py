import re

js_file = 'src/booking/checkout/checkout.js'

with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

# Fix the undefined checkoutData
old_hide_block = """    // Hide Split & Lock if user didn't turn on group booking OR seats < 2
    if (btnSplitPay) {
        const seatsCount = checkoutData && checkoutData.selectedSeats ? checkoutData.selectedSeats.length : 0;
        const isGroupBooking = checkoutData && checkoutData.isGroupBooking;
        if (!isGroupBooking || seatsCount < 2) {
            btnSplitPay.style.display = 'none';
        }
    }"""

new_hide_block = """    // Hide Split & Lock if user didn't turn on group booking OR seats < 2
    const checkoutSessionData = getCheckout();
    if (btnSplitPay) {
        const seatsCount = checkoutSessionData && checkoutSessionData.seats ? checkoutSessionData.seats.length : 0;
        const isGroupBooking = checkoutSessionData && checkoutSessionData.isGroupBooking;
        if (!isGroupBooking || seatsCount < 2) {
            btnSplitPay.style.display = 'none';
        }
    }"""

if old_hide_block in js:
    js = js.replace(old_hide_block, new_hide_block)
else:
    print("Could not find old_hide_block")


old_splitData = """            const splitData = {
                orderId: orderId,
                checkoutData: checkoutData,
                customFood: localStorage.getItem('selectedFood'),
                status: 'PENDING'
            };"""

new_splitData = """            const splitData = {
                orderId: orderId,
                checkoutData: checkoutSessionData,
                customFood: localStorage.getItem('selectedFood'),
                status: 'PENDING'
            };"""

if old_splitData in js:
    js = js.replace(old_splitData, new_splitData)
else:
    print("Could not find old_splitData")

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js)

print("checkout.js fixed.")
