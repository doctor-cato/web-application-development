
import { register, isLoggedIn } from '../../auth/auth-services/authService.js?v=5';
import { API_BASE_URL } from '../../shared/utils/apiConfig.js?v=5';

if (isLoggedIn()) {
    window.location.href = '/explore/home-page/index.html';
}

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

document.querySelectorAll('.togglePasswordBtn').forEach(btn => {
    btn.addEventListener('click', function () {
        const targetId    = this.getAttribute('data-target');
        const targetInput = document.getElementById(targetId);
        const type        = targetInput.getAttribute('type') === 'password' ? 'text' : 'password';
        targetInput.setAttribute('type', type);
        this.textContent  = type === 'password' ? 'visibility_off' : 'visibility';
    });
});

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

    const result = await register({ fullname, email, password, dob, phone, gender });

    if (result.ok) {
        // Show OTP prompt
        const otpCode = window.prompt(result.message + "\n\nVui lòng nhập mã OTP (6 số):");
        if (otpCode && otpCode.trim() !== '') {
            try {
                const verifyRes = await fetch(`${API_BASE_URL}/auth/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otpCode: otpCode.trim() })
                });
                const verifyData = await verifyRes.json();
                if (verifyRes.ok) {
                    alert('Xác nhận thành công! Bấm OK để tới trang Đăng nhập.');
                    window.location.href = '/auth/user-login/login.html';
                } else {
                    alert('Lỗi xác nhận: ' + (verifyData.message || 'Sai OTP.'));
                    window.location.href = '/auth/user-login/login.html';
                }
            } catch(e) {
                alert('Lỗi kết nối khi xác nhận OTP.');
            }
        } else {
            alert('Bạn có thể đăng nhập sau và xác nhận email sau (nếu hỗ trợ).');
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
});
