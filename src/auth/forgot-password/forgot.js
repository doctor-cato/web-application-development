/**
 * forgot.js — Xử lý form quên mật khẩu
 */
import { getUsers } from '/auth/auth-services/storage.js';

const forgotForm  = document.getElementById('forgotForm');
const stepEmail   = document.getElementById('step-email');
const stepSuccess = document.getElementById('step-success');
const errorBanner = document.getElementById('form-error-banner');
const emailError  = document.getElementById('email-error');
const emailInput  = document.getElementById('email');
const successMsg  = document.getElementById('success-msg');
const btnResend   = document.getElementById('btnResend');

let lastEmail = '';

function showError(msg) {
    emailInput.classList.add('error');
    emailError.textContent = msg;
    emailError.classList.add('show');
}

function clearErrors() {
    emailInput.classList.remove('error');
    emailError.classList.remove('show');
    errorBanner.classList.remove('show');
}

function showSuccess(email) {
    stepEmail.style.display   = 'none';
    stepSuccess.style.display = 'block';
    successMsg.textContent    =
        `Link đặt lại mật khẩu đã được gửi đến ${email}. ` +
        `Vui lòng kiểm tra hộp thư (kể cả thư mục spam).`;
}

forgotForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();

    const email = emailInput.value.trim();
    const users = getUsers();
    const exists = users.find(u => u.email === email);

    if (!exists) {
        showError('Email này chưa được đăng ký trong hệ thống.');
        return;
    }

    lastEmail = email;
    showSuccess(email);
});

emailInput.addEventListener('input', clearErrors);

// Gửi lại
if (btnResend) {
    btnResend.addEventListener('click', () => {
        stepSuccess.style.display = 'none';
        stepEmail.style.display   = 'block';
        emailInput.value          = lastEmail;
    });
}
