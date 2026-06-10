/**
 * authService.js
 * ─────────────────────────────────────────────────────────────
 * Quản lý xác thực người dùng.
 * LocalStorage đóng vai trò như "database" phía client.
 *
 * Trách nhiệm:
 *   register(data)       — Tạo tài khoản mới, tự đăng nhập sau đó
 *   login(email, pw)     — Xác thực + lưu session vào SessionStorage
 *   logout()             — Xóa session
 *   getSession()         — Trả về user hiện tại hoặc null
 *   isLoggedIn()         — Boolean
 *   updateProfile(data)  — Cập nhật thông tin tài khoản
 *
 * Lưu ý bảo mật: mật khẩu chỉ được encode Base64 (demo).
 * Production cần bcrypt phía backend.
 * ─────────────────────────────────────────────────────────────
 */

import { getUsers, saveUsers, getCurrentUser, setCurrentUser, clearCurrentUser } from './storage.js';

// TODO: function hashPassword(password) { ... }
// TODO: function verifyPassword(password, hash) { ... }
// TODO: export function register(data) { ... }
// TODO: export function login(email, password) { ... }
// TODO: export function logout() { ... }
// TODO: export function getSession() { ... }
// TODO: export function isLoggedIn() { ... }
// TODO: export function updateProfile(updates) { ... }
