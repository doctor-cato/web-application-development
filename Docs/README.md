# 3HD2Kcinema Documentation

## Overview

This directory contains all project documentation for the 3HD2Kcinema static web application.

The documentation is organized to support:

* clean HTML5 / CSS3 / Vanilla JS development
* local-first data storage and synchronization simulation
* scalable client-side modular structures
* maintainable project structure for portfolio showcase

---

# Documentation Structure

```txt
docs/
│
├── architecture/      # Client-side architecture & synchronization logic
├── features/          # Simulation-based feature walkthroughs
├── database/          # LocalStorage & SessionStorage data schemas
├── api/              # Client-side Javascript mock services
├── ui/                # Styling guides (CSS variables, animations)
├── workflows/         # Local static server and AI workflow guides
│
└── README.md          # This documentation map
```

---

# Architecture Docs

Location:

```txt
docs/architecture/
```

Contains:

* project overview
* frontend architecture (DOM manipulation, routing, modules)
* client-side service architecture (replaces backend architecture)
* realtime synchronization simulation (BroadcastChannel, timers)
* deployment architecture (static hosting on GitHub Pages, Vercel)

Purpose:

* explain how the client-side application is structured
* define the state management flow
* maintain zero-backend implementation guidelines

---

# Feature Docs

Location:

```txt
docs/features/
```

Contains:

* local authentication (LocalStorage check)
* movie catalog & showtimes browsing
* seat booking selection
* realtime seat locking simulation
* checkout flow
* simulated payment gateway
* admin simulation dashboard

Purpose:

* define client-side feature behaviors
* explain client-side state transitions
* organize UI-interactive logic

---

# Database Docs (Local Storage)

Location:

```txt
docs/database/
```

Contains:

* local storage design
* JSON data collections structure
* relational resolution in JavaScript

Purpose:

* explain how LocalStorage simulates database persistence
* define schemas for movies, users, showtimes, bookings
* maintain consistency in data reads/writes

---

# API Docs (Mock Services)

Location:

```txt
docs/api/
```

Contains:

* storage manager
* auth service API
* movie service API
* booking service API
* payment simulation API

Purpose:

* document Javascript module functions (inputs and returns)
* standardize service-layer design

---

# UI Docs

Location:

```txt
docs/ui/
```

Contains:

* UI guidelines
* design system (CSS Custom Properties)
* transition & animation guidelines (CSS transitions/keyframes)

Purpose:

* maintain visual consistency
* standardize dark-theme cinematic styles
* support lightweight, hardware-accelerated animations

---

# Workflow Docs

Location:

```txt
docs/workflows/
```

Contains:

* local development workflow (static HTTP server, e.g. Live Server)
* git workflow
* AI workflow for vanilla HTML/CSS/JS coding

Purpose:

* standardize development process
* support AI-assisted development of vanilla Javascript modules

---

# Documentation Philosophy

Documentation should remain:

* clean
* readable
* scalable
* beginner-friendly

Avoid:

* server-side architecture references
* outdated backend API endpoints description
* overcomplicated frameworks code examples

---

# Maintenance Rules

Always:

* update docs after major javascript service modifications
* keep LocalStorage key schemas documented
* maintain styling and variable consistency

Never:

* leave Node/Express backend configuration examples in instructions
* ignore changes to core data structures in LocalStorage

---

# Final Goal

The documentation system should:

* support quick, server-free developer onboarding
* provide clear instructions for developing high-fidelity interactive frontend apps
* showcase a robust, fully simulated client-side cinematic ticketing application
