/**
 * bookingService.js — seat locking with BroadcastChannel API
 */

import { lsGet, lsSet, getBookings, saveBookings, addTransaction, KEYS } from '../../shared/utils/storage.js';

const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const channel = new BroadcastChannel('seat_sync');

function makeBookingId() {
  return 'bk_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6).toUpperCase();
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
  return (map[showtimeId] && { ...map[showtimeId] }) || {};
}

export function lockSeat(showtimeId, seatId, userId) {
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
  const booking = {
    id,
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
    createdAt: now.toISOString()
  };

  bookings.push(booking);
  saveBookings(bookings);
  addTransaction('booking', booking, 'Đặt vé thành công');

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
