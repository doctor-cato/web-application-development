import re

js_file = 'src/booking/checkout/checkout.js'

with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

# We need to insert a check for selectedSeats.length right before adding the event listener to btnSplitPay
logic_to_insert = """
    // Hide Split & Lock if seats < 2
    if (btnSplitPay) {
        const seatsCount = checkoutData && checkoutData.selectedSeats ? checkoutData.selectedSeats.length : 0;
        if (seatsCount < 2) {
            btnSplitPay.style.display = 'none';
        }
    }
"""

# Find where btnSplitPay is declared
target = "if (btnSplitPay) {"
# Let's insert the display logic just before it
if "const btnSplitPay" in js and "Hide Split & Lock if seats < 2" not in js:
    js = js.replace("if (btnSplitPay) {", logic_to_insert + "\n    if (btnSplitPay) {")

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js)

print("checkout.js updated.")
