# Simulated Realtime Seat Locking

## Overview

Realtime seat locking prevents duplicate seat reservations by updating seat availability immediately. In this server-free application, seat synchronization is simulated across open browser tabs using the **BroadcastChannel API**, while concurrent user activity is simulated using background JavaScript loops.

---

# Synchronization Mechanism

Instead of Socket.io, the application coordinates states via:
* **`BroadcastChannel`**: Transmits messages instantly across tabs.
* **`LocalStorage`**: Serves as the central state store.
* **Page Lifecycle Events (`beforeunload`)**: Handles cleaning up locks when the booking tab is closed.

---

# Realtime Message Flows

## 1. Locking a Seat
When a user clicks an available seat:
1. The script writes a lock entry with a timestamp and the user's ID into the showtime object in `LocalStorage`.
2. Emits a `LOCK_SEAT` message to the BroadcastChannel:
   ```json
   {
     "type": "LOCK_SEAT",
     "showtimeId": "st_200",
     "seatNumber": "A5",
     "userId": "usr_123"
   }
   ```
3. Other tabs listen to the message and update their DOM to show seat `"A5"` as locked (amber color) and unclickable.

## 2. Unlocking a Seat
When a user deselects a seat or the selection expires:
1. The script removes the lock entry from the showtime object in `LocalStorage`.
2. Emits an `UNLOCK_SEAT` message to the BroadcastChannel:
   ```json
   {
     "type": "UNLOCK_SEAT",
     "showtimeId": "st_200",
     "seatNumber": "A5"
   }
   ```
3. Other tabs receive the message and re-enable seat `"A5"`.

## 3. Confirming a Booking
When checkout is finalized:
1. The seats are updated to `booked` status in `LocalStorage`.
2. Emits a `BOOK_SEAT` message:
   ```json
   {
     "type": "BOOK_SEAT",
     "showtimeId": "st_200",
     "seats": ["A5"]
   }
   ```
3. Other tabs mark those seats as permanently booked (solid red).

---

# Timeout System (Leases)

To prevent seats from being locked indefinitely if a user abandons the booking process:
* **Lease Duration**: 5 minutes.
* **Timer Trigger**: When a seat is selected, the page script starts a JS `setTimeout`.
* **Action**: If the timer expires before checkout, the script calls `unlockSeat()`, updating `LocalStorage` and broadcasting the `UNLOCK_SEAT` event to clear the seats for others.

---

# Clean Tab Close Handling

If the user closes their booking tab, lock cleanup is managed by a `beforeunload` event listener:

```javascript
window.addEventListener('beforeunload', () => {
  // Read selected seats for this session
  const mySelectedSeats = getMySelectedSeats();
  
  mySelectedSeats.forEach(seat => {
    // Release lock in LocalStorage
    bookingService.unlockSeatLocal(activeShowtime, seat);
    
    // Broadcast release
    seatChannel.postMessage({
      type: 'UNLOCK_SEAT',
      showtimeId: activeShowtime,
      seatNumber: seat
    });
  });
});
```

---

# Simulated Competitor Actions (Bots)

To show the interface reacting to "real-time" competition:
* When `booking.html` loads, a simulation bot loop starts.
* Every 20 seconds, the loop randomly locks 1 or 2 available seats, broadcasts the locks, and schedules a release timer for those seats.
* This visual feedback shows how the system disables seats dynamically, replicating real-time updates.
