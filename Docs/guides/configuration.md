# Configuration Guide

Since 3HD2Kcinema is a static web application running entirely in the browser, it does not use server-side environment variables or `.env` files. Instead, system parameters and simulation configs are defined in a centralized JavaScript configuration module.

---

# Configuration Module (`js/config.js`)

All application constants and pricing structures are managed in `js/config.js` (or inline inside service modules). These can be edited by developers to change the app's behavior:

| Parameter | Default Value | Description |
| :--- | :--- | :--- |
| **`LOCK_TIMEOUT_MS`** | `300000` (5 minutes) | Duration in milliseconds before a temporary seat lock is automatically released. |
| **`SIMULATION_INTERVAL_MS`** | `20000` (20 seconds) | Interval at which the background bot simulator attempts to lock new random seats. |
| **`MAX_SELECTED_SEATS`** | `6` | Maximum number of seats a single user can select for checkout. |
| **`PRICE_NORMAL`** | `80000` | Price in VND for a normal class seat. |
| **`PRICE_VIP`** | `100000` | Price in VND for a VIP class seat. |
| **`PRICE_DOUBLE`** | `150000` | Price in VND for a double sweetheart seat. |

---

# Initial Database Seeding Override

If you need to customize the default movies list or showtime slots loaded during the first application boot:
1. Locate the seeding JSON configurations inside `js/services/storage.js` (or `js/services/movieService.js`).
2. Add or edit movie profiles, poster links, and showtimes directly within the default mock arrays.
3. Reset your browser's local storage data using the browser developer console (`localStorage.clear(); location.reload();`) to see the updated seed data.
