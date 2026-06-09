# AI Workflow

## Overview

3HD2Kcinema is designed to work efficiently with AI-assisted development tools such as Cursor AI.

This workflow defines how AI should be used safely and effectively during development.

The goal is:

* faster development
* cleaner boilerplate generation
* improved debugging
* maintainable architecture

AI should assist development, not replace engineering judgment.

---

# Main AI Tools

## Cursor AI

Used for:

* code generation
* boilerplate creation
* refactoring assistance
* debugging help
* documentation generation

---

# AI Development Philosophy

AI should:

* accelerate repetitive work
* assist architecture consistency
* improve developer productivity

AI should NOT:

* fully control architecture decisions
* generate entire applications blindly
* replace manual review/testing

---

# Recommended AI Workflow

```txt id="x5n2rb"
Plan feature
↓
Generate small components/functions
↓
Review generated code
↓
Refactor if needed
↓
Test feature
↓
Commit clean implementation
```

---

# Cursor Rules Philosophy

Cursor rules should:

* define architecture standards
* define frontend/backend patterns
* maintain consistency
* reduce hallucinated structures

---

# Recommended Cursor Usage

## Good Use Cases

Use Cursor for:

* reusable components
* API boilerplate
* Mongoose schemas
* repetitive CRUD routes
* debugging assistance
* documentation generation

---

## Bad Use Cases

Avoid using AI for:

* blindly generating massive systems
* generating unreviewed payment logic
* generating unverified security logic
* replacing debugging entirely

---

# AI Code Review Rules

Always:

* review generated code manually
* test generated logic
* clean unused code
* simplify overcomplicated solutions

Never:

* trust generated code blindly
* skip security validation
* merge untested AI output

---

# Frontend AI Guidelines

AI-generated frontend code should:

* use functional React components
* use Tailwind CSS only
* remain responsive
* remain modular

Avoid:

* oversized JSX
* duplicated UI logic
* unnecessary abstractions

---

# Backend AI Guidelines

AI-generated backend code should:

* use async/await
* separate routes/controllers
* remain modular
* follow REST architecture

Avoid:

* oversized controllers
* deeply nested logic
* duplicated database operations

---

# Realtime System Guidelines

Realtime logic should always be:

* reviewed manually
* tested with multiple users
* validated for race conditions

Socket logic is critical and should never be trusted blindly.

---

# Payment System Guidelines

Payment logic requires:

* manual verification
* security review
* callback validation testing

Never trust AI-generated payment verification without review.

---

# Documentation Workflow

AI can help generate:

* architecture docs
* API documentation
* workflow documentation
* feature specifications

Documentation should still be reviewed for:

* consistency
* accuracy
* scalability

---

# Debugging Workflow

Recommended debugging process:

```txt id="j8q4wn"
Identify issue
↓
Understand root cause
↓
Use AI for debugging suggestions
↓
Verify manually
↓
Test fix
```

---

# Architecture Consistency

AI-generated code should follow:

* existing folder structure
* naming conventions
* reusable component philosophy
* modular backend architecture

---

# AI Safety Philosophy

AI should assist:

* productivity
* consistency
* iteration speed

Human developers remain responsible for:

* architecture decisions
* security
* testing
* deployment quality

---

# Future Improvements

Possible future upgrades:

* automated AI linting
* AI-assisted testing
* AI code review pipelines
* architecture validation systems
