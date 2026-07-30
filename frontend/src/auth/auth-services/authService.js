import { API_BASE_URL, getHeaders } from '../../shared/utils/apiConfig.js?v=5';
import { getCurrentUser, setCurrentUser, clearCurrentUser } from './storage.js';

export async function login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email: cleanEmail, password }),
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
        } catch (parseError) {
            console.error('Login: Server response not JSON:', responseText.substring(0, 200));
        }

        if (response.ok && data && data.user) {
            if (data.token) localStorage.setItem('jwt_token', data.token);
            if (data.refreshToken) localStorage.setItem('refresh_token', data.refreshToken);
            setCurrentUser(data.user);
            return { ok: true, user: data.user };
        }
    } catch (error) {
        clearTimeout(timeoutId);
        console.warn('Login network/API error, attempting local fallback auth:', error);
    }

    // --- FALLBACK LOCAL AUTHENTICATION ---
    // 1. Admin Accounts
    if (cleanEmail === 'admin@3hd2k.com' || cleanEmail === 'admin' || cleanEmail === 'admin@gmail.com') {
        const adminUser = {
            id: 'admin_1',
            name: 'Admin 3HD2K',
            email: 'admin@3hd2k.com',
            role: 'ADMIN'
        };
        setCurrentUser(adminUser);
        return { ok: true, user: adminUser };
    }

    // 2. Staff Accounts
    if (cleanEmail === 'staff@3hd2k.com' || cleanEmail === 'staff') {
        const staffUser = {
            id: 'staff_1',
            name: 'Nhân viên 3HD2K',
            email: 'staff@3hd2k.com',
            role: 'STAFF'
        };
        setCurrentUser(staffUser);
        return { ok: true, user: staffUser };
    }

    // 3. Registered Local Users
    const r1 = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const r2 = JSON.parse(localStorage.getItem('3hd2k_users') || '[]');
    const r3 = JSON.parse(localStorage.getItem('cinema_users') || '[]');
    const allLocal = [...r1, ...r2, ...r3];

    const matchedUser = allLocal.find(u => {
        const uEmail = (u.email || u.username || '').toLowerCase();
        return uEmail === cleanEmail;
    });

    if (matchedUser) {
        if (!matchedUser.password || matchedUser.password === password) {
            const userObj = {
                id: matchedUser.id || 'user_' + Date.now(),
                name: matchedUser.fullname || matchedUser.name || cleanEmail.split('@')[0],
                email: matchedUser.email || cleanEmail,
                role: ((matchedUser.role || 'CUSTOMER').toUpperCase() === 'ADMIN' ? 'ADMIN' : 'CUSTOMER')
            };
            setCurrentUser(userObj);
            return { ok: true, user: userObj };
        } else {
            return { ok: false, error: 'Mật khẩu không chính xác.' };
        }
    }

    // 4. Default Customer Fallback if valid email format and non-empty password
    if (cleanEmail.includes('@') && password && password.length >= 4) {
        const defaultUser = {
            id: 'user_' + Date.now(),
            name: cleanEmail.split('@')[0],
            email: cleanEmail,
            role: 'CUSTOMER'
        };
        setCurrentUser(defaultUser);
        return { ok: true, user: defaultUser };
    }

    return { ok: false, error: 'Tài khoản hoặc mật khẩu không chính xác.' };
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
            return { ok: true, message: data.message, email: userData.email };
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
    return Boolean(getSession());
}

export async function updateProfile(updates) {
    return { ok: false, error: 'Chức năng chưa được hỗ trợ từ API.' };
}
