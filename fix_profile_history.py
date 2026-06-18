import re

html_file = 'src/user/user-profile/profile.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the 'Mua lại' button
old_ticket_2_action = """                                <div class="history-action">
                                    <span class="status status-completed">Đã xem</span>
                                    <div class="history-price">375.000đ</div>
                                    <button class="btn-ticket btn-outline">Mua lại</button>
                                </div>"""

new_ticket_2_action = """                                <div class="history-action">
                                    <span class="status status-completed">Đã xem</span>
                                    <div class="history-price">375.000đ</div>
                                    <button class="btn-ticket btn-outline" style="display: none;">Mua lại</button>
                                    <div style="font-size: 0.85rem; color: #10b981; margin-top: 0.5rem; text-align: right;"><i class="fas fa-check-circle"></i> Đã hoàn tất</div>
                                </div>"""

html = html.replace(old_ticket_2_action, new_ticket_2_action)

# Enhance the history card style in HTML directly or via a style tag if we want to add more cinematic flair
css_upgrades = """
<style>
    /* Cinematic History UI Upgrades */
    .history-card {
        background: linear-gradient(145deg, rgba(30,30,30,0.6), rgba(15,15,15,0.8)) !important;
        border: 1px solid rgba(255,255,255,0.05) !important;
        border-radius: 12px !important;
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease !important;
        position: relative;
    }
    .history-card:hover {
        transform: translateY(-5px) !important;
        box-shadow: 0 10px 20px rgba(229, 9, 20, 0.2) !important;
        border-color: rgba(229, 9, 20, 0.3) !important;
    }
    .history-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; bottom: 0;
        width: 4px;
        background: var(--primary-red);
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    .history-card:hover::before {
        opacity: 1;
    }
    .history-info h3 {
        color: #fff;
        font-family: 'Oswald', sans-serif;
        letter-spacing: 1px;
        font-size: 1.5rem !important;
        text-shadow: 0 0 10px rgba(0,0,0,0.8);
    }
    .status-upcoming {
        background: rgba(229, 9, 20, 0.2) !important;
        color: #ff4b4b !important;
        border: 1px solid rgba(229, 9, 20, 0.5) !important;
        box-shadow: 0 0 10px rgba(229,9,20,0.3);
    }
    .status-completed {
        background: rgba(16, 185, 129, 0.1) !important;
        color: #10b981 !important;
        border: 1px solid rgba(16, 185, 129, 0.3) !important;
    }
</style>
"""

# inject CSS upgrades before </head>
html = html.replace('</head>', css_upgrades + '\n</head>')

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("Profile history fixed.")
