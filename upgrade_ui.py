import re

html_file = 'src/booking/seat-booking/booking.html'
css_file = 'src/booking/css/booking.css'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Remove the old group-seat-selector from above the seat grid
selector_html = """                    <!-- Group Seat Selector -->
                    <div class="group-seat-selector" style="margin-top: 1.5rem;">
                        <label>Số lượng ghế muốn đặt cùng lúc:</label>
                        <div class="group-seat-controls">
                            <button id="btn-group-minus" class="group-seat-btn" disabled>-</button>
                            <span id="group-size-display" class="group-seat-value">1</span>
                            <button id="btn-group-plus" class="group-seat-btn">+</button>
                        </div>
                    </div>

"""
html = html.replace(selector_html, "")

# 2. Insert the upgraded group-seat-selector below the seat-grid
# The seat-grid ends with: </p>\n                    </div>\n\n                </div>\n            </div>
upgraded_selector = """
                    <!-- Upgraded Group Seat Selector (Below map) -->
                    <div class="group-seat-selector glass-panel" style="margin-top: 2.5rem; display: flex; align-items: center; justify-content: space-between; max-width: 500px; padding: 1rem 1.5rem; border: 1px solid rgba(229, 9, 20, 0.3); box-shadow: 0 4px 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(229,9,20,0.1); border-radius: 50px;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(229, 9, 20, 0.2); display: flex; align-items: center; justify-content: center; color: var(--primary-red); font-size: 1.2rem;">
                                <i class="fas fa-user-friends"></i>
                            </div>
                            <div>
                                <div style="font-weight: 700; color: #fff; font-size: 1rem; letter-spacing: 0.5px;">Chọn ghế nhóm</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Tự động chọn các ghế sát nhau</div>
                            </div>
                        </div>
                        <div class="group-seat-controls" style="background: rgba(0,0,0,0.6); padding: 0.25rem 0.5rem; border-radius: 30px; border: 1px solid rgba(255,255,255,0.1);">
                            <button id="btn-group-minus" class="group-seat-btn" style="border-radius: 50%;" disabled><i class="fas fa-minus" style="font-size: 0.8rem;"></i></button>
                            <span id="group-size-display" class="group-seat-value" style="width: 30px; font-size: 1.2rem;">1</span>
                            <button id="btn-group-plus" class="group-seat-btn" style="border-radius: 50%; background: rgba(229, 9, 20, 0.2); color: var(--primary-red); border: 1px solid rgba(229, 9, 20, 0.3);"><i class="fas fa-plus" style="font-size: 0.8rem;"></i></button>
                        </div>
                    </div>
"""

# Find the end of seat grid
grid_end_regex = r'(<div id="seat-grid"[\s\S]*?</div>)'
html = re.sub(grid_end_regex, r'\1' + '\n' + upgraded_selector, html)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

with open(css_file, 'r', encoding='utf-8') as f:
    css = f.read()

# I will update the old .group-seat-btn hover logic just in case it's needed
css = css.replace('.group-seat-btn:hover:not(:disabled) {\n    background: var(--primary-red);\n}', '.group-seat-btn:hover:not(:disabled) {\n    background: var(--primary-red) !important;\n    color: #fff !important;\n    transform: scale(1.1);\n}')

with open(css_file, 'w', encoding='utf-8') as f:
    f.write(css)

print("UI Upgraded and Moved.")
