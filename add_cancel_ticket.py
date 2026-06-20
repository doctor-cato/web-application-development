import re

html_file = 'src/user/user-profile/profile.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add 'Huỷ vé' button to the first ticket (Sắp chiếu)
old_action_1 = """                                <div class="history-action">
                                    <span class="status status-upcoming">Sắp chiếu</span>
                                    <div class="history-price">250.000đ</div>
                                    <button class="btn-ticket">Xem mã vé</button>
                                </div>"""

new_action_1 = """                                <div class="history-action">
                                    <span class="status status-upcoming" id="f1-status">Sắp chiếu</span>
                                    <div class="history-price">250.000đ</div>
                                    <button class="btn-ticket" id="f1-view-btn">Xem mã vé</button>
                                    <button class="btn-ticket btn-outline-danger" id="f1-cancel-btn" onclick="openCancelModal('F1: The Movie', '20:00 - 15/06/2026', 'E5, E6', '250.000đ')" style="margin-top: 0.5rem; background: transparent; border: 1px solid #e50914; color: #e50914;">Huỷ vé</button>
                                </div>"""

html = html.replace(old_action_1, new_action_1)

# 2. Add Modal HTML at the end of the body
modal_html = """
    <!-- Cancel Ticket Modal -->
    <div id="cancel-modal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 9999; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
        <div class="glass-panel" style="width: 90%; max-width: 450px; padding: 2rem; position: relative; border: 1px solid rgba(229,9,20,0.3); border-radius: 16px; background: linear-gradient(145deg, rgba(20,20,20,0.9), rgba(10,10,10,0.95)); box-shadow: 0 10px 40px rgba(229,9,20,0.2);">
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(229,9,20,0.1); color: #e50914; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1rem; border: 1px solid rgba(229,9,20,0.3); box-shadow: 0 0 20px rgba(229,9,20,0.4);">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 style="font-family: 'Oswald', sans-serif; font-size: 1.75rem; color: #fff; margin: 0; letter-spacing: 1px;">XÁC NHẬN HUỶ VÉ</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">Bạn có chắc chắn muốn huỷ vé này không?</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <p style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #fff; font-weight: 600;" id="cancel-movie-name">Phim</p>
                <p style="margin: 0 0 0.25rem 0; font-size: 0.85rem; color: #aaa;"><i class="fas fa-clock"></i> <span id="cancel-movie-time">Thời gian</span></p>
                <p style="margin: 0 0 0.25rem 0; font-size: 0.85rem; color: #aaa;"><i class="fas fa-couch"></i> <span id="cancel-movie-seats">Ghế</span></p>
                <div style="border-top: 1px dashed rgba(255,255,255,0.1); margin: 0.5rem 0; padding-top: 0.5rem; display: flex; justify-content: space-between;">
                    <span style="color: #aaa; font-size: 0.9rem;">Số tiền hoàn lại (80%):</span>
                    <span style="color: #10b981; font-weight: 700; font-size: 1.1rem;" id="cancel-refund-amount">0đ</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem;">
                <button onclick="closeCancelModal()" class="btn-ticket" style="flex: 1; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff;">GIỮ LẠI VÉ</button>
                <button onclick="confirmCancel()" class="btn-ticket" style="flex: 1; background: #e50914; border: none; color: #fff; font-weight: 700; box-shadow: 0 0 15px rgba(229,9,20,0.5);">XÁC NHẬN HUỶ</button>
            </div>
        </div>
    </div>
"""

# Insert before closing body tag
html = html.replace('</body>', modal_html + '\n</body>')

# 3. Add inline JS
js_logic = """
    <script>
        function openCancelModal(name, time, seats, price) {
            document.getElementById('cancel-movie-name').innerText = name;
            document.getElementById('cancel-movie-time').innerText = time;
            document.getElementById('cancel-movie-seats').innerText = seats;
            
            // Calculate 80% refund
            let priceNum = parseInt(price.replace(/\\./g, '').replace('đ', ''));
            let refundNum = priceNum * 0.8;
            document.getElementById('cancel-refund-amount').innerText = refundNum.toLocaleString('vi-VN') + 'đ';
            
            const modal = document.getElementById('cancel-modal');
            modal.style.display = 'flex';
            modal.style.animation = 'fadeIn 0.3s ease';
        }

        function closeCancelModal() {
            const modal = document.getElementById('cancel-modal');
            modal.style.display = 'none';
        }

        function confirmCancel() {
            // Show loading state
            const btn = document.querySelector('#cancel-modal button:last-child');
            const originalText = btn.innerText;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG XỬ LÝ...';
            btn.style.pointerEvents = 'none';
            
            setTimeout(() => {
                closeCancelModal();
                btn.innerHTML = originalText;
                btn.style.pointerEvents = 'auto';
                
                // Update UI to Cancelled state
                const statusBadge = document.getElementById('f1-status');
                statusBadge.className = 'status';
                statusBadge.style.background = 'rgba(255, 255, 255, 0.1)';
                statusBadge.style.color = '#aaa';
                statusBadge.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                statusBadge.innerText = 'Đã huỷ';
                
                document.getElementById('f1-view-btn').style.display = 'none';
                document.getElementById('f1-cancel-btn').style.display = 'none';
                
                // Add a text indicating cancellation
                const actionDiv = document.getElementById('f1-status').parentElement;
                const cancelledText = document.createElement('div');
                cancelledText.innerHTML = '<div style="font-size: 0.85rem; color: #e50914; margin-top: 0.5rem; text-align: right;"><i class="fas fa-times-circle"></i> Đã hoàn tiền 80%</div>';
                actionDiv.appendChild(cancelledText);
                
                // Disable card visually
                const card = actionDiv.parentElement;
                card.style.opacity = '0.6';
                card.style.filter = 'grayscale(100%)';
                
                alert('Huỷ vé thành công! Số tiền hoàn lại sẽ được chuyển vào tài khoản của bạn trong 3-5 ngày làm việc.');
            }, 1500);
        }
    </script>
"""

# Insert JS before closing body
html = html.replace('</body>', js_logic + '\n</body>')

# 4. Add keyframe for fadeIn
css_keyframe = """
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
"""
html = html.replace('</style>', css_keyframe + '\n</style>')


with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("Cancel modal and logic added.")
