# Simulated Payment Service API

## Overview

The payment checkout process is simulated in the client using `js/services/paymentService.js`. It mocks integrations with payment providers (VNPAY and MoMo) by displaying mock transaction screens and resolving callback state transitions locally.

---

# Exported Functions

## createPaymentRequest(bookingId, provider, amount)

### Description
Registers a pending payment transaction record in `LocalStorage` (`3hd2k_payments`) and generates a redirect path to a mock checkout view.

### Parameters
* `bookingId` (string): The associated booking ID.
* `provider` (string): Either `"VNPAY"` or `"MoMo"`.
* `amount` (number): The payment total.

### Returns (Promise)
* Resolves with a redirect target path for the simulated payment screen:
  ```json
  {
    "success": true,
    "paymentUrl": "payment_simulation.html?bookingId=bk_1781018950&provider=MoMo&amount=95000"
  }
  ```

---

## verifyPaymentLocal(bookingId, simulatedStatus)

### Description
Simulates the webhook callback process. Updates booking records and changes seat status.

### Parameters
* `bookingId` (string): The target booking ID.
* `simulatedStatus` (string): Either `"success"` or `"failed"`.

### Returns (Promise)
* Resolves on successful confirmation:
  ```json
  {
    "success": true,
    "payment": {
      "id": "pay_1781018955",
      "bookingId": "bk_1781018950",
      "status": "success",
      "provider": "MoMo"
    }
  }
  ```
* Rejects on mock failure:
  ```json
  {
    "success": false,
    "message": "Payment simulation was marked as failed by user."
  }
  ```

---

# Payment Flow Simulation

1. The user selects seats and clicks "Tiến hành thanh toán".
2. The page calls `createPaymentRequest()`, which saves a pending payment record and redirects to `payment_simulation.html`.
3. `payment_simulation.html` displays a mock screen showing the booking details and payment instructions (with a simulated QR Code to scan).
4. The user clicks either a **"Simulate Success (Thanh toán thành công)"** or **"Simulate Failure (Thanh toán thất bại)"** button.
5. The script triggers `verifyPaymentLocal()`, updating `3hd2k_bookings` to `confirmed` or `cancelled`, and then redirects the user back to `profile.html` or a success invoice page.
