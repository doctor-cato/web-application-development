/**
 * movieService.js
 * ─────────────────────────────────────────────────────────────
 * Quản lý dữ liệu phim và suất chiếu.
 * Dữ liệu hardcode JSON tĩnh — giả lập GET /api/movies.
 * Trong kiến trúc đích thay bằng fetch('/api/movies').
 *
 * Trách nhiệm:
 *   seedMovies()            — Khởi tạo dữ liệu vào localStorage lần đầu
 *   getAllMovies()           — Lấy toàn bộ phim
 *   getNowShowing()         — Phim đang chiếu
 *   getComingSoon()         — Phim sắp chiếu
 *   getMovieById(id)        — Thông tin một phim
 *   getShowtimes(movieId)   — Danh sách suất chiếu
 *   getShowtimeById(id)     — Một suất chiếu cụ thể (kèm movie)
 *   formatPrice(amount)     — Format VND: "80.000 đ"
 * ─────────────────────────────────────────────────────────────
 */

import { lsGet, lsSet } from './storage.js';

// TODO: const SEED_MOVIES = [ ... ] — dữ liệu mẫu 4–5 phim + showtimes
// TODO: export function seedMovies() { ... }
// TODO: export function getAllMovies() { ... }
// TODO: export function getNowShowing() { ... }
// TODO: export function getComingSoon() { ... }
// TODO: export function getMovieById(id) { ... }
// TODO: export function getShowtimes(movieId) { ... }
// TODO: export function getShowtimeById(showtimeId) { ... }
// TODO: export function formatPrice(amount) { ... }
