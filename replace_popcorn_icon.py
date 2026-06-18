import re

js_file = 'src/booking/checkout/split-pay.js'

with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

old_html = """                <div style="width: 40px; height: 40px; background: rgba(251, 191, 36, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #FBBF24; font-size: 1.2rem; box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);">
                    <i class="fas fa-popcorn"></i>
                </div>"""

new_html = """                <div style="width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%);">
                    <img src="../../shared/images/food_popcorn.png" alt="Bắp Nước" style="width: 36px; height: 36px; object-fit: contain; filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.8));">
                </div>"""

if old_html in js:
    js = js.replace(old_html, new_html)
else:
    print("Could not find old_html in js file")

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js)

print("Icon replaced with image.")
