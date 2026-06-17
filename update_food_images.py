import re

with open('src/booking/booking-food/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

images = {
    'combo': '../../shared/images/combo_double.png',
    'comboBimBim': '../../shared/images/combo_single.png',
    'popcorn': '../../shared/images/food_popcorn.png',
    'popcornDuo': '../../shared/images/food_popcorn.png',
    'coupleDrink': '../../shared/images/food_coca.png',
    'drinksCombo2': '../../shared/images/combo_double.png', 
    'coca': '../../shared/images/food_coca.png',
    'pepsi': '../../shared/images/food_pepsi.png',
}

for prod, img in images.items():
    pattern = r'(<article class="card" data-product="' + prod + r'">\s*)<div class="media"[^>]*></div>'
    replacement = r'\1<div class="media">\n              <img src="' + img + r'" alt="' + prod + r'">\n            </div>'
    html = re.sub(pattern, replacement, html)

with open('src/booking/booking-food/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
