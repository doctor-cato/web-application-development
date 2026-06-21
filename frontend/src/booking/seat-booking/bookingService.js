/**
 * bookingService.js — seat locking with BroadcastChannel API
 */

import { lsGet, lsSet, getBookings, saveBookings, KEYS } from '/shared/utils/storage.js';

const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const channel = new BroadcastChannel('seat_sync');

function makeBookingId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return 'bk_' + result;
}

function _getLocksMap() {
  return lsGet(KEYS.SEAT_LOCKS, {});
}

function _saveLocksMap(m) {
  lsSet(KEYS.SEAT_LOCKS, m);
}

export function subscribeSeatUpdates(callback) {
  channel.onmessage = (event) => {
    callback(event.data);
  };
}

export function getSeatMap(showtimeId) {
  const map = _getLocksMap();
  const result = (map[showtimeId] && { ...map[showtimeId] }) || {};
  
  // Lấy các ghế đã đặt từ bookings
  const bookings = getBookings();
  bookings.forEach(b => {
    if (b.showtimeId === showtimeId) {
      (b.seats || []).forEach(seatId => {
        result[seatId] = { seatId, status: 'booked', bookingId: b.id };
      });
    }
  });
  
  return result;
}

export function lockSeat(showtimeId, seatId, userId) {
  // Kiểm tra ghế đã được thanh toán chưa
  const bookings = getBookings();
  const isBooked = bookings.some(b => b.showtimeId === showtimeId && (b.seats || []).includes(seatId));
  if (isBooked) return false;

  const map = _getLocksMap();
  map[showtimeId] = map[showtimeId] || {};
  if (map[showtimeId][seatId]) return false; // already locked/booked

  const expiresAt = Date.now() + LOCK_DURATION_MS;
  map[showtimeId][seatId] = { seatId, userId, expiresAt };
  _saveLocksMap(map);

  try { channel.postMessage({ type: 'seat_locked', showtimeId, seatId, userId, expiresAt }); } catch (e) {}

  // schedule local cleanup (best-effort)
  setTimeout(() => {
    const m = _getLocksMap();
    if (m[showtimeId] && m[showtimeId][seatId] && m[showtimeId][seatId].expiresAt <= Date.now()) {
      delete m[showtimeId][seatId];
      _saveLocksMap(m);
      try { channel.postMessage({ type: 'seat_unlocked', showtimeId, seatId }); } catch (e) {}
    }
  }, LOCK_DURATION_MS + 1000);

  return true;
}

export function unlockSeat(showtimeId, seatId, userId) {
  const map = _getLocksMap();
  if (map[showtimeId] && map[showtimeId][seatId]) {
    delete map[showtimeId][seatId];
    _saveLocksMap(map);
    try { channel.postMessage({ type: 'seat_unlocked', showtimeId, seatId }); } catch (e) {}
    return true;
  }
  return false;
}

export function releaseExpiredLocks() {
  const map = _getLocksMap();
  const now = Date.now();
  let changed = false;
  Object.keys(map).forEach(showId => {
    Object.keys(map[showId]).forEach(seat => {
      if (map[showId][seat].expiresAt <= now) {
        delete map[showId][seat];
        try { channel.postMessage({ type: 'seat_unlocked', showtimeId: showId, seatId: seat }); } catch (e) {}
        changed = true;
      }
    });
    if (Object.keys(map[showId]).length === 0) delete map[showId];
  });
  if (changed) _saveLocksMap(map);
}

export function confirmBooking(checkoutData) {
  // create booking record
  const bookings = getBookings();
  const id = makeBookingId();
  const now = new Date();
  const finalId = checkoutData.id || id;
  const booking = {
    id: finalId,
    movieTitle: checkoutData.movieTitle || 'Unknown Movie',
    showtimeId: checkoutData.showtimeId || null,
    showtimeText: checkoutData.showtimeText || '',
    room: checkoutData.room || '',
    seats: checkoutData.seats || [],
    combo: checkoutData.combo || 'none',
    total: checkoutData.total || checkoutData.amount || 0,
    userId: checkoutData.userId || null,
    transactionId: checkoutData.transactionId || null,
    paymentMethod: checkoutData.paymentMethod || null,
    poster: checkoutData.poster || '',
    createdAt: now.toISOString()
  };

  bookings.push(booking);
  saveBookings(bookings);

  // remove locks for booked seats and notify
  const map = _getLocksMap();
  (booking.seats || []).forEach(s => {
    if (map[booking.showtimeId] && map[booking.showtimeId][s]) {
      delete map[booking.showtimeId][s];
    }
    try { channel.postMessage({ type: 'seat_booked', showtimeId: booking.showtimeId, seatId: s }); } catch (e) {}
  });
  _saveLocksMap(map);

  return booking;
}

export function getUserBookings(userId) {
  const bookings = getBookings();
  if (!userId) return bookings;
  return bookings.filter(b => b.userId === userId);
}

