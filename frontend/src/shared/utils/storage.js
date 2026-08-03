
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

// Safe UTF-8 Base64 Helpers replacing deprecated escape/unescape
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

export function getCurrentUser() {
  try {
    const token = localStorage.getItem(KEYS.AUTH_TOKEN);
    if (!token) return ssGet(KEYS.CURRENT_USER, null);
    const payload = JSON.parse(safeAtob(token));
    if (payload.exp && Date.now() > payload.exp) {
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
  const token = safeBtoa(JSON.stringify(userPayload));
  localStorage.setItem(KEYS.AUTH_TOKEN, token);
  localStorage.setItem(KEYS.IS_LOGGED_IN, 'true');
  localStorage.setItem(KEYS.USER_NAME, userPayload.fullname || userPayload.fullName || userPayload.name || '');
  localStorage.setItem(KEYS.USER_EMAIL, userPayload.email || '');
  localStorage.setItem(KEYS.USER_AVATAR, userPayload.avatar || '');

  const role = (userPayload.role || '').toUpperCase();
  const email = (userPayload.email || '').toLowerCase();
  const finalRole = (role === 'ADMIN' || email.includes('admin')) ? 'ADMIN' : ((role === 'STAFF' || email.includes('staff')) ? 'STAFF' : (role || 'CUSTOMER'));
  localStorage.setItem('user_role', finalRole);
  localStorage.setItem('role', finalRole);

  // ponytail: Admin automatically owns all frames and all VIP privileges without needing purchase. ceiling: client-side storage role check. upgrade path: RBAC claims from backend JWT.
  if (finalRole === 'ADMIN' || role === 'VIP' || email.includes('admin')) {
    localStorage.setItem('is_vip', 'true');
    localStorage.setItem('vip_plan', finalRole === 'ADMIN' || email.includes('admin') ? 'diamond' : (userPayload.vipPlan || userPayload.vip_plan || ''));
  } else {
    localStorage.removeItem('is_vip');
    localStorage.removeItem('vip_plan');
  }
  ssSet(KEYS.CURRENT_USER, userPayload);
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
