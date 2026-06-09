# Seat Booking System

## Overview

The seat booking system is the interactive core of the 3HD2Kcinema interface. It enables users to browse a visual seat map, select vacant seats, view temporary lock statuses, and transition to checkout with automated real-time cross-tab synchronization.

---

# Design & UX Strategy

The booking UI should:
* **Feel Cinematic**: Render a clear theatre screen indicator and realistic seating grid.
* **Update Instantly**: Reflect lock and book state changes immediately on seat click events.
* **Prevent Overlaps**: Disable selection of seats currently locked or booked by other tabs/sessions.

---

# Seat States & Colors

* **Available**: Seat is empty and open for booking.
  - *Color*: Charcoal / Dark Gray border.
* **Selected**: Active seat clicked by the current user.
  - *Color*: Glowing Red backdrop.
* **Locked**: Seat temporarily reserved by another open tab/simulated user.
  - *Color*: Amber / Yellow border (unclickable).
* **Booked**: Seat permanently reserved by a past completed booking.
  - *Color*: Solid Red backdrop (unclickable).

---

# Seating Map Workflow

```txt
User enters booking.html?showtime=st_200
       ↓
Page script queries bookingService.js for seat map dictionary
       ↓
Renders CSS Grid of seats with specific states (Available, Booked, Locked)
       ↓
User clicks an Available seat -> State changes to Selected
       ↓
Call bookingService.lockSeat() -> Saves to LocalStorage & broadcasts event
       ↓
If checkout is not completed in 5 minutes -> Lock auto-expires -> Seat released
```

---

# UI Components & Structure

```txt
js/components/
├── seatGrid.js         # Renders the CSS Grid container and populates seat cells
└── bookingSummary.js   # Displays selected seat counts and calculates totals

js/pages/
└── booking.js          # Main page logic coordinating clicks, timers, and syncs
```

---

# Verification Rules

Before allowing selection of a seat, `booking.js` verifies:
1. **Collision Check**: Parses latest `LocalStorage` to verify the seat isn't currently marked `"booked"` or `"locked"` by another user ID.
2. **Login Enforcement**: Rejects selection actions and redirects to `login.html` if the current user session is empty.
3. **Selection Cap**: Limits single purchases to a maximum of 6 seats at one time to prevent reservation monopolization.
