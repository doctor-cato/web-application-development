/**
 * navbar.js
 * ─────────────────────────────────────────────────────────────
 * Component render thanh Navbar dùng chung cho toàn dự án.
 */

export function renderNavbar() {
    const navbarHTML = `
    <header class="navbar">
        <div class="nav-left">
            <a href="/explore/home-page/index.html" class="logo">3HD2K</a>
            <nav class="nav-links">
                <a href="/explore/home-page/index.html">Trang chủ</a>
                <a href="/explore/movie-search/index.html?tab=now-showing">Phim Đang Chiếu</a>
                <a href="/explore/cinema-map/index.html">Cụm Rạp</a>
                <a href="/wip.html">Khuyến Mãi</a>
                <a href="/wip.html">Đặt vé</a>
            </nav>
        </div>
        <div class="nav-actions">
            <div class="search-pill" id="search-pill">
                <i class="fas fa-search" id="search-icon"></i>
                <input type="text" id="search-input" placeholder="Tìm kiếm phim..." />
                <span id="search-text">Tìm kiếm</span>
            </div>
            <div class="notif-btn" id="notif-btn">
                <i class="fas fa-bell"></i>
                <!-- Dropdown -->
                <div class="notif-dropdown" id="notif-dropdown">
                    <div class="notif-header">
                        <span class="notif-title">Thông báo</span>
                    </div>
                    <div class="notif-empty" style="display: flex; flex-direction: column; align-items: center; padding: 40px 20px; color: rgba(255,255,255,0.5);">
                        <i class="fas fa-user-lock" style="font-size: 3rem; margin-bottom: 15px; color: rgba(255,255,255,0.2);"></i>
                        <p style="margin-bottom: 20px; text-align: center;">Vui lòng đăng nhập để xem thông báo</p>
                        <a href="/auth/user-login/login.html" class="btn-primary" style="background: var(--primary-red); color: white; padding: 10px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; transition: opacity 0.3s;">Đăng nhập ngay</a>
                    </div>
                </div>
            </div>
            <a href="/auth/user-login/login.html" class="user-btn" style="text-decoration: none; color: white;">
                <div class="avatar-wrapper" style="background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.2);">
                    <i class="fas fa-user" style="color: rgba(255,255,255,0.6); font-size: 1rem;"></i>
                </div>
            </a>
            <!-- Hamburger Menu -->
            <div class="hamburger-btn" id="hamburger-btn" style="cursor:pointer; display:flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:50%; background: rgba(255,255,255,0.05); transition:all 0.3s; position:relative;">
                <i class="fas fa-bars" style="color:white; font-size:1.2rem; pointer-events:none;"></i>
                <div class="hamburger-dropdown" id="hamburger-dropdown" style="display:none; position:absolute; top:50px; right:0; background:var(--bg-elevated, #1a1a1a); border:1px solid var(--glass-border, rgba(255,255,255,0.08)); border-radius:12px; width:260px; padding:10px 0; box-shadow:0 10px 40px rgba(0,0,0,0.8); z-index:9999; text-align:left;">
                    <div style="padding: 10px 20px; font-family:'Inter', sans-serif; text-transform:uppercase; font-weight:700; color: var(--primary-red, #e50914); font-size: 0.9rem; letter-spacing:1px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 5px;" class="mobile-only">Menu Chính</div>
                    <ul style="list-style:none; padding:0; margin:0;" class="mobile-only">
                        <li><a href="/explore/home-page/index.html" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;">Trang chủ</a></li>
                        <li><a href="/explore/movie-search/index.html?tab=now-showing" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;">Phim Đang Chiếu</a></li>
                        <li><a href="/explore/cinema-map/index.html" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;">Cụm Rạp</a></li>
                    </ul>
                    <div style="padding: 10px 20px; font-family:'Inter', sans-serif; text-transform:uppercase; font-weight:700; color: var(--primary-red, #e50914); font-size: 0.9rem; letter-spacing:1px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 5px; margin-top: 5px;">Hệ Sinh Thái 3HD2K</div>
                    <ul style="list-style:none; padding:0; margin:0;">
                        <li><a href="/engagement/dating/index.html" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;"><i class="fas fa-heart" style="margin-right:10px; color:#e50914; width:20px; text-align:center;"></i>Cine Match</a></li>
                        <li><a href="/engagement/minigame/index.html" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;"><i class="fas fa-gamepad" style="margin-right:10px; color:#e50914; width:20px; text-align:center;"></i>Cine Bet</a></li>
                        <li><a href="/engagement/aftercredit-lounge/index.html" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;"><i class="fas fa-comments" style="margin-right:10px; color:#e50914; width:20px; text-align:center;"></i>Thảo luận đánh giá</a></li>
                        <li><a href="/booking/group-booking/index.html" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;"><i class="fas fa-users" style="margin-right:10px; color:#e50914; width:20px; text-align:center;"></i>Đặt & Giữ ghế nhóm</a></li>
                        <li><a href="/user/loyalty-points/index.html" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;"><i class="fas fa-star" style="margin-right:10px; color:#e50914; width:20px; text-align:center;"></i>Điểm thưởng <span style="font-size:10px; background:#e50914; padding:2px 6px; border-radius:4px; margin-left:5px;">WIP</span></a></li>
                        <li><a href="/wip.html" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;"><i class="fas fa-ticket-alt" style="margin-right:10px; color:#e50914; width:20px; text-align:center;"></i>Khuyến mãi <span style="font-size:10px; background:#e50914; padding:2px 6px; border-radius:4px; margin-left:5px;">WIP</span></a></li>
                        <li><a href="/wip.html" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;"><i class="fas fa-crown" style="margin-right:10px; color:#e50914; width:20px; text-align:center;"></i>Gói hội viên <span style="font-size:10px; background:#e50914; padding:2px 6px; border-radius:4px; margin-left:5px;">WIP</span></a></li>
                    </ul>
                </div>
            </div>
        </div>
    </header>
    <style>
/* --- NAVBAR --- */
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 0 var(--page-padding);
    height: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 100;
    background: rgba(8, 8, 8, 0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(229, 9, 20, 0.3);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
}

.nav-left {
    display: flex;
    align-items: center;
    gap: 40px;
    height: 100%;
}

.logo {
    color: var(--primary-red);
    font-size: 2.4rem;
    cursor: pointer;
    flex-shrink: 0;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 100%;
}

.nav-links a {
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    letter-spacing: 0.3px;
    color: rgba(255, 255, 255, 0.55);
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 16px;
    transition: color 0.3s ease, background 0.3s ease;
    border-radius: 6px;
}

.nav-links a::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 60%;
    height: 2px;
    background: var(--primary-red);
    border-radius: 2px;
    transition: transform 0.3s ease;
    box-shadow: 0 0 8px rgba(229, 9, 20, 0.4);
}

.nav-links a:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.05);
}

.nav-links a:hover::after {
    transform: translateX(-50%) scaleX(1);
}

.nav-links a.active {
    color: #ffffff;
    font-weight: bold;
}

.nav-links a.active::after {
    transform: translateX(-50%) scaleX(1);
}

.nav-actions {
    display: flex;
    align-items: center;
    gap: 18px;
}

/* Pill-shaped search */
.search-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    border-radius: 50px;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
}

.search-pill:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 12px rgba(229, 9, 20, 0.15);
}

.search-pill i {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.5);
    transition: color 0.3s ease;
}

.search-pill:hover i {
    color: var(--primary-red);
}

.search-pill span {
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.4);
    white-space: nowrap;
    transition: color 0.3s ease;
}

.search-pill:hover span {
    color: rgba(255, 255, 255, 0.6);
}

/* Hidden input field by default */
#search-input {
    background: transparent;
    border: none;
    color: white;
    font-family: 'Inter', sans-serif;
    font-size: 0.95rem;
    width: 0;
    opacity: 0;
    transition: width 0.4s ease, opacity 0.3s ease;
    outline: none;
}

/* Active state for search pill */
.search-pill.active {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 12px rgba(229, 9, 20, 0.15);
    cursor: text;
}

.search-pill.active #search-input {
    width: 200px;
    opacity: 1;
}

.search-pill.active #search-text {
    display: none;
}

.search-pill.active i {
    color: var(--primary-red);
}

.nav-actions > i {
    font-size: 1.3rem;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.5);
    transition: color 0.25s ease, transform 0.25s ease;
    padding: 6px;
}

.nav-actions > i:hover {
    color: var(--primary-red);
    transform: scale(1.15);
}

/* Notification Button & Dropdown */
.notif-btn {
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
}

.notif-btn > i {
    font-size: 1.3rem;
    color: rgba(255, 255, 255, 0.5);
    transition: color 0.25s ease, transform 0.25s ease;
}

.notif-btn:hover > i, .notif-btn.active > i {
    color: var(--primary-red);
    transform: scale(1.15);
}

.notif-dot {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 8px;
    height: 8px;
    background-color: var(--primary-red);
    border-radius: 50%;
    border: 2px solid var(--nav-bg);
    pointer-events: none;
}

.notif-dropdown {
    position: absolute;
    top: calc(100% + 15px);
    right: -10px; /* Align near the edge but a bit shifted */
    width: 360px;
    background: rgba(15, 15, 15, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    cursor: default; /* Reset cursor for dropdown content */
}

/* Caret for dropdown */
.notif-dropdown::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 20px;
    width: 12px;
    height: 12px;
    background: rgba(15, 15, 15, 0.95);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    transform: rotate(45deg);
}

.notif-btn.active .notif-dropdown {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.notif-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.notif-title {
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
}

.notif-mark-all {
    background: none;
    border: none;
    color: var(--primary-red);
    font-size: 0.8rem;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: color 0.2s;
}

.notif-mark-all:hover {
    color: #ff6b6b;
    text-decoration: underline;
}

.notif-list {
    list-style: none;
    max-height: 350px;
    overflow-y: auto;
    padding: 0;
    margin: 0;
}

.notif-list::-webkit-scrollbar {
    width: 6px;
}

.notif-list::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
}

.notif-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
}

.notif-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
}

.notif-item {
    display: flex;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    transition: background 0.2s;
    cursor: pointer;
}

.notif-item:hover {
    background: rgba(255, 255, 255, 0.05);
}

.notif-item.unread {
    background: rgba(229, 9, 20, 0.05);
}

.notif-item.unread:hover {
    background: rgba(229, 9, 20, 0.08);
}

.notif-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 0.9rem;
}

.notif-icon-wrap.red {
    background: rgba(229, 9, 20, 0.15);
    color: var(--primary-red);
}

.notif-icon-wrap.yellow {
    background: rgba(255, 193, 7, 0.15);
    color: #ffc107;
}

.notif-icon-wrap.blue {
    background: rgba(33, 150, 243, 0.15);
    color: #2196f3;
}

.notif-body {
    flex: 1;
}

.notif-text {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 6px;
    line-height: 1.4;
}

.notif-text strong {
    color: #fff;
    font-weight: 600;
}

.notif-time {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
}

.notif-view-all {
    display: block;
    text-align: center;
    padding: 14px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85rem;
    text-decoration: none;
    transition: all 0.2s;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.notif-view-all:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 0 0 12px 12px;
}

.notif-view-all i {
    font-size: 0.75rem;
    margin-left: 4px;
}

/* User Avatar & Dropdown */
.user-btn {
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
}

.avatar-wrapper {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid transparent;
    transition: border-color 0.3s ease, transform 0.3s ease;
}

.user-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-btn:hover .avatar-wrapper, .user-btn.active .avatar-wrapper {
    border-color: var(--primary-red);
    transform: scale(1.1);
}

.user-dropdown {
    position: absolute;
    top: calc(100% + 15px);
    right: 0;
    width: 280px;
    background: rgba(15, 15, 15, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    cursor: default;
}

/* Caret for user dropdown */
.user-dropdown::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 14px;
    width: 12px;
    height: 12px;
    background: rgba(15, 15, 15, 0.95);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    transform: rotate(45deg);
}

.user-btn.active .user-dropdown {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.user-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.user-header-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--primary-red);
}

.user-info {
    display: flex;
    flex-direction: column;
}

.user-name {
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 4px;
}

.user-points {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    font-family: 'Inter', sans-serif;
}

.user-menu-list {
    list-style: none;
    padding: 10px 0;
    margin: 0;
}

.user-menu-list li a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-size: 0.95rem;
    transition: all 0.2s;
}

.user-menu-list li a i {
    width: 20px;
    text-align: center;
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.4);
    transition: color 0.2s;
}

.user-menu-list li a:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
}

.user-menu-list li a:hover i {
    color: #fff;
}

.mobile-only { display: block; }
@media (min-width: 768px) {
    .mobile-only { display: none !important; }
}
    </style>
    `;

    // Try to find existing navbar or placeholder
    let container = document.getElementById('navbar-placeholder') || 
                    document.querySelector('header.navbar');
    
    if (container) {
        container.outerHTML = navbarHTML;
    } else {
        document.body.insertAdjacentHTML('afterbegin', navbarHTML);
    }

    // Active link highlight
    setTimeout(() => {
        const currentPath = window.location.pathname;
        const links = document.querySelectorAll('.nav-links a');
        links.forEach(link => {
            if (currentPath.includes(link.getAttribute('href').replace('../../', ''))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Hamburger Logic
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const hamburgerDropdown = document.getElementById('hamburger-dropdown');
        if (hamburgerBtn && hamburgerDropdown) {
            hamburgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isDisplay = hamburgerDropdown.style.display === 'block';
                hamburgerDropdown.style.display = isDisplay ? 'none' : 'block';
            });
            
            hamburgerDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

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
                const userAvatar = localStorage.getItem('userAvatar') || defaultAvatar;

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
                            <img src="${userAvatar}" alt="User Avatar" class="user-avatar" onerror="this.onerror=null; this.src='${defaultAvatar}';" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                        </div>
                        <!-- Dropdown -->
                        <div class="user-dropdown" id="user-dropdown">
                            <div class="user-header">
                                <img src="${userAvatar}" alt="User Avatar" class="user-header-avatar" onerror="this.onerror=null; this.src='${defaultAvatar}';" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; margin-right: 15px;">
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

                const logoutBtn = document.getElementById('logout-action');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('userName');
                        localStorage.removeItem('userAvatar');
                        localStorage.removeItem('userEmail');
                        window.location.reload();
                    });
                }
            }
        }

        // --- SEARCH EXPAND LOGIC ---
        const searchPill = document.getElementById('search-pill');
        const searchInput = document.getElementById('search-input');

        if (searchPill) {
            searchPill.addEventListener('click', () => {
                searchPill.classList.add('active');
                if (searchInput) {
                    searchInput.style.display = 'block';
                    searchInput.focus();
                }
            });
        }

        // --- NOTIFICATION DROPDOWN LOGIC ---
        const notifBtn = document.getElementById('notif-btn');
        const notifDropdown = document.getElementById('notif-dropdown');

        if (notifBtn) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notifBtn.classList.toggle('active');
                const userBtn = document.getElementById('user-btn');
                if (userBtn && userBtn.classList.contains('active')) {
                    userBtn.classList.remove('active');
                }
            });
        }

        if (notifDropdown) {
            notifDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // --- USER DROPDOWN LOGIC ---
        const userBtn = document.getElementById('user-btn');
        const userDropdown = document.getElementById('user-dropdown');

        if (userBtn) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                e.preventDefault(); // Ngăn link chuyển trang nếu là <a>
                userBtn.classList.toggle('active');
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

        // --- CLICK OUTSIDE HANDLER ---
        document.addEventListener('click', (e) => {
            // Đóng search
            if (searchPill && !searchPill.contains(e.target)) {
                searchPill.classList.remove('active');
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.style.display = 'none';
                }
            }
            // Đóng notification
            const currentNotifBtn = document.getElementById('notif-btn');
            if (currentNotifBtn && currentNotifBtn.classList.contains('active') && !currentNotifBtn.contains(e.target)) {
                currentNotifBtn.classList.remove('active');
            }
            // Đóng user dropdown
            const currentUserBtn = document.getElementById('user-btn');
            if (currentUserBtn && currentUserBtn.classList.contains('active') && !currentUserBtn.contains(e.target)) {
                currentUserBtn.classList.remove('active');
            }
            // Đóng hamburger
            const currentHamburgerBtn = document.getElementById('hamburger-btn');
            const currentHamburgerDropdown = document.getElementById('hamburger-dropdown');
            if (currentHamburgerBtn && currentHamburgerDropdown && !currentHamburgerBtn.contains(e.target)) {
                currentHamburgerDropdown.style.display = 'none';
            }
        });

        // --- MARK ALL AS READ ---
        const markAllBtnNav = document.getElementById('notif-mark-all');
        const notifDot = document.getElementById('notif-dot');
        const notifItems = document.querySelectorAll('.notif-item');

        if (markAllBtnNav) {
            markAllBtnNav.addEventListener('click', (e) => {
                e.preventDefault(); 
                e.stopPropagation(); 
                notifItems.forEach(item => item.classList.remove('unread'));
                if (notifDot) notifDot.style.display = 'none';
            });
        }

    }, 0);
}

let hasRendered = false;
function safeRender() {
    if (hasRendered) return;
    hasRendered = true;
    renderNavbar();
}

// Tự động render nếu được import
document.addEventListener('DOMContentLoaded', safeRender);

// Chạy luôn nếu script load sau DOMContentLoaded
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    safeRender();
}
