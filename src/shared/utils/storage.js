/**
 * storage.js
 * Simple wrapper around localStorage & sessionStorage for the demo.
 */

export const KEYS = {
  USERS: 'cinema_users',
  CURRENT_USER: 'cinema_current_user',
  MOVIES: 'cinema_movies',
  BOOKINGS: 'cinema_bookings',
  SEAT_LOCKS: 'cinema_seat_locks',
  CHECKOUT: 'cinema_checkout',
  LAST_BOOKING: 'cinema_last_booking',
  PENDING_PAYMENTS: 'cinema_pending_payments',
  TRANSACTIONS: 'cinema_transactions'
};

// LocalStorage helpers
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

// SessionStorage helpers
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

// Domain helpers
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

// small user helpers (not used heavily here)
export function getUsers() { return lsGet(KEYS.USERS, []); }
export function saveUsers(users) { lsSet(KEYS.USERS, users); }

export function getCurrentUser() { return ssGet(KEYS.CURRENT_USER, null); }
export function setCurrentUser(user) { ssSet(KEYS.CURRENT_USER, user); }
export function clearCurrentUser() { ssRemove(KEYS.CURRENT_USER); }

export function getTransactions() { return lsGet(KEYS.TRANSACTIONS, []); }
export function saveTransactions(transactions) { lsSet(KEYS.TRANSACTIONS, transactions); }

/**
 * Thêm một giao dịch vào lịch sử.
 * @param {'booking'|'cancel'|'reschedule'} type
 * @param {Object} bookingInfo - booking object liên quan
 * @param {string} [details]
 */
export function addTransaction(type, bookingInfo, details = '') {
  const transactions = getTransactions();
  transactions.unshift({
    id: 'tx_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    type,
    bookingId: bookingInfo?.id || '',
    movieTitle: bookingInfo?.movieTitle || '',
    showtimeText: bookingInfo?.showtimeText || '',
    room: bookingInfo?.room || '',
    seats: bookingInfo?.seats || [],
    total: bookingInfo?.total || 0,
    details,
    createdAt: new Date().toISOString()
  });
  saveTransactions(transactions);
}
