/**
 * authService.js
 * ─────────────────────────────────────────────────────────────
 * Quản lý xác thực người dùng.
 * LocalStorage đóng vai trò như "database" phía client.
 *
 * Trách nhiệm:
 *   register(data)       — Tạo tài khoản mới, tự đăng nhập sau đó
 *   login(email, pw)     — Xác thực + lưu session vào LocalStorage
 *   logout()             — Xóa session
 *   getSession()         — Trả về user hiện tại hoặc null
 *   isLoggedIn()         — Boolean
 *   updateProfile(data)  — Cập nhật thông tin tài khoản
 *
 * Lưu ý bảo mật: mật khẩu chỉ được encode Base64 (demo).
 * Production cần bcrypt phía backend.
 * ─────────────────────────────────────────────────────────────
 */

import { getUsers, saveUsers, getCurrentUser, setCurrentUser, clearCurrentUser } from './storage.js';

// ── Helpers ────────────────────────────────────────────────

function hashPassword(password) {
    return btoa(unescape(encodeURIComponent(password)));
}

function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

function buildPayload(user) {
    return {
        name:     user.fullname || user.name || 'Khách',
        email:    user.email,
        phone:    user.phone || '',
        dob:      user.dob || '',
        gender:   user.gender || 'male',
        avatar:   user.avatar,
        role:     user.role || 'user',
        vip_plan: user.vip_plan || '',
        exp:      Date.now() + 24 * 60 * 60 * 1000, // 24 giờ
    };
}

// ── Public API ─────────────────────────────────────────────

/**
 * Tạo tài khoản mới và tự động đăng nhập.
 * @param {{ fullname, email, password, dob, phone, avatar }} data
 * @returns {{ ok: boolean, error?: string }}
 */
export function register(data) {
    const users = getUsers();

    // Kiểm tra email đã tồn tại
    if (users.find(u => u.email === data.email)) {
        return { ok: false, error: 'Email này đã được đăng ký! Hãy đăng nhập.' };
    }

    const newUser = {
        fullname: data.fullname,
        email:    data.email,
        password: hashPassword(data.password),
        dob:      data.dob   || '',
        phone:    data.phone || '',
        avatar:   data.avatar || '/shared/images/avatar.jpg',
        role:     'user',
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(buildPayload(newUser));

    return { ok: true };
}

/**
 * Đăng nhập bằng email + mật khẩu.
 * @returns {{ ok: boolean, error?: string }}
 */
export function login(email, password) {
    const users = getUsers();
    const user  = users.find(u => u.email === email);

    if (!user) {
        return { ok: false, error: 'Sai email hoặc mật khẩu!' };
    }

    // Hỗ trợ cả plain-text password (data cũ) và hashed (data mới)
    const passwordMatch =
        verifyPassword(password, user.password) ||
        user.password === password; // legacy plain-text fallback

    if (!passwordMatch) {
        return { ok: false, error: 'Sai email hoặc mật khẩu!' };
    }

    // Nếu user cũ dùng plain-text → migrate sang hash
    if (user.password === password) {
        user.password = hashPassword(password);
        saveUsers(users);
    }

    setCurrentUser(buildPayload(user));

    // Khôi phục trạng thái VIP vào localStorage nếu user đã đăng ký VIP
    if (user.role === 'vip') {
        localStorage.setItem('is_vip', 'true');
        localStorage.setItem('vip_plan', user.vip_plan || '');
    } else {
        localStorage.removeItem('is_vip');
        localStorage.removeItem('vip_plan');
    }

    return { ok: true };
}

/**
 * Đăng xuất: xóa session, redirect về trang chủ.
 */
export function logout() {
    clearCurrentUser();
    window.location.href = '/explore/home-page/index.html';
}

/**
 * Trả về thông tin user đang đăng nhập, hoặc null.
 * @returns {object|null}
 */
export function getSession() {
    const session = getCurrentUser();
    if (session && (!session.name || session.name === 'Khách')) {
        const users = getUsers();
        const user = users.find(u => u.email === session.email);
        if (user) {
            session.name = user.fullname || user.name || 'Khách';
        }
    }
    return session;
}

/**
 * @returns {boolean}
 */
export function isLoggedIn() {
    return Boolean(getSession());
}

/**
 * Cập nhật thông tin tài khoản (không đổi mật khẩu).
 * @param {{ fullname?, phone?, dob?, avatar? }} updates
 * @returns {{ ok: boolean, error?: string }}
 */
export function updateProfile(updates) {
    const session = getSession();
    if (!session) return { ok: false, error: 'Chưa đăng nhập.' };

    const users = getUsers();
    const idx   = users.findIndex(u => u.email === session.email);
    if (idx === -1) return { ok: false, error: 'Không tìm thấy tài khoản.' };

    if (updates.fullname) users[idx].fullname = updates.fullname;
    if (updates.phone)    users[idx].phone    = updates.phone;
    if (updates.dob !== undefined)      users[idx].dob      = updates.dob;
    if (updates.gender)   users[idx].gender   = updates.gender;
    if (updates.avatar)   users[idx].avatar   = updates.avatar;

    saveUsers(users);
    setCurrentUser(buildPayload(users[idx]));

    return { ok: true };
}
