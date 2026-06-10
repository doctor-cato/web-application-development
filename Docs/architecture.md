# Frontend Architecture

## Overview

The application architecture is entirely **client-side** and relies on native browser APIs. It has been structured into a **Feature-Based (Modular)** pattern, simulating modern frameworks like Next.js or Angular, while staying strictly within Vanilla HTML/CSS/JS.

Even though it currently lacks a backend database, the architectural layers are designed so that connecting an ASP.NET Core API or Node.js server in the future will be seamless.

---

## 1. Feature-Based Architecture Diagram

```text
+-------------------------------------------------------------+
|                       USER INTERFACE                        |
|  (auth/*.html, home/*.html, booking/*.html, checkout/*.html)|
+------------------------------+------------------------------+
                               | DOM Events / Renders
+------------------------------v------------------------------+
|                    FEATURE CONTROLLERS                      |
|  (auth/*.js, booking/*.js, checkout/*.js, etc.)             |
+------------------------------+------------------------------+
                               | Function Calls
+------------------------------v------------------------------+
|                     FEATURE SERVICES                        |
|  (*Service.js inside feature folders)                       |
+------------------------------+------------------------------+
                               | Read / Write / Sync
+------------------------------v------------------------------+
|                      SHARED UTILITIES                       |
|   +-----------------------+     +-----------------------+   |
|   |  storage.js (DB Mock) |     | BroadcastChannel API  |   |
|   | (LocalStorage/Session)|     | (Real-time Syncing)   |   |
|   +-----------------------+     +-----------------------+   |
+-------------------------------------------------------------+
```

---

## 2. Directory Grouping by Feature

Instead of grouping files by their file type (all HTMLs together, all JS together), we group files by **Domain/Feature**.
This means `src/auth/` will contain `login.html`, `register.html`, as well as `login.js` and `authService.js`. 

* **Feature Controllers**: Handle DOM events, rendering, and layout logic. They must **never** interact with `LocalStorage` directly.
* **Feature Services**: The simulated backend API for that specific feature.
* **Shared Layer (`src/shared/`)**: Contains global components (like Navbars), global CSS, and core utilities (like `storage.js`).

---

## 3. Simulated Real-Time Synchronization

Without a WebSocket server, real-time synchronization is handled entirely in the browser using the **BroadcastChannel API**.

1. **Tab A (User 1)** clicks Seat A5. 
2. `booking.js` calls `bookingService.lockSeat()`.
3. The service writes the lock to `LocalStorage` and broadcasts an event: `{ type: 'LOCK_SEAT', seat: 'A5' }` on the `seat_sync` channel.
4. **Tab B (User 2)** listens on the `seat_sync` channel, receives the event, and dynamically updates its UI to mark Seat A5 as locked.
