# Application Features & Flows

This document details the core interactive features of the 3HD2Kcinema simulation.

---

## 1. Catalog Browsing (`index.html`)
- Displays dynamically loaded movies from `movieService.js`.
- Integrates genre filtering.
- Renders posters and showtimes.

## 2. Authentication (`login.html` & `register.html`)
- Validates user input cleanly.
- Simulates password hashing and token generation.
- Stores session in `SessionStorage`.
- The `navbar.js` component dynamically reacts to the `active_session`, replacing the "Login" button with a User Profile dropdown.

## 3. Real-Time Seat Locking (`booking.html`)
This is the most critical feature of the simulator. It mimics the concurrency issues of a high-traffic cinema booking platform.

### The Locking Mechanism:
- When a seat is clicked, it becomes **"Locked"**.
- A 5-minute lease timer starts. If the timer expires before checkout completes, the seat is forcefully unlocked.
- The `BroadcastChannel` sends the lock event to all other tabs, preventing double bookings.
- If the user closes the tab mid-booking, the `beforeunload` event handler clears the locks from `LocalStorage` and broadcasts an unlock event.

### Bot Simulation:
- To visually demonstrate the real-time UI, `booking.js` contains a mock bot loop (`setInterval`) that randomly locks and unlocks unselected seats every few seconds.

## 4. Checkout & Payment Simulation (`checkout.html` & `payment_simulation.html`)
- The checkout page reads the `pending_checkout` payload from `SessionStorage`.
- Users can up-sell via Concessions (Bắp Nước).
- Upon initiating payment, the user is redirected to a mock Payment Gateway screen (`payment_simulation.html`), replicating MoMo or VNPAY.
- Successful payment triggers an atomic update in `LocalStorage`: transitioning the seats from `"locked"` to `"booked"`, and saving the final order to the user's booking history.

## 5. QR Code Invoice (`booking_invoice.html`)
- Reads the confirmed booking details.
- Uses `qrcode.js` to render a scannable ticket QR code entirely on the client side based on a unique ticket hash string.
