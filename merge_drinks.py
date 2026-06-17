import re

html_file = 'src/booking/booking-food/index.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# The goal is to merge the second grid of drinks into the first grid, and delete the second section
# We can find the contents of the second grid (coca and pepsi)
coca_pepsi_match = re.search(r'(<article class="card" data-product="coca">[\s\S]*?</article>\s*<article class="card" data-product="pepsi">[\s\S]*?</article>)', html)
if coca_pepsi_match:
    coca_pepsi_html = coca_pepsi_match.group(1)
    
    # 1. Remove the entire second category section under drinks
    # It looks like:
    # <section class="category">
    #     <button ... prev>
    #     <div class="grid">
    #       coca...
    #       pepsi...
    #     </div>
    #     <button ... next>
    # </section>
    html = re.sub(r'<section class="category">\s*<button type="button" class="slider-btn prev"><i class="fas fa-chevron-left"></i></button>\s*<div class="grid">\s*<article class="card" data-product="coca">[\s\S]*?</article>\s*<article class="card" data-product="pepsi">[\s\S]*?</article>\s*</div>\s*<button type="button" class="slider-btn next"><i class="fas fa-chevron-right"></i></button>\s*</section>', '', html)
    
    # 2. Append the coca and pepsi HTML into the first drinks grid
    # The first grid ends with: </article>\n        </div>\n      <button type="button" class="slider-btn next"><i class="fas fa-chevron-right"></i></button>\n      </section>\n      </div>
    
    # Let's insert coca_pepsi_html before the closing </div> of the drinks grid.
    # The drinks grid is the one containing 'drinksCombo2'
    html = re.sub(r'(<article class="card" data-product="drinksCombo2">[\s\S]*?</article>\s*)(</div>)', r'\1\n' + coca_pepsi_html + r'\n        \2', html)
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Success")
else:
    print("Could not find coca and pepsi")
