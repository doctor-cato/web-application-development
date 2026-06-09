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

## Backend & Database

* **ASP.NET Core Web API**: RESTful backend exposing `/api` endpoints.
* **Microsoft SQL Server**: Primary data store for all application data (users, movies, bookings, payments, seats).
* **Entity Framework Core / Dapper**: ORM and query layer for SQL Server access.
* **JWT (JSON Web Tokens)**: Stateless authentication — access token (15 min) + refresh token (7 days).

## State & Persistence

* **SQL Server `dbo.*` tables**: Single source of truth for all persistent data.
* **LocalStorage (browser)**: Offline cache for the QR ticket invoice page only — not a primary data store.
* **SessionStorage (browser)**: Temporary cart/checkout state during the booking flow.

## Synchronization

* **SignalR (WebSocket)**: Real-time seat lock/unlock/book events broadcast from `SeatHub` to all connected clients viewing the same showtime.
* **Background hosted service**: Runs every 60s to release expired seat locks (`DATEDIFF(SECOND, LockTime, GETUTCDATE()) > 300`).

## Deployment

* **Frontend**: Static files deployable to Vercel / Netlify / Azure Static Web Apps.
* **Backend**: ASP.NET Core app deployable to Azure App Service / IIS / Docker container.
* **Database**: SQL Server on Azure SQL Database or on-premise SQL Server instance.

---

# Main Features

## Catalog Browsing
* Dynamic homepage displaying cinema banners, filters, and categories.
* Movie description details, casting information, and showtime schedules.
* Data served from `GET /api/movies` and `GET /api/movies/{id}/showtimes`.

## Authentication
* User account registration and login via `POST /api/auth/register` and `POST /api/auth/login`.
* JWT-based session — access token stored in memory; refresh token in `HttpOnly` cookie.
* Protected checkout and profile screens require valid JWT.

## Seating Map & Real-time Locking
* Interactive seat selection matrix (Normal, VIP, Double).
* Seat state stored in `dbo.Seats` (SQL Server), fetched via `GET /api/showtimes/{id}/seats`.
* Lock/unlock via `POST /api/bookings/lock` with atomic SQL update (`WHERE Status = 'available'`).
* Real-time cross-client sync via **SignalR** — seat events pushed to all clients on the same showtime.
* Background service auto-releases locks expired > 300 seconds.

## Checkout & Payment
* Bắp nước / concessions up-selling on the checkout page.
* Payment initiated via `POST /api/payments/create` → MoMo / VNPAY redirect URL.
* Provider sends webhook to `POST /api/payments/callback` — backend verifies HMAC and confirms booking atomically.
* QR Code ticket generated client-side using `qrcode.js` from the `qrString` stored in `dbo.Bookings`.

## Administrative Dashboard
* Admin panel integrated in the Profile page for users with `role: "admin"`.
* Edit movie catalog and showtimes via admin API endpoints.
* View booking and payment records.

---

# Application Philosophy

The application code should remain:

* **modular**: distinct responsibilities for page scripts, API controllers, and SQL service layer.
* **clean & simple**: frontend calls REST API; backend handles all data logic.
* **readable**: clear HTTP contracts, parameterized SQL queries, and descriptive method names.

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
