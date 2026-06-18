import re

html_file = 'src/user/user-profile/profile.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

old_div_pattern = r'<div style="display: flex; gap: 0\.75rem; margin-top: 1rem; justify-content: flex-end; width: 100%;">.*?</div>'

# Swapping the order: Cancel first, then View.
# Also making the View button red (`#e50914`).
new_div = """<div style="display: flex; gap: 0.75rem; margin-top: 1rem; justify-content: flex-end; width: 100%;">
                                        <button id="f1-cancel-btn" onclick="openCancelModal('F1: The Movie', '20:00 - 15/06/2026', 'E5, E6', '250.000đ')" style="padding: 0.35rem 1rem; font-size: 0.8rem; font-family: 'Inter', sans-serif; font-weight: 500; border-radius: 30px; background: transparent; border: 1px solid rgba(229,9,20,0.5); color: #e50914; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(229,9,20,0.1)'; this.style.borderColor='#e50914'" onmouseout="this.style.background='transparent'; this.style.borderColor='rgba(229,9,20,0.5)'">Huỷ vé</button>
                                        <button id="f1-view-btn" style="padding: 0.35rem 1rem; font-size: 0.8rem; font-family: 'Inter', sans-serif; font-weight: 500; border-radius: 30px; background: #e50914; color: #fff; border: 1px solid #e50914; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 10px rgba(229,9,20,0.3);" onmouseover="this.style.background='#ff4b4b'; this.style.boxShadow='0 6px 15px rgba(229,9,20,0.5)'" onmouseout="this.style.background='#e50914'; this.style.boxShadow='0 4px 10px rgba(229,9,20,0.3)'">Xem mã vé</button>
                                    </div>"""

html = re.sub(old_div_pattern, new_div, html, flags=re.DOTALL)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("Buttons swapped and red color restored.")
