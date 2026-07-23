# Core Rules for AI Agents (3HD2Kcinema Project)

## Tech Stack & Architecture
- **Frontend**: Native HTML5, Vanilla ES6 Modules (`import`/`export`), Vanilla CSS / Tailwind CSS.
- **Storage**: Strictly use `Storage` wrapper from `frontend/src/shared/utils/storage.js` (`Storage.get(KEYS...)`, `Storage.set(KEYS...)`). Never access `localStorage` directly across feature files.
- **Seat Booking Realtime**: Use `BroadcastChannel('seat_sync')` for multi-tab state sync.
- **Backend**: ASP.NET Core C# with Repository Pattern (`Controllers` -> `Services` -> `Repositories` -> `DbContext`).
- **Token Efficiency**: Always use `rtk <command>` (Rust Token Killer proxy) for terminal operations.

## DOs & DON'Ts
1. **NO Over-engineering**: Keep code simple and modular. Do not introduce heavy JS frameworks or bundlers (React, Vue, Webpack, Vite) into the Vanilla JS frontend.
2. **Docs Synchronization**: Update corresponding markdown files in `docs/` whenever features, storage keys, or API contracts change.
3. **No Silent Error Hiding**: Identify root cause of failures. Never comment out Playwright tests or swallow exceptions with empty catch blocks.

## Commit Message Convention
```text
<prefix>(<scope>): <short description in English or Vietnamese>

CHANGED: <list of modified files>
NOTE: <important context for future maintainers or AI agents>
```
