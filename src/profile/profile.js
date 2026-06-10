/**
 * pages/profile.js — Trang hồ sơ người dùng
 * ─────────────────────────────────────────────────────────────
 * Trách nhiệm:
 *   - Guard: redirect về login.html nếu chưa đăng nhập
 *   - Render thông tin tài khoản (tên, email, phone, ngày sinh)
 *   - Xử lý đổi ảnh đại diện (FileReader → LocalStorage)
 *   - Render lịch sử đặt vé (từ bookingService.getUserBookings)
 *   - Nút "Xem vé" → redirect sang booking_invoice.html với booking đó
 *   - Nút "Đăng xuất" → authService.logout() → redirect về index.html
 *
 * Admin panel (nếu user.role === 'admin'):
 *   - Thống kê nhanh (số booking, doanh thu giả lập)
 *   - Danh sách booking gần đây
 * ─────────────────────────────────────────────────────────────
 */

import { getSession, logout, updateProfile } from '../auth/authService.js';
import { getUserBookings } from '../booking/bookingService.js';
import { renderNavbar } from '../shared/components/navbar.js';

// TODO: function init() { ... }
// TODO: function renderProfile(user) { ... }
// TODO: function renderBookingHistory(bookings) { ... }
// TODO: function handleAvatarChange(e) { ... }
// TODO: function handleLogout() { ... }
// TODO: function renderAdminPanel() { ... }  ← chỉ hiện khi role === 'admin'

// document.addEventListener('DOMContentLoaded', init);
