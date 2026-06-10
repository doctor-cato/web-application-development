/**
 * pages/booking.js — Trang chọn ghế
 * ─────────────────────────────────────────────────────────────
 * URL params: booking.html?movieId=m_001&showtimeId=st_001
 *
 * Trách nhiệm:
 *   - Đọc movieId + showtimeId từ URLSearchParams
 *   - Render thông tin phim + suất chiếu đang chọn
 *   - Render seatGrid qua component/seatGrid.js
 *   - Xử lý chọn/bỏ chọn ghế → gọi bookingService.lockSeat()
 *   - Countdown 5 phút cho ghế đang lock
 *   - Nhận BroadcastChannel events để sync ghế real-time
 *   - Simulate ghế ngẫu nhiên bị lock (JS Timer)
 *   - Khi bấm "Tiếp tục" → lưu checkout vào SessionStorage
 *     → redirect sang checkout.html
 * ─────────────────────────────────────────────────────────────
 */

import { getMovieById, getShowtimeById } from '../../explore/home/movieService.js';
import { getSeatMap, lockSeat, unlockSeat, subscribeSeatUpdates } from './bookingService.js';
import { renderSeatGrid, updateSeat, getSelectedSeats } from '../../shared/components/seatGrid.js';
import { saveCheckout } from '../../shared/utils/storage.js';
import { getSession } from '../../auth/services/authService.js';
import { toast } from '../../shared/components/toast.js';

// TODO: let countdownTimer = null;
// TODO: let simulationTimer = null;
// TODO: let selectedSeats = [];

// TODO: function init() { ... }
// TODO: function renderMovieInfo(movie, showtime) { ... }
// TODO: function startCountdown(seconds) { ... }
// TODO: function simulateActivity() { ... }
// TODO: function handleSeatSelect(seatId) { ... }
// TODO: function handleContinue() { ... }

// document.addEventListener('DOMContentLoaded', init);
