# Simulated Payment System

## Overview

The payment system in 3HD2Kcinema is simulated entirely on the client side. It models the checkout redirect flow and validates transactional states locally using `SessionStorage` and `LocalStorage`.

---

# Goals & Strategy

The simulated payment system should:
* **Mimic Checkout Transitions**: Simulate redirects to payment provider screens (VNPAY and MoMo mock sandboxes).
* **Handle Transaction Records**: Write simulated payment receipts to the `3hd2k_payments` LocalStorage database.
* **Validate States Safely**: Ensure that bookings are only confirmed in LocalStorage if a simulated success transaction is executed.

---

# Supported Mock Providers

* **Simulated VNPAY**: Displays a mock banking verification viewport with a simulated login.
* **Simulated MoMo**: Displays a mockup of a mobile e-wallet interface complete with a static QR Code scanner simulation.

---

# Payment Flow Simulation

```txt
Checkout Page (concessions & seat selections confirmed)
       ↓
Click 'Thanh toán' -> Calls paymentService.createPaymentRequest()
       ↓
Writes pending transaction details into '3hd2k_payments'
       ↓
Redirects browser to payment_simulation.html?bookingId=bk_123
       ↓
User triggers 'Simulate Success' or 'Simulate Cancel' button
       ↓
Browser redirects to booking_invoice.html -> Updates local storage -> Syncs seats
```

---

# Data Schemas & Persistence

A payment record is stored in `3hd2k_payments` as a JSON block:
* `id`: Unique string prefix (e.g. `"pay_1781018955"`).
* `bookingId`: The ID of the matching booking entry.
* `provider`: `"VNPAY"` or `"MoMo"`.
* `transactionId`: Generated mock code string.
* `amount`: Numeric price matching booking totalPrice.
* `status`: `"pending"`, `"success"`, or `"failed"`.

---

# Error & Timeout Management

* **Manual Abort**: If the user clicks "Hủy giao dịch" on the simulated portal, the transaction status is marked as `"failed"` and they return to `checkout.html`.
* **Lock Expirations**: If the 5-minute seat lock timer expires while the user is on the payment screen, the seat locks are released in the background in LocalStorage. If the user then completes the payment, the verification step detects the expired lock. It rejects the finalization, marks the payment as `"failed"`, and notifies the user to re-select seats.
