import re

html_file = 'src/user/user-profile/profile.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# I will use a regex to replace the entire div containing the buttons
old_div_pattern = r'<div style="display: flex; gap: 0\.5rem; margin-top: 0\.75rem; width: 100%;">.*?</div>'

new_div = """<div style="display: flex; gap: 0.75rem; margin-top: 1rem; justify-content: flex-end; width: 100%;">
                                        <button id="f1-view-btn" style="padding: 0.35rem 1rem; font-size: 0.8rem; font-family: 'Inter', sans-serif; font-weight: 500; border-radius: 30px; background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">Xem mã vé</button>
                                        <button id="f1-cancel-btn" onclick="openCancelModal('F1: The Movie', '20:00 - 15/06/2026', 'E5, E6', '250.000đ')" style="padding: 0.35rem 1rem; font-size: 0.8rem; font-family: 'Inter', sans-serif; font-weight: 500; border-radius: 30px; background: transparent; border: 1px solid rgba(229,9,20,0.5); color: #e50914; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(229,9,20,0.1)'; this.style.borderColor='#e50914'" onmouseout="this.style.background='transparent'; this.style.borderColor='rgba(229,9,20,0.5)'">Huỷ vé</button>
                                    </div>"""

html = re.sub(old_div_pattern, new_div, html, flags=re.DOTALL)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("Buttons redone to be pill-shaped and fit content size.")
