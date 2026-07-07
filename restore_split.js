const fs = require('fs');

const codeToAppend = `
    const splitPayBtn = document.getElementById('btn-split-pay');
    const splitModal = document.getElementById('split-modal');
    const closeSplitModal = document.getElementById('close-split-modal');
    const btnCopyLink = document.getElementById('btn-copy-link');

    if (splitPayBtn && splitModal) {
        splitPayBtn.addEventListener('click', () => {
            const seats = checkoutSessionData.seats || [];
            if (seats.length <= 1) {
                alert('Chia sẻ thanh toán chỉ áp dụng khi bạn đặt từ 2 vé trở lên.');
                return;
            }

            const container = document.getElementById('split-seats-container');
            if (container) {
                container.innerHTML = '';
                const originalTotal = parseDataAmount(document.getElementById('order-total'));
                const pricePerSeat = Math.floor(originalTotal / seats.length);

                seats.forEach((seat, index) => {
                    const row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.alignItems = 'center';
                    row.style.justifyContent = 'space-between';
                    row.style.padding = '0.5rem';
                    row.style.background = 'rgba(255,255,255,0.05)';
                    row.style.borderRadius = '4px';

                    const isHost = index === 0;
                    const hostLabel = isHost ? '<span style="font-size:0.7rem; color:var(--neon-green); border:1px solid; padding:2px; border-radius:3px;">BẠN</span>' : '';
                    
                    row.innerHTML = \`
                        <div style="display:flex; align-items:center; gap:0.5rem; width: 40%;">
                            <span style="color:#fff; font-weight:bold;">Ghế \${seat}</span>
                            \${hostLabel}
                        </div>
                        <input type="text" class="split-user-input" data-seat="\${seat}" placeholder="\${isHost ? 'Bạn (Host)' : 'Tên người bạn...'}" style="width:30%; padding:0.25rem; border-radius:4px; border:1px solid rgba(255,255,255,0.2); background:transparent; color:#fff;" \${isHost ? 'disabled' : ''}>
                        <label style="color:#aaa; font-size:0.8rem; display:flex; align-items:center; gap:0.25rem; width:25%;">
                            <input type="checkbox" id="pay-for-\${seat}" \${isHost ? 'checked disabled' : ''}> Trả hộ
                        </label>
                    \`;
                    container.appendChild(row);
                });

                container.addEventListener('change', updatePreview);
            }
            
            function updatePreview() {
                const originalTotal = parseDataAmount(document.getElementById('order-total'));
                const pricePerSeat = Math.floor(originalTotal / seats.length);
                let hostCount = 0;
                document.querySelectorAll('input[type="checkbox"][id^="pay-for-"]').forEach(cb => {
                    if (cb.checked) hostCount++;
                });
                const previewEl = document.getElementById('split-host-total');
                if (previewEl) previewEl.innerText = (hostCount * pricePerSeat).toLocaleString() + ' đ';
            }

            updatePreview();
            splitModal.style.display = 'flex';
        });
    }

    const confirmSplitBtn = document.getElementById('btn-confirm-split');
    if (confirmSplitBtn) {
        confirmSplitBtn.addEventListener('click', () => {
            const orderId = 'SPLIT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            const baseUrl = window.location.href.split('?')[0].replace('checkout/checkout.html', 'group-booking/room.html');
            const splitLink = baseUrl + '?order=' + orderId;
            
            const splitLinkInput = document.getElementById('split-link-input');
            if (splitLinkInput) splitLinkInput.value = splitLink;
            
            const goLobbyBtn = document.getElementById('btn-go-lobby');
            if (goLobbyBtn) goLobbyBtn.href = splitLink;
            
            const assignments = [];
            document.querySelectorAll('.split-user-input').forEach(input => {
                if (input.disabled) return; 
                const seat = input.getAttribute('data-seat');
                const username = input.value.trim();
                const payForCb = document.getElementById('pay-for-' + seat);
                const isPaidFor = payForCb ? payForCb.checked : false;
                assignments.push({ seat, username, isPaidFor });
            });
            
            const splitData = {
                orderId: orderId,
                checkoutData: checkoutSessionData,
                customFood: localStorage.getItem('selectedFood'),
                status: 'PENDING',
                paidSeats: [checkoutSessionData.seats[0]], 
                assignments: assignments
            };
            
            assignments.forEach(a => {
                if (a.isPaidFor) splitData.paidSeats.push(a.seat);
            });
            
            localStorage.setItem('splitOrder_' + orderId, JSON.stringify(splitData));
            localStorage.setItem('mySeatForOrder_' + orderId, checkoutSessionData.seats[0]);
            
            let notifs = [];
            try { notifs = JSON.parse(localStorage.getItem('3hd2k_notifications') || '[]'); } catch(e) {}
            
            const currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).username || 'Host' : 'Host';
            const movieTitle = checkoutSessionData.movieTitle || 'Phim ẩn danh';
            
            assignments.forEach(a => {
                if (a.username) {
                    if (a.isPaidFor) {
                        notifs.push({
                            id: Date.now() + Math.random(),
                            targetUser: a.username,
                            category: 'booking',
                            title: 'Vé được thanh toán hộ!',
                            message: \`Bạn được \${currentUser} tặng vé phim \${movieTitle} (Ghế \${a.seat}). Nhấn để nhận vé.\`,
                            timestamp: Date.now(),
                            unread: true,
                            action: 'receive_ticket',
                            bookingData: {
                                movieTitle,
                                showtimeText: checkoutSessionData.showtimeText,
                                room: checkoutSessionData.room,
                                seat: a.seat,
                                poster: checkoutSessionData.poster
                            }
                        });
                    } else {
                        notifs.push({
                            id: Date.now() + Math.random(),
                            targetUser: a.username,
                            category: 'booking',
                            title: 'Lời mời xem phim & Thanh toán',
                            message: \`Bạn được \${currentUser} mời xem phim \${movieTitle} (Ghế \${a.seat}). Nhấn để thanh toán phần của bạn.\`,
                            timestamp: Date.now(),
                            unread: true,
                            action: 'pay_split',
                            splitLink: splitLink
                        });
                    }
                }
            });
            
            localStorage.setItem('3hd2k_notifications', JSON.stringify(notifs));
            
            let hostTotalCost = 0;
            const originalTotal = parseDataAmount(document.getElementById('order-total'));
            const seatCount = checkoutSessionData.seats.length;
            const pricePerSeat = Math.floor(originalTotal / (seatCount || 1));
            
            let hostPaidCount = 1; 
            assignments.forEach(a => {
                if (a.isPaidFor) hostPaidCount++;
            });
            hostTotalCost = hostPaidCount * pricePerSeat;
            
            const totalEl = document.getElementById('order-total');
            if (totalEl) {
                totalEl.setAttribute('data-amount', hostTotalCost);
                totalEl.innerText = hostTotalCost.toLocaleString() + ' đ';
            }
            
            const seatAmountEl = document.getElementById('order-summary-seat-amount');
            if (seatAmountEl) {
                seatAmountEl.setAttribute('data-amount', hostTotalCost);
                seatAmountEl.innerText = hostTotalCost.toLocaleString() + ' đ';
            }
            
            const seatsEl = document.getElementById('order-summary-seats');
            if (seatsEl) {
                seatsEl.innerHTML = '';
                const span = document.createElement('span');
                span.className = 'seat-badge';
                span.innerText = checkoutSessionData.seats[0] + (hostPaidCount > 1 ? \` (+\${hostPaidCount-1} trả hộ)\` : '');
                seatsEl.appendChild(span);
            }
            
            const orderData = {
                checkoutData: checkoutSessionData,
                paidSeats: [],
                cancelledSeats: []
            };

            fetch(\`/api/groupbooking/\${orderId}\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            }).then(res => res.json())
              .then(data => {
                  console.log("Group Order Saved: ", data);
                  
                  checkoutSessionData.seats = [checkoutSessionData.seats[0]];
                  checkoutSessionData.total = hostTotalCost;
                  saveCheckout(checkoutSessionData);
                  
                  document.getElementById('split-link-section').style.display = 'flex';
                  confirmSplitBtn.style.display = 'none';
                  if (goLobbyBtn) goLobbyBtn.style.display = 'block';
                  
                  alert('Đã gán ghế và tạo lời mời thành công! Link đã sẵn sàng.');
              }).catch(err => {
                  console.error("Lỗi khi lưu Vé Nhóm:", err);
                  alert("Không thể kết nối đến máy chủ nhóm. Vui lòng thử lại.");
              });
        });
    }

    if (closeSplitModal) {
        closeSplitModal.addEventListener('click', () => {
            splitModal.style.display = 'none';
        });
    }

    if (btnCopyLink) {
        btnCopyLink.addEventListener('click', () => {
            const input = document.getElementById('split-link-input');
            if (input) {
                input.select();
                document.execCommand('copy');
                const originalText = btnCopyLink.innerHTML;
                btnCopyLink.innerHTML = '<i class="fas fa-check"></i>';
                btnCopyLink.style.color = '#10b981';
                setTimeout(() => {
                    btnCopyLink.innerHTML = originalText;
                    btnCopyLink.style.color = 'var(--primary-red)';
                }, 2000);
            }
        });
    }
`;

fs.appendFileSync('frontend/src/booking/checkout/checkout.js', codeToAppend);
console.log('Restored split pay logic and updated fetch URL.');
