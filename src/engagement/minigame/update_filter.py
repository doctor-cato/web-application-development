import re

# Update index.html
html_path = r'c:\Users\PC KHANH\web-application-development\src\engagement\minigame\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace filter buttons
old_filters = '''<div class="filter-bar">
                <button class="filter-btn active" data-filter="all">Tất cả phim</button>
                <button class="filter-btn" data-filter="neon-night">The Neon Night</button>
                <button class="filter-btn" data-filter="cyber-core">Cyber Core</button>
                <button class="filter-btn" data-filter="laugh-riot">Laugh Riot</button>
            </div>'''
new_filters = '''<div class="filter-bar">
                <button class="filter-btn active" data-filter="all">Tất cả thể loại</button>
                <button class="filter-btn" data-filter="action">Hành động</button>
                <button class="filter-btn" data-filter="scifi">Khoa học viễn tưởng</button>
                <button class="filter-btn" data-filter="comedy">Hài hước</button>
            </div>'''
html = html.replace(old_filters, new_filters)

# Replace data-movie attributes with data-genre
html = html.replace('data-movie="neon-night"', 'data-genre="action"')
html = html.replace('data-movie="cyber-core"', 'data-genre="scifi"')
html = html.replace('data-movie="laugh-riot"', 'data-genre="comedy"')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

# Update script.js
js_path = r'c:\Users\PC KHANH\web-application-development\src\engagement\minigame\js\script.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace("const cardMovie = card.getAttribute('data-movie');", "const cardGenre = card.getAttribute('data-genre');")
js = js.replace("if (filter === 'all' || cardMovie === filter) {", "if (filter === 'all' || cardGenre === filter) {")

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print('Updated filter from movie to genre')
