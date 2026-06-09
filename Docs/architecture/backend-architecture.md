# Backend Architecture

## Overview

3HD2Kcinema uses a **client-server architecture**. The frontend (Vanilla HTML/CSS/JS) communicates with a RESTful backend API over HTTP. The backend persists all application data in a **Microsoft SQL Server** database.

The backend layer is responsible for:
- Business logic and data validation
- Authentication and session management (JWT)
- Seat lock coordination across concurrent users
- Payment gateway integration (MoMo / VNPAY)
- QR ticket generation and verification

---

# Architecture Stack

## Core Technologies

| Layer | Technology |
|---|---|
| **Database** | Microsoft SQL Server (2019+) |
| **ORM / Query Builder** | Entity Framework Core or Dapper (C# .NET) |
| **API Runtime** | ASP.NET Core Web API |
| **Auth** | JWT Bearer tokens |
| **Real-time** | SignalR (seat lock sync) |
| **Payment** | MoMo / VNPAY sandbox APIs |

---

# Services Structure

```txt
Backend (ASP.NET Core)
│
├── Controllers/
│   ├── AuthController.cs        # Login, register, token refresh
│   ├── MoviesController.cs      # Movie catalog and showtimes
│   ├── BookingsController.cs    # Seat map, lock, confirm booking
│   └── PaymentsController.cs    # Payment request, webhook callback
│
├── Services/
│   ├── AuthService.cs
│   ├── MovieService.cs
│   ├── BookingService.cs
│   └── PaymentService.cs
│
├── Models/                      # EF Core entity models mapping to SQL tables
│   ├── User.cs
│   ├── Movie.cs
│   ├── Showtime.cs
│   ├── Seat.cs
│   ├── Booking.cs
│   └── Payment.cs
│
├── Data/
│   └── AppDbContext.cs          # EF Core DbContext, SQL Server connection
│
└── Hubs/
    └── SeatHub.cs               # SignalR hub for real-time seat sync
```

---

# File Responsibilities

## AppDbContext.cs

Acts as the **database connection layer**.
- Configures the SQL Server connection string from `appsettings.json`.
- Defines `DbSet<T>` for each entity (Users, Movies, Showtimes, Seats, Bookings, Payments).
- Runs EF Core migrations to keep the schema in sync.

---

## AuthService.cs

Handles **authentication and session management**.
- **Register**: Inserts a new `User` row into `dbo.Users`, validating email uniqueness at the database level (`UNIQUE` constraint).
- **Login**: Queries `dbo.Users` by email, verifies the bcrypt-hashed password, and returns a signed JWT.
- **Token refresh**: Issues a new access token given a valid refresh token.

---

## MovieService.cs

Handles the **movie catalog and showtimes**.
- `GET /api/movies` — queries `dbo.Movies` for all active films.
- `GET /api/movies/{id}` — single movie lookup by primary key.
- `GET /api/movies/{id}/showtimes` — joins `dbo.Showtimes` filtered by `MovieId`.
- Admin operations: INSERT / UPDATE / DELETE on `dbo.Movies` and `dbo.Showtimes`.

---

## BookingService.cs

Handles **seat availability, locking, and booking confirmation**.
- **Get seats**: Queries `dbo.Seats` joined with `dbo.Showtimes` for a given `ShowtimeId`.
- **Lock seat**: `UPDATE dbo.Seats SET Status = 'locked', LockedBy = @userId, LockTime = GETUTCDATE() WHERE SeatId = @seatId AND Status = 'available'` — atomic via SQL transaction.
- **Unlock seat**: Resets locked seats back to `available`.
- **Confirm booking**: Wraps seat status update (`locked → booked`) and `INSERT INTO dbo.Bookings` in a single SQL transaction to prevent partial writes.
- **Expired lock cleanup**: A background job (Hangfire / hosted service) runs every minute to `UPDATE dbo.Seats SET Status = 'available' WHERE Status = 'locked' AND DATEDIFF(SECOND, LockTime, GETUTCDATE()) > 300`.

---

## PaymentService.cs

Handles **payment gateway integration**.
- **Create payment request**: Inserts a `pending` row into `dbo.Payments`, generates the MoMo / VNPAY redirect URL with an HMAC signature.
- **Webhook callback**: Verifies the provider signature, then runs a SQL transaction to update `dbo.Payments.Status` and `dbo.Bookings.BookingStatus` atomically.
- **Failure rollback**: On failed payment, releases seat locks and sets booking to `cancelled`.

---

# Real-time Seat Synchronization

Instead of `BroadcastChannel` (browser-only), the backend uses **SignalR** for cross-client seat sync:

```
Client A locks seat A3
  → POST /api/bookings/lock
  → BookingService updates dbo.Seats (SQL transaction)
  → SeatHub broadcasts { type: "SEAT_LOCKED", seatId: "A3", showtimeId: "st_200" }
  → All clients on the same showtime room receive the event and update their seat grid
```

---

# Security

- Passwords stored as **bcrypt** hashes — never plaintext.
- All write endpoints require a valid **JWT Bearer** token in the `Authorization` header.
- SQL injection prevented by **parameterized queries** (EF Core / Dapper).
- Payment webhook callbacks verified with **HMAC-SHA512** signatures from the provider.
- Sensitive config (connection strings, API keys) stored in `appsettings.json` / environment variables — never hardcoded.
