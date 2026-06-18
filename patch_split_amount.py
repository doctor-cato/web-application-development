import re

js_file = 'src/booking/checkout/split-pay.js'

with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

old_redirect = "window.location.href = `payment_simulation.html?provider=${encodeURIComponent(provider)}&txId=${encodeURIComponent(transaction.transactionId)}&returnUrl=${returnUrl}`;"
new_redirect = "window.location.href = `payment_simulation.html?provider=${encodeURIComponent(provider)}&amount=${total}&txId=${encodeURIComponent(transaction.transactionId)}&returnUrl=${returnUrl}`;"

js = js.replace(old_redirect, new_redirect)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js)

print("split-pay.js redirect updated.")
