
import { login, verify2faLogin, isLoggedIn, getSession } from '../../auth/auth-services/authService.js?v=5';
import { API_BASE_URL } from '../../shared/utils/apiConfig.js?v=5';

function redirectAfterLogin(userRole) {
    const urlParams = new URLSearchParams(window.location.search);
    let returnUrl = urlParams.get('returnUrl') || urlParams.get('redirect');
    const session = getSession();
    let role = (userRole || session?.role || session?.Role || session?.userRole || session?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || localStorage.getItem('user_role') || '').toUpperCase();
    const lowerEmail = (session?.email || '').toLowerCase();
    const lowerName = (session?.fullname || session?.name || '').toLowerCase();
    if (lowerEmail.includes('admin') || lowerName.includes('admin') || role === 'ADMIN') role = 'ADMIN';
    else if (lowerEmail.includes('staff') || lowerName.includes('staff') || role === 'STAFF') role = 'STAFF';

    // Sanitize returnUrl to prevent infinite redirect loops to login/auth pages
    if (returnUrl) {
        const lowerUrl = returnUrl.toLowerCase();
        if (lowerUrl.includes('login') || lowerUrl.includes('register') || lowerUrl.includes('auth')) {
            returnUrl = null;
        }
    }

    let targetUrl = '/explore/home-page/index.html';
    if (role === 'ADMIN') {
        targetUrl = '/management/admin.html';
    } else if (role === 'STAFF') {
        targetUrl = '/management/staff-sales.html';
    } else if (returnUrl) {
        targetUrl = returnUrl;
    }

    // Do not redirect if already at targetUrl
    if (window.location.pathname !== targetUrl && !window.location.href.endsWith(targetUrl)) {
        window.location.href = targetUrl;
    }
}

if (isLoggedIn()) {
    const referrer = document.referrer || '';
    const isFromProtectedPage = referrer.includes('admin.html') || referrer.includes('staff-sales.html');
    
    // Only auto-redirect if not coming back from a protected page rejection
    if (!isFromProtectedPage) {
        const session = getSession();
        redirectAfterLogin(session?.role);
    }
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
                if (result.require2fa) {
                    loginForm.style.display = 'none';
                    const otpSection = document.getElementById('otpSection');
                    const otpEmailDisplay = document.getElementById('otpEmailDisplay');
                    if (otpSection && otpEmailDisplay) {
                        otpSection.style.display = 'block';
                        otpEmailDisplay.textContent = result.email;
                        
                        setupOtpLogic(result.email);
                    }
                } else {
                    redirectAfterLogin(result.user?.role);
                }
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

function setupOtpLogic(email) {
    const otpInputs = document.querySelectorAll('.otp-digit');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const otpErrorEl = document.getElementById('otpError');
    const otpSuccessEl = document.getElementById('otpSuccess');

    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value) {
                this.classList.add('filled');
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            } else {
                this.classList.remove('filled');
            }
            if (otpErrorEl) otpErrorEl.textContent = '';
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace' && !this.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });

    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', async function () {
            let otp = '';
            otpInputs.forEach(inp => otp += inp.value);

            if (otp.length < 6) {
                if (otpErrorEl) otpErrorEl.textContent = 'Vui lòng nhập đủ 6 số OTP.';
                return;
            }

            verifyOtpBtn.disabled = true;
            verifyOtpBtn.textContent = 'Đang xử lý...';

            const result = await verify2faLogin(email, otp);
            if (result.ok) {
                if (otpSuccessEl) otpSuccessEl.textContent = 'Xác minh thành công!';
                setTimeout(() => {
                    redirectAfterLogin(result.user?.role);
                }, 500);
            } else {
                if (otpErrorEl) otpErrorEl.textContent = result.error || 'Mã OTP không chính xác.';
                verifyOtpBtn.disabled = false;
                verifyOtpBtn.textContent = 'Xác Nhận';
            }
        });
    }
}
