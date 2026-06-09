# Client-Side Service Architecture (Mock Backend)

## Overview

In this frontend-only application, the "backend" is simulated entirely on the client side using JavaScript services. These services act as the data controller and repository layers, providing the page scripts with API-like interfaces to interact with local data.

The service architecture focuses on:

* modular business logic
* data validation before storage
* simulation of API request-response delays (optional `Promise` wrapping)
* local persistence integrity

---

# Architecture Stack

## Core Technologies

* **ES6 Modules**: Separation of service domains (auth, movies, bookings).
* **LocalStorage Wrapper**: A unified interface (`storage.js`) to handle JSON parsing/stringifying and error catching.
* **JS Promises**: Used to simulate asynchronous network responses for auth, fetching, and booking confirmations.

---

# Mock Service Goals

The mock backend layer should:

* expose clean async functions (returning Promises) to mimic server latency
* enforce schema rules and data integrity when writing to browser storage
* isolate client-side data modifications to service modules
* be easily swappable with a real server API in the future

Avoid:

* page controllers writing directly to `localStorage`
* storing raw plain passwords (simulate local hashing if needed)
* race conditions in seat selections (prevented by atomic local writes and BroadcastChannel)

---

# Services Structure

```txt
js/services/
│
├── storage.js          # Core Storage Wrapper (get, set, initialize database)
├── authService.js      # Handles login, registration, and active session
├── movieService.js     # Manages movie catalog and showtimes
├── bookingService.js   # Controls seat statuses, locks, and checkout validation
└── paymentService.js   # Simulates VNPay/MoMo gateway callbacks
```

---

# File Responsibilities

## storage.js

Acts as the "Database Connection".
* Initializes default database entries (movies list, showtimes, seats structure) in `LocalStorage` on the first visit if empty.
* Provides safe `read` and `write` methods that parse and format JSON.

---

## authService.js

Simulates the backend Authentication Controller.
* **Register**: Inserts new user objects into the `3hd2k_users` LocalStorage array, validating email uniqueness.
* **Login**: Compares inputs against registered users. If matched, writes user details to `SessionStorage` under `3hd2k_current_user` to simulate a JWT session token.
* **Logout**: Clears session data.

---

## movieService.js

Simulates the Movie Catalog API.
* Provides lists of movies, showtimes, and details from the static dataset.
* Supports administrative queries (adding, updating, or deleting movie configurations in `LocalStorage`).

---

## bookingService.js

Simulates the Booking & Realtime Controller.
* **Seat Map**: Retrieves availability arrays for specific showtimes.
* **Seat Locking**: Marks seats as `locked` in LocalStorage, updating timestamps to enforce automatic 5-minute expirations.
* **Confirm Booking**: Moves seats from `locked` to `booked` and registers a booking record under `3hd2k_bookings`.

---

## paymentService.js

Simulates Payment Integrations.
* Accepts booking details, triggers a 2-second timeout to simulate external gateway processing, and returns a transaction verification code.

---

# Data Request-Response Simulation

To simulate network requests, services return JavaScript `Promise` objects resolving after a slight delay:

```javascript
export const login = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = storage.read('3hd2k_users') || [];
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        sessionStorage.setItem('3hd2k_current_user', JSON.stringify(user));
        resolve({ success: true, user });
      } else {
        reject({ success: false, message: 'Invalid credentials' });
      }
    }, 500); // 500ms mock latency
  });
};
```

---

# Security Simulation Rules

* **Validation**: Services must validate seat selections locally prior to confirming a booking. If a seat is marked as `booked` by another tab's sync process, the transaction fails.
* **Expirations**: JS timers automatically run cleanups to release expired seat locks, mimicking backend cron jobs.
