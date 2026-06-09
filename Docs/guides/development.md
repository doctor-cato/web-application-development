# Development Guide

This guide covers coding standards, file structures, and contribution guidelines for the 3HD2Kcinema static project.

---

## Local Development Workflow

To add features or edit code:
1. Start your local static server (e.g. `npx serve` or Live Server).
2. Open pages directly in your browser.
3. Edits made to HTML, CSS, or JS modules will refresh automatically in the browser (if using Live Server).

There are no compiler steps, bundlers, or package installations needed during development.

---

## Code Style & Standards

* **HTML5 Markup**: Use semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`). Ensure inputs use appropriate types (`email`, `password`, `number`) for native validation.
* **Vanilla CSS / Custom Properties**: Use CSS variables in `css/style.css` for styling tokens:
  ```css
  :root {
    --primary-color: #e50914;
    --background-dark: #121414;
    --card-bg: rgba(255, 255, 255, 0.05);
    --glow-shadow: 0 0 15px rgba(229, 9, 20, 0.5);
  }
  ```
  Avoid writing style rules inside HTML files.
* **Vanilla JavaScript (ES6+ Modules)**:
  - Use `<script type="module" src="js/pages/some-page.js">` in your HTML files.
  - Break logic into functions.
  - Communicate with `LocalStorage` and `SessionStorage` only through the predefined wrappers in `js/services/`.

---

## Branch Conventions

When branching off of `main`, follow semantic branching conventions:
- `feat/feature-name` - For new features
- `fix/bug-description` - For bug fixes
- `refactor/what-is-refactored` - For structure improvements
- `docs/what-was-documented` - For documentation updates

---

## Pull Request (PR) Process

To contribute changes:
1. Push your branch to the repository.
2. Open a Pull Request targeting `main`.
3. Verify in your PR description:
   - What features or fixes were implemented.
   - Confirmation that the application was tested locally on a static browser server.
   - Any modifications made to LocalStorage key schemas.
