# Development & Git Workflows

## Code Rules

When working on this codebase:
1. **Never** import external Node modules or bundler packages unless strictly necessary. Stay true to Vanilla ES6 `<script type="module">`.
2. **Never** write DOM manipulation logic inside `js/services/`.
3. **Never** write `LocalStorage` `setItem`/`getItem` inside `js/pages/`. Always go through `storage.js`.

---

## Git Flow

The project relies on a clean, isolated branching strategy:

* **`main`**: The stable branch. Code here must run flawlessly via a static HTTP server.
* **`develop`**: The integration branch.
* **`feature/*`**: Create feature branches off `develop` (e.g., `feature/payment-gateway`).

### Commits
Use semantic commit prefixes:
* `feat:` for new UI/logic.
* `fix:` for bug fixes.
* `docs:` for markdown changes.
* `refactor:` for rearranging structure (like moving files out of `assets/`).

---

## AI Collaboration Workflow (Cursor / Copilot / Antigravity)

When using AI agents on this repository:
1. **Context Limit**: Only point the AI to the `Docs/` markdown files. Absolutely forbid the AI from reading or writing `.docx` files.
2. **No Over-Engineering**: If an AI tries to generate React components (`.jsx`) or Express routes, immediately stop the generation. Remind the AI to read `Docs/architecture.md` to adhere to the pure Vanilla HTML/CSS/JS constraints.
3. **Clean Diffs**: Instruct the AI to use modular updates instead of rewriting massive 500-line HTML files from scratch.
