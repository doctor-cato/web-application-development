import re
import os

html_file = 'src/booking/booking-food/index.html'
css_file = 'src/booking/booking-food/styles.css'
js_file = 'src/booking/booking-food/app.js'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# Add slider buttons to each category
html = re.sub(r'(<section class="category">[\s\S]*?)(<div class="grid">)', r'\1\n        <button type="button" class="slider-btn prev"><i class="fas fa-chevron-left"></i></button>\n        \2', html)
html = re.sub(r'(</article>\s*</div>\s*)</section>', r'\1<button type="button" class="slider-btn next"><i class="fas fa-chevron-right"></i></button>\n      </section>', html)

# Add 2 more mock combos so the slider actually overflows
new_combos = """
          <article class="card" data-product="comboFamily">
            <div class="media">
              <img src="../../shared/images/combo_double.png" alt="comboFamily">
            </div>
            <div class="body">
              <h3>Combo Gia Đình</h3>
              <div class="price">195.000đ</div>
              <p class="desc">2 Bắp lớn + 4 Nước ngọt. Phù hợp cho cả nhà.</p>
              <div class="controls">
                <div class="qty-row">
                  <div class="qty-label btn-minus">-</div>
                  <span class="qty-display">1</span>
                  <div class="qty-label btn-plus">+</div>
                </div>
                <div class="add-row"><label class="add-label comboFamily-btn-label"></label></div>
              </div>
            </div>
          </article>

          <article class="card" data-product="comboSnack">
            <div class="media">
              <img src="../../shared/images/combo_single.png" alt="comboSnack">
            </div>
            <div class="body">
              <h3>Combo Ăn Vặt</h3>
              <div class="price">85.000đ</div>
              <p class="desc">1 Nước ngọt + 1 Xúc xích + 1 Khoai tây chiên.</p>
              <div class="controls">
                <div class="qty-row">
                  <div class="qty-label btn-minus">-</div>
                  <span class="qty-display">1</span>
                  <div class="qty-label btn-plus">+</div>
                </div>
                <div class="add-row"><label class="add-label comboSnack-btn-label"></label></div>
              </div>
            </div>
          </article>
"""
html = html.replace('</article>\n        </div>\n      </section>\n\n      <section class="category">\n        <h3>Đồ ăn riêng</h3>', '</article>\n' + new_combos + '        </div>\n<button type="button" class="slider-btn next"><i class="fas fa-chevron-right"></i></button>\n      </section>\n\n      <section class="category">\n        <h3>Đồ ăn riêng</h3>')


with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

with open(css_file, 'r', encoding='utf-8') as f:
    css = f.read()

# Make page wider and set layout to flex space-between
css = re.sub(r'\.page\{padding:118px 40px 60px;max-width:1200px;margin:0 auto\}', '.page{padding:118px 40px 60px;max-width:1440px;margin:0 auto}', css)
css = re.sub(r'\.content\{display:grid;grid-template-columns:1fr 340px;gap:32px;align-items:start\}', '.content{display:flex;justify-content:space-between;gap:40px;align-items:flex-start}\n.items{width:calc(100% - 380px)}', css)

# Add slider btn styles
slider_css = """
.category { position: relative; margin-bottom: 40px; min-width: 0; }
.slider-btn { position: absolute; top: 50%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; background: rgba(0,0,0,0.8); color: white; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: all 0.3s; opacity: 0; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
.category:hover .slider-btn { opacity: 1; }
.slider-btn:hover { background: var(--accent); border-color: var(--accent); transform: translateY(-50%) scale(1.1); }
.slider-btn.prev { left: -22px; }
.slider-btn.next { right: -22px; }
@media(max-width: 920px) { .slider-btn { display: none; } }
"""
css += slider_css

with open(css_file, 'w', encoding='utf-8') as f:
    f.write(css)

with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

# Add combo products to JS
js = js.replace("comboBimBim: {", "comboFamily: { name: 'Combo Gia Đình', price: 195000, desc: '2 Bắp lớn + 4 Nước ngọt. Phù hợp cho cả nhà.' }, comboSnack: { name: 'Combo Ăn Vặt', price: 85000, desc: '1 Nước ngọt + 1 Xúc xích + 1 Khoai tây chiên.' }, comboBimBim: {")

# Add scroll logic for sliders
scroll_js = """
  // Slider logic
  document.querySelectorAll('.category').forEach(cat => {
    const prev = cat.querySelector('.prev');
    const next = cat.querySelector('.next');
    const grid = cat.querySelector('.grid');
    if(prev && next && grid) {
      prev.addEventListener('click', () => {
        grid.scrollBy({ left: -340, behavior: 'smooth' });
      });
      next.addEventListener('click', () => {
        grid.scrollBy({ left: 340, behavior: 'smooth' });
      });
    }
  });
"""
js = js.replace('renderAll();\n})();', scroll_js + '\n  renderAll();\n})();')

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js)
