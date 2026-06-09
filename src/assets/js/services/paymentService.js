/**
 * paymentService.js
 * ─────────────────────────────────────────────────────────────
 * Giả lập luồng thanh toán và tạo dữ liệu QR ticket.
 * Không gọi API ngân hàng thật — chỉ simulate client-side.
 *
 * Trách nhiệm:
 *   createTransaction(checkoutData)  — Tạo transactionId, lưu pending payment
 *   confirmPayment(transactionId)    — Đánh dấu thanh toán thành công
 *   cancelPayment(transactionId)     — Hủy giao dịch, release seat locks
 *   buildQrString(bookingData)       — Tạo chuỗi encode cho QR code
 *   getPaymentRedirectUrl(provider, amount, txId) — URL giả lập cổng TT
 *
 * QR String format:
 *   TICKET_{bookingId}_SEATS_{seatList}_SHOW_{showtimeId}_COMBO_{combo}
 * ─────────────────────────────────────────────────────────────
 */

import { lsGet, lsSet, saveLastBooking } from './storage.js';
import { confirmBooking } from './bookingService.js';

// TODO: export function createTransaction(checkoutData) { ... }
// TODO: export function confirmPayment(transactionId) { ... }
// TODO: export function cancelPayment(transactionId) { ... }
// TODO: export function buildQrString(bookingData) { ... }
// TODO: export function getPaymentRedirectUrl(provider, amount, txId) { ... }
// TODO: export function formatTransactionId() { ... } — generate unique ID
