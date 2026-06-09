# Booking Service API

## Overview

The booking process is managed by `js/services/bookingService.js`. It coordinates seat map states, temporary locks, and order confirmations.

---

# Exported Functions

## getShowtimeSeats(showtimeId)

### Description
Fetches the seat status configuration dictionary for a given showtime session.

### Parameters
* `showtimeId` (string): Showtime unique ID.

### Returns (Promise)
* Resolves with a dictionary mapping seat labels to states:
  ```json
  {
    "success": true,
    "seats": {
      "A1": { "status": "available" },
      "A2": { "status": "locked", "lockedBy": "usr_123", "lockTime": 1781018400000 },
      "A3": { "status": "booked" }
    }
  }
  ```

---

## lockSeat(showtimeId, seatNumber, userId)

### Description
Registers a temporary lock on a specific seat. Broadcasts a sync event to other tabs.

### Parameters
* `showtimeId` (string): Target showtime ID.
* `seatNumber` (string): Seat label (e.g. `"A2"`).
* `userId` (string): The active user's ID.

### Returns (Promise)
* Resolves on success: `{ "success": true }`
* Rejects on failure if the seat is already locked or booked:
  ```json
  {
    "success": false,
    "message": "Seat is already locked or booked."
  }
  ```

---

## unlockSeat(showtimeId, seatNumber)

### Description
Releases a temporary seat lock. Broadcasts a sync event.

### Parameters
* `showtimeId` (string): Target showtime ID.
* `seatNumber` (string): Seat label.

### Returns (Promise)
* Resolves on success: `{ "success": true }`

---

## createBooking(showtimeId, seats, totalAmount, userId)

### Description
Converts selected seat locks to a permanent booking state, records the transaction, and clears locks.

### Parameters
* `showtimeId` (string): Target showtime ID.
* `seats` (array of strings): Selected seats (e.g. `["A3"]`).
* `totalAmount` (number): Price calculation.
* `userId` (string): Active user ID.

### Returns (Promise)
* Resolves on successful purchase with a ticket record:
  ```json
  {
    "success": true,
    "booking": {
      "id": "bk_1781018950",
      "userId": "usr_123",
      "showtimeId": "st_200",
      "seats": ["A3"],
      "totalPrice": 95000,
      "bookingStatus": "confirmed",
      "qrCodeData": "TICKET_bk_1781018950",
      "createdAt": "2026-06-09T15:25:00Z"
    }
  }
  ```

---

## getMyBookings(userId)

### Description
Retrieves booking transaction history for a specific customer profile.

### Parameters
* `userId` (string): Active user ID.

### Returns (Promise)
* Resolves with an array of matching booking records: `[booking, booking, ...]`.

---

# Local Validation Checks

Before modifying records in `3hd2k_showtimes`, the booking service performs validation:
* **Availability check**: Ensures target seats are not already marked `"booked"`.
* **Lock ownership**: Ensures seat locks being released belong to the requesting user.
* **Timeout cleanup**: Auto-purges locks where `Date.now() - lockTime > 300000` (5 minutes).
