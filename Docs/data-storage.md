# Data Storage Simulation

Since 3HD2Kcinema does not use an external database (SQL Server, MongoDB), all application state is preserved locally in the user's browser.

We use two mechanisms:
1. **`LocalStorage`**: Persistent data (Users, Movie Catalogs, Seat Statuses).
2. **`SessionStorage`**: Transient data (Current logged-in session, active shopping cart).

All data interactions are centralized in `js/services/storage.js` to ensure JSON integrity and schema consistency.

---

## LocalStorage Schema

The `LocalStorage` acts as our global database containing several "collections" (keys).

### 1. `users_db` (Array of Objects)
Stores registered accounts.
```json
[
  {
    "userId": "usr_1717891200",
    "name": "Nguyen Van A",
    "email": "a@example.com",
    "password": "hashed_password_simulation",
    "role": "user"
  }
]
```

### 2. `movies_db` (Array of Objects)
The catalog of available films.
```json
[
  {
    "movieId": "mov_001",
    "title": "Spider-Man: Across the Spider-Verse",
    "poster": "https://images...",
    "genres": ["Animation", "Action"],
    "duration": 140
  }
]
```

### 3. `showtimes_db` (Array of Objects)
Maps movie screenings to specific dates and times.
```json
[
  {
    "showtimeId": "st_200",
    "movieId": "mov_001",
    "date": "2026-06-10",
    "time": "19:30",
    "room": "Room 3"
  }
]
```

### 4. `seat_status_db` (Object Dictionary)
Tracks the real-time availability, locks, and bookings for seats per showtime.
```json
{
  "st_200": {
    "A1": { "status": "available" },
    "A2": { 
      "status": "locked", 
      "lockedBy": "usr_1717891200", 
      "lockExpiresAt": 1717891500 
    },
    "B4": { 
      "status": "booked", 
      "bookedBy": "usr_1717891200", 
      "bookingId": "bk_8829" 
    }
  }
}
```

---

## SessionStorage Schema

The `SessionStorage` acts as our active session environment. It clears when the tab/browser is fully closed.

### 1. `active_session`
Stores the JWT/Mock Token of the currently logged-in user.
```json
{
  "token": "mock_jwt_abc123",
  "userId": "usr_1717891200",
  "role": "user"
}
```

### 2. `pending_checkout`
Stores the active cart when navigating from the booking page to the checkout and payment pages.
```json
{
  "showtimeId": "st_200",
  "selectedSeats": ["A1", "A2"],
  "seatTotal": 160000,
  "combo": "DOUBLE",
  "comboTotal": 95000,
  "grandTotal": 255000,
  "expiresAt": 1717891500
}
```
