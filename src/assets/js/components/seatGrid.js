/**
 * seatGrid.js
 * ─────────────────────────────────────────────────────────────
 * Component tạo sơ đồ ghế tương tác cho trang booking.
 *
 * Cách dùng:
 *   import { renderSeatGrid, updateSeat } from '../components/seatGrid.js';
 *   renderSeatGrid(container, seatMap, { onSelect, onDeselect });
 *
 * Seat states:   available | locked | booked | selected
 * Seat types:    normal | vip | couple
 *
 * Trách nhiệm:
 *   renderSeatGrid(container, seatMap, callbacks) — Render toàn bộ lưới ghế
 *   updateSeat(seatId, newState)                  — Cập nhật 1 ghế (real-time)
 *   getSelectedSeats()                            — Trả về mảng ghế đang chọn
 *   clearSelection()                              — Bỏ chọn tất cả
 * ─────────────────────────────────────────────────────────────
 */

// TODO: export function renderSeatGrid(container, seatMap, callbacks) { ... }
// TODO: export function updateSeat(seatId, newState) { ... }
// TODO: export function getSelectedSeats() { ... }
// TODO: export function clearSelection() { ... }
// TODO: function _createSeatEl(seat) { ... }
// TODO: function _getLegend() { ... } — HTML chú thích màu ghế
