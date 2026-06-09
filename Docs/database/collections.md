# SQL Server Tables & Schemas

## Overview

3HD2Kcinema uses **Microsoft SQL Server** as its database. All application data is stored in relational tables under the `dbo` schema in the `3hd2kcinema_db` database. This document describes each table's purpose, columns, and example rows.

---

# dbo.Users

## Purpose
Stores registered customer accounts and admin profiles.

## Columns
| Column | Type | Constraints | Description |
|---|---|---|---|
| `UserId` | `NVARCHAR(50)` | PK | App-generated ID, e.g. `usr_1717891200` |
| `Name` | `NVARCHAR(100)` | NOT NULL | Display name |
| `Email` | `NVARCHAR(200)` | NOT NULL, UNIQUE | Login key |
| `Password` | `NVARCHAR(255)` | NOT NULL | bcrypt hash |
| `Role` | `NVARCHAR(20)` | DEFAULT `'user'` | `'user'` or `'admin'` |
| `CreatedAt` | `DATETIME2` | DEFAULT GETUTCDATE() | Registration timestamp |

## Example Row
```sql
INSERT INTO dbo.Users VALUES (
  'usr_1717891200', 'Nguyen Van A', 'a@example.com',
  '$2b$12$...bcrypt_hash...', 'user', '2026-06-09T15:21:00'
);
```

---

# dbo.Movies

## Purpose
Stores the cinema film catalog.

## Columns
| Column | Type | Description |
|---|---|---|
| `MovieId` | `NVARCHAR(50)` PK | e.g. `mov_001` |
| `Title` | `NVARCHAR(255)` | Film title |
| `Poster` | `NVARCHAR(500)` | Image URL or path |
| `Description` | `NVARCHAR(MAX)` | Synopsis |
| `Genres` | `NVARCHAR(255)` | Comma-separated, e.g. `Animation,Action` |
| `Duration` | `INT` | Runtime in minutes |
| `ReleaseDate` | `DATE` | |
| `Rating` | `DECIMAL(3,1)` | 0.0–10.0 |
| `TrailerUrl` | `NVARCHAR(500)` | YouTube embed URL |
| `IsActive` | `BIT` | `1` = visible in catalog |

## Example Row
```sql
INSERT INTO dbo.Movies VALUES (
  'mov_001', 'Spider-Man: Across the Spider-Verse',
  'images/posters/spiderman.jpg',
  'Miles Morales encounters a team of Spider-People...',
  'Animation,Action,Adventure', 140, '2023-06-02', 9.0,
  'https://www.youtube.com/embed/shW9i6k8Mc0', 1
);
```

---

# dbo.Showtimes

## Purpose
Defines scheduled screening sessions for each movie.

## Columns
| Column | Type | Description |
|---|---|---|
| `ShowtimeId` | `NVARCHAR(50)` PK | e.g. `st_200` |
| `MovieId` | `NVARCHAR(50)` FK → Movies | |
| `ShowDate` | `DATE` | Screening date |
| `ShowTime` | `TIME` | e.g. `19:30:00` |
| `Room` | `NVARCHAR(50)` | e.g. `Room 3` |
| `IsActive` | `BIT` | `1` = bookable |

## Example Row
```sql
INSERT INTO dbo.Showtimes VALUES (
  'st_200', 'mov_001', '2026-06-10', '19:30:00', 'Room 3', 1
);
```

---

# dbo.Seats

## Purpose
One row per seat per showtime. Status is updated atomically via SQL transactions to prevent double-booking.

## Columns
| Column | Type | Description |
|---|---|---|
| `SeatId` | `BIGINT IDENTITY` PK | Auto-increment surrogate key |
| `ShowtimeId` | `NVARCHAR(50)` FK → Showtimes | |
| `SeatLabel` | `NVARCHAR(10)` | e.g. `A3`, `B12` |
| `SeatType` | `NVARCHAR(20)` | `normal`, `vip`, or `double` |
| `Price` | `INT` | VND price for this seat |
| `Status` | `NVARCHAR(20)` | `available`, `locked`, or `booked` |
| `LockedBy` | `NVARCHAR(50)` FK → Users | NULL unless locked |
| `LockTime` | `DATETIME2` | NULL unless locked |

## Seat States
| Status | Meaning |
|---|---|
| `available` | Open for selection |
| `locked` | Temporarily held; released after 300 seconds if not confirmed |
| `booked` | Permanently reserved after successful payment |

## Example Row
```sql
-- Available seat
INSERT INTO dbo.Seats (ShowtimeId, SeatLabel, SeatType, Price, Status)
VALUES ('st_200', 'A3', 'normal', 80000, 'available');

-- Locked seat
UPDATE dbo.Seats
SET Status = 'locked', LockedBy = 'usr_1717891200', LockTime = GETUTCDATE()
WHERE ShowtimeId = 'st_200' AND SeatLabel = 'A3' AND Status = 'available';
```

---

# dbo.Bookings

## Purpose
Stores finalized booking records. A booking aggregates the seat selection, combo choice, and payment outcome.

## Columns
| Column | Type | Description |
|---|---|---|
| `BookingId` | `NVARCHAR(50)` PK | e.g. `bk_1781018950` |
| `UserId` | `NVARCHAR(50)` FK → Users | |
| `ShowtimeId` | `NVARCHAR(50)` FK → Showtimes | |
| `ComboType` | `NVARCHAR(20)` | `NONE`, `SINGLE`, or `DOUBLE` |
| `ComboPrice` | `INT` | VND |
| `SeatTotal` | `INT` | Sum of seat prices |
| `TotalPrice` | `INT` | `SeatTotal + ComboPrice` |
| `PaymentStatus` | `NVARCHAR(20)` | `pending`, `success`, `failed` |
| `BookingStatus` | `NVARCHAR(20)` | `pending`, `confirmed`, `cancelled` |
| `QrString` | `NVARCHAR(500)` | Full QR content for offline display |
| `TransactionId` | `NVARCHAR(50)` | Payment provider TX ID |
| `CreatedAt` | `DATETIME2` | |

## Example Row
```sql
INSERT INTO dbo.Bookings VALUES (
  'bk_1781018950', 'usr_1717891200', 'st_200',
  'DOUBLE', 95000, 160000, 255000,
  'success', 'confirmed',
  'TICKET_bk_1781018950_SEATS_A3_A4_COMBO_DOUBLE',
  'A3BX9KM2ZQ7T', '2026-06-09T15:25:00'
);
```

---

# dbo.BookingSeats

## Purpose
Junction table linking a booking to its individual seat rows. Allows one booking to reference multiple seats.

## Columns
| Column | Type | Description |
|---|---|---|
| `BookingId` | `NVARCHAR(50)` FK → Bookings | |
| `SeatId` | `BIGINT` FK → Seats | |

## Example
```sql
INSERT INTO dbo.BookingSeats VALUES ('bk_1781018950', 101);
INSERT INTO dbo.BookingSeats VALUES ('bk_1781018950', 102);
```

---

# dbo.Payments

## Purpose
Records billing transactions from MoMo or VNPAY. Each payment maps 1:1 to a booking.

## Columns
| Column | Type | Description |
|---|---|---|
| `PaymentId` | `NVARCHAR(50)` PK | e.g. `pay_1781018955` |
| `BookingId` | `NVARCHAR(50)` FK → Bookings | |
| `Provider` | `NVARCHAR(20)` | `MoMo` or `VNPAY` |
| `TransactionId` | `NVARCHAR(100)` | Provider-issued TX ID |
| `Amount` | `INT` | VND |
| `Status` | `NVARCHAR(20)` | `pending`, `success`, `failed` |
| `RawCallback` | `NVARCHAR(MAX)` | Raw JSON webhook payload from provider |
| `CreatedAt` | `DATETIME2` | |

## Example Row
```sql
INSERT INTO dbo.Payments VALUES (
  'pay_1781018955', 'bk_1781018950', 'MoMo',
  'A3BX9KM2ZQ7T', 255000, 'success',
  '{"resultCode":0,"message":"Successful"}',
  '2026-06-09T15:25:05'
);
```
