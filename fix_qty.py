import re

with open('src/booking/booking-food/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

replacement = '''<div class="qty-row">
                  <div class="qty-label btn-minus">-</div>
                  <span class="qty-display">1</span>
                  <div class="qty-label btn-plus">+</div>
                </div>'''

html = re.sub(r'<div class="qty-row">.*?</div>', replacement, html, flags=re.DOTALL)

with open('src/booking/booking-food/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
