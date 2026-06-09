/**
 * bookingService.js
 * ─────────────────────────────────────────────────────────────
 * Quản lý ghế, lock ghế và xác nhận đặt vé.
 * Dùng BroadcastChannel API để đồng bộ trạng thái ghế giữa các tab.
 *
 * Trách nhiệm:
 *   initSeats(showtimeId)           — Tạo sơ đồ ghế cho suất chiếu
 *   getSeatMap(showtimeId)          — Lấy trạng thái tất cả ghế
 *   lockSeat(showtimeId, seatId, userId)   — Khóa ghế 5 phút (300s)
 *   unlockSeat(showtimeId, seatId, userId) — Giải phóng ghế đang lock
 *   confirmBooking(checkoutData)    — Chuyển ghế locked → booked, tạo booking record
 *   getUserBookings(userId)         — Lịch sử đặt vé của user
 *   releaseExpiredLocks()           — Cleanup ghế hết hạn lock
 *
 * BroadcastChannel:
 *   Channel name: 'cinema_seat_sync'
 *   Message types: SEAT_LOCKED | SEAT_UNLOCKED | SEAT_BOOKED
 * ─────────────────────────────────────────────────────────────
 */

import { lsGet, lsSet, getBookings, saveBookings } from './storage.js';

// TODO: const LOCK_DURATION_MS = 5 * 60 * 1000; // 300s
// TODO: const channel = new BroadcastChannel('cinema_seat_sync');

// TODO: export function initSeats(showtimeId, layout) { ... }
// TODO: export function getSeatMap(showtimeId) { ... }
// TODO: export function lockSeat(showtimeId, seatId, userId) { ... }
// TODO: export function unlockSeat(showtimeId, seatId, userId) { ... }
// TODO: export function confirmBooking(checkoutData) { ... }
// TODO: export function getUserBookings(userId) { ... }
// TODO: export function releaseExpiredLocks() { ... }
// TODO: export function subscribeSeatUpdates(showtimeId, callback) { ... }
