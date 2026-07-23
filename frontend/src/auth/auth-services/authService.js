import { API_BASE_URL, getHeaders } from '../../shared/utils/apiConfig.js?v=5';
import { getCurrentUser, setCurrentUser, clearCurrentUser } from './storage.js';

export async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email, password })
        });
        
        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Login: Server trả về response không phải JSON:', responseText.substring(0, 200));
            return { ok: false, error: 'Máy chủ gặp lỗi xử lý. Vui lòng thử lại sau.' };
        }

        if (response.ok) {
            setCurrentUser(data.user);
            return { ok: true, user: data.user };
        } else {
            return { ok: false, error: data.message || 'Đăng nhập thất bại' };
        }
    } catch (error) {
        console.error('Login network error:', error);
        return { ok: false, error: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.' };
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
        
        // Đọc response body dưới dạng text trước, rồi thử parse JSON
        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            // Server trả về text thô (ví dụ stack trace) thay vì JSON
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
            return await login(userData.email, userData.password);
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
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: getHeaders()
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    clearCurrentUser();
    window.location.href = '/auth/user-login/login.html';
}

export function getSession() {
    return getCurrentUser();
}

export function isLoggedIn() {
    return Boolean(getSession());
}

export async function updateProfile(updates) {
    return { ok: false, error: 'Chức năng chưa được hỗ trợ từ API.' };
}
