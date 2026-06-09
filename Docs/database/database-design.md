# Database Design — SQL Server

## Overview

3HD2Kcinema uses **Microsoft SQL Server** as its primary data store. The schema is managed via **EF Core migrations** and follows a normalized relational model.

All tables use the `dbo` schema. Primary keys are either `BIGINT IDENTITY` (auto-increment) for surrogate keys, or application-generated string IDs (e.g., `bk_<timestamp>`) stored as `NVARCHAR(50)`.

---

# Database Architecture

```
SQL Server: 3hd2kcinema_db
│
├── dbo.Users
├── dbo.Movies
├── dbo.Showtimes
├── dbo.Seats           ← one row per seat per showtime
├── dbo.Bookings
├── dbo.BookingSeats    ← junction table: booking ↔ seats
└── dbo.Payments
```

---

# Tables

## dbo.Users

Stores registered customer and admin accounts.

```sql
CREATE TABLE dbo.Users (
    UserId      NVARCHAR(50)  NOT NULL PRIMARY KEY,   -- "usr_1717891200"
    Name        NVARCHAR(100) NOT NULL,
    Email       NVARCHAR(200) NOT NULL UNIQUE,
    Password    NVARCHAR(255) NOT NULL,               -- bcrypt hash
    Role        NVARCHAR(20)  NOT NULL DEFAULT 'user', -- 'user' | 'admin'
    CreatedAt   DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);
```

---

## dbo.Movies

Stores the cinema film catalog.

```sql
CREATE TABLE dbo.Movies (
    MovieId     NVARCHAR(50)  NOT NULL PRIMARY KEY,   -- "mov_001"
    Title       NVARCHAR(255) NOT NULL,
    Poster      NVARCHAR(500) NULL,
    Description NVARCHAR(MAX) NULL,
    Genres      NVARCHAR(255) NULL,                   -- comma-separated
    Duration    INT           NOT NULL,               -- minutes
    ReleaseDate DATE          NOT NULL,
    Rating      DECIMAL(3,1)  NULL,
    TrailerUrl  NVARCHAR(500) NULL,
    IsActive    BIT           NOT NULL DEFAULT 1
);
```

---

## dbo.Showtimes

Defines screening sessions for movies.

```sql
CREATE TABLE dbo.Showtimes (
    ShowtimeId  NVARCHAR(50)  NOT NULL PRIMARY KEY,   -- "st_200"
    MovieId     NVARCHAR(50)  NOT NULL REFERENCES dbo.Movies(MovieId),
    ShowDate    DATE          NOT NULL,
    ShowTime    TIME          NOT NULL,
    Room        NVARCHAR(50)  NOT NULL,
    IsActive    BIT           NOT NULL DEFAULT 1
);
```

---

## dbo.Seats

One row per seat per showtime. Status is managed atomically via SQL transactions.

```sql
CREATE TABLE dbo.Seats (
    SeatId      BIGINT        NOT NULL PRIMARY KEY IDENTITY,
    ShowtimeId  NVARCHAR(50)  NOT NULL REFERENCES dbo.Showtimes(ShowtimeId),
    SeatLabel   NVARCHAR(10)  NOT NULL,               -- "A3", "B12"
    SeatType    NVARCHAR(20)  NOT NULL DEFAULT 'normal', -- 'normal' | 'vip' | 'double'
    Price       INT           NOT NULL,               -- VND
    Status      NVARCHAR(20)  NOT NULL DEFAULT 'available', -- 'available' | 'locked' | 'booked'
    LockedBy    NVARCHAR(50)  NULL REFERENCES dbo.Users(UserId),
    LockTime    DATETIME2     NULL,

    CONSTRAINT UQ_Seats_Showtime_Label UNIQUE (ShowtimeId, SeatLabel)
);

-- Index for fast availability queries
CREATE INDEX IX_Seats_ShowtimeId_Status ON dbo.Seats (ShowtimeId, Status);
```

---

## dbo.Bookings

Stores confirmed (or cancelled) booking orders.

```sql
CREATE TABLE dbo.Bookings (
    BookingId     NVARCHAR(50)  NOT NULL PRIMARY KEY,  -- "bk_1781018950"
    UserId        NVARCHAR(50)  NOT NULL REFERENCES dbo.Users(UserId),
    ShowtimeId    NVARCHAR(50)  NOT NULL REFERENCES dbo.Showtimes(ShowtimeId),
    ComboType     NVARCHAR(20)  NOT NULL DEFAULT 'NONE', -- 'NONE' | 'SINGLE' | 'DOUBLE'
    ComboPrice    INT           NOT NULL DEFAULT 0,    -- VND
    SeatTotal     INT           NOT NULL,              -- VND
    TotalPrice    INT           NOT NULL,              -- SeatTotal + ComboPrice
    PaymentStatus NVARCHAR(20)  NOT NULL DEFAULT 'pending', -- 'pending' | 'success' | 'failed'
    BookingStatus NVARCHAR(20)  NOT NULL DEFAULT 'pending', -- 'pending' | 'confirmed' | 'cancelled'
    QrString      NVARCHAR(500) NULL,                  -- "TICKET_bk_..._SEATS_..._COMBO_..."
    TransactionId NVARCHAR(50)  NULL,
    CreatedAt     DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_Bookings_UserId ON dbo.Bookings (UserId);
```

---

## dbo.BookingSeats

Junction table linking a booking to its individual seats.

```sql
CREATE TABLE dbo.BookingSeats (
    BookingId  NVARCHAR(50) NOT NULL REFERENCES dbo.Bookings(BookingId),
    SeatId     BIGINT       NOT NULL REFERENCES dbo.Seats(SeatId),

    CONSTRAINT PK_BookingSeats PRIMARY KEY (BookingId, SeatId)
);
```

---

## dbo.Payments

Records billing transactions from MoMo / VNPAY.

```sql
CREATE TABLE dbo.Payments (
    PaymentId     NVARCHAR(50)  NOT NULL PRIMARY KEY,  -- "pay_1781018955"
    BookingId     NVARCHAR(50)  NOT NULL REFERENCES dbo.Bookings(BookingId),
    Provider      NVARCHAR(20)  NOT NULL,              -- 'MoMo' | 'VNPAY'
    TransactionId NVARCHAR(100) NOT NULL,              -- provider-issued TX ID
    Amount        INT           NOT NULL,              -- VND
    Status        NVARCHAR(20)  NOT NULL DEFAULT 'pending', -- 'pending' | 'success' | 'failed'
    RawCallback   NVARCHAR(MAX) NULL,                  -- raw JSON from provider webhook
    CreatedAt     DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);
```

---

# Indexing Strategy

| Table | Index | Reason |
|---|---|---|
| `dbo.Users` | `UNIQUE (Email)` | Fast login lookup + uniqueness enforcement |
| `dbo.Seats` | `IX_Seats_ShowtimeId_Status` | Seat map availability queries |
| `dbo.Bookings` | `IX_Bookings_UserId` | User booking history queries |
| `dbo.Showtimes` | `(MovieId, ShowDate)` | Showtime listing by movie + date |

---

# Security

- Passwords stored as **bcrypt hashes** (`NVARCHAR(255)`).
- Connection string stored in `appsettings.json` under `ConnectionStrings:DefaultConnection` — never committed to source control.
- All queries use **parameterized statements** (EF Core / Dapper) — no string concatenation.
- Sensitive columns (`Password`) are never returned in API responses.
