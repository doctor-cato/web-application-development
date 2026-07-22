# Changelog

All notable changes to this project will be documented in this file.

## [2.7.7] - 2026-07-22

### Added
- **Loyalty & VIP Multiplier System**: Implemented dynamic reward points calculation based on user's Loyalty Tier (Silver: 1.25x, Gold: 1.5x, VIP: 1.75x, Diamond: 2.0x) or VIP Plan (Silver: 1.2x, Gold: 1.5x, Platinum: 2.0x), picking the highest multiplier.
- **Ticket Cancellation Flow**: Added full cancellation and partial cancellation support in the user profile page, which dynamically releases booked seats, updates local storage, and pops a success toast notification.
- **Real Geolocation**: Integrated active browser geolocation on the Cinema Map to calculate distances to nearby theaters.
- **Storage Service (`storage.js`)**: Centralized local storage management for constants and safe parsing.
- **Authentication Service (`authService.js`)**: Core logic for authentication including register, login, session management (JWT mock), and logout.
- **Forgot Password Flow (`forgot-password`)**: Added UI and logic for password recovery.
- **Profile UI logic (`profile-ui.js`)**: Decoupled interactive UI logic (accordions, tabs, modals) for the user profile page.

### Changed
- **Navbar & Navigation**:
  - Implemented auto-closing for all dropdown menus (notifications, user menu) upon clicking outside.
  - Switched from raw `localStorage` reading to using `getSession` and `logout` from `authService`.
  - Fixed relative pathing bugs by enforcing root-relative paths (`/`).
- **User Profile Page**: Refactored cancel ticket modal layout, removed hardcoded mock data to avoid ghost ticket cancellations, and integrated functional mock tickets for testing.
- **Login Module (`login.js`, `login.html`)**: Refactored massive inline scripts into ES modules. Absolute pathing configured.
- **Register Module (`register.js`, `register.html`)**: Refactored inline scripts into ES modules, integrated with `authService`.
- **Profile Module (`profile.js`, `profile.html`)**: Abstracted 400+ lines of inline script into modular JS, securely fetching user profile data via `authService`.
- **Group Booking**: Updated waiting room CTA link to point to `wip.html` since the collaborative feature is still in progress.

### Fixed
- **Mobile Responsive Layouts**:
  - Home Page: Fixed hero section button spacing and layout overlap on small screens.
  - Booking Food: Added horizontal scroll behavior for category food tabs on mobile to prevent layout overflow.
  - Movie Details: Fixed dropdown z-index issues and mobile viewport layout overlaps.
  - Booking Success: Fixed font rendering, points display bugs, and duplicate QR code generation.
  - E-Ticket: Made the modal scrollable and fully responsive on mobile.
  - Cinema Map: Fixed zoom control overlays and layout alignment on small screens.

### Security
- **Mock Tokenization**: Plain-text passwords from legacy users are now safely hashed (Base64 for demo purposes) and migrated upon login. Session tokens are used instead of storing raw passwords in local storage.

### Removed
- **Redundant Files**: Removed the deprecated and monolithic `frontend/stitch_booking.html` file.
- **Temp Folders**: Removed `Project` and `So_sanh` template/prototype folders as they are no longer needed.
- **Tooling Scripts**: Removed all one-off Python and JS tooling scripts from the root and src directories to clean up the repository.
