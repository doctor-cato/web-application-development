# Client-Side Checkout Flow

## Overview

The checkout system coordinates selected seats, optional concessions, price calculations, simulated payment processing, and final booking confirmation.

---

# Goals & Strategy

The checkout flow should:
* **Display Order Details**: Clearly list the chosen movie, showtime date/time, seat numbers, and selected combo packages.
* **Track Cart State**: Store pending order configurations in `SessionStorage` (`3hd2k_pending_booking`) during payment redirects.
* **Confirm Reservations**: Automatically transition seats from `locked` to `booked` upon mock payment validation.

---

# Checkout Workflow

```txt
User selects seats -> Clicks 'Tiến hành thanh toán'
       ↓
Page script writes order data to SessionStorage ('3hd2k_pending_booking')
       ↓
Navigates to checkout.html
       ↓
User selects concessions (Popcorn, Soda) -> Total price updates dynamically
       ↓
User selects payment method (MoMo or VNPAY) -> Clicks 'Thanh toán'
       ↓
Service generates mock URL -> Redirects to payment_simulation.html
       ↓
User clicks 'Thanh toán thành công' (Simulate Success)
       ↓
Redirect back to invoice page -> Reads SessionStorage -> Writes Booking to LocalStorage
```

---

# File Locations & Modules

* **`checkout.html`**: Giao diện hiển thị giỏ hàng, chọn bắp nước và phương thức thanh toán.
* **`js/pages/checkout.js`**: Đọc giỏ hàng từ SessionStorage, xử lý cộng trừ combo bắp nước, tính tổng tiền và xử lý click nút thanh toán.
* **`js/services/paymentService.js`**: Tạo link giả lập thanh toán.
* **`js/services/bookingService.js`**: Ghi nhận booking chính thức vào LocalStorage khi thanh toán thành công.

---

# Pricing Calculation Rules

All pricing calculations are managed by `js/pages/checkout.js` and verified by `bookingService.js` before finalized storage:
* **Seat Pricing**: Normal seat (80,000 VND), VIP seat (100,000 VND), Double seat (150,000 VND).
* **Concessions Pricing**: Single Combo (Popcorn + Drink - 65,000 VND), Double Combo (2 Drinks + Popcorn - 95,000 VND).
* **Total Calculation**: Sum of seats price plus concessions totals.

---

# Error Handling

* **Expired Lock during Checkout**: If the user takes longer than 5 minutes on the checkout screen, the seat lock expires in LocalStorage. If they click "Pay", the checkout system performs a final validation check. If another tab has claimed the seat, the transaction is rejected, redirecting the user back to the seating map with a warning.
* **Simulated Payment Cancellation**: If the user clicks "Hủy giao dịch" on the mock payment screen, they are redirected back to `checkout.html` with their selected seats and concessions intact in SessionStorage.
