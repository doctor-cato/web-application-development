<!-- generated-by: gsd-doc-writer -->
# Testing Guide

This document outlines the testing strategy for the 3HD2Kcinema project.

## Test framework and setup

> **Note**: The project does not currently have an automated testing framework configured (e.g., Jest, Vitest, Cypress). Automated testing is planned for a future development phase.

## Running tests

Currently, there are no automated test scripts configured in `package.json`.

In the future, tests will be run via standard commands:
```bash
npm run test
```

## Writing new tests

Once a testing framework is introduced:
- Frontend components will be tested using Vitest + React Testing Library (e.g., `Button.test.jsx`).
- Backend routes and services will be tested using Jest + Supertest (e.g., `auth.test.js`).

## Coverage requirements

No coverage threshold is currently configured.

## CI integration

There is currently no CI test workflow configured. When added, tests will be enforced via GitHub Actions on Pull Requests targeting the `main` branch.
