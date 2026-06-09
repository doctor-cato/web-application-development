# JS Services Reference (Mock API)

## Overview

Since 3HD2Kcinema operates entirely on the client, backend API interactions are replaced by JavaScript service modules located in the `js/services/` directory. These modules export asynchronous functions that return JavaScript `Promise` objects to simulate network delays.

---

# Services Map

The following service modules manage data operations and interface with `storage.js`:

| Service Module | Exported Function | Input Parameters | Return Value (Promise) |
| :--- | :--- | :--- | :--- |
| **`authService.js`** | `register(name, email, pwd)` | `name (str)`, `email (str)`, `pwd (str)` | `{ success: true, user }` |
| | `login(email, pwd)` | `email (str)`, `pwd (str)` | `{ success: true, user }` |
| | `getCurrentUser()` | None | `user (obj)` or `null` |
| | `logout()` | None | `{ success: true }` |
| **`movieService.js`** | `getMovies()` | None | `[movie, movie, ...]` |
| | `getMovieById(id)` | `id (str)` | `movie (obj)` or `undefined` |
| | `getShowtimes(movieId)`| `movieId (str)` | `[showtime, showtime, ...]` |
| **`bookingService.js`**| `getSeats(showtimeId)` | `showtimeId (str)` | `seats (obj)` |
| | `lockSeat(showtimeId, seat)`| `showtimeId (str)`, `seat (str)`| `{ success: true }` |
| | `unlockSeat(showtimeId, seat)`| `showtimeId (str)`, `seat (str)`| `{ success: true }` |
| | `confirmBooking(data)` | `bookingData (obj)` | `{ success: true, booking }` |
| | `getMyBookings(userId)` | `userId (str)` | `[booking, booking, ...]` |
| **`paymentService.js`**| `simulatePayment(amount)`| `amount (int)` | `{ success: true, txId }` |

---

# Response Standard Envelope

To match the structure of server API integrations, service methods resolve or reject with a standard envelope structure:

### Success Resolution
```json
{
  "success": true,
  "data": {
    "id": "st_200",
    "movieId": "mov_001",
    "seats": {}
  }
}
```

### Error Rejection
```json
{
  "success": false,
  "message": "The selected seat is already locked by another user."
}
```

---

# Simulated Network Latency

To simulate request roundtrips, methods are wrapped in `setTimeout`:
```javascript
return new Promise((resolve, reject) => {
  setTimeout(() => {
    // Service logic here...
    resolve({ success: true, data });
  }, 300); // 300ms simulated latency
});
```
This latency enables testing of UI loading indicators and spinners, matching a production fullstack application's visual behavior.
