/**
 * pages/login.js — Trang đăng nhập
 * ─────────────────────────────────────────────────────────────
 * Trách nhiệm:
 *   - Validate form (email format, password min-length)
 *   - Gọi authService.login()
 *   - Redirect về trang trước đó hoặc index.html sau khi thành công
 *   - Hiển thị lỗi inline nếu sai thông tin
 *   - Nếu đã đăng nhập rồi → redirect ngay về index.html
 * ─────────────────────────────────────────────────────────────
 */

import { login, isLoggedIn } from '../services/authService.js';

// TODO: function init() { ... }
// TODO: function handleSubmit(e) { ... }
// TODO: function showError(field, message) { ... }
// TODO: function clearErrors() { ... }

// document.addEventListener('DOMContentLoaded', init);
