# Project Overview

## Introduction

3HD2Kcinema is a modern client-side cinema booking web application focused on simulated realtime seat booking and immersive cinematic user experience.

The project is designed to:

* demonstrate modular vanilla web development (HTML, CSS, JS)
* showcase browser-native realtime synchronization (BroadcastChannel)
* remain server-free and simple to host
* follow scalable, organized client-side practices
* support AI-assisted development workflows

---

# Core Goals

## Main Priorities

1. Simulated realtime seat booking and synchronization across browser tabs
2. Clean modular JavaScript architecture without frameworks
3. Reusable UI components built with native DOM APIs
4. Dynamic, dark-themed cinematic UI
5. Local data persistence

---

# Tech Stack

## Frontend & Styling

* **HTML5**: Semantic document structuring.
* **Vanilla CSS3 / Tailwind CSS (via CDN)**: Layout, responsiveness, and dark styling theme.
* **Vanilla JavaScript (ES6+ Modules)**: Application logic, DOM manipulation.
* **QRCode.js**: Lightweight client-side library for QR Code ticket rendering.

## State & Persistence

* **LocalStorage**: Persists accounts, movie catalog metadata, and transaction history.
* **SessionStorage**: Handles current login sessions and temporary seat selections.

## Synchronization

* **BroadcastChannel API**: Broadcasts selections, locks, and bookings instantly between open tabs.
* **JavaScript Web Timers (`setInterval` / `setTimeout`)**: Simulates concurrent booking actions from virtual clients.

## Deployment

* **GitHub Pages / Vercel / Netlify**: Free static hosting directly connected to repository branches.

---

# Main Features

## Catalog Browsing
* Dynamic homepage displaying cinema banners, filters, and categories.
* Movie description details, casting information, and showtime schedules.

## Authentication (Local Auth)
* User account registration.
* User login matching credentials against LocalStorage.
* Protected checkout and profile screens based on SessionStorage session state.

## Seating Map & simulated Realtime Locking
* Interactive seat selection matrix (Normal, VIP, Double).
* Multi-tab seat sync using `BroadcastChannel`.
* Automated javascript timeout locks (auto-release after 5 minutes).
* Randomly simulated seat lock activity mimicking other users.

## Checkout & Simulated Payments
* Bắp nước / concessions up-selling.
* Mock checkouts showing transaction summaries.
* Simulated payment interfaces (mock MoMo/VNPAY payment success pages).
* Dynamic QR Code receipt ticket generation.

## Administrative Dashboard
* Admin dashboard mockup (integrated in Profile page if user role is `admin`).
* Edit catalog movies list, showtimes, and view simulated income logs.

---

# Application Philosophy

The application code should remain:

* **modular**: distinct responsibilities for page scripts, render components, and storage services.
* **clean & simple**: avoid complex dependencies or server-side runtimes.
* **readable**: clear DOM interactions and descriptive method structures.

Avoid:
* setting up Node express configs or MongoDB mongoose connections.
* raw `localStorage` writes dispersed outside the `storage.js` service layer.
* complex client-server synchronization code.

---

# Realtime System Importance

Since there is no central backend database to coordinate seat state, client-side coordination is key:
* Prevent selecting a seat that is locked or booked in another tab.
* Instantly clear seat selections if the user navigates away or closes the tab.
* Provide an engaging user simulation where seats randomly lock and unlock.

---

# Development Workflow

Recommended development order:

```txt
Setup Repository
       ↓
Base HTML Pages & CSS Styling
       ↓
Data Storage Wrapper (storage.js)
       ↓
Authentication (authService.js & login/register pages)
       ↓
Catalog Rendering (movieService.js & index page)
       ↓
Interactive Seating Grid (booking page)
       ↓
Cross-tab Seat Sync (BroadcastChannel)
       ↓
Background Booking Simulation (Web Timers)
       ↓
Checkout & QR Ticket Generation
       ↓
Static Host Deployment
```
