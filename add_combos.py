import re

html_file = 'src/booking/booking-food/index.html'
js_file = 'src/booking/booking-food/app.js'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

new_combos_html = """
          <article class="card" data-product="comboCinema">
            <div class="media">
              <img src="../../shared/images/food_popcorn.png" alt="comboCinema">
            </div>
            <div class="body">
              <h3>Combo Siêu Khổng Lồ</h3>
              <div class="price">115.000đ</div>
              <p class="desc">1 Bắp siêu lớn + 1 Nước khổng lồ. Ăn mãi không hết.</p>
              <div class="controls">
                <div class="qty-row">
                  <div class="qty-label btn-minus">-</div>
                  <span class="qty-display">1</span>
                  <div class="qty-label btn-plus">+</div>
                </div>
                <div class="add-row"><label class="add-label comboCinema-btn-label"></label></div>
              </div>
            </div>
          </article>

          <article class="card" data-product="comboDate">
            <div class="media">
              <img src="../../shared/images/combo_single.png" alt="comboDate">
            </div>
            <div class="body">
              <h3>Combo Hẹn Hò VIP</h3>
              <div class="price">135.000đ</div>
              <p class="desc">2 Bắp nhỏ + 2 Nước ngọt + 2 Xúc xích nướng.</p>
              <div class="controls">
                <div class="qty-row">
                  <div class="qty-label btn-minus">-</div>
                  <span class="qty-display">1</span>
                  <div class="qty-label btn-plus">+</div>
                </div>
                <div class="add-row"><label class="add-label comboDate-btn-label"></label></div>
              </div>
            </div>
          </article>
          
          <article class="card" data-product="comboParty">
            <div class="media">
              <img src="../../shared/images/combo_double.png" alt="comboParty">
            </div>
            <div class="body">
              <h3>Combo Tiệc Tùng</h3>
              <div class="price">250.000đ</div>
              <p class="desc">4 Bắp lớn + 4 Nước ngọt + 4 Snack. Quẩy hết mình.</p>
              <div class="controls">
                <div class="qty-row">
                  <div class="qty-label btn-minus">-</div>
                  <span class="qty-display">1</span>
                  <div class="qty-label btn-plus">+</div>
                </div>
                <div class="add-row"><label class="add-label comboParty-btn-label"></label></div>
              </div>
            </div>
          </article>
"""

# Inject before the closing </div> of the first grid
html = html.replace('</article>\n        </div>\n      <button type="button" class="slider-btn next"><i class="fas fa-chevron-right"></i></button>\n      </section>\n\n      <section class="category">\n        <h3>Đồ ăn riêng</h3>', '</article>\n' + new_combos_html + '        </div>\n      <button type="button" class="slider-btn next"><i class="fas fa-chevron-right"></i></button>\n      </section>\n\n      <section class="category">\n        <h3>Đồ ăn riêng</h3>')

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

new_combos_js = "comboCinema: { name: 'Combo Siêu Khổng Lồ', price: 115000, desc: '1 Bắp siêu lớn + 1 Nước khổng lồ. Ăn mãi không hết.' }, comboDate: { name: 'Combo Hẹn Hò VIP', price: 135000, desc: '2 Bắp nhỏ + 2 Nước ngọt + 2 Xúc xích nướng.' }, comboParty: { name: 'Combo Tiệc Tùng', price: 250000, desc: '4 Bắp lớn + 4 Nước ngọt + 4 Snack. Quẩy hết mình.' }, "

js = js.replace("comboBimBim: {", new_combos_js + "comboBimBim: {")

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js)
