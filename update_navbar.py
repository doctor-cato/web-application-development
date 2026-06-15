import re
import sys

def update_navbar():
    css_file = r"c:\Users\PC KHANH\web-application-development\So_sanh\assets\css\main.css"
    js_file = r"c:\Users\PC KHANH\web-application-development\src\shared\components\navbar.js"

    # Read CSS
    with open(css_file, "r", encoding="utf-8") as f:
        css_content = f.read()

    # Extract CSS from /* --- NAVBAR --- */ to just before footer {
    start_str = "/* --- NAVBAR --- */"
    end_str = "footer {"
    start_idx = css_content.find(start_str)
    end_idx = css_content.find(end_str, start_idx)
    
    extracted_css = css_content[start_idx:end_idx].strip()

    # Read JS
    with open(js_file, "r", encoding="utf-8") as f:
        js_content = f.read()

    new_html = f"""const navbarHTML = `
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
        </div>
    </header>
    <style>
{extracted_css}
    </style>
    `;"""

    # Manually replace the const navbarHTML = `...`;
    # Find the start of const navbarHTML = `
    start_html = js_content.find("const navbarHTML = `")
    # Find the closing `; that corresponds to it
    end_html = js_content.find("`;", start_html) + 2
    
    js_content = js_content[:start_html] + new_html + js_content[end_html:]

    with open(js_file, "w", encoding="utf-8") as f:
        f.write(js_content)

    print("Success")

if __name__ == "__main__":
    update_navbar()
