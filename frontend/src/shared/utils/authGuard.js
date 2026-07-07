/**
 * authGuard.js
 * ─────────────────────────────────────────────────────────────
 * Kiểm tra trạng thái đăng nhập trước khi cho phép sử dụng
 * các tính năng yêu cầu xác thực (đặt vé, thanh toán, v.v.)
 *
 * Cách dùng:
 *   import { requireAuth } from '../../shared/utils/authGuard.js';
 *
 *   // Returns true nếu đã đăng nhập, false nếu chưa (và hiện modal)
 *   if (!requireAuth()) return;
 * ─────────────────────────────────────────────────────────────
 */

const MODAL_ID = 'auth-guard-modal';

/**
 * Kiểm tra user đã đăng nhập chưa dựa vào localStorage.
 */
export function isAuthenticated() {
    const session = localStorage.getItem('currentUser');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    return Boolean(session) || isLoggedIn === 'true';
}

/**
 * Hiển thị modal yêu cầu đăng nhập.
 * @param {string} [message] — Thông điệp tùy chỉnh
 * @returns {false} — Luôn trả về false để dùng ngắn gọn: if (!requireAuth()) return;
 */
export function showAuthModal(message) {
    // Xóa modal cũ nếu có
    const existing = document.getElementById(MODAL_ID);
    if (existing) existing.remove();

    const msg = message || 'Bạn cần đăng nhập để sử dụng tính năng này.';

    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.innerHTML = `
        <div class="auth-guard-overlay" style="
            position: fixed; inset: 0; z-index: 99999;
            background: rgba(0,0,0,0.75);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center;
            animation: authGuardFadeIn 0.3s ease;
        ">
            <div class="auth-guard-card" style="
                background: linear-gradient(145deg, #1a1a1a, #111);
                border: 1px solid rgba(229, 9, 20, 0.3);
                border-radius: 20px;
                padding: 2.5rem 2rem;
                max-width: 420px;
                width: 90%;
                text-align: center;
                box-shadow: 0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(229,9,20,0.1);
                animation: authGuardSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                position: relative;
            ">
                <!-- Close button -->
                <button id="auth-guard-close" style="
                    position: absolute; top: 14px; right: 16px;
                    background: none; border: none; color: #666;
                    font-size: 1.25rem; cursor: pointer;
                    width: 32px; height: 32px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                " onmouseover="this.style.color='#fff';this.style.background='rgba(255,255,255,0.1)'"
                   onmouseout="this.style.color='#666';this.style.background='none'">
                    <i class="fas fa-times"></i>
                </button>

                <!-- Icon -->
                <div style="
                    width: 72px; height: 72px; border-radius: 50%;
                    background: rgba(229, 9, 20, 0.12);
                    border: 2px solid rgba(229, 9, 20, 0.35);
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 1.5rem;
                ">
                    <i class="fas fa-lock" style="font-size: 1.75rem; color: #E50914;"></i>
                </div>

                <!-- Title -->
                <h2 style="
                    font-family: 'Inter', 'Inter', sans-serif;
                    font-size: 1.5rem; font-weight: 700;
                    color: #fff; margin-bottom: 0.75rem;
                    letter-spacing: 0.5px;
                ">YÊU CẦU ĐĂNG NHẬP</h2>

                <!-- Message -->
                <p style="
                    color: #999; font-size: 0.95rem;
                    line-height: 1.6; margin-bottom: 2rem;
                ">${msg}</p>

                <!-- Buttons -->
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <a href="../../auth/user-login/login.html" id="auth-guard-login" style="
                        display: flex; align-items: center; justify-content: center; gap: 8px;
                        padding: 14px; border-radius: 10px;
                        background: linear-gradient(135deg, #E50914, #b8070f);
                        color: #fff; font-weight: 700; font-size: 1rem;
                        text-decoration: none;
                        transition: all 0.25s ease;
                        box-shadow: 0 4px 15px rgba(229,9,20,0.3);
                    " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 25px rgba(229,9,20,0.4)'"
                       onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 15px rgba(229,9,20,0.3)'">
                        <i class="fas fa-sign-in-alt"></i>
                        ĐĂNG NHẬP
                    </a>
                    <a href="../../auth/user-register/register.html" id="auth-guard-register" style="
                        display: flex; align-items: center; justify-content: center; gap: 8px;
                        padding: 14px; border-radius: 10px;
                        background: rgba(255,255,255,0.06);
                        border: 1px solid rgba(255,255,255,0.15);
                        color: #ccc; font-weight: 600; font-size: 1rem;
                        text-decoration: none;
                        transition: all 0.25s ease;
                    " onmouseover="this.style.background='rgba(255,255,255,0.1)';this.style.borderColor='rgba(255,255,255,0.3)';this.style.color='#fff';this.style.transform='translateY(-2px)'"
                       onmouseout="this.style.background='rgba(255,255,255,0.06)';this.style.borderColor='rgba(255,255,255,0.15)';this.style.color='#ccc';this.style.transform='translateY(0)'">
                        <i class="fas fa-user-plus"></i>
                        TẠO TÀI KHOẢN MỚI
                    </a>
                </div>

                <p style="margin-top: 1.25rem; font-size: 0.8rem; color: #555;">
                    Đăng nhập để trải nghiệm toàn bộ tính năng của 3HD2K Cinema
                </p>
            </div>
        </div>

        <style>
            @keyframes authGuardFadeIn {
                from { opacity: 0; }
                to   { opacity: 1; }
            }
            @keyframes authGuardSlideUp {
                from { opacity: 0; transform: translateY(30px) scale(0.95); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
            }
        </style>
    `;

    document.body.appendChild(modal);

    // Close handlers
    const closeBtn = document.getElementById('auth-guard-close');
    const overlay = modal.querySelector('.auth-guard-overlay');

    closeBtn.addEventListener('click', () => modal.remove());
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) modal.remove();
    });
    document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handler);
        }
    });

    return false;
}

/**
 * Guard chính: nếu đã đăng nhập trả về true, chưa thì hiện modal và trả về false.
 * @param {string} [message] — Thông điệp tùy chỉnh
 * @returns {boolean}
 */
export function requireAuth(message) {
    if (isAuthenticated()) return true;
    showAuthModal(message);
    return false;
}
