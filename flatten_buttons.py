import re

html_file = 'src/user/user-profile/profile.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

old_buttons = """                                    <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; width: 100%;">
                                        <button class="btn-ticket" id="f1-view-btn" style="flex: 1; padding: 0.5rem; font-size: 0.9rem;">Xem mã vé</button>
                                        <button class="btn-ticket btn-outline-danger" id="f1-cancel-btn" onclick="openCancelModal('F1: The Movie', '20:00 - 15/06/2026', 'E5, E6', '250.000đ')" style="flex: 1; padding: 0.5rem; font-size: 0.9rem; background: transparent; border: 1px solid #e50914; color: #e50914;">Huỷ vé</button>
                                    </div>"""

new_buttons = """                                    <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem; width: 100%;">
                                        <button class="btn-ticket" id="f1-view-btn" style="flex: 1; padding: 0.35rem 0.5rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 4px; box-shadow: none;">Xem mã vé</button>
                                        <button class="btn-ticket btn-outline-danger" id="f1-cancel-btn" onclick="openCancelModal('F1: The Movie', '20:00 - 15/06/2026', 'E5, E6', '250.000đ')" style="flex: 1; padding: 0.35rem 0.5rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: transparent; border: 1px solid rgba(229,9,20,0.6); color: #e50914; border-radius: 4px; box-shadow: none;">Huỷ vé</button>
                                    </div>"""

if old_buttons in html:
    html = html.replace(old_buttons, new_buttons)
else:
    print("Could not find old buttons.")

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("Buttons flattened and modernized.")
