# Booking API

## Overview

The booking flow is managed by `/api/bookings` and `/api/showtimes` endpoints. Seat state is stored in `dbo.Seats` (SQL Server) and updated atomically via SQL transactions to prevent race conditions. Real-time seat events are broadcast to connected clients via **SignalR** (`SeatHub`).

---

# GET /api/showtimes/{showtimeId}/seats

### Description
Returns the current seat map for a showtime.

### Headers
```
Authorization: Bearer <access_token>
```

### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "showtimeId": "st_200",
    "seats": [
      { "seatId": 101, "seatLabel": "A1", "seatType": "normal", "price": 80000, "status": "available" },
      { "seatId": 102, "seatLabel": "A2", "seatType": "normal", "price": 80000, "status": "locked" },
      { "seatId": 103, "seatLabel": "A3", "seatType": "vip",    "price": 110000, "status": "booked" }
    ]
  }
}
```

### SQL Operation
```sql
SELECT SeatId, SeatLabel, SeatType, Price, Status
FROM dbo.Seats
WHERE ShowtimeId = @showtimeId
ORDER BY SeatLabel;
```

---

# POST /api/bookings/lock

### Description
Temporarily locks a seat for the authenticated user. Uses an atomic SQL update with a status guard to prevent double-locking.

### Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "showtimeId": "st_200",
  "seatLabel": "A3"
}
```

### Response — 200 OK
```json
{ "success": true }
```

### Response — 409 Conflict (seat taken)
```json
{
  "success": false,
  "message": "Seat A3 is already locked or booked."
}
```

### SQL Operation
```sql
UPDATE dbo.Seats
SET    Status = 'locked', LockedBy = @userId, LockTime = GETUTCDATE()
WHERE  ShowtimeId = @showtimeId
  AND  SeatLabel  = @seatLabel
  AND  Status     = 'available';
-- If @@ROWCOUNT = 0 → conflict response
```

### SignalR Broadcast
On success, `SeatHub` broadcasts to all clients in the showtime group:
```json
{ "type": "SeatLocked", "showtimeId": "st_200", "seatLabel": "A3", "lockedBy": "usr_123" }
```

---

# DELETE /api/bookings/lock

### Description
Releases a temporary seat lock held by the authenticated user.

### Request Body
```json
{
  "showtimeId": "st_200",
  "seatLabel": "A3"
}
```

### Response — 200 OK
```json
{ "success": true }
```

### SQL Operation
```sql
UPDATE dbo.Seats
SET    Status = 'available', LockedBy = NULL, LockTime = NULL
WHERE  ShowtimeId = @showtimeId
  AND  SeatLabel  = @seatLabel
  AND  LockedBy   = @userId;
```

---

# POST /api/bookings

### Description
Creates a booking and confirms seat reservations inside a single SQL transaction. Called after successful payment webhook.

### Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "showtimeId": "st_200",
  "seatLabels": ["A3", "A4"],
  "comboType": "DOUBLE",
  "paymentId": "pay_1781018955"
}
```

### Response — 201 Created
```json
{
  "success": true,
  "data": {
    "bookingId": "bk_1781018950",
    "userId": "usr_1717891200",
    "showtimeId": "st_200",
    "seats": ["A3", "A4"],
    "comboType": "DOUBLE",
    "totalPrice": 255000,
    "bookingStatus": "confirmed",
    "qrString": "TICKET_bk_1781018950_SEATS_A3_A4_COMBO_DOUBLE",
    "transactionId": "A3BX9KM2ZQ7T",
    "createdAt": "2026-06-09T15:25:00Z"
  }
}
```

### SQL Transaction
```sql
BEGIN TRANSACTION;
  INSERT INTO dbo.Bookings (...) VALUES (...);
  INSERT INTO dbo.BookingSeats (BookingId, SeatId) VALUES (...), (...);
  UPDATE dbo.Seats SET Status = 'booked', LockedBy = NULL, LockTime = NULL
  WHERE ShowtimeId = @showtimeId AND SeatLabel IN ('A3', 'A4');
COMMIT;
```

---

# GET /api/bookings/{id}

### Description
Returns full details of a single booking, including seat list and payment info.

### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "bookingId": "bk_1781018950",
    "movieTitle": "Spider-Man: Across the Spider-Verse",
    "showtime": "2026-06-10 19:30",
    "room": "Room 3",
    "seats": ["A3", "A4"],
    "comboType": "DOUBLE",
    "totalPrice": 255000,
    "bookingStatus": "confirmed",
    "qrString": "TICKET_bk_1781018950_SEATS_A3_A4_COMBO_DOUBLE",
    "transactionId": "A3BX9KM2ZQ7T",
    "createdAt": "2026-06-09T15:25:00Z"
  }
}
```

---

# GET /api/bookings/my

### Description
Returns all bookings for the authenticated user, ordered by most recent.

### Response — 200 OK
```json
{
  "success": true,
  "data": [ { ...booking }, { ...booking } ]
}
```

---

# Seat Lock Expiry (Background Job)

A hosted background service runs every 60 seconds to release expired locks:

```sql
UPDATE dbo.Seats
SET    Status = 'available', LockedBy = NULL, LockTime = NULL
WHERE  Status = 'locked'
  AND  DATEDIFF(SECOND, LockTime, GETUTCDATE()) > 300;
```

Released seats are broadcast via SignalR: `{ type: "SeatUnlocked", ... }`.
