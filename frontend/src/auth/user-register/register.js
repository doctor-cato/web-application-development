
import { register, isLoggedIn } from '../../auth/auth-services/authService.js?v=5';
import { API_BASE_URL } from '../../shared/utils/apiConfig.js?v=5';

if (isLoggedIn()) {
    window.location.href = '/explore/home-page/index.html';
}

// ========== DOM Elements ==========
const registerForm      = document.getElementById('registerForm');
const errorBanner       = document.getElementById('form-error-banner');
const emailInput        = document.getElementById('email');
const pwdInput          = document.getElementById('password');
const confirmPwdInput   = document.getElementById('confirm_password');
const phoneInput        = document.getElementById('phone');
const emailError        = document.getElementById('email-error');
const pwdError          = document.getElementById('pwd-error');
const confirmPwdError   = document.getElementById('confirm-pwd-error');
const phoneError        = document.getElementById('phone-error');

// OTP elements
const otpSection        = document.getElementById('otpSection');
const otpEmailDisplay   = document.getElementById('otpEmailDisplay');
const otpInputs         = document.querySelectorAll('.otp-digit');
const verifyOtpBtn      = document.getElementById('verifyOtpBtn');
const otpErrorEl        = document.getElementById('otpError');
const otpSuccessEl      = document.getElementById('otpSuccess');
const resendOtpBtn      = document.getElementById('resendOtpBtn');
const resendCountdown   = document.getElementById('resendCountdown');
const authTabs          = document.querySelector('.auth-tabs');

let registeredEmail = '';
let countdownInterval = null;

// ========== Password Toggle ==========
document.querySelectorAll('.togglePasswordBtn').forEach(btn => {
    btn.addEventListener('click', function () {
        const targetId    = this.getAttribute('data-target');
        const targetInput = document.getElementById(targetId);
        const type        = targetInput.getAttribute('type') === 'password' ? 'text' : 'password';
        targetInput.setAttribute('type', type);
        this.textContent  = type === 'password' ? 'visibility_off' : 'visibility';
    });
});

// ========== Clear Error on Input ==========
[emailInput, pwdInput, confirmPwdInput, phoneInput].forEach(input => {
    if (!input) return;
    input.addEventListener('input', function () {
        this.classList.remove('error');
        errorBanner.classList.remove('show');
        const errEl = document.getElementById(this.id + '-error')
            || (this.id === 'password' ? pwdError : confirmPwdError);
        if (errEl) errEl.classList.remove('show');
        if (this.id === 'phone' && phoneError) phoneError.classList.remove('show');
    });
});

// ========== OTP Input Handling ==========
otpInputs.forEach((input, index) => {
    // Only allow numeric input
    input.addEventListener('input', function (e) {
        const val = this.value.replace(/\D/g, '');
        this.value = val;

        if (val) {
            this.classList.add('filled');
            this.classList.remove('error');
            // Auto-focus next
            if (index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        } else {
            this.classList.remove('filled');
        }

        // Clear error/success messages
        otpErrorEl.textContent = '';
        otpSuccessEl.textContent = '';

        // Auto-submit when all 6 digits filled
        const otp = getOtpValue();
        if (otp.length === 6) {
            verifyOtp();
        }
    });

    // Backspace handling
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !this.value && index > 0) {
            otpInputs[index - 1].focus();
            otpInputs[index - 1].value = '';
            otpInputs[index - 1].classList.remove('filled');
        }
    });

    // Paste handling (paste full 6-digit code)
    input.addEventListener('paste', function (e) {
        e.preventDefault();
        const pasteData = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        if (pasteData.length >= 6) {
            otpInputs.forEach((inp, i) => {
                inp.value = pasteData[i] || '';
                if (inp.value) inp.classList.add('filled');
            });
            otpInputs[5].focus();
            // Auto-submit
            setTimeout(() => verifyOtp(), 200);
        }
    });
});

function getOtpValue() {
    return Array.from(otpInputs).map(inp => inp.value).join('');
}

// ========== Show OTP Section ==========
function showOtpSection(email) {
    registeredEmail = email;
    registerForm.style.display = 'none';
    if (authTabs) authTabs.style.display = 'none';
    otpSection.style.display = 'block';
    otpEmailDisplay.textContent = email;
    otpInputs[0].focus();
    startResendCountdown();
}

// ========== Resend Countdown ==========
function startResendCountdown() {
    let seconds = 60;
    resendOtpBtn.disabled = true;
    resendCountdown.textContent = seconds;
    resendOtpBtn.innerHTML = `Gửi lại (<span id="resendCountdown">${seconds}</span>s)`;

    if (countdownInterval) clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
        seconds--;
        const countdownEl = document.getElementById('resendCountdown') || resendCountdown;
        if (countdownEl) countdownEl.textContent = seconds;

        if (seconds <= 0) {
            clearInterval(countdownInterval);
            resendOtpBtn.disabled = false;
            resendOtpBtn.innerHTML = 'Gửi lại';
        }
    }, 1000);
}

// ========== Resend OTP ==========
resendOtpBtn.addEventListener('click', async function () {
    if (this.disabled || !registeredEmail) return;

    this.disabled = true;
    otpErrorEl.textContent = '';
    otpSuccessEl.textContent = '';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: registeredEmail })
        });
        const data = await response.json();

        if (response.ok) {
            otpSuccessEl.textContent = 'Đã gửi lại mã OTP thành công!';
            // Clear old inputs
            otpInputs.forEach(inp => {
                inp.value = '';
                inp.classList.remove('filled', 'error', 'success');
            });
            otpInputs[0].focus();
            startResendCountdown();
        } else {
            otpErrorEl.textContent = data.message || 'Không thể gửi lại mã OTP.';
            startResendCountdown();
        }
    } catch (e) {
        otpErrorEl.textContent = 'Lỗi kết nối. Vui lòng thử lại.';
        startResendCountdown();
    }
});

// ========== Verify OTP ==========
verifyOtpBtn.addEventListener('click', verifyOtp);

async function verifyOtp() {
    const otpCode = getOtpValue();

    if (otpCode.length !== 6) {
        otpErrorEl.textContent = 'Vui lòng nhập đủ 6 số.';
        otpInputs.forEach(inp => { if (!inp.value) inp.classList.add('error'); });
        return;
    }

    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = 'Đang xác nhận...';
    otpErrorEl.textContent = '';
    otpSuccessEl.textContent = '';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: registeredEmail, otpCode })
        });
        const data = await response.json();

        if (response.ok) {
            // Success - show green state
            otpInputs.forEach(inp => {
                inp.classList.remove('error');
                inp.classList.add('success');
                inp.disabled = true;
            });
            otpSuccessEl.textContent = '✓ Xác nhận email thành công!';
            verifyOtpBtn.style.display = 'none';
            if (resendOtpBtn) resendOtpBtn.closest('.otp-footer').style.display = 'none';

            // Countdown redirect
            let redirectSeconds = 3;
            const redirectMsg = document.createElement('div');
            redirectMsg.className = 'otp-redirect-msg';
            redirectMsg.innerHTML = `<strong>Chuyển hướng đến trang Đăng nhập sau ${redirectSeconds} giây...</strong>`;
            otpSection.appendChild(redirectMsg);

            const redirectInterval = setInterval(() => {
                redirectSeconds--;
                if (redirectSeconds > 0) {
                    redirectMsg.innerHTML = `<strong>Chuyển hướng đến trang Đăng nhập sau ${redirectSeconds} giây...</strong>`;
                } else {
                    clearInterval(redirectInterval);
                    window.location.href = '/auth/user-login/login.html';
                }
            }, 1000);
        } else {
            otpErrorEl.textContent = data.message || 'Mã OTP không chính xác.';
            otpInputs.forEach(inp => inp.classList.add('error'));

            // Clear and refocus
            setTimeout(() => {
                otpInputs.forEach(inp => {
                    inp.value = '';
                    inp.classList.remove('filled', 'error');
                });
                otpInputs[0].focus();
            }, 1500);

            verifyOtpBtn.disabled = false;
            verifyOtpBtn.textContent = 'Xác Nhận';
        }
    } catch (e) {
        otpErrorEl.textContent = 'Lỗi kết nối khi xác nhận. Vui lòng thử lại.';
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent = 'Xác Nhận';
    }
}

// ========== Register Form Submit ==========
registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    [emailInput, pwdInput, confirmPwdInput, phoneInput].forEach(el => el && el.classList.remove('error'));
    [emailError, pwdError, confirmPwdError, phoneError].forEach(el => el && el.classList.remove('show'));
    errorBanner.classList.remove('show');

    const fullname        = document.getElementById('fullname').value.trim();
    const email           = emailInput.value.trim();
    const password        = pwdInput.value;
    const confirmPassword = confirmPwdInput.value;
    const dob             = document.getElementById('dob').value;
    const phone           = phoneInput.value.trim();
    const gender          = document.querySelector('input[name="gender"]:checked').value;

    let isValid = true;

    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
        phoneInput.classList.add('error');
        phoneError.textContent = 'SĐT không hợp lệ (VD: 0901234567).';
        phoneError.classList.add('show');
        isValid = false;
    }

    if (password.length < 6) {
        pwdInput.classList.add('error');
        pwdError.textContent = 'Tối thiểu 6 ký tự.';
        pwdError.classList.add('show');
        isValid = false;
    }

    if (password !== confirmPassword) {
        confirmPwdInput.classList.add('error');
        confirmPwdError.textContent = 'Mật khẩu không khớp.';
        confirmPwdError.classList.add('show');
        isValid = false;
    }

    if (!isValid) return;

    // Disable button while processing
    const submitBtn = document.getElementById('registerSubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang xử lý...';
    }

    const result = await register({ fullname, email, password, dob, phone, gender });

    if (result.ok) {
        if (result.requireOtp) {
            // SMTP configured: Show OTP verification section
            showOtpSection(email);
        } else {
            // SMTP not configured: Auto-verified, redirect to login
            alert(result.message);
            window.location.href = '/auth/user-login/login.html';
        }
    } else {
        if (result.error && (result.error.toLowerCase().includes('điện thoại') || result.error.toLowerCase().includes('phone'))) {
            phoneInput.classList.add('error');
            phoneError.textContent = result.error;
            phoneError.classList.add('show');
        } else {
            emailInput.classList.add('error');
            emailError.textContent = result.error;
            emailError.classList.add('show');
        }
    }

    // Re-enable button
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Tạo Tài Khoản';
    }
});
