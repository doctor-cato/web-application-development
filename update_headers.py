import re

html_file = 'src/booking/booking-food/index.html'
css_file = 'src/booking/booking-food/styles.css'
js_file = 'src/booking/booking-food/app.js'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the old h2/h3 tags and wrap sections properly
html = re.sub(r'<h2>Đồ ăn</h2>\s*<section class="category">\s*<h3>Combo riêng</h3>', 
    r'''
      <!-- STICKY TABS -->
      <div class="food-tabs" id="food-tabs">
        <a href="#section-combo" class="food-tab active" data-target="section-combo"><i class="fas fa-fire"></i> Combo Ưu Đãi</a>
        <a href="#section-popcorn" class="food-tab" data-target="section-popcorn"><i class="fas fa-hamburger"></i> Đồ Ăn Vặt</a>
        <a href="#section-drinks" class="food-tab" data-target="section-drinks"><i class="fas fa-glass-cheers"></i> Nước Uống</a>
      </div>

      <div id="section-combo" class="menu-section">
        <h2 class="section-title"><i class="fas fa-fire"></i> Combo Ưu Đãi <span>Khuyên dùng</span></h2>
        <section class="category">
''', html)

html = re.sub(r'</section>\s*<section class="category">\s*<h3>Đồ ăn riêng</h3>',
    r'''</section>
      </div>
      
      <div id="section-popcorn" class="menu-section">
        <h2 class="section-title"><i class="fas fa-hamburger"></i> Bắp & Đồ Ăn Vặt <span>Giòn rụm</span></h2>
        <section class="category">''', html)

html = re.sub(r'</section>\s*<h2 style="margin-top:18px;">Nước uống</h2>\s*<section class="category">\s*<h3>Combo riêng</h3>',
    r'''</section>
      </div>

      <div id="section-drinks" class="menu-section">
        <h2 class="section-title"><i class="fas fa-glass-cheers"></i> Nước Uống <span>Giải khát cực đã</span></h2>
        <section class="category">''', html)

html = re.sub(r'</section>\s*<section class="category">\s*<h3>Nước thường</h3>',
    r'''</section>
        <section class="category">''', html)

html = re.sub(r'(</section>\s*)</section>\s*<aside class="summary">',
    r'\1</div>\n    </section>\n\n    <aside class="summary">', html)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

with open(css_file, 'r', encoding='utf-8') as f:
    css = f.read()

new_css = """
/* STICKY TABS */
.food-tabs {
  display: flex;
  gap: 12px;
  position: sticky;
  top: 80px; /* Below navbar */
  z-index: 50;
  background: rgba(11, 11, 11, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 16px 0;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 10px 20px -10px rgba(0,0,0,0.5);
}
.food-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 999px;
  color: var(--muted);
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.food-tab i { font-size: 16px; transition: color 0.3s ease; }
.food-tab:hover {
  background: rgba(255,255,255,0.08);
  color: #fff;
}
.food-tab.active {
  background: linear-gradient(135deg, var(--accent), #ff4d56);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 15px rgba(239,31,51,0.4);
}
.food-tab.active i { color: #fff; }

/* SECTION TITLES */
.menu-section {
  scroll-margin-top: 160px; /* 80px navbar + 80px tabs */
  margin-bottom: 20px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 20px 0;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 1.5px;
  font-size: 32px;
  background: linear-gradient(90deg, #ff4d56, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  text-transform: uppercase;
}
.section-title i {
  -webkit-text-fill-color: initial;
  color: var(--accent);
  font-size: 24px;
}
.section-title span {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  letter-spacing: 0.5px;
  background: rgba(239,31,51,0.15);
  -webkit-text-fill-color: var(--accent);
  border: 1px solid rgba(239,31,51,0.3);
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  font-weight: 700;
  transform: translateY(-2px);
}
.section-title::after {
  content: "";
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(239,31,51,0.3), transparent);
  margin-left: 16px;
}
"""

css += new_css
with open(css_file, 'w', encoding='utf-8') as f:
    f.write(css)

with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

# Add logic for active tab highlight on scroll
tab_js = """
  // Sticky Tabs Scroll Spy
  const sections = document.querySelectorAll('.menu-section');
  const tabs = document.querySelectorAll('.food-tab');

  const observerOptions = {
    root: null,
    rootMargin: '-180px 0px -40% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        tabs.forEach(tab => {
          if (tab.dataset.target === id) {
            tab.classList.add('active');
          } else {
            tab.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => observer.observe(sec));

  // Smooth scroll for tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = tab.dataset.target;
      const targetSec = document.getElementById(targetId);
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
"""

js = js.replace('  renderAll();\n})();', tab_js + '\n  renderAll();\n})();')

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js)
