import re

html_file = 'src/booking/booking-food/index.html'
css_file = 'src/booking/booking-food/styles.css'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# Add Barlow Condensed to Google Fonts URL
html = html.replace('family=Bebas+Neue', 'family=Barlow+Condensed:wght@500;600;700;800&family=Bebas+Neue')

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

with open(css_file, 'r', encoding='utf-8') as f:
    css = f.read()

# Replace Bebas Neue with Barlow Condensed
css = css.replace("font-family: 'Bebas Neue', sans-serif;", "font-family: 'Barlow Condensed', sans-serif; font-weight: 700;")

# Increase font size slightly because Barlow Condensed is a bit smaller/different proportion than Bebas
css = re.sub(r'\.section-title \{\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin: 0 0 20px 0;\n  font-family: \'Bebas Neue\', sans-serif;\n  letter-spacing: 1.5px;\n  font-size: 32px;',
r'''.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 20px 0;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  letter-spacing: 1px;
  font-size: 36px;''', css)

with open(css_file, 'w', encoding='utf-8') as f:
    f.write(css)
