/**
 * login.js — Xử lý form đăng nhập
 */
import { login, isLoggedIn } from '../../auth/auth-services/authService.js?v=5';

// Redirect nếu đã đăng nhập
if (isLoggedIn()) {
    window.location.href = '/explore/home-page/index.html';
}

const loginForm      = document.getElementById('loginForm');
const errorBanner    = document.getElementById('form-error-banner');
const passwordInput  = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');

// ── Toggle hiển thị mật khẩu ──────────────────────────────
togglePassword.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? 'visibility_off' : 'visibility';
});

// ── Xử lý submit ──────────────────────────────────────────
loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    errorBanner.classList.remove('show');

    const email    = document.getElementById('email').value.trim();
    const password = passwordInput.value;

    const result = await login(email, password);

    if (result.ok) {
        const role = result.user?.role?.toUpperCase() || 'CUSTOMER';
        if (role === 'ADMIN') {
            window.location.href = '/management/admin.html';
        } else if (role === 'STAFF') {
            window.location.href = '/management/staff-sales.html';
        } else {
            window.location.href = '/explore/home-page/index.html';
        }
    } else {
        errorBanner.textContent = result.error;
        errorBanner.classList.add('show');

        document.getElementById('email').classList.add('error');
        passwordInput.classList.add('error');

        // Gỡ viền đỏ khi người dùng gõ lại
        ['email', 'password'].forEach(id => {
            document.getElementById(id).addEventListener('input', function () {
                this.classList.remove('error');
                errorBanner.classList.remove('show');
            }, { once: true });
        });
    }
});
