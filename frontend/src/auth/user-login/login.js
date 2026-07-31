
import { login, isLoggedIn, getSession } from '../../auth/auth-services/authService.js?v=5';
import { API_BASE_URL } from '../../shared/utils/apiConfig.js?v=5';

function redirectAfterLogin(userRole) {
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl') || urlParams.get('redirect');
    const role = (userRole || '').toUpperCase();

    if (role === 'ADMIN') {
        window.location.href = '/management/admin.html';
    } else if (role === 'STAFF') {
        window.location.href = '/management/staff-sales.html';
    } else if (returnUrl) {
        window.location.href = returnUrl;
    } else {
        window.location.href = '/explore/home-page/index.html';
    }
}

if (isLoggedIn()) {
    const session = getSession();
    redirectAfterLogin(session?.role);
}

const loginForm      = document.getElementById('loginForm');
const errorBanner    = document.getElementById('form-error-banner');
const passwordInput  = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');

if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.textContent = type === 'password' ? 'visibility_off' : 'visibility';
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (errorBanner) errorBanner.classList.remove('show');

        const emailInput = document.getElementById('email');
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!email || !password) {
            if (errorBanner) {
                errorBanner.textContent = 'Vui lòng nhập đầy đủ email và mật khẩu.';
                errorBanner.classList.add('show');
            }
            return;
        }

        const submitBtn = loginForm.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Đang xử lý...';
        }

        try {
            const result = await login(email, password);

            if (result.ok) {
                redirectAfterLogin(result.user?.role);
            } else {

                if (errorBanner) {
                    errorBanner.textContent = result.error || 'Đăng nhập thất bại.';
                    errorBanner.classList.add('show');
                }

                emailInput?.classList.add('error');
                passwordInput?.classList.add('error');

                ['email', 'password'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        el.addEventListener('input', function () {
                            this.classList.remove('error');
                            if (errorBanner) errorBanner.classList.remove('show');
                        }, { once: true });
                    }
                });
            }
        } catch (err) {
            console.error('Login submit error:', err);
            if (errorBanner) {
                errorBanner.textContent = 'Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.';
                errorBanner.classList.add('show');
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Đăng Nhập';
            }
        }
    });
}
