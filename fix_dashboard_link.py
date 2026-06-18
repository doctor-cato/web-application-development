import re

js_file = 'src/booking/checkout/checkout.js'

with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

old_logic = "splitLinkInput.value = splitLink;"
new_logic = """splitLinkInput.value = splitLink;
            
            // Gán link này cho nút MỞ TRANG THEO DÕI
            const openDashboardBtn = splitModal.querySelector('a.btn-primary');
            if (openDashboardBtn) openDashboardBtn.href = splitLink;"""

if old_logic in js:
    js = js.replace(old_logic, new_logic)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js)

print("checkout.js fixed for dashboard button link.")
