import re

html_file = 'src/user/user-profile/profile.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update the existing ticket's openTicketModal call to pass data
old_f1_btn = '<button id="f1-view-btn" onclick="openTicketModal()" '
new_f1_btn = '<button id="f1-view-btn" onclick="openTicketModal(\'single\', \'F1: The Movie\', \'15/06/2026\', \'20:00\', \'Rạp 1\', \'E5, E6\', \'3HD2K Vincom Đồng Khởi\', \'/shared/images/f1_movie.jpg\', \'3HD2K-9X8K2M\')" '
html = html.replace(old_f1_btn, new_f1_btn)

# 2. Add the new Group Ticket card
group_ticket_html = """
                            <!-- Ticket 2: Group Ticket -->
                            <div class="history-card">
                                <div class="history-img">
                                    <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80" alt="Avenger">
                                </div>
                                <div class="history-info">
                                    <h3>Interstellar</h3>
                                    <p><i class="fas fa-map-marker-alt"></i> 3HD2K Vincom Đồng Khởi - IMAX</p>
                                    <p><i class="fas fa-clock"></i> 19:30 - 20/06/2026</p>
                                    <p><i class="fas fa-couch"></i> Ghế: G1, G2, G3, G4</p>
                                    <div style="margin-top: 0.5rem;"><span style="background: rgba(16,185,129,0.2); color: #10b981; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; border: 1px solid rgba(16,185,129,0.4);">Vé Nhóm (Split & Lock)</span></div>
                                </div>
                                <div class="history-action">
                                    <span class="status status-upcoming" id="f2-status">Sắp chiếu</span>
                                    <div class="history-price">500.000đ</div>
                                    <div style="display: flex; gap: 0.75rem; margin-top: 1rem; justify-content: flex-end; width: 100%;">
                                        <button id="f2-cancel-btn" onclick="openCancelModal('Interstellar', '19:30 - 20/06/2026', 'G1, G2, G3, G4', '500.000đ')" style="padding: 0.35rem 1rem; font-size: 0.8rem; font-family: 'Inter', sans-serif; font-weight: 500; border-radius: 30px; background: transparent; border: 1px solid rgba(229,9,20,0.5); color: #e50914; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(229,9,20,0.1)'; this.style.borderColor='#e50914'" onmouseout="this.style.background='transparent'; this.style.borderColor='rgba(229,9,20,0.5)'">Huỷ vé</button>
                                        <button id="f2-view-btn" onclick="openTicketModal('group', 'Interstellar', '20/06/2026', '19:30', 'IMAX', 'G1, G2, G3, G4', '3HD2K Vincom Đồng Khởi', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80', '3HD2K-GROUP4')" style="padding: 0.35rem 1rem; font-size: 0.8rem; font-family: 'Inter', sans-serif; font-weight: 500; border-radius: 30px; background: #e50914; color: #fff; border: 1px solid #e50914; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 10px rgba(229,9,20,0.3);" onmouseover="this.style.background='#ff4b4b'; this.style.boxShadow='0 6px 15px rgba(229,9,20,0.5)'" onmouseout="this.style.background='#e50914'; this.style.boxShadow='0 4px 10px rgba(229,9,20,0.3)'">Xem mã vé</button>
                                    </div>
                                </div>
                            </div>
"""
# Insert after Ticket 1 end (which ends right before <!-- Ticket 1 --> or <!-- Ticket 2 --> if it existed)
# Let's find <!-- Ticket 1 --> block end.
# Actually I can just insert it before <!-- Ticket 1 --> if it doesn't break, or after.
insert_pos = html.find('                            <!-- Ticket 1 -->')
if insert_pos != -1:
    html = html[:insert_pos] + group_ticket_html + '\n' + html[insert_pos:]
else:
    # fallback
    html = html.replace('<div class="history-list">', '<div class="history-list">\n' + group_ticket_html)

# 3. Add ID tags to Modal elements to allow JS updating
modal_replacements = [
    ('<img src="/shared/images/f1_movie.jpg" class="ticket-bg-blur" alt="blur"', '<img id="t-modal-bg" src="/shared/images/f1_movie.jpg" class="ticket-bg-blur" alt="blur"'),
    ('<span class="ticket-badge">VÉ ĐIỆN TỬ</span>', '<span id="t-modal-badge" class="ticket-badge">VÉ ĐIỆN TỬ</span>'),
    ('<h2 class="ticket-title">F1: The Movie</h2>', '<h2 id="t-modal-title" class="ticket-title">F1: The Movie</h2>'),
    ('<span class="detail-value">15/06/2026</span>', '<span id="t-modal-date" class="detail-value">15/06/2026</span>'),
    ('<span class="detail-value">20:00</span>', '<span id="t-modal-time" class="detail-value">20:00</span>'),
    ('<span class="detail-value">Rạp 1</span>', '<span id="t-modal-room" class="detail-value">Rạp 1</span>'),
    ('<span class="detail-value" style="color: var(--primary-red);">E5, E6</span>', '<span id="t-modal-seats" class="detail-value" style="color: var(--primary-red);">E5, E6</span>'),
    ('<span class="detail-value" style="font-size: 0.9rem; font-family: \'Inter\', sans-serif;">3HD2K Vincom Đồng Khởi</span>', '<span id="t-modal-location" class="detail-value" style="font-size: 0.9rem; font-family: \'Inter\', sans-serif;">3HD2K Vincom Đồng Khởi</span>'),
    ('<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=F1-E5-E6-2026-3HD2K" alt="QR Code">', '<img id="t-modal-qr" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=F1-E5-E6-2026-3HD2K" alt="QR Code">'),
    ('Mã Đơn: <span>3HD2K-9X8K2M</span>', 'Mã Đơn: <span id="t-modal-id">3HD2K-9X8K2M</span>'),
    ('<p style="font-size: 0.75rem; color: #888; text-align: center; margin-top: 0.5rem;">Đưa mã này cho nhân viên soát vé</p>', '<p id="t-modal-note" style="font-size: 0.75rem; color: #888; text-align: center; margin-top: 0.5rem; padding: 0 1rem; line-height: 1.4;">Đưa mã này cho nhân viên soát vé</p>')
]

for old_s, new_s in modal_replacements:
    html = html.replace(old_s, new_s)

# Handle specifically the 'Mã Đơn' replacement because of my exact string
html = html.replace('<p class="booking-id">MÃ ĐƠN: <span>3HD2K-9X8K2M</span></p>', '<p class="booking-id">MÃ ĐƠN: <span id="t-modal-id">3HD2K-9X8K2M</span></p>')


# 4. Refactor JS
old_js = """        function openTicketModal() {
            const modal = document.getElementById('eticket-modal');
            modal.style.display = 'flex';
        }"""
        
new_js = """        function openTicketModal(type, title, date, time, room, seats, location, poster, bookingId) {
            document.getElementById('t-modal-title').innerText = title;
            document.getElementById('t-modal-date').innerText = date;
            document.getElementById('t-modal-time').innerText = time;
            document.getElementById('t-modal-room').innerText = room;
            document.getElementById('t-modal-seats').innerText = seats;
            document.getElementById('t-modal-location').innerText = location;
            document.getElementById('t-modal-bg').src = poster;
            document.getElementById('t-modal-qr').src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + bookingId;
            document.getElementById('t-modal-id').innerText = bookingId;
            
            const badge = document.getElementById('t-modal-badge');
            const note = document.getElementById('t-modal-note');
            
            if (type === 'group') {
                const count = seats.split(',').length;
                badge.innerText = 'VÉ NHÓM (' + count + ' NGƯỜI)';
                badge.style.background = 'rgba(16, 185, 129, 0.2)';
                badge.style.color = '#10b981';
                badge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                note.innerHTML = 'Mã QR này áp dụng cho toàn bộ ' + count + ' thành viên. Hãy nhấn <b>Chia sẻ</b> để gửi cho bạn bè đến sau quét vé nhé!';
                note.style.color = '#fff';
            } else {
                badge.innerText = 'VÉ ĐIỆN TỬ';
                badge.style.background = 'rgba(229, 9, 20, 0.2)';
                badge.style.color = '#ff4b4b';
                badge.style.borderColor = 'rgba(229, 9, 20, 0.3)';
                note.innerText = 'Đưa mã này cho nhân viên soát vé';
                note.style.color = '#888';
            }

            const modal = document.getElementById('eticket-modal');
            modal.style.display = 'flex';
        }"""
        
html = html.replace(old_js, new_js)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("Mock group ticket added.")
