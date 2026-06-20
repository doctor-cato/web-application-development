import re

html_file = 'src/booking/checkout/split-pay.html'
js_file = 'src/booking/checkout/split-pay.js'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# Enhance body background
old_body = """        body {
            background-color: var(--bg-dark);
            color: var(--text-light);
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
        }"""

new_body = """        body {
            background-color: var(--bg-dark);
            color: var(--text-light);
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            background-image: radial-gradient(circle at 50% 0%, rgba(229, 9, 20, 0.15) 0%, transparent 50%),
                              radial-gradient(circle at 100% 100%, rgba(20, 20, 20, 0.8) 0%, transparent 50%);
            background-attachment: fixed;
        }"""
html = html.replace(old_body, new_body)

# Enhance addon styles
addon_css = """
        /* Add-ons Enhanced */
        .addon-section {
            margin-top: 2.5rem;
            background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
            padding: 2rem;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.05);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
        }
        .addon-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.25rem;
            margin-top: 1rem;
            background: rgba(0,0,0,0.3);
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.03);
            transition: all 0.3s ease;
        }
        .addon-item:hover {
            background: rgba(255,255,255,0.05);
            transform: translateX(5px);
            border-color: rgba(229,9,20,0.3);
        }
        .btn-addon {
            padding: 0.5rem 1.25rem !important;
            border-radius: 30px !important;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 1px;
            transition: all 0.3s;
        }
"""
html = html.replace('/* Add-ons */', addon_css)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)


# Update JS to add user avatar/social feel
with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

old_subtitle = """<p class="subtitle" style="text-align: left; margin-bottom: 0;">Đơn hàng: <span style="color:var(--primary-red); font-weight:700;">#${orderId}</span></p>"""
new_subtitle = """<p class="subtitle" style="text-align: left; margin-bottom: 0; display: flex; align-items: center; gap: 0.5rem;">
                    <img src="https://i.pravatar.cc/100?img=3" style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--primary-red);"> 
                    <span>Trưởng nhóm đã tạo đơn: <span style="color:var(--primary-red); font-weight:700;">#${orderId}</span></span>
                </p>"""

js = js.replace(old_subtitle, new_subtitle)

old_addon = """<!-- Addons -->
        <div class="addon-section">
            <h3 style="font-family: 'Oswald'; margin-top: 0; margin-bottom: 0.5rem;"><i class="fas fa-popcorn" style="color: #FBBF24;"></i> 2. MUA THÊM BẮP NƯỚC (TUỲ CHỌN)</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Phần này chỉ mua riêng cho bạn, không ảnh hưởng đến người khác.</p>
            
            <div class="addon-item" style="margin-top: 1rem;">"""

new_addon = """<!-- Addons -->
        <div class="addon-section">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                <div style="width: 40px; height: 40px; background: rgba(251, 191, 36, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #FBBF24; font-size: 1.2rem; box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);">
                    <i class="fas fa-popcorn"></i>
                </div>
                <h3 style="font-family: 'Oswald'; margin: 0; font-size: 1.5rem; letter-spacing: 1px;">2. BẮP NƯỚC CÁ NHÂN</h3>
            </div>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-left: 3.5rem;">Combo này sẽ được giao riêng cho bạn tại quầy, không dính dáng đến trưởng nhóm.</p>
            
            <div class="addon-item" style="margin-top: 1.5rem;">"""

js = js.replace(old_addon, new_addon)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js)

print("UI further enhanced.")
