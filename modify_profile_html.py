import re

html_file = 'src/user/user-profile/profile.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add real-history-container
old_history_list = '<div class="history-list">'
new_history_list = '<div class="history-list">\n                            <div id="real-history-container"></div>'
html = html.replace(old_history_list, new_history_list)

# 2. Add profile.js script at the end of body
old_body_end = '</body>'
new_body_end = '<script type="module" src="./profile.js"></script>\n</body>'
html = html.replace(old_body_end, new_body_end)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("HTML modified for real history.")
