/**
 * navbar.js
 * ─────────────────────────────────────────────────────────────
 * Render thanh điều hướng dựa trên trạng thái đăng nhập.
 *
 * Cách dùng:
 *   import { renderNavbar } from '../../shared/components/navbar.js';
 *   renderNavbar(document.getElementById('navbar'));
 *
 * Trách nhiệm:
 *   renderNavbar(container)  — Render HTML navbar vào container element
 *   _buildGuestNav()         — Nav khi chưa đăng nhập (Đăng nhập / Đăng ký)
 *   _buildUserNav(user)      — Nav khi đã đăng nhập (avatar, tên, Đăng xuất)
 * ─────────────────────────────────────────────────────────────
 */

import { getSession, logout } from '../../auth/services/authService.js';

// TODO: export function renderNavbar(container) { ... }
// TODO: function _buildGuestNav() { ... }
// TODO: function _buildUserNav(user) { ... }
