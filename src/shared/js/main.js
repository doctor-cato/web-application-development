// --- AUTH LOGIC (LOCALSTORAGE) ---
const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

if (isLoggedIn) {
    const navActions = document.querySelector('.nav-actions');
    if (navActions) {
        // Xóa nút chưa đăng nhập hiện tại
        const oldNotifBtn = document.getElementById('notif-btn');
        const oldUserBtn = document.querySelector('.user-btn');
        if (oldNotifBtn) oldNotifBtn.remove();
        if (oldUserBtn) oldUserBtn.remove();

        const userName = localStorage.getItem('userName') || 'Sigma Sicula';
        function getSrcPrefix() {
            const pathname = window.location.pathname;
            if (pathname.includes('/user-profile/') || pathname.includes('/user-notifications/') || pathname.includes('/user-login/') || pathname.includes('/user-register/')) {
                return '../../..';
            }
            if (pathname.includes('/home-page/') || pathname.includes('/movie-search/') || pathname.includes('/movie-details/') || pathname.includes('/cinema-map/') || pathname.includes('/aftercredit-lounge/')) {
                return '../..';
            }
            return '.';
        }
        const srcPrefix = getSrcPrefix();
        const defaultAvatar = `${srcPrefix}/shared/images/avatar.jpg`;
        const userAvatar = localStorage.getItem('userAvatar') || 'https://i.pravatar.cc/150?img=11';

        const loggedInHtml = `
            <div class="notif-btn" id="notif-btn">
                <i class="fas fa-bell"></i>
                <span class="notif-dot" id="notif-dot"></span>
                <!-- Dropdown -->
                <div class="notif-dropdown" id="notif-dropdown">
                    <div class="notif-header">
                        <span class="notif-title">Thông báo</span>
                        <button class="notif-mark-all" id="notif-mark-all">Đánh dấu tất cả đã đọc</button>
                    </div>
                    <ul class="notif-list">
                        <li class="notif-item unread">
                            <div class="notif-icon-wrap red"><i class="fas fa-ticket-alt"></i></div>
                            <div class="notif-body">
                                <p class="notif-text"><strong>Đặt vé thành công!</strong> F1: The Movie – Suất 20:00, 15/06/2026</p>
                                <span class="notif-time">2 phút trước</span>
                            </div>
                        </li>
                        <li class="notif-item unread">
                            <div class="notif-icon-wrap yellow"><i class="fas fa-star"></i></div>
                            <div class="notif-body">
                                <p class="notif-text"><strong>Phim mới ra mắt!</strong> War Machine (2026) đang chiếu tại 3HD2K</p>
                                <span class="notif-time">1 giờ trước</span>
                            </div>
                        </li>
                        <li class="notif-item">
                            <div class="notif-icon-wrap blue"><i class="fas fa-tag"></i></div>
                            <div class="notif-body">
                                <p class="notif-text"><strong>Khuyến mãi:</strong> Mua 2 tặng 1 vé bắp mỗi thứ 4 hàng tuần</p>
                                <span class="notif-time">Hôm qua</span>
                            </div>
                        </li>
                        <li class="notif-item">
                            <div class="notif-icon-wrap red"><i class="fas fa-film"></i></div>
                            <div class="notif-body">
                                <p class="notif-text"><strong>Nhắc nhở:</strong> Phim bạn quan tâm – Gran Turismo sắp chiếu vào 20/06</p>
                                <span class="notif-time">2 ngày trước</span>
                            </div>
                        </li>
                    </ul>
                    <a href="${srcPrefix}/user/user-notifications/index.html" class="notif-view-all">Xem tất cả thông báo <i class="fas fa-chevron-right"></i></a>
                </div>
            </div>
            <div class="user-btn" id="user-btn">
                <div class="avatar-wrapper">
                    <img src="${userAvatar}" alt="User Avatar" class="user-avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                </div>
                <!-- Dropdown -->
                <div class="user-dropdown" id="user-dropdown">
                    <div class="user-header">
                        <img src="${userAvatar}" alt="User Avatar" class="user-header-avatar" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; margin-right: 15px;">
                        <div class="user-info">
                            <span class="user-name">${userName}</span>
                            <span class="user-points"><i class="fas fa-crown" style="color: #ffc107;"></i> VIP - 1,250 điểm</span>
                        </div>
                    </div>
                    <ul class="user-menu-list">
                        <li><a href="${srcPrefix}/user/user-profile/profile.html#info"><i class="fas fa-user-circle"></i> Thông tin cá nhân</a></li>
                        <li><a href="${srcPrefix}/user/user-profile/profile.html#history"><i class="fas fa-ticket-alt"></i> Lịch sử đặt vé</a></li>
                        <li><a href="${srcPrefix}/user/user-profile/profile.html#offers"><i class="fas fa-gift"></i> Ưu đãi của tôi</a></li>
                        <li><a href="${srcPrefix}/user/user-profile/profile.html#settings"><i class="fas fa-cog"></i> Cài đặt</a></li>
                    </ul>
                    <div class="user-menu-footer">
                        <a href="#" class="logout-btn" id="logout-action"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
                    </div>
                </div>
            </div>
        `;
        navActions.insertAdjacentHTML('beforeend', loggedInHtml);

        // Gắn sự kiện Đăng xuất
        setTimeout(() => {
            const logoutBtn = document.getElementById('logout-action');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('userAvatar');
                    window.location.reload();
                });
            }
        }, 0);
    }
}

// --- SEARCH EXPAND LOGIC ---
const searchPill = document.getElementById('search-pill');
const searchInput = document.getElementById('search-input');

if (searchPill) {
    searchPill.addEventListener('click', () => {
        searchPill.classList.add('active');
        searchInput.focus();
    });
}

// Close search when clicking outside
document.addEventListener('click', (e) => {
    if (searchPill && !searchPill.contains(e.target)) {
        searchPill.classList.remove('active');
        searchInput.value = ''; // clear input when collapsed
    }
});

// --- NOTIFICATION DROPDOWN LOGIC ---
const notifBtn = document.getElementById('notif-btn');
const notifDropdown = document.getElementById('notif-dropdown');

if (notifBtn) {
    notifBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent document click from closing immediately
        notifBtn.classList.toggle('active');
        // Close user dropdown if it's open
        const userBtn = document.getElementById('user-btn');
        if (userBtn && userBtn.classList.contains('active')) {
            userBtn.classList.remove('active');
        }
    });
}

if (notifDropdown) {
    notifDropdown.addEventListener('click', (e) => {
        e.stopPropagation(); // keep dropdown open when clicking inside it
    });
}

// --- USER DROPDOWN LOGIC ---
const userBtn = document.getElementById('user-btn');
const userDropdown = document.getElementById('user-dropdown');

if (userBtn) {
    userBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        userBtn.classList.toggle('active');
        // Close notification dropdown if it's open
        if (notifBtn && notifBtn.classList.contains('active')) {
            notifBtn.classList.remove('active');
        }
    });
}

if (userDropdown) {
    userDropdown.addEventListener('click', (e) => {
        e.stopPropagation(); 
    });
}

// Modify the existing close click outside listener to also handle user dropdown
document.addEventListener('click', (e) => {
    // ... search logic (already handled above) ...

    if (notifBtn && notifBtn.classList.contains('active')) {
        notifBtn.classList.remove('active');
    }
    
    if (userBtn && userBtn.classList.contains('active')) {
        userBtn.classList.remove('active');
    }
});

// Mark all as read in dropdown
const markAllBtnNav = document.getElementById('notif-mark-all');
const notifDot = document.getElementById('notif-dot');
const notifItems = document.querySelectorAll('.notif-item');

if (markAllBtnNav) {
    markAllBtnNav.addEventListener('click', (e) => {
        e.preventDefault(); 
        e.stopPropagation(); 
        
        notifItems.forEach(item => {
            item.classList.remove('unread');
        });
        
        if (notifDot) {
            notifDot.style.display = 'none';
        }
    });
}
