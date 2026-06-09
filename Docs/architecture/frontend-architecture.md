# Frontend Architecture

## Overview

The frontend is built using vanilla HTML5, CSS3, and modern ES6+ JavaScript. It operates entirely client-side, using standard browser APIs for rendering, persistence, and cross-tab communication.

Frontend architecture focuses on:

* modular JavaScript (ES6 Modules)
* dynamic DOM manipulation
* responsive layout (CSS Grid & Flexbox)
* native CSS transitions and keyframe animations
* client-side state persistence (`LocalStorage` & `SessionStorage`)

---

# Frontend Stack

## Core Technologies

* **HTML5**: Structured markup, form validation, semantic elements.
* **CSS3**: Layout styling, CSS custom variables, keyframe animations, Tailwind CSS CDN (optional styling utility).
* **JavaScript (ES6+)**: Module imports, DOM event handling, async/await client-side flow.
* **Web APIs**: BroadcastChannel API (for multi-tab real-time sync), LocalStorage, SessionStorage.

---

# Frontend Goals

The frontend should:

* remain easy to run (just open in browser or run a static file server)
* feel immersive and cinematic with a polished dark theme
* support simulated real-time seats synchronization
* keep page-handling code separated into logical JS files
* maintain a clean separation between UI rendering and storage logic

Avoid:

* heavy frameworks or build runtimes (React, Vue, Vite dev servers, Next.js)
* client-server bundler requirements
* global state management libraries (Redux, MobX)
* excessive third-party dependencies

---

# Frontend Structure

The workspace is organized to keep markup, styles, and logic modular and clean:

```txt
3hd2kcinema/
│
├── css/
│   └── style.css        # Central styling sheet
│
├── js/
│   ├── components/      # DOM template components (Navbar, MovieCard, Seat)
│   ├── services/        # Storage management and simulation logic
│   ├── pages/           # Page-specific event handlers and initialization
│   └── main.js          # Global setup and initialization script
│
├── index.html           # Homepage
├── login.html           # Login page
├── register.html        # Register page
├── profile.html         # Profile / Simulated Admin page
└── booking.html         # Seat booking & showtime page
```

---

# Folder & File Responsibilities

## css/style.css

Contains global styles, utility classes, and layout variables (e.g., primary colors, glassmorphism designs, hover glow effects).

---

## js/components/

Reusable DOM-rendering helper modules. These files export functions that take data and return HTML strings or dynamic DOM elements.

Examples:
* `movieCard.js`: Generates markup for displaying movies in list views.
* `seatGrid.js`: Generates the interactive grid for showtime seating maps.
* `navbar.js`: Dynamically renders navigation buttons based on user session status.

---

## js/pages/

Modules loaded on specific HTML pages to initialize page state, register DOM event listeners (clicks, submits), and render content.

Examples:
* `index.js`: Loads catalog from movie service and renders the landing listings.
* `booking.js`: Handles interactive seat selections, locks, and updates seat statuses.
* `login.js`/`register.js`: Handles form validation and calls auth services.

---

## js/services/

Abstraction layer simulating backend APIs and database operations.

* `storage.js`: Wraps `LocalStorage` and `SessionStorage` reads/writes, ensuring data integrity.
* `authService.js`: Simulates registration, credential verification, and session state.
* `movieService.js`: Serves movie listings and showtime slots from JSON lists.
* `bookingService.js`: Simulates seats locking, transaction generation, and booking storage.

---

# Routing Architecture

Routing is handled natively by the browser via standard document redirects (page-to-page navigation):

* User moves from page to page using HTML link elements (`<a href="booking.html">`).
* Page-specific scripts parse URL search parameters (e.g., `booking.html?showtime=123`) using `URLSearchParams` to load the appropriate context dynamically on load.

---

# State Management

* **Page State**: Managed in memory via JavaScript objects/arrays in each page script.
* **Persistent State**: Stored in JSON strings in browser `LocalStorage` (registered users, saved bookings, movie/showtime catalogs).
* **Session State**: Stored in `SessionStorage` (currently logged-in user details, temp selections).

---

# UI Design Principles

## Theme
Modern cinematic dark interface with vibrant red accents and immersive glassmorphic cards.

## Key elements
- Dark backdrop color scheme (`#121414`).
- Prominent red accenting (`#e50914`).
- Dynamic hover scaling and subtle box-shadow glows.

---

# Animation Guidelines

Animations are created using native CSS keyframes and transitions for GPU acceleration and zero dependency overhead.

Preferred patterns:
* Transition hover classes: `transition: all 0.3s ease;`
* Fade-in keyframes for page transitions:
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

# Simulation of Realtime Synchronization

Realtime features are simulated entirely within client-side JavaScript:
* **Tab Synchronization**: Communication between multiple instances of the app is handled using `new BroadcastChannel('seat_sync')`, transmitting seat lock messages instantly across tabs.
* **Simulated Activity**: `setInterval` loops in `booking.js` toggle random seats to "locked" or "booked" states, simulating concurrent users.
