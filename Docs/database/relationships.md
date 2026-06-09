# Database Relationships — SQL Server

## Overview

3HD2Kcinema uses a normalized relational schema in SQL Server. Relationships are enforced via **foreign key constraints** at the database level, and resolved in the application layer through EF Core navigation properties or Dapper JOINs.

---

# Entity Relationship Diagram

```
dbo.Users (UserId PK)
   │
   ├──► dbo.Seats (LockedBy FK)          -- user who currently holds a seat lock
   │
   └──► dbo.Bookings (UserId FK)
            │
            ├──► dbo.BookingSeats (BookingId FK) ──► dbo.Seats (SeatId FK)
            │
            └──► dbo.Payments (BookingId FK)

dbo.Movies (MovieId PK)
   │
   └──► dbo.Showtimes (MovieId FK)
            │
            └──► dbo.Seats (ShowtimeId FK)
            │
            └──► dbo.Bookings (ShowtimeId FK)
```

---

# Relationship Details

## User → Bookings (One-to-Many)

One user can have multiple bookings over time.

```sql
-- FK definition on dbo.Bookings
FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)

-- Query: get all bookings for a user
SELECT b.*, s.ShowDate, s.ShowTime, s.Room, m.Title
FROM dbo.Bookings b
JOIN dbo.Showtimes s ON b.ShowtimeId = s.ShowtimeId
JOIN dbo.Movies m    ON s.MovieId    = m.MovieId
WHERE b.UserId = @userId
ORDER BY b.CreatedAt DESC;
```

---

## Movie → Showtimes (One-to-Many)

One movie has multiple scheduled screening sessions.

```sql
-- FK definition on dbo.Showtimes
FOREIGN KEY (MovieId) REFERENCES dbo.Movies(MovieId)

-- Query: get all upcoming showtimes for a movie
SELECT * FROM dbo.Showtimes
WHERE MovieId = @movieId
  AND ShowDate >= CAST(GETUTCDATE() AS DATE)
  AND IsActive = 1
ORDER BY ShowDate, ShowTime;
```

---

## Showtime → Seats (One-to-Many)

Each showtime has its own set of seat rows. Seat status is tracked per showtime, so the same physical seat (e.g. "A3") can have different states across different showtimes.

```sql
-- FK definition on dbo.Seats
FOREIGN KEY (ShowtimeId) REFERENCES dbo.Showtimes(ShowtimeId)

-- Query: get full seat map for a showtime
SELECT SeatId, SeatLabel, SeatType, Price, Status
FROM dbo.Seats
WHERE ShowtimeId = @showtimeId
ORDER BY SeatLabel;
```

---

## Booking ↔ Seats (Many-to-Many via dbo.BookingSeats)

One booking can include multiple seats. Each seat can only belong to one confirmed booking.

```sql
-- FK definitions on dbo.BookingSeats
FOREIGN KEY (BookingId) REFERENCES dbo.Bookings(BookingId),
FOREIGN KEY (SeatId)    REFERENCES dbo.Seats(SeatId)

-- Query: get seat labels for a booking
SELECT s.SeatLabel, s.SeatType, s.Price
FROM dbo.BookingSeats bs
JOIN dbo.Seats s ON bs.SeatId = s.SeatId
WHERE bs.BookingId = @bookingId;
```

---

## Booking → Payment (One-to-One)

Each booking has at most one payment record. The payment record is created when the user initiates checkout and updated when the provider callback arrives.

```sql
-- FK definition on dbo.Payments
FOREIGN KEY (BookingId) REFERENCES dbo.Bookings(BookingId)

-- Query: get payment details for a booking
SELECT p.PaymentId, p.Provider, p.TransactionId, p.Amount, p.Status, p.CreatedAt
FROM dbo.Payments p
WHERE p.BookingId = @bookingId;
```

---

# Seat Locking — Atomic Update Pattern

To prevent race conditions (two users booking the same seat simultaneously), the seat lock uses an **atomic SQL UPDATE with a status guard**:

```sql
-- Lock a seat — only succeeds if still 'available'
UPDATE dbo.Seats
SET    Status   = 'locked',
       LockedBy = @userId,
       LockTime = GETUTCDATE()
WHERE  ShowtimeId = @showtimeId
  AND  SeatLabel  = @seatLabel
  AND  Status     = 'available';

-- Check rows affected: if 0, seat was already taken
```

Confirming a booking transitions seat status from `locked → booked` inside a SQL transaction:

```sql
BEGIN TRANSACTION;

  -- 1. Mark seats as booked
  UPDATE dbo.Seats
  SET    Status = 'booked', LockedBy = NULL, LockTime = NULL
  WHERE  SeatId IN (SELECT SeatId FROM dbo.BookingSeats WHERE BookingId = @bookingId);

  -- 2. Confirm the booking
  UPDATE dbo.Bookings
  SET    BookingStatus = 'confirmed', PaymentStatus = 'success',
         QrString = @qrString, TransactionId = @transactionId
  WHERE  BookingId = @bookingId;

  -- 3. Update payment record
  UPDATE dbo.Payments SET Status = 'success' WHERE BookingId = @bookingId;

COMMIT;
```

---

# Referential Integrity Rules

| Rule | Enforcement |
|---|---|
| Email uniqueness | `UNIQUE` constraint on `dbo.Users.Email` |
| Seat uniqueness per showtime | `UNIQUE (ShowtimeId, SeatLabel)` on `dbo.Seats` |
| No orphan payments | `FOREIGN KEY (BookingId)` on `dbo.Payments` |
| No orphan bookings | `FOREIGN KEY (UserId)` and `FOREIGN KEY (ShowtimeId)` on `dbo.Bookings` |
| Seat lock expiry | Background job: `UPDATE dbo.Seats SET Status = 'available' WHERE Status = 'locked' AND DATEDIFF(SECOND, LockTime, GETUTCDATE()) > 300` |
