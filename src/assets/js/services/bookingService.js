/**
 * bookingService.js — minimal booking record management for demo
 */

import { getBookings, saveBookings } from './storage.js';

function makeBookingId() {
  return 'bk_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6).toUpperCase();
}

export function confirmBooking(checkoutData) {
  // checkoutData expected to contain: movieTitle, showtimeId, showtimeText, room, seats (array), combo, total, userId, transactionId, paymentMethod
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
  return booking;
}

export function getUserBookings(userId) {
  const bookings = getBookings();
  if (!userId) return bookings;
  return bookings.filter(b => b.userId === userId);
}
