# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Storage Service (`storage.js`)**: Centralized local storage management for constants and safe parsing.
- **Authentication Service (`authService.js`)**: Core logic for authentication including register, login, session management (JWT mock), and logout.
- **Forgot Password Flow (`forgot-password`)**: Added UI and logic for password recovery.
- **Profile UI logic (`profile-ui.js`)**: Decoupled interactive UI logic (accordions, tabs, modals) for the user profile page.

### Changed
- **Login Module (`login.js`, `login.html`)**: Refactored massive inline scripts into ES modules. Absolute pathing configured.
- **Register Module (`register.js`, `register.html`)**: Refactored inline scripts into ES modules, integrated with `authService`.
- **Navbar (`navbar.js`)**: 
  - Switched from raw `localStorage` reading to using `getSession` and `logout` from `authService`.
  - Fixed relative pathing bugs by enforcing root-relative paths (`/`).
- **Profile Module (`profile.js`, `profile.html`)**: Abstracted 400+ lines of inline script into modular JS, securely fetching user profile data via `authService`.

### Security
- **Mock Tokenization**: Plain-text passwords from legacy users are now safely hashed (Base64 for demo purposes) and migrated upon login. Session tokens are used instead of storing raw passwords in local storage.

### Removed
- **Temp Folders**: Removed `Project` and `So_sanh` template/prototype folders as they are no longer needed.
- **Tooling Scripts**: Removed all one-off Python and JS tooling scripts from the root and src directories to clean up the repository.
