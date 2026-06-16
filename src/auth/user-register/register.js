/**
 * register.js — Xử lý form đăng ký tài khoản
 */
import { register, isLoggedIn } from '/auth/auth-services/authService.js';

// Redirect nếu đã đăng nhập
if (isLoggedIn()) {
    window.location.href = '/explore/home-page/index.html';
}

// ── DOM refs ───────────────────────────────────────────────
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
const avatarInput       = document.getElementById('avatarInput');
const preview           = document.getElementById('registerAvatarPreview');

// ── Avatar preview ─────────────────────────────────────────
let avatarDataUrl = '';

window.addEventListener('DOMContentLoaded', () => {
    localStorage.removeItem('user_avatar');
});

if (avatarInput) {
    avatarInput.addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            avatarDataUrl = e.target.result;
            if (preview) preview.src = avatarDataUrl;
        };
        reader.readAsDataURL(file);
    });
}

// ── Toggle hiển thị mật khẩu ──────────────────────────────
document.querySelectorAll('.togglePasswordBtn').forEach(btn => {
    btn.addEventListener('click', function () {
        const targetId    = this.getAttribute('data-target');
        const targetInput = document.getElementById(targetId);
        const type        = targetInput.getAttribute('type') === 'password' ? 'text' : 'password';
        targetInput.setAttribute('type', type);
        this.textContent  = type === 'password' ? 'visibility_off' : 'visibility';
    });
});

// ── Gỡ lỗi khi user gõ lại ────────────────────────────────
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

// ── Submit ─────────────────────────────────────────────────
registerForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Reset errors
    [emailInput, pwdInput, confirmPwdInput, phoneInput].forEach(el => el && el.classList.remove('error'));
    [emailError, pwdError, confirmPwdError, phoneError].forEach(el => el && el.classList.remove('show'));
    errorBanner.classList.remove('show');

    const fullname        = document.getElementById('fullname').value.trim();
    const email           = emailInput.value.trim();
    const password        = pwdInput.value;
    const confirmPassword = confirmPwdInput.value;
    const dob             = document.getElementById('dob').value;
    const phone           = phoneInput.value.trim();
    const avatar          = avatarDataUrl || '/shared/images/avatar.jpg';

    let isValid = true;

    // Validation: Phone
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
        phoneInput.classList.add('error');
        phoneError.textContent = 'SĐT không hợp lệ (VD: 0987654321).';
        phoneError.classList.add('show');
        isValid = false;
    }

    // Validation: Password length
    if (password.length < 6) {
        pwdInput.classList.add('error');
        pwdError.textContent = 'Tối thiểu 6 ký tự.';
        pwdError.classList.add('show');
        isValid = false;
    }

    // Validation: Confirm password
    if (password !== confirmPassword) {
        confirmPwdInput.classList.add('error');
        confirmPwdError.textContent = 'Mật khẩu không khớp.';
        confirmPwdError.classList.add('show');
        isValid = false;
    }

    if (!isValid) return;

    const result = register({ fullname, email, password, dob, phone, avatar });

    if (result.ok) {
        window.location.href = '/explore/home-page/index.html';
    } else {
        emailInput.classList.add('error');
        emailError.textContent = result.error;
        emailError.classList.add('show');
    }
});
