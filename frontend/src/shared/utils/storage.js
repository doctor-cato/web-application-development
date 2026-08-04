
export const KEYS = {
  USERS: 'cinema_users',
  CURRENT_USER: 'cinema_current_user',
  MOVIES: 'cinema_movies',
  BOOKINGS: 'cinema_bookings',
  SEAT_LOCKS: 'cinema_seat_locks',
  CHECKOUT: 'cinema_checkout',
  LAST_BOOKING: 'cinema_last_booking',
  PENDING_PAYMENTS: 'cinema_pending_payments',
  AUTH_TOKEN: 'auth_token',
  IS_LOGGED_IN: 'isLoggedIn',
  USER_NAME: 'userName',
  USER_EMAIL: 'userEmail',
  USER_AVATAR: 'userAvatar'
};


export function safeBtoa(str) {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1)));
  } catch (e) {
    return btoa(str);
  }
}

export function safeAtob(str) {
  try {
    return decodeURIComponent(atob(str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  } catch (e) {
    return atob(str);
  }
}

export function lsGet(key, defaultValue = null) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : defaultValue;
  } catch (e) {
    console.error('lsGet parse error', e);
    return defaultValue;
  }
}

export function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('lsSet error', e);
  }
}

export function lsRemove(key) {
  localStorage.removeItem(key);
}

export function ssGet(key, defaultValue = null) {
  try {
    const v = sessionStorage.getItem(key);
    return v ? JSON.parse(v) : defaultValue;
  } catch (e) {
    console.error('ssGet parse error', e);
    return defaultValue;
  }
}

export function ssSet(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('ssSet error', e);
  }
}

export function ssRemove(key) {
  sessionStorage.removeItem(key);
}

export function getBookings() {
  return lsGet(KEYS.BOOKINGS, []);
}

export function saveBookings(bookings) {
  lsSet(KEYS.BOOKINGS, bookings);
}

export function getCheckout() {
  return ssGet(KEYS.CHECKOUT, null);
}

export function saveCheckout(data) {
  ssSet(KEYS.CHECKOUT, data);
}

export function getLastBooking() {
  return lsGet(KEYS.LAST_BOOKING, null);
}

export function saveLastBooking(booking) {
  lsSet(KEYS.LAST_BOOKING, booking);
}

export function getPendingPayments() {
  return lsGet(KEYS.PENDING_PAYMENTS, {});
}

export function savePendingPayments(map) {
  lsSet(KEYS.PENDING_PAYMENTS, map);
}

export function getUsers() {
  return lsGet(KEYS.USERS, []);
}

export function saveUsers(users) {
  lsSet(KEYS.USERS, users);
}

export function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    if (token.includes('.')) {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const base64Url = parts[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) {
            base64 += '=';
        }
        const jsonPayload = safeAtob(base64);
        const parsed = JSON.parse(jsonPayload);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    }
    const decoded = safeAtob(token);
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed === 'object') {
      if (parsed.alg && !parsed.email && !parsed.fullname && !parsed.role && !parsed.name && !parsed['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']) {
        return null; // Reject corrupt old header-only tokens
      }
      return parsed;
    }
  } catch (e) {}
  return null;
}

export function getCurrentUser() {
  try {
    let payload = null;

    const authToken = localStorage.getItem(KEYS.AUTH_TOKEN);
    const jwtToken = localStorage.getItem('jwt_token');

    if (authToken) payload = parseJwtPayload(authToken);
    if ((!payload || !payload.email) && jwtToken) {
      const p = parseJwtPayload(jwtToken);
      if (p) payload = { ...p, ...payload };
    }

    if (!payload || !payload.email) {
      const ssUser = ssGet(KEYS.CURRENT_USER, null);
      if (ssUser && ssUser.email) payload = { ...payload, ...ssUser };
    }

    const isLoggedIn = localStorage.getItem(KEYS.IS_LOGGED_IN) === 'true' || Boolean(jwtToken || authToken);
    const storedEmail = localStorage.getItem(KEYS.USER_EMAIL);

    if ((!payload || !payload.email) && isLoggedIn && storedEmail) {
      payload = {
        email: storedEmail,
        fullname: localStorage.getItem(KEYS.USER_NAME) || storedEmail.split('@')[0],
        avatar: localStorage.getItem(KEYS.USER_AVATAR) || '',
        phone: localStorage.getItem('userPhone') || '',
        dob: localStorage.getItem('userDob') || '',
        gender: localStorage.getItem('userGender') || 'male',
        role: localStorage.getItem('user_role') || localStorage.getItem('role') || 'CUSTOMER'
      };
    }

    if (payload) {
      if (!payload.email && payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']) {
        payload.email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
      }
      if (!payload.fullname) {
        payload.fullname = payload.fullName || payload.name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || (payload.email ? payload.email.split('@')[0] : '');
      }
      if (!payload.role) {
        payload.role = payload.Role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || localStorage.getItem('user_role') || 'CUSTOMER';
      }
      
      // Strict corruption check
      if (!payload.email && !payload.fullname && !payload.role && !payload.name) {
        return null;
      }

      if (!payload.phone) payload.phone = localStorage.getItem('userPhone') || '';
      if (!payload.dob) payload.dob = payload.dateOfBirth || localStorage.getItem('userDob') || '';
      if (!payload.avatar) payload.avatar = localStorage.getItem('userAvatar') || '';
    }

    if (payload && payload.exp && Date.now() > payload.exp * 1000) {
      clearCurrentUser();
      return null;
    }
    return payload;
  } catch (e) {
    return ssGet(KEYS.CURRENT_USER, null);
  }
}

export function setCurrentUser(userPayload) {
  if (!userPayload) return;

  const existing = ssGet(KEYS.CURRENT_USER, {}) || {};
  const merged = { ...existing, ...userPayload };

  const token = safeBtoa(JSON.stringify(merged));
  localStorage.setItem(KEYS.AUTH_TOKEN, token);
  if (!localStorage.getItem('jwt_token')) {
    localStorage.setItem('jwt_token', token);
  }
  localStorage.setItem(KEYS.IS_LOGGED_IN, 'true');

  const name = merged.fullname || merged.fullName || merged.name || '';
  if (name) localStorage.setItem(KEYS.USER_NAME, name);

  const email = merged.email || '';
  if (email) localStorage.setItem(KEYS.USER_EMAIL, email);

  const avatar = merged.avatar || '';
  if (avatar) localStorage.setItem(KEYS.USER_AVATAR, avatar);

  const phone = merged.phone || merged.phoneNumber || '';
  if (phone) localStorage.setItem('userPhone', phone);

  const dob = merged.dob || merged.dateOfBirth || merged.date_of_birth || '';
  if (dob) localStorage.setItem('userDob', dob);

  const gender = merged.gender || '';
  if (gender) localStorage.setItem('userGender', gender);

  const role = (merged.role || '').toUpperCase();
  const lowerEmail = email.toLowerCase();
  const finalRole = (role === 'ADMIN' || lowerEmail.includes('admin')) ? 'ADMIN' : ((role === 'STAFF' || lowerEmail.includes('staff')) ? 'STAFF' : (role || 'CUSTOMER'));
  localStorage.setItem('user_role', finalRole);
  localStorage.setItem('role', finalRole);

  if (finalRole === 'ADMIN' || role === 'VIP' || lowerEmail.includes('admin')) {
    localStorage.setItem('is_vip', 'true');
    localStorage.setItem('vip_plan', finalRole === 'ADMIN' || lowerEmail.includes('admin') ? 'diamond' : (merged.vipPlan || merged.vip_plan || ''));
  } else {
    localStorage.removeItem('is_vip');
    localStorage.removeItem('vip_plan');
  }

  ssSet(KEYS.CURRENT_USER, merged);
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
  ssRemove(KEYS.CURRENT_USER);
}
