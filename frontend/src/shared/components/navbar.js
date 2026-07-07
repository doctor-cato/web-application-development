/**
 * navbar.js
 * ─────────────────────────────────────────────────────────────
 * Component render thanh Navbar dùng chung cho toàn dự án.
 */

import { logout, getSession } from '../../auth/auth-services/authService.js';

export function renderNavbar() {
    // Luôn dùng đường dẫn tuyệt đối từ root (thư mục src/)
    const srcPrefix = '';

    const navbarHTML = `
    <header class="navbar">
        <div class="nav-left">
            <a href="${srcPrefix}/index.html" class="logo">3HD2K</a>
            <nav class="nav-links">
                <a href="${srcPrefix}/index.html">Trang chủ</a>
                <a href="${srcPrefix}/explore/movie-search/index.html?tab=now-showing">Phim Đang Chiếu</a>
                <a href="${srcPrefix}/explore/cinema-map/index.html">Cụm Rạp</a>
                <a href="${srcPrefix}/user/user-notifications/index.html?tab=promo">Khuyến Mãi</a>
                <div class="booking-dropdown-wrapper" style="position:relative; display:inline-block; height:100%; align-items:center; display:flex;">
                    <a href="#" style="cursor:pointer;" class="nav-booking-toggle">Đặt vé <i class="fas fa-chevron-down" style="font-size:0.8rem; margin-left:4px;"></i></a>
                    <div class="booking-dropdown-content" style="display:none; position:absolute; top:100%; left:50%; transform:translateX(-50%); background:var(--bg-elevated, #1a1a1a); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px 0; min-width:160px; z-index:1000; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                        <a href="${srcPrefix}/booking/seat-booking/booking.html" style="display:block; padding:12px 20px; color:white; text-decoration:none; white-space:nowrap;">Mua vé</a>
                        <a href="${srcPrefix}/booking/booking-food/index.html" style="display:block; padding:12px 20px; color:white; text-decoration:none; white-space:nowrap;">Đặt đồ ăn</a>
                        <a href="${srcPrefix}/booking/group-booking/index.html" style="display:block; padding:12px 20px; color:white; text-decoration:none; white-space:nowrap;">Thuê rạp</a>
                    </div>
                </div>
            </nav>
        </div>
        <div class="nav-actions">
            <div class="search-pill" id="search-pill" style="position: relative;">
                <i class="fas fa-search" id="search-icon"></i>
                <input type="text" id="search-input" placeholder="Tìm kiếm phim..." autocomplete="off" />
                <span id="search-text">Tìm kiếm</span>
                
                <div id="search-suggestions" style="display: none; position: absolute; top: 120%; right: 0; width: 340px; max-height: 400px; overflow-y: auto; background: var(--bg-elevated, #1a1a1a); border: 1px solid var(--glass-border, rgba(255,255,255,0.08)); border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); z-index: 10000; flex-direction: column; text-align: left;">
                    <!-- Render suggestions here via JS -->
                </div>
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
                        <a href="${srcPrefix}/auth/user-login/login.html" class="btn-primary" style="background: var(--primary-red); color: white; padding: 10px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; transition: opacity 0.3s;">Đăng nhập ngay</a>
                    </div>
                </div>
            </div>
            <a href="${srcPrefix}/auth/user-login/login.html" class="user-btn" style="text-decoration: none; color: white;">
                <div class="avatar-wrapper" style="background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.2);">
                    <img src="${srcPrefix}/shared/images/avatar.jpg" alt="Guest Avatar" class="user-avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                </div>
            </a>
            <!-- Hamburger Menu -->
            <div class="hamburger-btn" id="hamburger-btn" style="cursor:pointer; display:flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:50%; background: rgba(255,255,255,0.05); transition:all 0.3s; position:relative;">
                <i class="fas fa-bars" style="color:white; font-size:1.2rem; pointer-events:none;"></i>
                <div class="hamburger-dropdown" id="hamburger-dropdown" style="display:none; position:absolute; top:50px; right:0; background:var(--bg-elevated, #1a1a1a); border:1px solid var(--glass-border, rgba(255,255,255,0.08)); border-radius:12px; width:260px; padding:10px 0; box-shadow:0 10px 40px rgba(0,0,0,0.8); z-index:9999; text-align:left;">
                    <div style="padding: 10px 20px; font-family:'Inter', sans-serif; text-transform:uppercase; font-weight:700; color: var(--primary-red, #e50914); font-size: 0.9rem; letter-spacing:1px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 5px;" class="mobile-only">Menu Chính</div>
                    <ul style="list-style:none; padding:0; margin:0;" class="mobile-only">
                        <li><a href="${srcPrefix}/index.html" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;">Trang chủ</a></li>
                        <li><a href="${srcPrefix}/explore/movie-search/index.html?tab=now-showing" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;">Phim Đang Chiếu</a></li>
                        <li><a href="${srcPrefix}/explore/cinema-map/index.html" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;">Cụm Rạp</a></li>
                        <li><a href="#" id="mobile-qb-btn" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;">Đặt vé nhanh</a></li>
                    </ul>
                    <div style="padding: 10px 20px; font-family:'Inter', sans-serif; text-transform:uppercase; font-weight:700; color: var(--primary-red, #e50914); font-size: 0.9rem; letter-spacing:1px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 5px; margin-top: 5px;">Hệ Sinh Thái 3HD2K</div>
                    <ul style="list-style:none; padding:0; margin:0;">
                        
                        <li><a href="${srcPrefix}/engagement/minigame/index.html" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;"><i class="fas fa-gamepad" style="margin-right:10px; color:#e50914; width:20px; text-align:center;"></i>Cine Predict</a></li>
                        <li><a href="${srcPrefix}/explore/movie-search/index.html?tab=now-showing" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;"><i class="fas fa-heart" style="margin-right:10px; color:#e50914; width:20px; text-align:center;"></i>Cine-Match (Ghép đôi)</a></li>
                        <li><a href="${srcPrefix}/user/user-notifications/index.html?tab=promo" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;"><i class="fas fa-ticket-alt" style="margin-right:10px; color:#e50914; width:20px; text-align:center;"></i>Khuyến mãi</a></li>
                        <li><a href="${srcPrefix}/user/loyalty-points/index.html" style="display:block; padding:12px 20px; color:white; text-decoration:none; font-family:'Inter', sans-serif; transition:background 0.2s;"><i class="fas fa-crown" style="margin-right:10px; color:#e50914; width:20px; text-align:center;"></i>Gói hội viên</a></li>
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
    white-space: nowrap;
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

.nav-links a.active {
    color: #ffffff;
    font-weight: bold;
}

.nav-links a:hover::after,
.nav-links a.active::after,
.quick-book-toggle.active::after {
    transform: translateX(-50%) scaleX(1) !important;
}

/* Quick Book Modal */
.quick-book-wrapper {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
}

.quick-book-dropdown {
    position: absolute;
    top: calc(100% + 5px);
    left: 50%;
    transform: translateX(-50%) translateY(-10px);
    width: 320px;
    background: rgba(15, 15, 15, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    padding: 24px;
    cursor: default;
}

.quick-book-dropdown.active {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
}

/* Caret */
.quick-book-dropdown::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 12px;
    height: 12px;
    background: rgba(15, 15, 15, 0.95);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.qb-title {
    font-size: 1.1rem;
    color: #fff;
    margin-bottom: 20px;
    text-align: center;
    font-weight: 700;
    letter-spacing: 1px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding-bottom: 12px;
}

.qb-step {
    margin-bottom: 16px;
}

.qb-step label {
    display: block;
    font-size: 0.85rem;
    color: rgba(255,255,255,0.7);
    margin-bottom: 6px;
    font-weight: 500;
}

.qb-step select {
    width: 100%;
    background: rgba(0,0,0,0.4);
    border: 1px solid rgba(255,255,255,0.2);
    color: #fff;
    padding: 10px 12px;
    border-radius: 6px;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: all 0.2s;
}

.qb-step select:focus {
    border-color: var(--primary-red);
    box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.2);
}

.qb-step select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.qb-step select option {
    background: #1a1a1a;
    color: #fff;
}

/* Custom Select Dropdown UI */
.qb-custom-select {
    position: relative;
    width: 100%;
}

.qb-select-trigger {
    background: rgba(0,0,0,0.4);
    border: 1px solid rgba(255,255,255,0.2);
    color: #fff;
    padding: 10px 12px;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: text;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    transition: all 0.2s;
}

.qb-select-trigger input {
    background: transparent;
    border: none;
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    width: 100%;
    outline: none;
}

.qb-select-trigger input::placeholder {
    color: rgba(255,255,255,0.7);
}

.qb-select-trigger:hover {
    border-color: rgba(255,255,255,0.4);
}

.qb-select-trigger.active {
    border-color: var(--primary-red);
    box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.2);
}

.qb-select-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    background: rgba(20, 20, 20, 0.98);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-5px);
    transition: all 0.2s;
    z-index: 1010;
    overflow: hidden;
}

.qb-select-menu.active {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.qb-options-list {
    max-height: 180px;
    overflow-y: auto;
    list-style: none;
    padding: 0;
    margin: 0;
}

.qb-options-list::-webkit-scrollbar {
    width: 6px;
}
.qb-options-list::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.2);
}
.qb-options-list::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.2);
    border-radius: 3px;
}
.qb-options-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255,255,255,0.4);
}

.qb-options-list li {
    padding: 10px 12px;
    color: rgba(255,255,255,0.8);
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.2s;
}

.qb-options-list li:hover {
    background: rgba(229, 9, 20, 0.15);
    color: #fff;
}

.qb-options-list li.no-results {
    cursor: default;
    color: rgba(255,255,255,0.4);
    text-align: center;
    padding: 15px 10px;
}
.qb-options-list li.no-results:hover {
    background: transparent;
}

.qb-btn {
    width: 100%;
    padding: 12px;
    background: var(--primary-red);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 1rem;
    margin-top: 10px;
    cursor: pointer;
    transition: background 0.3s, transform 0.1s;
}

.qb-btn:hover:not(:disabled) {
    background: #ff0f1a;
}

.qb-btn:active:not(:disabled) {
    transform: scale(0.98);
}

.qb-btn:disabled {
    background: #555;
    cursor: not-allowed;
    color: rgba(255,255,255,0.5);
}

.nav-actions {
    display: flex;
    align-items: center;
    gap: 18px;
}

.nav-actions > * {
    flex-shrink: 0;
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
    transition: max-width 0.4s ease, opacity 0.3s ease, color 0.3s ease, margin-left 0.4s ease;
    max-width: 100px;
    opacity: 1;
    overflow: hidden;
    margin-left: 0;
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
    width: 140px;
    opacity: 1;
}

.search-pill.active #search-text {
    max-width: 0;
    opacity: 0;
    margin-left: -8px;
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
    transition: transform 0.3s ease;
}

.user-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

#hamburger-dropdown a:hover {
    background: rgba(255, 255, 255, 0.08) !important;
    border-radius: 6px;
}

#hamburger-dropdown a i {
    transition: all 0.2s ease;
}

#hamburger-dropdown a:hover i {
    color: #ffffff !important;
    transform: scale(1.15);
}

.mobile-only { display: block; }
@media (min-width: 1024px) {
    .mobile-only { display: none !important; }
}
@media (max-width: 1024px) {
    .nav-links { position: absolute; width: 0; height: 0; overflow: visible; }
    .nav-links > a { display: none !important; }
    .navbar { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; background: rgba(8, 8, 8, 0.98) !important; }
    .quick-book-wrapper { position: static !important; }
    .quick-book-toggle { display: none !important; }
    .quick-book-dropdown {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) scale(0.95) !important;
        width: 90% !important;
        max-width: 400px !important;
        z-index: 10000 !important;
    }
    .quick-book-dropdown.active {
        transform: translate(-50%, -50%) scale(1) !important;
    }
    .quick-book-dropdown::before { display: none !important; }
    
    /* Add a dark overlay behind modal on mobile */
    .mobile-modal-overlay {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.8);
        z-index: 9999;
        display: none;
        backdrop-filter: blur(5px);
    }
    .mobile-modal-overlay.active { display: block; }
    .nav-left { gap: 15px; }
    .logo { font-size: 1.8rem; }
    .search-pill span { display: none; }
    .search-pill { padding: 10px 14px; }
}
@media (max-width: 600px) {
    .nav-actions { gap: 10px; }
    .search-pill.active #search-input { width: 100px; }
    .user-dropdown { right: -50px; }
    .notif-dropdown { right: -50px; width: 300px; }
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
        let currentPath = window.location.pathname;
        // Normalize current path
        if (currentPath.endsWith('/index.html')) {
            currentPath = currentPath.replace('/index.html', '/');
        }

        const links = document.querySelectorAll('.nav-links a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;
            
            // Strip query parameters
            let hrefPath = href.split('?')[0].replace('../../', '').replace('../', '');
            // Normalize href path
            if (hrefPath.endsWith('/index.html')) {
                hrefPath = hrefPath.replace('/index.html', '/');
            }
            
            if (hrefPath === '/') {
                // If it's the home link, only highlight if currentPath is strictly root
                if (currentPath === '/') {
                    link.classList.add('active');
                }
            } else if (hrefPath && currentPath.includes(hrefPath)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Helper to close all menus
        function closeAllMenus(except = null) {
            const qbToggle = document.getElementById('quick-book-toggle');
            const qbDropdown = document.getElementById('quick-book-dropdown');
            if (except !== 'quick-book' && qbToggle && qbDropdown) {
                qbToggle.classList.remove('active');
                qbDropdown.classList.remove('active');
            }
            const searchPill = document.getElementById('search-pill');
            const searchSuggestions = document.getElementById('search-suggestions');
            if (except !== 'search' && searchPill) {
                searchPill.classList.remove('active');
                if (searchSuggestions) searchSuggestions.style.display = 'none';
            }
            const notifBtn = document.getElementById('notif-btn');
            if (except !== 'notif' && notifBtn) {
                notifBtn.classList.remove('active');
            }
            const userBtn = document.getElementById('user-btn');
            if (except !== 'user' && userBtn) {
                userBtn.classList.remove('active');
            }
            const hamburgerDropdown = document.getElementById('hamburger-dropdown');
            if (except !== 'hamburger' && hamburgerDropdown) {
                hamburgerDropdown.style.display = 'none';
            }
        }

        // --- QUICK BOOK LOGIC ---
        const qbToggle = document.getElementById('quick-book-toggle');
        const qbDropdown = document.getElementById('quick-book-dropdown');
        if (qbToggle && qbDropdown) {
            qbToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeAllMenus('quick-book');
                qbToggle.classList.toggle('active');
                qbDropdown.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!qbDropdown.contains(e.target) && e.target !== qbToggle) {
                    qbDropdown.classList.remove('active');
                    qbToggle.classList.remove('active');
                }
            });

            const qbCinema = document.getElementById('qb-cinema');
            const qbDate = document.getElementById('qb-date');
            const qbShowtime = document.getElementById('qb-showtime');
            const qbSubmit = document.getElementById('qb-submit');

            // Custom Select Elements
            const qbMovieWrapper = document.getElementById('qb-movie-wrapper');
            const qbMovieTrigger = document.getElementById('qb-movie-trigger');
            const qbMovieMenu = document.getElementById('qb-movie-menu');
            const qbMovieSearch = document.getElementById('qb-movie-search');
            const qbMovieList = document.getElementById('qb-movie-list');
            let selectedMovieId = null;

            // Load phim into Custom Dropdown
            const moviesData = typeof nowShowingMovies !== 'undefined' ? nowShowingMovies : [{id: 'dummy', title: 'Phim Demo (Hardcoded)'}];
            
            function renderMovieOptions(filterText = '') {
                qbMovieList.innerHTML = '';
                const filtered = moviesData.filter(m => m.title.toLowerCase().includes(filterText.toLowerCase()));
                
                if (filtered.length === 0) {
                    qbMovieList.innerHTML = '<li class="no-results">Không tìm thấy phim</li>';
                    return;
                }

                filtered.forEach(m => {
                    const li = document.createElement('li');
                    li.textContent = m.title;
                    li.dataset.value = m.id;
                    li.addEventListener('click', () => {
                        selectedMovieId = m.id;
                        qbMovieSearch.value = m.title;
                        qbMovieMenu.classList.remove('active');
                        qbMovieTrigger.classList.remove('active');
                        triggerMovieSelection();
                    });
                    qbMovieList.appendChild(li);
                });
            }

            // Initial render
            renderMovieOptions();

            // Toggle Dropdown
            if(qbMovieTrigger) {
                qbMovieTrigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isActive = qbMovieMenu.classList.contains('active');
                    if (!isActive) {
                        qbMovieMenu.classList.add('active');
                        qbMovieTrigger.classList.add('active');
                        qbMovieSearch.value = '';
                        renderMovieOptions();
                    }
                    qbMovieSearch.focus();
                });
            }

            // Search filtering
            if(qbMovieSearch) {
                qbMovieSearch.addEventListener('input', (e) => {
                    if (!qbMovieMenu.classList.contains('active')) {
                        qbMovieMenu.classList.add('active');
                        qbMovieTrigger.classList.add('active');
                    }
                    renderMovieOptions(e.target.value);
                });
            }

            // Prevent closing when clicking inside menu
            if(qbMovieMenu) {
                qbMovieMenu.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }

            // Close custom dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (qbMovieWrapper && !qbMovieWrapper.contains(e.target) && qbMovieMenu.classList.contains('active')) {
                    qbMovieMenu.classList.remove('active');
                    qbMovieTrigger.classList.remove('active');
                    if (selectedMovieId) {
                        const m = moviesData.find(x => x.id === selectedMovieId);
                        if (m) qbMovieSearch.value = m.title;
                    } else {
                        qbMovieSearch.value = '';
                    }
                }
            });

            function triggerMovieSelection() {
                qbCinema.innerHTML = '<option value="" disabled selected>-- Chọn Rạp --</option>';
                if (typeof cinemas !== 'undefined') {
                    cinemas.forEach(c => {
                        const opt = document.createElement('option');
                        opt.value = c.id;
                        opt.textContent = c.name;
                        qbCinema.appendChild(opt);
                    });
                } else {
                    const opt = document.createElement('option');
                    opt.value = "dummy-cinema";
                    opt.textContent = "Rạp Demo";
                    qbCinema.appendChild(opt);
                }
                qbCinema.disabled = false;
                qbDate.disabled = true;
                qbDate.innerHTML = '<option value="" disabled selected>-- Chọn Ngày --</option>';
                qbShowtime.disabled = true;
                qbShowtime.innerHTML = '<option value="" disabled selected>-- Chọn Suất Chiếu --</option>';
                qbSubmit.disabled = true;
            }

            qbCinema.addEventListener('change', () => {
                qbDate.disabled = false;
                qbDate.innerHTML = '<option value="" disabled selected>-- Chọn Ngày --</option>';
                // Populate dummy dates based on today
                const today = new Date();
                for(let i=0; i<3; i++) {
                    const d = new Date(today);
                    d.setDate(today.getDate() + i);
                    const dateStr = d.toLocaleDateString('vi-VN');
                    const opt = document.createElement('option');
                    opt.value = dateStr;
                    opt.textContent = dateStr;
                    qbDate.appendChild(opt);
                }
                qbShowtime.disabled = true;
                qbShowtime.innerHTML = '<option value="" disabled selected>-- Chọn Suất Chiếu --</option>';
                qbSubmit.disabled = true;
            });

            qbDate.addEventListener('change', () => {
                qbShowtime.disabled = false;
                qbShowtime.innerHTML = '<option value="" disabled selected>-- Chọn Suất Chiếu --</option>';
                // Populate dummy showtimes
                const times = ['09:00', '10:30', '13:00', '15:30', '18:00', '19:30', '21:00'];
                times.forEach(t => {
                    const opt = document.createElement('option');
                    opt.value = t;
                    opt.textContent = t;
                    qbShowtime.appendChild(opt);
                });
                qbSubmit.disabled = true;
            });

            qbShowtime.addEventListener('change', () => {
                qbSubmit.disabled = false;
            });

            qbSubmit.addEventListener('click', () => {
                const showtime = qbShowtime.value;
                if (selectedMovieId && showtime) {
                    if (window.requireAuth && !window.requireAuth('Bạn cần đăng nhập để đặt vé xem phim. Hãy đăng nhập hoặc tạo tài khoản để tiếp tục.')) return;
                    localStorage.removeItem('checkoutFood'); // Clear custom food state for new booking
                    window.location.href = `${srcPrefix}/booking/seat-booking/booking.html?id=${selectedMovieId}&showtimeId=${showtime}`; 
                }
            });
        }

        // Hamburger Logic
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const hamburgerDropdown = document.getElementById('hamburger-dropdown');
        if (hamburgerBtn && hamburgerDropdown) {
            hamburgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isDisplay = hamburgerDropdown.style.display === 'block';
                closeAllMenus('hamburger');
                hamburgerDropdown.style.display = isDisplay ? 'none' : 'block';
            });
            
            hamburgerDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                if (e.target.closest('a')) {
                    hamburgerDropdown.style.display = 'none';
                }
            });
        }

        
        // Mobile Quick Book Logic
        const mobileQbBtn = document.getElementById('mobile-qb-btn');
        const modalOverlay = document.getElementById('mobile-modal-overlay');
        if (mobileQbBtn && qbDropdown) {
            mobileQbBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (hamburgerDropdown) hamburgerDropdown.style.display = 'none';
                qbDropdown.classList.add('active');
                if (modalOverlay) modalOverlay.classList.add('active');
            });
            
            if (modalOverlay) {
                modalOverlay.addEventListener('click', () => {
                    qbDropdown.classList.remove('active');
                    modalOverlay.classList.remove('active');
                });
            }
            
            // Override the default document click so it also hides the overlay
            document.addEventListener('click', (e) => {
                if (!qbDropdown.contains(e.target) && e.target !== qbToggle && e.target !== mobileQbBtn) {
                    qbDropdown.classList.remove('active');
                    if (modalOverlay) modalOverlay.classList.remove('active');
                }
            });
        // Add logic for Đặt vé dropdown
        const bookingToggle = document.querySelector('.nav-booking-toggle');
        const bookingDropdownContent = document.querySelector('.booking-dropdown-content');
        if (bookingToggle && bookingDropdownContent) {
            const wrapper = document.querySelector('.booking-dropdown-wrapper');
            wrapper.addEventListener('mouseenter', () => {
                bookingDropdownContent.style.display = 'block';
            });
            wrapper.addEventListener('mouseleave', () => {
                bookingDropdownContent.style.display = 'none';
            });
        }

        // --- AUTH LOGIC ---
        const session = getSession();
            const navActions = document.querySelector('.nav-actions');
            if (navActions) {
                // Xóa nút chưa đăng nhập hiện tại
                const oldNotifBtn = document.getElementById('notif-btn');
                const oldUserBtn = document.querySelector('.user-btn');
                if (oldNotifBtn) oldNotifBtn.remove();
                if (oldUserBtn) oldUserBtn.remove();

                const userName = (session.fullname || session.name) || 'Khách';
                const defaultAvatar = `${srcPrefix}/shared/images/avatar.jpg`;
                const userAvatar = session.avatar || defaultAvatar;
                
                const isVip = localStorage.getItem('is_vip') === 'true' || session.role === 'vip';
                const vipPlan = localStorage.getItem('vip_plan') || session.vip_plan || '';
                let rewardsPoints = 0;
                try {
                    const rewardsData = JSON.parse(localStorage.getItem('3hd2k_rewards') || '{}');
                    rewardsPoints = rewardsData.points || 0;
                } catch(_) {}
                const pointsDisplay = rewardsPoints.toLocaleString('vi-VN');
                const userPointsHtml = isVip 
                    ? `<span class="user-points"><i class="fas fa-crown" style="color: #ffc107;"></i> VIP ${vipPlan ? vipPlan.charAt(0).toUpperCase() + vipPlan.slice(1) : ''} - ${pointsDisplay} điểm</span>`
                    : `<span class="user-points">Hạng thường - ${pointsDisplay} điểm</span>`;

                const borderClass = 'avatar-border-' + (localStorage.getItem('userAvatarBorder') || 'member');

                const loggedInHtml = `
                    <div class="notif-btn" id="notif-btn">
                        <i class="fas fa-bell"></i>
                        <span class="notif-dot" id="notif-dot" style="display: none;"></span>
                        <!-- Dropdown -->
                        <div class="notif-dropdown" id="notif-dropdown">
                            <div class="notif-header">
                                <span class="notif-title">Thông báo</span>
                                <button class="notif-mark-all" id="notif-mark-all">Đánh dấu tất cả đã đọc</button>
                            </div>
                            <ul class="notif-list" id="nav-notif-list">
                                <!-- Dynamic items rendered here -->
                            </ul>
                            <div class="notif-empty" id="nav-notif-empty" style="display: none; flex-direction: column; align-items: center; padding: 30px 20px; color: rgba(255,255,255,0.4); text-align: center;">
                                <i class="far fa-bell-slash" style="font-size: 2rem; margin-bottom: 10px; color: rgba(255,255,255,0.2);"></i>
                                <p style="font-size: 0.9rem; margin: 0;">Không có thông báo mới</p>
                            </div>
                            <a href="${srcPrefix}/user/user-notifications/index.html" class="notif-view-all">Xem tất cả thông báo <i class="fas fa-chevron-right"></i></a>
                        </div>
                    </div>
                    <div class="user-btn" id="user-btn">
                        <div class="avatar-wrapper">
                            <img src="${userAvatar}" alt="User Avatar" class="user-avatar ${borderClass}" onerror="this.onerror=null; this.src='${defaultAvatar}';" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                        </div>
                        <!-- Dropdown -->
                        <div class="user-dropdown" id="user-dropdown">
                            <div class="user-header">
                                <img src="${userAvatar}" alt="User Avatar" class="user-header-avatar ${borderClass}" onerror="this.onerror=null; this.src='${defaultAvatar}';" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; margin-right: 15px;">
                                <div class="user-info">
                                    <span class="user-name">${userName}</span>
                                    ${userPointsHtml}
                                </div>
                            </div>
                            <ul class="user-menu-list">
                                <li><a href="${srcPrefix}/user/user-profile/profile.html?tab=info"><i class="fas fa-user-circle"></i> Thông tin cá nhân</a></li>
                                <li><a href="${srcPrefix}/user/user-profile/profile.html?tab=history"><i class="fas fa-ticket-alt"></i> Lịch sử đặt vé</a></li>
                                <li><a href="${srcPrefix}/user/user-profile/profile.html?tab=offers"><i class="fas fa-gift"></i> Ưu đãi của tôi</a></li>
                                <li><a href="${srcPrefix}/user/user-profile/profile.html?tab=settings"><i class="fas fa-cog"></i> Cài đặt</a></li>
                            </ul>
                            <div class="user-menu-footer">
                                <a href="#" class="logout-btn" id="logout-action"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
                            </div>
                        </div>
                    </div>
                `;
                const currentHamburgerBtn = document.getElementById('hamburger-btn');
                if (currentHamburgerBtn) {
                    currentHamburgerBtn.insertAdjacentHTML('beforebegin', loggedInHtml);
                } else {
                    navActions.insertAdjacentHTML('beforeend', loggedInHtml);
                }

                const logoutBtn = document.getElementById('logout-action');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        logout(); // Gọi service để xóa auth_token và reload
                    });
                }
            }
        }


        // --- SEARCH EXPAND LOGIC ---
        const searchPill = document.getElementById('search-pill');
        const searchInput = document.getElementById('search-input');

        if (searchPill) {
            searchPill.addEventListener('click', () => {
                closeAllMenus('search');
                searchPill.classList.add('active');
                if (searchInput) {
                    searchInput.focus();
                }
            });
        }

        if (searchInput) {
            const searchSuggestions = document.getElementById('search-suggestions');
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const q = e.target.value.trim();
                    if (q) {
                        window.location.href = `${srcPrefix}/explore/movie-search/index.html?q=${encodeURIComponent(q)}`;
                    }
                }
            });

            if (searchSuggestions) {
                searchInput.addEventListener('input', (e) => {
                    const q = e.target.value.trim().toLowerCase();
                    if (!q) {
                        searchSuggestions.style.display = 'none';
                        return;
                    }
                    
                    let allMovies = [];
                    if (typeof window.nowShowingMovies !== 'undefined') allMovies = allMovies.concat(window.nowShowingMovies);
                    if (typeof window.comingSoonMovies !== 'undefined') allMovies = allMovies.concat(window.comingSoonMovies);
                    
                    if (allMovies.length === 0) {
                        searchSuggestions.style.display = 'none';
                        return;
                    }
                    
                    const matches = allMovies.filter(m => {
                        const titleMatch = m.title && m.title.toLowerCase().includes(q);
                        const titleEnMatch = m.titleEn && m.titleEn.toLowerCase().includes(q);
                        return titleMatch || titleEnMatch;
                    }).slice(0, 5); // Limit top 5
                    
                    if (matches.length > 0) {
                        searchSuggestions.innerHTML = matches.map(m => {
                            const posterSrc = m.poster.includes('../../') ? `${srcPrefix}/${m.poster.replace('../../', '')}` : m.poster;
                            return `
                            <a href="${srcPrefix}/booking/seat-booking/booking.html?id=${m.id}" style="display: flex; gap: 12px; padding: 12px 15px; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s; align-items: center;">
                                <img src="${posterSrc}" alt="${m.title}" style="width: 45px; height: 65px; object-fit: cover; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                                <div style="flex: 1; min-width: 0;">
                                    <div style="color: white; font-weight: bold; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;">${m.title}</div>
                                    <div style="color: rgba(255,255,255,0.5); font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${m.titleEn || (m.tags ? m.tags.join(', ') : '')}</div>
                                </div>
                            </a>
                        `}).join('') + `
                            <a href="${srcPrefix}/explore/movie-search/index.html?q=${encodeURIComponent(q)}" style="display: block; padding: 12px; text-align: center; color: var(--primary-red, #e50914); text-decoration: none; font-size: 0.9rem; font-weight: bold; background: rgba(229, 9, 20, 0.05); transition: background 0.2s;">
                                Xem tất cả kết quả
                            </a>
                        `;
                        searchSuggestions.style.display = 'flex';
                    } else {
                        searchSuggestions.innerHTML = `
                            <div style="padding: 20px; text-align: center; color: rgba(255,255,255,0.5); font-size: 0.9rem;">
                                Không tìm thấy phim phù hợp
                            </div>
                        `;
                        searchSuggestions.style.display = 'flex';
                    }
                });
            }
        }

        // --- NOTIFICATION DROPDOWN LOGIC ---
        const notifBtn = document.getElementById('notif-btn');
        const notifDropdown = document.getElementById('notif-dropdown');

        if (notifBtn) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllMenus('notif');
                notifBtn.classList.toggle('active');
                if (notifBtn.classList.contains('active')) {
                    notifBtn.classList.add('ringing');
                    setTimeout(() => {
                        notifBtn.classList.remove('ringing');
                    }, 600);
                }
            });
        }

        if (notifDropdown) {
            notifDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                if (e.target.closest('a')) {
                    notifBtn.classList.remove('active');
                }
            });
        }

        // --- USER DROPDOWN LOGIC ---
        const userBtn = document.getElementById('user-btn');
        const userDropdown = document.getElementById('user-dropdown');

        if (userBtn) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllMenus('user');
                userBtn.classList.toggle('active');
            });
        }

        if (userDropdown) {
            userDropdown.addEventListener('click', (e) => {
                e.stopPropagation(); 
                if (e.target.closest('a')) {
                    userBtn.classList.remove('active');
                }
            });
        }

        // --- CLICK OUTSIDE HANDLER ---
        document.addEventListener('click', (e) => {
            // Đóng search
            if (searchPill && !searchPill.contains(e.target)) {
                searchPill.classList.remove('active');
                if (searchInput) {
                    searchInput.value = '';
                }
                const searchSuggestions = document.getElementById('search-suggestions');
                if (searchSuggestions) {
                    searchSuggestions.style.display = 'none';
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

        // --- DYNAMIC NOTIFICATIONS LOGIC ---
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
            return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        }

        function getNotifIcon(category) {
            if (category === 'booking') return { wrap: 'red', icon: 'fas fa-ticket-alt' };
            if (category === 'movie') return { wrap: 'yellow', icon: 'fas fa-star' };
            if (category === 'promo') return { wrap: 'blue', icon: 'fas fa-tag' };
            return { wrap: 'gray', icon: 'fas fa-bell' };
        }

        const navNotifList = document.getElementById('nav-notif-list');
        const navNotifEmpty = document.getElementById('nav-notif-empty');
        const notifDot = document.getElementById('notif-dot');
        const markAllBtnNav = document.getElementById('notif-mark-all');

        function updateNavNotifications() {
            if (!navNotifList) return;
            
            // Initialize if not present
            let notifsStr = localStorage.getItem('3hd2k_notifications');
            if (!notifsStr) {
                // To meet user requirement: start completely empty. 
                // Only populated via purchases or external triggers.
                localStorage.setItem('3hd2k_notifications', JSON.stringify([]));
                notifsStr = '[]';
            }

            let notifs = [];
            try {
                notifs = JSON.parse(notifsStr);
            } catch (e) {
                notifs = [];
            }

            // --- SYNC WITH BOOKING DATA ---
            try {
                const bookings = JSON.parse(localStorage.getItem('cinema_bookings') || '[]');
                const existingBookingNotifs = notifs.filter(n => n.category === 'booking');
                // Retain non-booking notifs
                notifs = notifs.filter(n => n.category !== 'booking');
                
                bookings.forEach(b => {
                    const bId = b.id || '';
                    const notifId = 'notif_' + bId;
                    const existing = existingBookingNotifs.find(n => n.id === notifId);
                    
                    const isCancelled = b.status === 'Cancelled' || b.status === 'cancelled';
                    const title = isCancelled ? 'Đã hủy vé thành công!' : 'Đặt vé thành công!';
                    
                    // Format date & time
                    let timeText = b.showtimeText || b.time || 'N/A';
                    if (b.date) {
                        timeText += ', ' + b.date;
                    }

                    const text = `${b.movieTitle || 'Phim'} - Suất ${timeText}`;
                    const time = existing ? existing.timestamp : (b.createdAt || Date.now());
                    // default to true for newly synced ones
                    const unread = existing ? existing.unread : true;
                    
                    notifs.push({
                        id: notifId,
                        category: 'booking',
                        bookingId: bId,
                        title: title,
                        text: text,
                        timestamp: time,
                        unread: unread
                    });
                });
                
                localStorage.setItem('3hd2k_notifications', JSON.stringify(notifs));
            } catch (e) {
                console.error('Error syncing booking notifications', e);
            }
            // ------------------------------

            // Sort by timestamp desc
            notifs.sort((a, b) => b.timestamp - a.timestamp);

            const unreadCount = notifs.filter(n => n.unread).length;
            if (notifDot) {
                notifDot.style.display = unreadCount > 0 ? 'block' : 'none';
            }

            if (notifs.length === 0) {
                navNotifList.style.display = 'none';
                if (navNotifEmpty) navNotifEmpty.style.display = 'flex';
            } else {
                navNotifList.style.display = 'block';
                if (navNotifEmpty) navNotifEmpty.style.display = 'none';

                navNotifList.innerHTML = notifs.map(n => {
                    const iconInfo = getNotifIcon(n.category);
                    const bId = n.bookingId || (n.id && n.id.startsWith('notif_') ? n.id.replace('notif_', '') : '');
                    return `
                        <li class="notif-item ${n.unread ? 'unread' : ''}" data-id="${n.id}" ${bId ? `onclick="window.location.href='${srcPrefix}/user/user-profile/profile.html?tab=history&bookingId=${bId}'" style="cursor: pointer;"` : ''}>
                            <div class="notif-icon-wrap ${iconInfo.wrap}"><i class="${iconInfo.icon}"></i></div>
                            <div class="notif-body">
                                <p class="notif-text"><strong>${n.title}</strong> ${n.text}</p>
                                <span class="notif-time">${formatRelativeTime(n.timestamp)}</span>
                            </div>
                        </li>
                    `;
                }).join('');
            }
        }

        // Initial render
        updateNavNotifications();
        window.updateNavNotifications = updateNavNotifications;

        if (markAllBtnNav) {
            markAllBtnNav.addEventListener('click', (e) => {
                e.preventDefault(); 
                e.stopPropagation(); 
                
                try {
                    let notifs = JSON.parse(localStorage.getItem('3hd2k_notifications') || '[]');
                    notifs.forEach(n => n.unread = false);
                    localStorage.setItem('3hd2k_notifications', JSON.stringify(notifs));
                    updateNavNotifications();
                } catch (e) {
                    console.error('Error marking all as read', e);
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
