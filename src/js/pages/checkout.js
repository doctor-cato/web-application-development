/**
 * pages/checkout.js — Trang xác nhận + chọn combo
 * ─────────────────────────────────────────────────────────────
 * Trách nhiệm:
 *   - Đọc thông tin đặt vé từ SessionStorage (checkout data)
 *   - Render order summary (phim, suất chiếu, ghế, giá ghế)
 *   - Hiển thị countdown còn lại cho ghế đang lock
 *   - Xử lý chọn combo → cập nhật tổng tiền live
 *   - Xử lý chọn phương thức thanh toán (MoMo / VNPAY)
 *   - Khi bấm "Thanh toán" → gọi paymentService.createTransaction()
 *     → redirect sang payment_simulation.html?provider=momo&txId=xxx
 *   - Nếu hết countdown → redirect về booking.html
 * ─────────────────────────────────────────────────────────────
 */

import { getCheckout } from '../services/storage.js';
import { createTransaction } from '../services/paymentService.js';
import { formatPrice } from '../services/movieService.js';
import { toast } from '../components/toast.js';

// TODO: const COMBOS = { none: 0, single: 65000, double: 95000 }

// TODO: function init() { ... }
// TODO: function renderOrderSummary(checkout) { ... }
// TODO: function setupComboSelector() { ... }
// TODO: function setupPaymentMethod() { ... }
// TODO: function updateTotal() { ... }
// TODO: function startCountdown(remainingMs) { ... }
// TODO: function handlePayClick() { ... }

// document.addEventListener('DOMContentLoaded', init);
