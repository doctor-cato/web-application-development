# Project Overview

## Introduction

**3HD2Kcinema** is a modern, static, server-free client-side cinema booking web application. It focuses on simulating a real-time cinematic user experience entirely within the browser.

The project is designed to:
* Demonstrate modular vanilla web development using HTML, CSS, and JS without heavy frameworks (No React, Vue, or Angular).
* Showcase browser-native real-time synchronization using the **BroadcastChannel API**.
* Utilize browser local storage (`LocalStorage`, `SessionStorage`) for data persistence.
* Remain easy to run locally without installing any backend SDKs (Node, ASP.NET, SQL Server).

---

## Core Technologies

* **HTML5**: Structured markup.
* **CSS3 / Tailwind CSS**: Styled via native CSS classes and Tailwind via CDN.
* **JavaScript (ES6 Modules)**: Modular logic separated into components, services, and page controllers.
* **LocalStorage & SessionStorage**: Serves as the simulated "database".
* **BroadcastChannel API**: Syncs real-time events (like locking seats) across multiple tabs.

---

## How to Run the App

Because the app is purely static HTML/CSS/JS with ES6 Modules, you **must run it via a local static HTTP server** (due to browser CORS policies on `file://` imports).

### Quick Start (Python)
1. Open a terminal in the project root `3hd2kcinema/src`.
2. Run `python -m http.server 8000`.
3. Open your browser and navigate to `http://localhost:8000/index.html`.

### Quick Start (VSCode)
1. Open the project in VSCode.
2. Install the **Live Server** extension.
3. Right-click on `src/index.html` and select **"Open with Live Server"**.

---

## Directory Structure

```text
3hd2kcinema/
├── Docs/                    # Project documentation
├── src/                     # Source code directory
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript logic (components, pages, services)
│   ├── index.html           # Homepage
│   ├── login.html           # Login page
│   ├── register.html        # Registration
│   ├── booking.html         # Seat selection map
│   ├── checkout.html        # Checkout & combos
│   ├── payment_simulation.html # Payment gateway simulator
│   ├── booking_invoice.html # QR Code ticket invoice
│   └── profile.html         # User profile and history
```
