# Bugfix Requirements Document

## Introduction

The project documentation across `Docs/` and several root-level files incorrectly describes a backend stack — Node.js, Express, MongoDB/Mongoose, Socket.io, and React — that does not exist in the actual codebase. The real implementation (`New folder/`) is a fully client-side, frontend-only project using vanilla HTML5, CSS3, JavaScript (ES6 Modules), Tailwind CSS via CDN, LocalStorage/SessionStorage for persistence, and BroadcastChannel API for realtime cross-tab synchronization.

This mismatch makes the documentation misleading, causes confusion for contributors and AI agents reading the docs, and breaks trust between the documented spec and the real code. The fix is to rewrite all affected documentation files to accurately reflect the vanilla architecture.

**Scope of breakage (files with incorrect backend references):**

- `Docs/features/movie-system.md` — contains React component file tree (`.jsx`), Express routes, Mongoose models, and REST API endpoint stubs
- `Docs/features/movie-reviews.md` — documents a MongoDB `Review` collection with Mongoose schema (`_id`, `ref: User`, `ref: Movie`), and Express REST routes (`POST /api/movies/:id/reviews`)
- `Docs/ui/animation-guidelines.md` — names Framer Motion as the primary animation library
- `Docs/workflows/development-workflow.md` — describes a full Node/React/Socket.io/MongoDB/JWT development workflow in phases 1–8

All other docs (`architecture/`, `database/`, `api/`, `features/authentication.md`, `features/seat-booking.md`, etc., root `README.md`, `AGENT_GUIDE.md`, `PRODUCT_ANALYSIS.md`, `PRODUCT_DIRECTION.md`, `AI_FEATURE_PROPOSAL.md`) already correctly describe the vanilla architecture and require no changes.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a developer reads `Docs/features/movie-system.md` THEN the system displays React component filenames (`.jsx` extension), Express controller and route directory structures, Mongoose model files, and REST API endpoint URLs (`GET /api/movies`, `GET /api/movies/:id`) that do not exist in the codebase

1.2 WHEN a developer reads `Docs/features/movie-reviews.md` THEN the system describes a MongoDB `Review` collection with Mongoose-style schema fields (`_id`, `ref: User`, `ref: Movie`, `timestamps`), server-side Express API endpoints (`POST /api/movies/:id/reviews`, `PUT /api/movies/:id/reviews`, `GET /api/movies/:id/reviews`), and a backend middleware for checking ticket purchase status — none of which exist

1.3 WHEN a developer reads `Docs/ui/animation-guidelines.md` THEN the system lists `Framer Motion` as the primary animation library, which is an npm-installed React animation package incompatible with the no-build, no-npm, vanilla JS architecture

1.4 WHEN a developer reads `Docs/workflows/development-workflow.md` THEN the system shows a development order that includes "Backend API", "MongoDB Models", "Socket.io Realtime", "JWT Authentication", and deployment of a separate backend server — contradicting the project's server-free, frontend-only architecture and the `AGENT_GUIDE.md` rules

### Expected Behavior (Correct)

2.1 WHEN a developer reads `Docs/features/movie-system.md` THEN the system SHALL describe the movie catalog as implemented by `js/services/movieService.js` reading from `3hd2k_movies` and `3hd2k_showtimes` keys in LocalStorage, with vanilla JS component filenames (`.js` extension), no backend routes, and no Mongoose models

2.2 WHEN a developer reads `Docs/features/movie-reviews.md` THEN the system SHALL describe movie reviews stored as a JSON array under a LocalStorage key (e.g., `3hd2k_reviews`), reviewed/written by vanilla JS service functions, with eligibility checks performed client-side by comparing the user's booking history in `3hd2k_bookings` — no server endpoints, no Mongoose schema

2.3 WHEN a developer reads `Docs/ui/animation-guidelines.md` THEN the system SHALL list only vanilla CSS keyframes and CSS transitions as the animation technology, consistent with the no-npm, no-build constraint, and remove all references to Framer Motion

2.4 WHEN a developer reads `Docs/workflows/development-workflow.md` THEN the system SHALL show a development order that covers only frontend phases: project setup (static files only), HTML pages and CSS styling, storage wrapper (`storage.js`), authentication service, movie catalog rendering, seat booking UI, BroadcastChannel sync, checkout and QR ticket generation, and static hosting deployment — with no backend, database server, or Socket.io phases

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a developer reads any currently-correct doc file (e.g., `Docs/architecture/overview.md`, `Docs/architecture/project-overview.md`, `Docs/architecture/frontend-architecture.md`, `Docs/architecture/backend-architecture.md`, `Docs/architecture/realtime-architecture.md`, `Docs/architecture/deployment-architecture.md`) THEN the system SHALL CONTINUE TO describe the vanilla HTML/CSS/JS architecture using LocalStorage, SessionStorage, and BroadcastChannel API exactly as currently documented

3.2 WHEN a developer reads any currently-correct API service doc (e.g., `Docs/api/auth-api.md`, `Docs/api/booking-api.md`, `Docs/api/movie-api.md`, `Docs/api/payment-api.md`, `Docs/api/reference.md`) THEN the system SHALL CONTINUE TO document the `js/services/` JavaScript module functions with their correct Promise-based signatures and LocalStorage interactions

3.3 WHEN a developer reads any currently-correct database doc (e.g., `Docs/database/collections.md`, `Docs/database/database-design.md`, `Docs/database/relationships.md`) THEN the system SHALL CONTINUE TO describe the LocalStorage/SessionStorage schema with the `3hd2k_` key prefix conventions and JSON array structures

3.4 WHEN a developer reads any currently-correct feature doc (e.g., `Docs/features/authentication.md`, `Docs/features/seat-booking.md`, `Docs/features/realtime-seat-locking.md`, `Docs/features/checkout-flow.md`, `Docs/features/payment-system.md`, `Docs/features/payment-gateway.md`, `Docs/features/admin-dashboard.md`, `Docs/features/notifications.md`, `Docs/features/social-login.md`) THEN the system SHALL CONTINUE TO describe those features using only client-side browser technologies

3.5 WHEN a developer reads any root-level doc (`README.md`, `AGENT_GUIDE.md`, `AI_FEATURE_PROPOSAL.md`, `PRODUCT_ANALYSIS.md`, `PRODUCT_DIRECTION.md`) THEN the system SHALL CONTINUE TO describe the project as a vanilla HTML/CSS/JS frontend-only application as currently documented

3.6 WHEN a developer reads `Docs/ui/design-system.md` or `Docs/ui/ui-guidelines.md` THEN the system SHALL CONTINUE TO describe the Spatial/Aurora/Glassmorphism UI system using only vanilla CSS and Tailwind CDN utility classes as currently documented
