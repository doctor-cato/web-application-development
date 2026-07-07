const fs = require('fs');
const path = require('path');
const filePath = path.join('frontend', 'src', 'user', 'user-profile', 'profile.html');
let content = fs.readFileSync(filePath, 'utf8');

const newScript = `<script>
        let currentCancelId = null;

        function openCancelModal(name, time, seats, price, idStr = null) {
            currentCancelId = idStr;
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
                
                if (currentCancelId) {
                    document.dispatchEvent(new CustomEvent('cancelTicket', { detail: currentCancelId }));
                } else {
                    // Fallback for static f1-status
                    const statusBadge = document.getElementById('f1-status');
                    if (statusBadge) {
                        statusBadge.className = 'status';
                        statusBadge.style.background = 'rgba(255, 255, 255, 0.1)';
                        statusBadge.style.color = '#aaa';
                        statusBadge.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                        statusBadge.innerText = 'Đã huỷ';
                        
                        const actionDiv = statusBadge.parentElement;
                        if(actionDiv) {
                            const cancelledText = document.createElement('div');
                            cancelledText.innerHTML = '<div style="font-size: 0.85rem; color: #e50914; margin-top: 0.5rem; text-align: right;"><i class="fas fa-times-circle"></i> Đã hoàn tiền 80%</div>';
                            actionDiv.appendChild(cancelledText);
                            
                            const card = actionDiv.closest('.history-card');
                            if(card) {
                                card.style.opacity = '0.6';
                                const cb = card.querySelector('.ticket-cb');
                                if(cb) cb.disabled = true;
                            }
                        }
                    }
                    if(document.getElementById('f1-view-btn')) document.getElementById('f1-view-btn').style.display = 'none';
                    if(document.getElementById('f1-cancel-btn')) document.getElementById('f1-cancel-btn').style.display = 'none';
                }
            }, 1000);
        }`;

const match = content.match(/<script>[\s\S]*?function confirmCancel\(\)[\s\S]*?1000\);\s*}/);
if (match) {
    content = content.replace(match[0], newScript);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated profile.html');
} else {
    console.log('Failed to match script block in profile.html');
}
