/**
 * pages/payment.js — Trang giả lập cổng thanh toán
 * ─────────────────────────────────────────────────────────────
 * URL params: payment_simulation.html?provider=momo&txId=xxx
 *
 * Trách nhiệm:
 *   - Đọc provider + txId từ URLSearchParams
 *   - Áp theme class lên <body> (.momo-theme / .vnpay-theme)
 *   - Render thông tin giao dịch (số tiền, mã GD)
 *   - Countdown 300s — đổi màu warning khi < 60s
 *   - Nút "Thanh toán thành công" → gọi paymentService.confirmPayment()
 *     → redirect sang booking_invoice.html
 *   - Nút "Hủy giao dịch" → gọi paymentService.cancelPayment()
 *     → redirect về checkout.html
 *   - Nếu hết countdown → tự động hủy + redirect
 * ─────────────────────────────────────────────────────────────
 */

import { confirmPayment, cancelPayment } from '../services/paymentService.js';
import { toast } from '../components/toast.js';

// TODO: let countdownTimer = null;
// TODO: const PAYMENT_TIMEOUT = 300; // seconds

// TODO: function init() { ... }
// TODO: function applyProviderTheme(provider) { ... }
// TODO: function startCountdown(seconds) { ... }
// TODO: function handleSuccess() { ... }
// TODO: function handleCancel() { ... }

// document.addEventListener('DOMContentLoaded', init);
