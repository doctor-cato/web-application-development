document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.notif-filter-btn');
    const markAllBtn = document.getElementById('notif-page-mark-all');
    const emptyState = document.getElementById('notif-empty');
    const notifFeed = document.querySelector('.notif-feed');
    let currentFilter = 'all';

    function getNotifIcon(category) {
        if (category === 'booking') return { wrap: 'red', icon: 'fas fa-ticket-alt' };
        if (category === 'movie') return { wrap: 'yellow', icon: 'fas fa-star' };
        if (category === 'promo') return { wrap: 'blue', icon: 'fas fa-tag' };
        return { wrap: 'gray', icon: 'fas fa-bell' };
    }

    function formatRelativeTime(timestamp) {
        const diffMs = Date.now() - timestamp;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        
        const d = new Date(timestamp);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }

    function renderNotifications() {
        // Read from localStorage
        let notifsStr = localStorage.getItem('3hd2k_notifications');
        if (!notifsStr) {
            localStorage.setItem('3hd2k_notifications', JSON.stringify([]));
            notifsStr = '[]';
        }
        let notifs = [];
        try { notifs = JSON.parse(notifsStr); } catch(e) {}
        
        const currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).username : null;
        
        // Filter by targetUser if specified
        notifs = notifs.filter(n => !n.targetUser || n.targetUser === currentUser);

        // Sort desc
        notifs.sort((a, b) => b.timestamp - a.timestamp);

        // Filter
        let visibleNotifs = notifs;
        if (currentFilter !== 'all') {
            if (currentFilter === 'unread') {
                visibleNotifs = notifs.filter(n => n.unread);
            } else {
                visibleNotifs = notifs.filter(n => n.category === currentFilter);
            }
        }

        // Update unread badge in sidebar
        const unreadCount = notifs.filter(n => n.unread).length;
        const unreadBadge = document.querySelector('.notif-filter-btn[data-filter="unread"] .badge');
        if (unreadBadge) {
            if (unreadCount > 0) {
                unreadBadge.textContent = unreadCount;
                unreadBadge.style.display = 'inline-block';
            } else {
                unreadBadge.style.display = 'none';
            }
        }

        // Remove old cards
        const oldCards = document.querySelectorAll('.notif-card');
        oldCards.forEach(c => c.remove());

        if (visibleNotifs.length === 0) {
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';
            
            visibleNotifs.forEach(n => {
                const iconInfo = getNotifIcon(n.category);
                const bId = n.bookingId || (n.id && n.id.startsWith('notif_') ? n.id.replace('notif_', '') : '');
                
                let actionBtn = '';
                if (n.action === 'receive_ticket') {
                    actionBtn = `<button class="btn-action receive-ticket-btn" data-id="${n.id}" style="margin-top: 10px; background: var(--primary-red); color: #fff; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer;">Nhận vé</button>`;
                } else if (n.action === 'pay_split') {
                    actionBtn = `<button class="btn-action" onclick="window.location.href='${n.splitLink}'" style="margin-top: 10px; background: #e50914; color: #fff; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer;">Thanh toán</button>`;
                }
                
                const cardHtml = `
                    <div class="notif-card ${n.unread ? 'unread' : ''}" data-id="${n.id}" ${bId && !n.action ? `onclick="window.location.href='../user-profile/profile.html?tab=history&bookingId=${bId}'" style="cursor: pointer;"` : ''}>
                        <div class="notif-card-icon ${iconInfo.wrap}"><i class="${iconInfo.icon}"></i></div>
                        <div class="notif-card-content">
                            <p class="notif-card-text"><strong>${n.title || ''}</strong> ${n.message || n.textLong || n.text}</p>
                            ${actionBtn}
                            <div class="notif-card-meta">
                                <span class="notif-card-time"><i class="far fa-clock"></i> ${formatRelativeTime(n.timestamp)}</span>
                            </div>
                        </div>
                        <div class="notif-card-actions">
                            <button class="notif-btn-delete" title="Xóa thông báo"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                `;
                emptyState.insertAdjacentHTML('beforebegin', cardHtml);
            });

            // Bind receive ticket events
            document.querySelectorAll('.receive-ticket-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const notifId = btn.getAttribute('data-id');
                    let currentNotifs = JSON.parse(localStorage.getItem('3hd2k_notifications') || '[]');
                    const notif = currentNotifs.find(n => n.id == notifId);
                    
                    if (notif && notif.bookingData) {
                        const currentUserData = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : {};
                        let bookings = JSON.parse(localStorage.getItem('3hd2k_bookings') || '[]');
                        
                        // Create individual ticket
                        bookings.push({
                            id: 'INDIV-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                            movieTitle: notif.bookingData.movieTitle,
                            showtimeText: notif.bookingData.showtimeText,
                            room: notif.bookingData.room,
                            seats: [notif.bookingData.seat],
                            combo: 'none',
                            total: 0, // Paid by host
                            userId: currentUserData.email || currentUserData.username || 'guest',
                            status: 'Confirmed',
                            createdAt: new Date().toISOString()
                        });
                        
                        localStorage.setItem('3hd2k_bookings', JSON.stringify(bookings));
                        
                        // Mark notif as read and remove action
                        notif.unread = false;
                        notif.action = null;
                        notif.message = notif.message + ' (Đã nhận vé)';
                        localStorage.setItem('3hd2k_notifications', JSON.stringify(currentNotifs));
                        
                        alert('Nhận vé thành công! Bạn có thể xem vé trong mục Lịch sử.');
                        renderNotifications();
                        if (window.updateNavNotifications) window.updateNavNotifications();
                    }
                });
            });

            // Bind delete events
            document.querySelectorAll('.notif-btn-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const card = btn.closest('.notif-card');
                    const id = card.getAttribute('data-id');
                    
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    
                    setTimeout(() => {
                        let currentNotifs = JSON.parse(localStorage.getItem('3hd2k_notifications') || '[]');
                        currentNotifs = currentNotifs.filter(n => n.id !== id);
                        localStorage.setItem('3hd2k_notifications', JSON.stringify(currentNotifs));
                        renderNotifications();
                        // Trigger navbar update event
                        if (window.updateNavNotifications) window.updateNavNotifications();
                    }, 200);
                });
            });
        }
    }

    // Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderNotifications();
        });
    });

    // Mark all as read
    if (markAllBtn) {
        markAllBtn.addEventListener('click', () => {
            let currentNotifs = JSON.parse(localStorage.getItem('3hd2k_notifications') || '[]');
            currentNotifs.forEach(n => n.unread = false);
            localStorage.setItem('3hd2k_notifications', JSON.stringify(currentNotifs));
            renderNotifications();
            if (window.updateNavNotifications) window.updateNavNotifications();
        });
    }

    // Auto-select tab from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
        const targetBtn = document.querySelector(`.notif-filter-btn[data-filter="${tabParam}"]`);
        if (targetBtn) {
            filterBtns.forEach(b => b.classList.remove('active'));
            targetBtn.classList.add('active');
            currentFilter = tabParam;
        }
    }

    renderNotifications();
});
