# LocalStorage JSON Collections

## Overview

In this static frontend architecture, the database is stored in the browser's `LocalStorage` as serialized JSON arrays. Each "collection" corresponds to a unique key prefix.

Main keys in LocalStorage:

* `3hd2k_users`: Array of user profiles.
* `3hd2k_movies`: Array of movie specifications.
* `3hd2k_showtimes`: Array of showtime slot configurations, including seat maps.
* `3hd2k_bookings`: Array of confirmed booking orders.
* `3hd2k_payments`: Array of transaction billing records.

Active session key in SessionStorage:
* `3hd2k_current_user`: Active login session object.

---

# Users Collection (`3hd2k_users`)

## Purpose
Stores registered customer accounts and profile data.

## JSON Schema Example
```json
{
  "id": "usr_1717891200",
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "password": "hashed_or_plain_string",
  "role": "user",
  "createdAt": "2026-06-09T15:21:00Z"
}
```

## Rules
* `email`: Must be verified for uniqueness against the array contents before adding a user during registration.
* `role`: Default value is `"user"`. Can be set to `"admin"` to access simulated administrative panels.

---

# Movies Collection (`3hd2k_movies`)

## Purpose
Stores details of movies available for viewing.

## JSON Schema Example
```json
{
  "id": "mov_001",
  "title": "Spider-Man: Across the Spider-Verse",
  "poster": "images/posters/spiderman.jpg",
  "description": "Miles Morales encounters a team of Spider-People charged with protecting the Multiverse.",
  "genres": ["Animation", "Action", "Adventure"],
  "duration": 140,
  "releaseDate": "2023-06-02",
  "rating": 9.0,
  "trailerUrl": "https://www.youtube.com/embed/shW9i6k8Mc0"
}
```

---

# Showtimes Collection (`3hd2k_showtimes`)

## Purpose
Defines show times for specific movies and keeps track of the seat map states.

## JSON Schema Example
```json
{
  "id": "st_200",
  "movieId": "mov_001",
  "date": "2026-06-10",
  "time": "19:30",
  "room": "Room 3",
  "seats": {
    "A1": { "status": "available" },
    "A2": { "status": "locked", "lockedBy": "usr_999", "lockTime": 1781018400000 },
    "A3": { "status": "booked" }
  }
}
```

## Seat States
* `available`: Available for selection.
* `locked`: Temporarily held by a user. Requires a `lockedBy` user ID and `lockTime` (unix milliseconds) to track expirations.
* `booked`: Confirmed sold seat.

---

# Bookings Collection (`3hd2k_bookings`)

## Purpose
Stores finalized booking transactions and references ticket receipts.

## JSON Schema Example
```json
{
  "id": "bk_1781018950",
  "userId": "usr_1717891200",
  "showtimeId": "st_200",
  "seats": ["A3"],
  "totalPrice": 95000,
  "paymentStatus": "success",
  "bookingStatus": "confirmed",
  "qrCodeData": "TICKET_bk_1781018950_SEAT_A3",
  "createdAt": "2026-06-09T15:25:00Z"
}
```

## Booking States
* `pending`: Selected but checkout in process.
* `confirmed`: Successfully paid and reserved.
* `cancelled`: Payment timed out or failed.

---

# Payments Collection (`3hd2k_payments`)

## Purpose
Records simulated billing data for accounting references.

## JSON Schema Example
```json
{
  "id": "pay_1781018955",
  "bookingId": "bk_1781018950",
  "provider": "MoMo",
  "transactionId": "MOMO_TX_83217983",
  "amount": 95000,
  "status": "success",
  "createdAt": "2026-06-09T15:25:05Z"
}
```
