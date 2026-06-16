/**
 * storage.js
 * ─────────────────────────────────────────────────────────────
 * Wrapper cho LocalStorage / SessionStorage.
 * Tập trung tất cả key names ở một chỗ để tránh typo.
 * ─────────────────────────────────────────────────────────────
 */

const KEYS = {
    USERS:         'registeredUsers',
    IS_LOGGED_IN:  'isLoggedIn',
    USER_NAME:     'userName',
    USER_EMAIL:    'userEmail',
    USER_AVATAR:   'userAvatar',
    AUTH_TOKEN:    'auth_token',
};

// ── Users list (LocalStorage — persistent) ─────────────────

export function getUsers() {
    try {
        const raw = localStorage.getItem(KEYS.USERS);
        const parsed = JSON.parse(raw || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function saveUsers(users) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

// ── Current session (LocalStorage — giữ qua reload) ────────

export function getCurrentUser() {
    try {
        const token = localStorage.getItem(KEYS.AUTH_TOKEN);
        if (!token) return null;
        const payload = JSON.parse(atob(token));
        if (payload.exp && Date.now() > payload.exp) {
            clearCurrentUser();
            return null;
        }
        return payload;
    } catch {
        return null;
    }
}

export function setCurrentUser(userPayload) {
    const token = btoa(JSON.stringify(userPayload));
    localStorage.setItem(KEYS.AUTH_TOKEN,    token);
    // Giữ các key legacy mà navbar.js đang đọc
    localStorage.setItem(KEYS.IS_LOGGED_IN,  'true');
    localStorage.setItem(KEYS.USER_NAME,     userPayload.name  || '');
    localStorage.setItem(KEYS.USER_EMAIL,    userPayload.email || '');
    localStorage.setItem(KEYS.USER_AVATAR,   userPayload.avatar || '');
}

export function clearCurrentUser() {
    localStorage.removeItem(KEYS.AUTH_TOKEN);
    localStorage.removeItem(KEYS.IS_LOGGED_IN);
    localStorage.removeItem(KEYS.USER_NAME);
    localStorage.removeItem(KEYS.USER_EMAIL);
    localStorage.removeItem(KEYS.USER_AVATAR);
}
