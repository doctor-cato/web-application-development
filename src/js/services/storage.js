/**
 * storage.js
 * ─────────────────────────────────────────────────────────────
 * Lớp abstraction DUY NHẤT cho LocalStorage & SessionStorage.
 * Toàn bộ code trong project phải đọc/ghi qua module này.
 *
 * Keys:
 *   cinema_users          — Mảng tất cả tài khoản đã đăng ký
 *   cinema_current_user   — Object user đang đăng nhập (SessionStorage)
 *   cinema_movies         — Mảng dữ liệu phim + suất chiếu
 *   cinema_bookings       — Mảng lịch sử đặt vé
 *   cinema_seat_locks     — Map trạng thái ghế đang bị lock
 *   cinema_checkout       — Thông tin đặt vé đang trong luồng (SessionStorage)
 *   cinema_last_booking   — Vé vừa thanh toán xong (dùng cho invoice page)
 * ─────────────────────────────────────────────────────────────
 */

// TODO: export const KEYS = { ... }
// TODO: export function lsGet(key, defaultValue) { ... }
// TODO: export function lsSet(key, value) { ... }
// TODO: export function lsRemove(key) { ... }
// TODO: export function ssGet(key, defaultValue) { ... }
// TODO: export function ssSet(key, value) { ... }
// TODO: export function ssRemove(key) { ... }

// Domain helpers
// TODO: export function getUsers() / saveUsers(users)
// TODO: export function getCurrentUser() / setCurrentUser(user) / clearCurrentUser()
// TODO: export function getBookings() / saveBookings(bookings)
// TODO: export function getCheckout() / saveCheckout(data)
// TODO: export function getLastBooking() / saveLastBooking(booking)
