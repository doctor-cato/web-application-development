# Realtime Sync & Simulation Architecture

## Overview

Realtime synchronization is simulated on the client side using standard Web APIs. The system handles concurrent activities to demonstrate seat locking dynamics in a standalone web application environment.

The system uses:

* **BroadcastChannel API**: To synchronize seat selections, locks, and bookings instantly across different open tabs/windows.
* **JavaScript Web Timers (`setInterval` / `setTimeout`)**: To mock the activity of other users booking seats on the same showtime.
* **LocalStorage Updates**: To reflect seat state persistence locally.

---

# Realtime Stack

## Core Technology

* **HTML5 BroadcastChannel**: Native browser channel named `3hd2k_seat_channel` for low-latency, cross-tab events.
* **JavaScript Event Loops**: Web timers driving mock user actions and lock expirations.

---

# Main Realtime Features

## Seat Locking Simulation

When a user selects a seat:
* The seat is marked as `locked` in `LocalStorage` with a lease expiration timestamp (current time + 5 minutes).
* A `LOCK_SEAT` event is sent via `BroadcastChannel` to update other open tabs instantly.
* Other tabs disable selecting that seat.

---

## Simulated Concurrent Bookings

To mimic a busy cinema booking system:
* When the seat-selection page is loaded, a simulated bot manager (`js/services/bookingService.js`) initializes a timer.
* Every 15–30 seconds, the manager randomly selects 1–2 available seats and "locks" them on behalf of mock users (e.g., "User_Bot_4").
* These random locks are broadcasted across tabs and eventually get confirmed as "booked" or released, creating a dynamic, living interface.

---

## Lock Expiration

Seat locks expire automatically:
* The client records an expiration timestamp for each lock.
* If a checkout is not completed within 5 minutes, a `setTimeout` triggers, writing an `unlocked` state back to LocalStorage and broadcasting an `UNLOCK_SEAT` event.
* If the user closes their booking tab, the `beforeunload` window event fires, cleaning up their active locks and broadcasting the release.

---

# Realtime Sync Workflow

## Seat Lock Event Flow

```txt
User Clicks Seat (Tab A)
   ↓
Update local state and write lock to LocalStorage
   ↓
Broadcast 'LOCK_SEAT' event via BroadcastChannel
   ↓
Tab B receives event → Reads LocalStorage → Disables seat in UI
```

---

## Unlock / Release Event Flow

```txt
User Deselects Seat OR 5-min timer expires (Tab A)
   ↓
Remove lock from LocalStorage
   ↓
Broadcast 'UNLOCK_SEAT' event via BroadcastChannel
   ↓
Tab B receives event → Re-enables seat in UI
```

---

## Booking Confirmation Flow

```txt
Checkout Completed Success (Tab A)
   ↓
Update seats to 'booked' and write Booking Record in LocalStorage
   ↓
Broadcast 'BOOK_SEAT' event via BroadcastChannel
   ↓
Tab B receives event → Marks seat as permanently booked
```

---

# BroadcastChannel Messages

The channel `3hd2k_seat_channel` communicates using JSON payloads:

### LOCK_SEAT
```json
{
  "type": "LOCK_SEAT",
  "showtimeId": "st_001",
  "seatNumber": "A5",
  "userId": "user_123"
}
```

### UNLOCK_SEAT
```json
{
  "type": "UNLOCK_SEAT",
  "showtimeId": "st_001",
  "seatNumber": "A5"
}
```

### BOOK_SEAT
```json
{
  "type": "BOOK_SEAT",
  "showtimeId": "st_001",
  "seats": ["A5", "A6"]
}
```

---

# Performance & UI Redraws

To avoid screen flicker and maintain performance:
* The UI page handler (`js/pages/booking.js`) updates only the specific seat cells in the DOM when a `BroadcastChannel` message is received, rather than re-rendering the entire seating grid.
* The simulated activity runs on lightweight intervals that do not block the main browser thread.
