/**
 * forgot.js — Xử lý form quên mật khẩu (Nối Database Backend)
 */
import { API_BASE_URL, getHeaders } from '../../shared/utils/apiConfig.js?v=4';

const forgotForm  = document.getElementById('forgotForm');
const stepEmail   = document.getElementById('step-email');
const stepReset   = document.getElementById('step-reset');
const stepSuccess = document.getElementById('step-success');

const errorBanner = document.getElementById('form-error-banner');
const emailError  = document.getElementById('email-error');
const emailInput  = document.getElementById('email');
const submitBtn   = document.getElementById('submitBtn');

const resetForm   = document.getElementById('resetForm');
const resetErrorBanner = document.getElementById('reset-error-banner');
const otpInput    = document.getElementById('otp');
const newPasswordInput = document.getElementById('newPassword');
const submitResetBtn = document.getElementById('submitResetBtn');
const btnResendOtp = document.getElementById('btnResendOtp');

const successMsg  = document.getElementById('success-msg');

let lastEmail = '';

function showError(msg) {
    emailInput.classList.add('error');
    emailError.textContent = msg;
    emailError.classList.add('show');
}

function showResetError(msg) {
    resetErrorBanner.textContent = msg;
    resetErrorBanner.classList.add('show');
}

function clearErrors() {
    emailInput.classList.remove('error');
    emailError.classList.remove('show');
    errorBanner.classList.remove('show');
    resetErrorBanner.classList.remove('show');
}

// BƯỚC 1: Gửi yêu cầu quên mật khẩu (Lấy OTP)
forgotForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearErrors();

    const email = emailInput.value.trim();
    if (!email) {
        showError('Vui lòng nhập email.');
        return;
    }

    submitBtn.textContent = 'Đang gửi...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            showError(data.message || data.title || 'Có lỗi xảy ra.');
        } else {
            // Chuyển sang bước nhập OTP
            lastEmail = email;
            stepEmail.style.display = 'none';
            stepReset.style.display = 'block';
        }
    } catch (err) {
        console.error('Forgot password error:', err);
        showError('Không thể kết nối đến máy chủ.');
    } finally {
        submitBtn.textContent = 'Gửi link đặt lại mật khẩu';
        submitBtn.disabled = false;
    }
});

// BƯỚC 2: Nhập OTP và Mật khẩu mới
resetForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearErrors();

    const otp = otpInput.value.trim();
    const newPassword = newPasswordInput.value.trim();

    if (!otp || !newPassword) {
        showResetError('Vui lòng nhập đầy đủ OTP và mật khẩu mới.');
        return;
    }

    submitResetBtn.textContent = 'Đang xử lý...';
    submitResetBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                email: lastEmail,
                otpCode: otp,
                newPassword: newPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showResetError(data.message || data.title || 'Có lỗi xảy ra.');
        } else {
            // Chuyển sang bước thành công
            stepReset.style.display = 'none';
            stepSuccess.style.display = 'block';
            successMsg.textContent = 'Mật khẩu của bạn đã được cập nhật thành công. Vui lòng đăng nhập lại.';
        }
    } catch (err) {
        console.error('Reset password error:', err);
        showResetError('Không thể kết nối đến máy chủ.');
    } finally {
        submitResetBtn.textContent = 'Xác nhận đặt lại';
        submitResetBtn.disabled = false;
    }
});

emailInput.addEventListener('input', clearErrors);
otpInput.addEventListener('input', clearErrors);
newPasswordInput.addEventListener('input', clearErrors);

// Gửi lại OTP
if (btnResendOtp) {
    btnResendOtp.addEventListener('click', async (e) => {
        e.preventDefault();
        btnResendOtp.textContent = 'Đang gửi lại...';
        btnResendOtp.style.pointerEvents = 'none';
        
        try {
            await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ email: lastEmail })
            });
            alert('Mã OTP mới đã được gửi. Vui lòng kiểm tra màn hình console backend!');
        } catch (err) {
            alert('Lỗi khi gửi lại OTP.');
        } finally {
            btnResendOtp.textContent = 'Gửi lại mã OTP';
            btnResendOtp.style.pointerEvents = 'auto';
        }
    });
}
