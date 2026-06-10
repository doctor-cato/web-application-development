/**
 * pages/index.js — Trang chủ
 * ─────────────────────────────────────────────────────────────
 * Khởi tạo và điều khiển trang chủ index.html.
 *
 * Trách nhiệm:
 *   - Render hero banner (phim nổi bật)
 *   - Render lưới "Đang chiếu" từ movieService
 *   - Render lưới "Sắp chiếu"
 *   - Filter phim theo thể loại
 *   - Điều hướng sang booking.html?movieId=xxx khi bấm "Đặt vé"
 * ─────────────────────────────────────────────────────────────
 */

import { getNowShowing, getComingSoon, seedMovies } from './movieService.js';
import { createMovieCard, createComingSoonCard } from '../shared/components/movieCard.js';
import { renderNavbar } from '../shared/components/navbar.js';

// TODO: function init() { ... }
// TODO: function renderBanner(movie) { ... }
// TODO: function renderNowShowing() { ... }
// TODO: function renderComingSoon() { ... }
// TODO: function setupGenreFilter() { ... }

// document.addEventListener('DOMContentLoaded', init);
