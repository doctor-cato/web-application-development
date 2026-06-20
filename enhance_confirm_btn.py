import re

html_file = 'src/booking/checkout/split-pay.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# Add CSS for the enhanced button
btn_css = """
        /* Enhanced Confirm Button */
        .btn-confirm-enhanced {
            width: 100%;
            margin-top: 1.5rem;
            padding: 1.25rem !important;
            font-size: 1.2rem !important;
            font-weight: 700;
            font-family: 'Oswald', sans-serif;
            letter-spacing: 2px;
            background: linear-gradient(90deg, #e50914, #ff4b4b, #e50914) !important;
            background-size: 200% auto !important;
            border: none !important;
            border-radius: 8px !important;
            color: white;
            cursor: pointer;
            transition: all 0.5s ease;
            box-shadow: 0 0 20px rgba(229, 9, 20, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            animation: gradient-shift 3s linear infinite;
        }

        .btn-confirm-enhanced:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 30px rgba(229, 9, 20, 0.8);
            background-position: right center !important;
        }

        .btn-confirm-enhanced i {
            font-size: 1.1rem;
        }

        @keyframes gradient-shift {
            0% { background-position: 0% center; }
            100% { background-position: -200% center; }
        }
"""
html = html.replace('/* Add-ons Enhanced */', btn_css + '\n/* Add-ons Enhanced */')

# Replace the button HTML
old_btn = '<button id="btn-confirm-pay" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem;">XÁC NHẬN THANH TOÁN</button>'
new_btn = '<button id="btn-confirm-pay" class="btn-confirm-enhanced"><i class="fas fa-shield-alt"></i> XÁC NHẬN THANH TOÁN</button>'
html = html.replace(old_btn, new_btn)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("Confirm button upgraded.")
