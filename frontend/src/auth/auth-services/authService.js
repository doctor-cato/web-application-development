import { API_BASE_URL, getHeaders } from '../../shared/utils/apiConfig.js?v=5';
import { getCurrentUser, setCurrentUser, clearCurrentUser } from './storage.js';

export async function login(email, password) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email, password }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        const responseText = await response.text();
        let data;
        try {
            data = responseText ? JSON.parse(responseText) : {};
            if (!response.ok && response.status === 429 && !data.message) {
                data.message = 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.';
            }
            if (!response.ok && data.errors && !data.message) {
                const firstErrorKey = Object.keys(data.errors)[0];
                data.message = data.errors[firstErrorKey][0];
            }
        } catch (parseError) {
            console.error('Login: Server trả về response không phải JSON:', responseText.substring(0, 200));
            return { ok: false, error: 'Máy chủ gặp lỗi xử lý. Vui lòng thử lại sau.' };
        }

        if (response.ok) {
            if (data.require2fa) {
                return { ok: true, require2fa: true, email: data.email, message: data.message };
            }
            if (data.token) {
                localStorage.setItem('jwt_token', data.token);
            }
            if (data.refreshToken) {
                localStorage.setItem('refresh_token', data.refreshToken);
            }
            setCurrentUser(data.user);
            return { ok: true, user: data.user };
        } else {
            return { ok: false, error: data.message || 'Đăng nhập thất bại' };
        }
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('Login network error:', error);

        if (error.name === 'AbortError') {
            return { ok: false, error: 'Hết thời gian chờ phản hồi từ máy chủ (Timeout). Vui lòng kiểm tra lại server Backend.' };
        }
        return { ok: false, error: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng hoặc server Backend.' };
    }
}

export async function verify2faLogin(email, otpCode) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-2fa-login`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email, otpCode })
        });
        const responseText = await response.text();
        let data = {};
        try {
            if (responseText) data = JSON.parse(responseText);
        } catch(e) {}

        if (response.ok) {
            if (data.token) {
                localStorage.setItem('jwt_token', data.token);
            }
            if (data.refreshToken) {
                localStorage.setItem('refresh_token', data.refreshToken);
            }
            if (data.user) {
                setCurrentUser(data.user);
            }
            return { ok: true, user: data.user };
        } else {
            return { ok: false, error: data.message || 'Mã OTP không chính xác' };
        }
    } catch (error) {
        console.error('verify2faLogin error:', error);
        return { ok: false, error: 'Lỗi kết nối khi xác minh OTP.' };
    }
}

export async function register(userData) {
    try {
        const payload = {
            name: userData.fullname,
            email: userData.email,
            phone: userData.phone,
            dateOfBirth: userData.dob,
            gender: userData.gender,
            password: userData.password,
            confirmPassword: userData.confirmPassword || userData.password
        };
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        let data;
        try {
            data = responseText ? JSON.parse(responseText) : {};
            if (!response.ok && response.status === 429 && !data.message) {
                data.message = 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.';
            }
            if (!response.ok && data.errors && !data.message) {
                const firstErrorKey = Object.keys(data.errors)[0];
                data.message = data.errors[firstErrorKey][0];
            }
        } catch (parseError) {

            console.error('Server trả về response không phải JSON:', responseText.substring(0, 200));
            if (responseText.includes('UNIQUE') && responseText.includes('phone')) {
                return { ok: false, error: 'Số điện thoại này đã được sử dụng.' };
            }
            if (responseText.includes('UNIQUE') && responseText.includes('email')) {
                return { ok: false, error: 'Email này đã được sử dụng.' };
            }
            return { ok: false, error: 'Máy chủ gặp lỗi xử lý. Vui lòng thử lại sau.' };
        }

        if (response.ok) {
            return { ok: true, message: data.message, requireOtp: data.requireOtp, email: userData.email };
        } else {
            return { ok: false, error: data.message || 'Đăng ký thất bại' };
        }
    } catch (error) {
        console.error('Register network error:', error);
        return { ok: false, error: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.' };
    }
}

export async function logout() {
    try {
        const rt = localStorage.getItem('refresh_token');
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ refreshToken: rt || '' })
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    clearCurrentUser();
    window.location.href = '/auth/user-login/login.html';
}

export async function refreshJwtToken() {
    try {
        const token = localStorage.getItem('jwt_token');
        const rt = localStorage.getItem('refresh_token');
        if (!token || !rt) return false;

        const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token, refreshToken: rt })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('jwt_token', data.token);
            localStorage.setItem('refresh_token', data.refreshToken);
            return true;
        }
        return false;
    } catch(err) {
        return false;
    }
}

export function getSession() {
    return getCurrentUser();
}

export function isLoggedIn() {
    const session = getSession();
    const jwtToken = localStorage.getItem('jwt_token');
    return Boolean(session && jwtToken);
}

export async function updateProfile(updates) {
    try {
        const currentUser = getCurrentUser();
        const payload = {
            email: currentUser ? currentUser.email : (localStorage.getItem('userEmail') || ''),
            dateOfBirth: updates.dob || updates.dateOfBirth,
            gender: updates.gender,
            fullname: updates.fullname
        };

        const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        let data;
        try {
            data = responseText ? JSON.parse(responseText) : {};
        } catch (_) {
            data = {};
        }

        if (response.ok) {
            if (data.user) {
                const session = getCurrentUser() || {};
                const updatedSession = { ...session, ...data.user };
                setCurrentUser(updatedSession);
            }
            return { ok: true, message: data.message || 'Cập nhật thành công' };
        } else {
            return { ok: false, error: data.message || 'Không thể cập nhật thông tin' };
        }
    } catch (error) {
        console.error('[authService] updateProfile network error:', error);
        return { ok: false, error: 'Không thể kết nối tới máy chủ.' };
    }
}
