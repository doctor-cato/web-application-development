
const KEYS = {
    USERS:         'registeredUsers',
    IS_LOGGED_IN:  'isLoggedIn',
    USER_NAME:     'userName',
    USER_EMAIL:    'userEmail',
    USER_AVATAR:   'userAvatar',
    AUTH_TOKEN:    'auth_token',
};

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

export function getCurrentUser() {
    try {
        const token = localStorage.getItem(KEYS.AUTH_TOKEN);
        if (!token) return null;
        const payload = JSON.parse(decodeURIComponent(escape(atob(token))));
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
    const token = btoa(unescape(encodeURIComponent(JSON.stringify(userPayload))));
    localStorage.setItem(KEYS.AUTH_TOKEN,    token);

    localStorage.setItem(KEYS.IS_LOGGED_IN,  'true');
    localStorage.setItem(KEYS.USER_NAME,     userPayload.fullname || userPayload.fullName || userPayload.name  || '');
    localStorage.setItem(KEYS.USER_EMAIL,    userPayload.email || '');
    localStorage.setItem(KEYS.USER_AVATAR,   userPayload.avatar || '');

    const role = (userPayload.role || '').toLowerCase();
    if (role === 'vip') {
        localStorage.setItem('is_vip', 'true');
        localStorage.setItem('vip_plan', userPayload.vipPlan || userPayload.vip_plan || '');
    } else {
        localStorage.removeItem('is_vip');
        localStorage.removeItem('vip_plan');
    }
}

export function clearCurrentUser() {
    localStorage.removeItem(KEYS.AUTH_TOKEN);
    localStorage.removeItem(KEYS.IS_LOGGED_IN);
    localStorage.removeItem(KEYS.USER_NAME);
    localStorage.removeItem(KEYS.USER_EMAIL);
    localStorage.removeItem(KEYS.USER_AVATAR);

    localStorage.removeItem('userPhone');
    localStorage.removeItem('userDob');
    localStorage.removeItem('userGender');
    localStorage.removeItem('3hd2k_rewards');
    localStorage.removeItem('is_vip');
    localStorage.removeItem('vip_plan');
    localStorage.removeItem('avatar_border_class');
}
