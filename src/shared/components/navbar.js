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
