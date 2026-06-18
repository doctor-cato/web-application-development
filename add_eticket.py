import re

html_file = 'src/user/user-profile/profile.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update the 'Xem mã vé' button to call JS function
old_btn = '<button id="f1-view-btn" style="padding: 0.35rem 1rem; font-size: 0.8rem; font-family: \'Inter\', sans-serif; font-weight: 500; border-radius: 30px; background: #e50914; color: #fff; border: 1px solid #e50914; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 10px rgba(229,9,20,0.3);" onmouseover="this.style.background=\'#ff4b4b\'; this.style.boxShadow=\'0 6px 15px rgba(229,9,20,0.5)\'" onmouseout="this.style.background=\'#e50914\'; this.style.boxShadow=\'0 4px 10px rgba(229,9,20,0.3)\'">Xem mã vé</button>'

new_btn = '<button id="f1-view-btn" onclick="openTicketModal()" style="padding: 0.35rem 1rem; font-size: 0.8rem; font-family: \'Inter\', sans-serif; font-weight: 500; border-radius: 30px; background: #e50914; color: #fff; border: 1px solid #e50914; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 10px rgba(229,9,20,0.3);" onmouseover="this.style.background=\'#ff4b4b\'; this.style.boxShadow=\'0 6px 15px rgba(229,9,20,0.5)\'" onmouseout="this.style.background=\'#e50914\'; this.style.boxShadow=\'0 4px 10px rgba(229,9,20,0.3)\'">Xem mã vé</button>'

html = html.replace(old_btn, new_btn)

# 2. Add Modal HTML and CSS
modal_html = """
    <!-- E-Ticket Modal -->
    <div id="eticket-modal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
        
        <div style="position: absolute; top: 1.5rem; right: 1.5rem; color: #fff; font-size: 2rem; cursor: pointer; transition: transform 0.2s;" onclick="closeTicketModal()" onmouseover="this.style.transform='rotate(90deg)'" onmouseout="this.style.transform='rotate(0deg)'">
            <i class="fas fa-times"></i>
        </div>

        <div class="ticket-wrapper">
            <div class="ticket-top">
                <img src="/shared/images/f1_movie.jpg" class="ticket-bg-blur" alt="blur" onerror="this.src='https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&q=80'">
                <div class="ticket-content">
                    <span class="ticket-badge">VÉ ĐIỆN TỬ</span>
                    <h2 class="ticket-title">F1: The Movie</h2>
                    
                    <div class="ticket-details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Ngày</span>
                            <span class="detail-value">15/06/2026</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Giờ chiếu</span>
                            <span class="detail-value">20:00</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Rạp</span>
                            <span class="detail-value">Rạp 1</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Ghế</span>
                            <span class="detail-value" style="color: var(--primary-red);">E5, E6</span>
                        </div>
                    </div>
                    
                    <div class="detail-item" style="margin-top: 1rem;">
                        <span class="detail-label">Địa điểm</span>
                        <span class="detail-value" style="font-size: 0.9rem; font-family: 'Inter', sans-serif;">3HD2K Vincom Đồng Khởi</span>
                    </div>
                </div>
            </div>
            
            <div class="ticket-divider">
                <div class="notch left-notch"></div>
                <div class="dashed-line"></div>
                <div class="notch right-notch"></div>
            </div>
            
            <div class="ticket-bottom">
                <div class="qr-container">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=F1-E5-E6-2026-3HD2K" alt="QR Code">
                </div>
                <p class="booking-id">MÃ ĐƠN: <span>3HD2K-9X8K2M</span></p>
                <p style="font-size: 0.75rem; color: #888; text-align: center; margin-top: 0.5rem;">Đưa mã này cho nhân viên soát vé</p>
            </div>
        </div>
        
        <!-- Action Buttons -->
        <div style="position: absolute; bottom: 2rem; display: flex; gap: 1rem; animation: fadeIn 1s ease forwards; opacity: 0;">
            <button class="btn-ticket" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 30px; padding: 0.75rem 1.5rem; color: #fff; cursor: pointer; backdrop-filter: blur(5px);"><i class="fas fa-download"></i> Tải vé về</button>
            <button class="btn-ticket" style="background: var(--primary-red); border: 1px solid var(--primary-red); border-radius: 30px; padding: 0.75rem 1.5rem; color: #fff; box-shadow: 0 0 15px rgba(229,9,20,0.4); cursor: pointer;"><i class="fas fa-share-alt"></i> Chia sẻ</button>
        </div>
    </div>
"""

css_add = """
    /* E-Ticket Styles */
    .ticket-wrapper {
        width: 320px;
        filter: drop-shadow(0 20px 40px rgba(0,0,0,0.8));
        animation: slideUpTicket 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        transform: translateY(150px);
        opacity: 0;
    }
    @keyframes slideUpTicket {
        to { transform: translateY(0); opacity: 1; }
    }
    .ticket-top {
        background: linear-gradient(145deg, rgba(30,30,30,0.9), rgba(15,15,15,0.95));
        border-radius: 16px 16px 0 0;
        position: relative;
        overflow: hidden;
        padding: 2rem 1.5rem 1.5rem 1.5rem;
        border: 1px solid rgba(255,255,255,0.1);
        border-bottom: none;
    }
    .ticket-bg-blur {
        position: absolute;
        top: -20%; left: -20%; width: 140%; height: 140%;
        object-fit: cover;
        filter: blur(25px) opacity(0.2);
        z-index: 0;
    }
    .ticket-content {
        position: relative;
        z-index: 1;
    }
    .ticket-badge {
        background: rgba(229, 9, 20, 0.2);
        color: #ff4b4b;
        border: 1px solid rgba(229, 9, 20, 0.3);
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 1px;
    }
    .ticket-title {
        font-family: 'Oswald', sans-serif;
        font-size: 2.2rem;
        margin: 1rem 0;
        color: #fff;
        line-height: 1.1;
        text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        text-transform: uppercase;
    }
    .ticket-details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
    .detail-item {
        display: flex;
        flex-direction: column;
    }
    .detail-label {
        font-size: 0.75rem;
        color: #aaa;
        text-transform: uppercase;
        margin-bottom: 0.2rem;
    }
    .detail-value {
        font-size: 1.2rem;
        font-weight: 700;
        color: #fff;
        font-family: 'Bebas Neue', sans-serif;
        letter-spacing: 1px;
    }
    .ticket-divider {
        height: 30px;
        background: linear-gradient(145deg, rgba(30,30,30,0.9), rgba(15,15,15,0.95));
        position: relative;
        display: flex;
        align-items: center;
        border-left: 1px solid rgba(255,255,255,0.1);
        border-right: 1px solid rgba(255,255,255,0.1);
    }
    .notch {
        width: 30px;
        height: 30px;
        background: #111; /* roughly matches modal backdrop over dark bg */
        border-radius: 50%;
        position: absolute;
        z-index: 2;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
    }
    .left-notch { left: -16px; border-right: 1px solid rgba(255,255,255,0.1); }
    .right-notch { right: -16px; border-left: 1px solid rgba(255,255,255,0.1); }
    
    .dashed-line {
        width: 100%;
        height: 0;
        border-bottom: 2px dashed rgba(255,255,255,0.2);
        margin: 0 20px;
    }
    
    .ticket-bottom {
        background: linear-gradient(145deg, rgba(30,30,30,0.9), rgba(15,15,15,0.95));
        border-radius: 0 0 16px 16px;
        padding: 1.5rem 1.5rem 2rem 1.5rem;
        border: 1px solid rgba(255,255,255,0.1);
        border-top: none;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .qr-container {
        background: #fff;
        padding: 10px;
        border-radius: 12px;
        margin-bottom: 1rem;
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
    }
    .qr-container img {
        display: block;
        width: 140px;
        height: 140px;
    }
    .booking-id {
        font-family: 'Inter', monospace;
        font-weight: 700;
        font-size: 1.2rem;
        color: #fff;
        letter-spacing: 2px;
        margin: 0;
    }
"""

js_add = """
    <script>
        function openTicketModal() {
            const modal = document.getElementById('eticket-modal');
            modal.style.display = 'flex';
        }

        function closeTicketModal() {
            const modal = document.getElementById('eticket-modal');
            modal.style.display = 'none';
        }
    </script>
"""

# Inject HTML
html = html.replace('</body>', modal_html + '\n' + js_add + '\n</body>')

# Inject CSS
html = html.replace('</style>', css_add + '\n</style>')

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("E-ticket UI implemented.")
