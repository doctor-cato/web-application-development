/**
 * footer.js
 * ─────────────────────────────────────────────────────────────
 * Component render Footer dùng chung cho toàn dự án.
 */

export function renderFooter() {
    const footerHTML = `
    <footer>
        <div class="footer-content" style="border-top: 1px solid var(--glass-border); padding-top: 40px; margin-top: 40px;">
            <div class="footer-brand">
                <h2 class="logo" style="font-family: 'Inter', sans-serif; font-size: 3rem; color: var(--primary-red); margin-bottom: 10px;">3HD2K</h2>
                <p style="color: rgba(255,255,255,0.6); max-width: 300px; line-height: 1.6;">Trải nghiệm điện ảnh đỉnh cao, mang Hollywood đến gần bạn hơn.</p>
                <div class="social-icons" style="margin-top: 20px; display: flex; gap: 15px;">
                    <i class="fas fa-share-alt" style="color: white; font-size: 1.2rem; cursor: pointer;"></i>
                    <i class="fas fa-globe" style="color: white; font-size: 1.2rem; cursor: pointer;"></i>
                </div>
            </div>
            <div class="footer-links" style="display: flex; gap: 60px; flex-wrap: wrap;">
                <div class="link-column">
                    <h4 style="font-family: 'Inter', sans-serif; font-size: 0.75rem; font-weight: bold; letter-spacing: 1px; margin-bottom: 20px;">KHÁM PHÁ</h4>
                    <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
                        <li><a href="../../engagement/minigame/index.html" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.3s; font-family: 'Inter', sans-serif;">CINE PREDICT</a></li>
                        <li><a href="../../booking/group-booking/index.html" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.3s; font-family: 'Inter', sans-serif;">Đặt ghế nhóm</a></li>
                        <li><a href="../../wip.html" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.3s; font-family: 'Inter', sans-serif;">Khuyến mãi</a></li>
                    </ul>
                </div>
                <div class="link-column">
                    <h4 style="font-family: 'Inter', sans-serif; font-size: 0.75rem; font-weight: bold; letter-spacing: 1px; margin-bottom: 20px;">HỖ TRỢ</h4>
                    <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
                        <li><a href="../../footer/index.html?tab=help" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.3s; font-family: 'Inter', sans-serif;">Trung tâm Hỗ trợ</a></li>
                        <li><a href="../../footer/index.html?tab=terms" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.3s; font-family: 'Inter', sans-serif;">Điều khoản Sử dụng</a></li>
                        <li><a href="../../footer/index.html?tab=privacy" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.3s; font-family: 'Inter', sans-serif;">Chính sách Bảo mật</a></li>
                        <li><a href="../../footer/index.html?tab=cookie" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.3s; font-family: 'Inter', sans-serif;">Tùy chọn Cookie</a></li>
                    </ul>
                </div>
                <div class="link-column">
                    <h4 style="font-family: 'Inter', sans-serif; font-size: 0.75rem; font-weight: bold; letter-spacing: 1px; margin-bottom: 20px;">VỀ CHÚNG TÔI</h4>
                    <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
                        <li><a href="../../wip.html" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.3s; font-family: 'Inter', sans-serif;">Về Chúng Tôi</a></li>
                        <li><a href="../../wip.html" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.3s; font-family: 'Inter', sans-serif;">Thông tin Doanh nghiệp</a></li>
                        <li><a href="../../wip.html" style="color: rgba(255,255,255,0.7); text-decoration: none; transition: color 0.3s; font-family: 'Inter', sans-serif;">Tuyển Dụng</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="footer-bottom" style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); font-size: 0.9rem;">
            <p>&copy; 2026 3HD2K Cinema. All rights reserved.</p>
        </div>
    </footer>

    <!-- ── FLOATING SUPPORT ─────────────────────────────────── -->
    <div class="float-support">
        <div class="float-support-menu" id="support-menu">
            <a href="tel:19001234" class="float-support-item">
                <i class="fas fa-phone"></i> Hotline: 1900 1234
            </a>
            <a href="#" class="float-support-item" onclick="event.preventDefault(); window.showToast('Chat trực tuyến sẽ sớm ra mắt!')">
                <i class="fas fa-comment-dots"></i> Chat trực tuyến
            </a>
        </div>
        <button class="float-support-toggle" id="support-toggle" aria-label="Hỗ trợ" onclick="window.toggleSupportMenu()">
            <i class="fas fa-headset" id="support-icon"></i>
        </button>
    </div>

    <!-- ── TOAST ─────────────────────────────────────────────── -->
    <div class="toast" id="toast"></div>
    <style>
    footer {
        background-color: var(--bg-color);
        padding: 40px 20px;
        color: white;
    }
    .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 40px;
    }
    .link-column a:hover {
        color: var(--primary-red) !important;
    }
    @media (max-width: 768px) {
        .footer-content { flex-direction: column; }
    }
    </style>
    `;

    // Try to find existing footer or placeholder
    let container = document.getElementById('footer-placeholder') || 
                    document.querySelector('footer.main-footer') ||
                    document.querySelector('footer');
    
    if (container) {
        container.outerHTML = footerHTML;
    } else {
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
}

// Tự động render nếu được import
let hasRenderedFooter = false;
function safeRenderFooter() {
    if (hasRenderedFooter) return;
    hasRenderedFooter = true;
    renderFooter();
}

document.addEventListener('DOMContentLoaded', safeRenderFooter);

if (document.readyState === 'interactive' || document.readyState === 'complete') {
    safeRenderFooter();
}
