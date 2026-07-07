/**
 * bookingService.js — seat locking with BroadcastChannel API
 */

import { lsGet, lsSet, getBookings, saveBookings, KEYS } from '../../shared/utils/storage.js';

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
    if (b.showtimeId === showtimeId && b.status !== 'Cancelled') {
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
  const isBooked = bookings.some(b => b.status !== 'Cancelled' && b.showtimeId === showtimeId && (b.seats || []).includes(seatId));
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

import { API_BASE_URL, getHeaders } from '../../shared/utils/apiConfig.js?v=4';

export async function confirmBooking(checkoutData) {
  try {
    const payload = {
        Email: checkoutData.userId || 'guest@example.com',
        ShowtimeId: checkoutData.showtimeId || 1, // fallback
        MovieId: checkoutData.movieId || 1,       // fallback
        Seats: (checkoutData.seats || []).join(','),
        TotalPrice: checkoutData.total || checkoutData.amount || 0,
        PaymentMethod: checkoutData.paymentMethod || 'Credit Card'
    };
    
    const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });
    
    if (response.ok) {
        const data = await response.json();
        const finalId = data.bookingId || checkoutData.id || makeBookingId();
        
        const booking = {
            id: finalId,
            movieTitle: checkoutData.movieTitle || 'Unknown Movie',
            showtimeId: checkoutData.showtimeId || null,
            showtimeText: checkoutData.showtimeText || '',
            room: checkoutData.room || '',
            seats: checkoutData.seats || [],
            combo: checkoutData.combo || 'none',
            total: payload.TotalPrice,
            userId: checkoutData.userId || null,
            transactionId: checkoutData.transactionId || null,
            paymentMethod: checkoutData.paymentMethod || null,
            poster: checkoutData.poster || '',
            createdAt: new Date().toISOString()
        };

        // remove locks for booked seats and notify
        const map = _getLocksMap();
        (booking.seats || []).forEach(s => {
          if (map[booking.showtimeId] && map[booking.showtimeId][s]) {
            delete map[booking.showtimeId][s];
          }
          try { channel.postMessage({ type: 'seat_booked', showtimeId: booking.showtimeId, seatId: s }); } catch (e) {}
        });
        _saveLocksMap(map);

        // Notify Staff about F&B App Order if there is food
        if (checkoutData.customFood && checkoutData.customFood.length > 0) {
            let appOrders = JSON.parse(localStorage.getItem("cinema_app_orders")) || [];
            let itemsText = checkoutData.customFood.map(item => `${item.qty}x ${item.name}`).join(", ");
            let userName = localStorage.getItem('userName') || 'Khách Vãng Lai';
            let userPhone = localStorage.getItem('userPhone') || 'N/A';
            
            appOrders.unshift({
                id: 'APP-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                customerName: userName,
                phone: userPhone,
                items: checkoutData.customFood.map(f => ({ prodId: f.id || 'f1', qty: f.qty })),
                itemsText: itemsText,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem("cinema_app_orders", JSON.stringify(appOrders));
        }

        return booking;
    } else {
        console.error('Booking failed at backend');
        return null;
    }
  } catch (error) {
    console.error('Error in confirmBooking:', error);
    return null;
  }
}

export async function getUserBookings(userId) {
  if (!userId) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.error(err);
  }
  return [];
}
