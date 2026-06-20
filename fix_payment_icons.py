import re

html_file = 'src/booking/checkout/split-pay.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

old_momo = 'src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"'
new_momo = 'src="https://img.mservice.io/momo-payment/icon/images/logo512.png"'

old_vnpay = 'src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418189687.png"'
new_vnpay = 'src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png"'

html = html.replace(old_momo, new_momo)
html = html.replace(old_vnpay, new_vnpay)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("Payment icons fixed.")
