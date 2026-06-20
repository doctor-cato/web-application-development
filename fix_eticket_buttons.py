import re

html_file = 'src/user/user-profile/profile.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Modal Container to flex-direction: column
old_modal_start = '<div id="eticket-modal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999; align-items: center; justify-content: center; backdrop-filter: blur(10px);">'
new_modal_start = '<div id="eticket-modal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999; align-items: center; justify-content: center; flex-direction: column; backdrop-filter: blur(10px);">'
html = html.replace(old_modal_start, new_modal_start)

# 2. Update Action Buttons Container
old_buttons_container = '<div style="position: absolute; bottom: 2rem; display: flex; gap: 1rem; animation: fadeIn 1s ease forwards; opacity: 0;">'
new_buttons_container = '<div style="display: flex; gap: 1rem; margin-top: 2rem; animation: fadeIn 1s ease forwards; opacity: 0; z-index: 10;">'
html = html.replace(old_buttons_container, new_buttons_container)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("E-ticket buttons overlapping fixed.")
