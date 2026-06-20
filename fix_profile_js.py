import re

js_file = 'src/user/user-profile/profile.js'

with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

old_listen = "document.addEventListener('DOMContentLoaded', renderRealHistory);"
new_listen = """if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderRealHistory);
} else {
    renderRealHistory();
}"""

if old_listen in js:
    js = js.replace(old_listen, new_listen)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js)

print("Fixed profile.js execution issue.")
