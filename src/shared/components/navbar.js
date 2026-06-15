/**
 * navbar.js
 * ─────────────────────────────────────────────────────────────
 * Component render thanh Navbar dùng chung cho toàn dự án.
 */

export function renderNavbar() {
    const navbarHTML = `
    <header class="navbar" style="position: sticky; top: 0; z-index: 1000; background: var(--bg-elevated); border-bottom: 1px solid var(--glass-border);">
        <div class="nav-left" style="display: flex; align-items: center; gap: 40px;">
            <a href="/explore/home-page/index.html" class="logo" style="font-size: 2rem; color: var(--primary-red); font-family: 'Bebas Neue', sans-serif;">3HD2K</a>
            <nav class="nav-links nav-desktop">
                <a href="/explore/home-page/index.html">Trang chủ</a>
                <a href="/explore/movie-search/index.html?tab=now-showing">Phim</a>
                <a href="/explore/cinema-map/index.html">Rạp Phim</a>
                <a href="/wip.html">Khuyến Mãi</a>
                <a href="/wip.html">Đặt vé</a>
            </nav>
        </div>
        <div class="nav-actions" style="display: flex; align-items: center; gap: 15px;">
            <div class="search-pill sm-visible" id="search-pill" style="display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.05); padding: 8px 15px; border-radius: 20px; border: 1px solid var(--glass-border);">
                <i class="fas fa-search" id="search-icon" style="color: rgba(255,255,255,0.6);"></i>
                <input type="text" id="search-input" placeholder="Tìm kiếm phim..." style="background: transparent; border: none; color: white; outline: none; width: 150px; display: none;" />
                <span id="search-text" style="color: rgba(255,255,255,0.8); font-size: 0.9rem;">Tìm kiếm</span>
            </div>
            <div class="notif-btn sm-visible" id="notif-btn" style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.05); cursor: pointer;">
                <i class="fas fa-bell" style="color: white;"></i>
                <!-- Dropdown -->
                <div class="notif-dropdown" id="notif-dropdown" style="display: none; position: absolute; top: 50px; right: 0; background: var(--bg-elevated); border: 1px solid var(--glass-border); border-radius: 12px; width: 300px; padding: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
                    <div class="notif-header" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 10px;">
                        <span class="notif-title" style="font-weight: 600;">Thông báo</span>
                    </div>
                    <div class="notif-empty" style="display: flex; flex-direction: column; align-items: center; padding: 20px; color: rgba(255,255,255,0.5);">
                        <i class="fas fa-user-lock" style="font-size: 2.5rem; margin-bottom: 15px; color: rgba(255,255,255,0.2);"></i>
                        <p style="margin-bottom: 15px; text-align: center; font-size: 0.9rem;">Vui lòng đăng nhập để xem thông báo</p>
                        <a href="/auth/user-login/login.html" class="btn-primary" style="background: var(--primary-red); color: white; padding: 8px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">Đăng nhập ngay</a>
                    </div>
                </div>
            </div>
            <a href="/auth/user-login/login.html" class="user-btn" style="text-decoration: none; color: white;">
                <div class="avatar-wrapper" style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.2);">
                    <i class="fas fa-user" style="color: rgba(255,255,255,0.6); font-size: 1rem;"></i>
                </div>
            </a>
            <!-- Hamburger Menu -->
            <div class="hamburger-btn" id="hamburger-btn" style="cursor:pointer; display:flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:50%; background: rgba(255,255,255,0.05); transition:all 0.3s; position:relative;">
                <i class="fas fa-bars" style="color:white; font-size:1.2rem; pointer-events:none;"></i>
                <div class="hamburger-dropdown" id="hamburger-dropdown" style="display:none; position:absolute; top:50px; right:0; background:var(--bg-elevated); border:1px solid var(--glass-border); border-radius:12px; width:260px; padding:10px 0; box-shadow:0 10px 40px rgba(0,0,0,0.8); z-index:9999; text-align:left;">
                    <div style="padding: 10px 20px; font-family:'Inter', sans-serif; text-transform:uppercase; font-weight:700; color: var(--primary-red); font-size: 0.9rem; letter-spacing:1px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 5px;" class="mobile-only">Menu Chính</div>
                    <ul style="list-style:none; padding:0; margin:0;" class="mobile-only">
                        <li><a href="/explore/home-page/index.html" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;">Trang chủ</a></li>
                        <li><a href="/explore/movie-search/index.html?tab=now-showing" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;">Phim</a></li>
                        <li><a href="/explore/cinema-map/index.html" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;">Rạp Phim</a></li>
                    </ul>
                    <div style="padding: 10px 20px; font-family:'Inter', sans-serif; text-transform:uppercase; font-weight:700; color: var(--primary-red); font-size: 0.9rem; letter-spacing:1px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 5px; margin-top: 5px;">Hệ Sinh Thái 3HD2K</div>
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
        .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 20px;
        }
        .nav-links a {
            color: rgba(255,255,255,0.7);
            text-decoration: none;
            font-size: 1rem;
            transition: color 0.2s;
        }
        .nav-links a:hover, .nav-links a.active {
            color: white;
            font-weight: 600;
        }
        .nav-desktop { display: none; }
        .sm-visible { display: none !important; }
        .mobile-only { display: block; }
        
        @media (min-width: 576px) {
            .sm-visible { display: flex !important; }
        }
        @media (min-width: 768px) {
            .nav-desktop { display: flex; gap: 20px; align-items: center; }
            .mobile-only { display: none !important; }
        }
        
        /* Dropdown hover behavior for desktop */
        .notif-btn:hover .notif-dropdown {
            display: block !important;
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

            document.addEventListener('click', (e) => {
                if (!hamburgerBtn.contains(e.target)) {
                    hamburgerDropdown.style.display = 'none';
                }
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
