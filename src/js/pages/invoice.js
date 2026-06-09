/**
 * pages/invoice.js — Trang vé điện tử
 * ─────────────────────────────────────────────────────────────
 * Trách nhiệm:
 *   - Đọc booking data từ localStorage (getLastBooking)
 *   - Render thông tin vé (phim, suất, ghế, combo, tổng tiền, mã GD)
 *   - Render QR code lên <canvas> bằng QRCode.js
 *     QR data = buildQrString(booking)
 *   - Fallback text nếu QRCode.js không load được
 *   - Lưu offline cache vào localStorage để dùng khi mất mạng
 *   - Nút "Tải ảnh QR" → canvas.toDataURL → link download PNG
 * ─────────────────────────────────────────────────────────────
 */

import { getLastBooking } from '../services/storage.js';
import { buildQrString } from '../services/paymentService.js';

// TODO: function init() { ... }
// TODO: function renderTicketInfo(booking) { ... }
// TODO: function renderQrCode(qrString) { ... }
// TODO: function renderQrFallback(qrString) { ... }
// TODO: export function downloadQR() { ... }  ← gọi từ onclick trong HTML

// document.addEventListener('DOMContentLoaded', init);
