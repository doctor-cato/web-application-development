# Payment API

## Overview

The payment flow is handled by `/api/payments` endpoints. The backend integrates with **MoMo** and **VNPAY** sandbox gateways. Payment records are stored in `dbo.Payments` (SQL Server). On successful payment, the webhook handler atomically updates `dbo.Payments`, `dbo.Bookings`, and `dbo.Seats` in a single SQL transaction.

---

# POST /api/payments/create

### Description
Creates a `pending` payment record and returns the provider redirect URL. Called when the user clicks "Thanh toán ngay" on the checkout page.

### Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "bookingId": "bk_1781018950",
  "provider": "MoMo",
  "amount": 255000
}
```

### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "paymentId": "pay_1781018955",
    "paymentUrl": "https://test-payment.momo.vn/pay?partnerCode=...&orderId=pay_1781018955&..."
  }
}
```

### SQL Operation
```sql
INSERT INTO dbo.Payments (PaymentId, BookingId, Provider, TransactionId, Amount, Status)
VALUES (@paymentId, @bookingId, @provider, @transactionId, @amount, 'pending');
```

### Provider URL Generation
- **MoMo**: HMAC-SHA256 signed request to MoMo sandbox `https://test-payment.momo.vn/v2/gateway/api/create`.
- **VNPAY**: HMAC-SHA512 signed redirect to `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`.

---

# POST /api/payments/callback

### Description
Webhook endpoint called by MoMo or VNPAY after the user completes or cancels payment. Verifies the provider signature, then atomically updates all related records.

**This endpoint does NOT require JWT** — it is called directly by the payment provider server.

### Request Body (MoMo example)
```json
{
  "partnerCode": "MOMO",
  "orderId": "pay_1781018955",
  "requestId": "...",
  "amount": 255000,
  "resultCode": 0,
  "message": "Successful",
  "signature": "hmac_sha256_signature"
}
```

### Response — 200 OK (must always return 200 to provider)
```json
{ "success": true }
```

### Success Flow (resultCode == 0)
```sql
BEGIN TRANSACTION;

  UPDATE dbo.Payments
  SET    Status = 'success', RawCallback = @rawJson
  WHERE  PaymentId = @orderId;

  UPDATE dbo.Bookings
  SET    BookingStatus = 'confirmed', PaymentStatus = 'success',
         QrString = @qrString, TransactionId = @transactionId
  WHERE  BookingId = (SELECT BookingId FROM dbo.Payments WHERE PaymentId = @orderId);

  UPDATE dbo.Seats
  SET    Status = 'booked', LockedBy = NULL, LockTime = NULL
  WHERE  SeatId IN (
    SELECT bs.SeatId FROM dbo.BookingSeats bs
    JOIN dbo.Payments p ON bs.BookingId = p.BookingId
    WHERE p.PaymentId = @orderId
  );

COMMIT;
```

### Failure Flow (resultCode != 0)
```sql
BEGIN TRANSACTION;
  UPDATE dbo.Payments  SET Status = 'failed'    WHERE PaymentId = @orderId;
  UPDATE dbo.Bookings  SET BookingStatus = 'cancelled', PaymentStatus = 'failed'
    WHERE BookingId = (SELECT BookingId FROM dbo.Payments WHERE PaymentId = @orderId);
  UPDATE dbo.Seats
  SET Status = 'available', LockedBy = NULL, LockTime = NULL
  WHERE SeatId IN (SELECT SeatId FROM dbo.BookingSeats WHERE BookingId = ...);
COMMIT;
```

### SignalR Broadcast (on success)
```json
{ "type": "SeatBooked", "showtimeId": "st_200", "seatLabels": ["A3", "A4"] }
```

---

# GET /api/payments/{bookingId}

### Description
Returns the payment record associated with a booking. Used by the invoice page to display transaction details.

### Headers
```
Authorization: Bearer <access_token>
```

### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "paymentId": "pay_1781018955",
    "bookingId": "bk_1781018950",
    "provider": "MoMo",
    "transactionId": "A3BX9KM2ZQ7T",
    "amount": 255000,
    "status": "success",
    "createdAt": "2026-06-09T15:25:05Z"
  }
}
```

---

# Payment Flow Summary

```
1. User clicks "Thanh toán ngay"
   → Frontend: POST /api/payments/create
   → Backend: INSERT dbo.Payments (status: pending), return provider URL

2. Frontend redirects user to payment_simulation.html (dev) or provider URL (prod)

3. User completes payment on provider page

4. Provider server calls: POST /api/payments/callback
   → Backend: verify HMAC signature
   → SQL transaction: update Payments + Bookings + Seats atomically
   → SignalR broadcast to all clients

5. Frontend polls or receives SignalR event → redirects to booking_invoice.html
```

---

# Security Notes

- Webhook signatures verified with **HMAC-SHA256** (MoMo) or **HMAC-SHA512** (VNPAY) before any DB write.
- API keys and secret keys stored in `appsettings.json` / environment variables — never in source code.
- `POST /api/payments/callback` is IP-whitelisted to provider server IPs in production.
