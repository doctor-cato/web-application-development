# Git Workflow

## Overview

This document defines the Git workflow used in 3HD2Kcinema.

The workflow focuses on:

* clean commit history
* feature isolation
* collaborative scalability
* safer development flow

---

# Branch Structure

## Main Branches

```txt id="h4u7mx"
main
develop
feature/frontend
feature/backend
feature/seat-booking
feature/payment
```

---

# Branch Responsibilities

## main

Production-ready branch.

Rules:

* stable only
* tested code only
* deploy-ready code only

---

## develop

Main development integration branch.

Used for:

* combining completed features
* testing integrated systems

---

## feature/*

Feature-specific branches.

Examples:

* feature/frontend
* feature/backend
* feature/seat-booking

Benefits:

* isolated development
* easier debugging
* safer experimentation

---

# Recommended Workflow

```txt id="v6n2pc"
Create feature branch
↓
Develop feature
↓
Commit changes
↓
Test feature
↓
Merge into develop
↓
Merge develop into main
```

---

# Commit Convention

## Prefixes

```txt id="w8r5tk"
feat:
fix:
refactor:
chore:
docs:
style:
```

---

# Commit Examples

```txt id="n3v1yu"
feat: add movie card component
fix: resolve socket reconnect issue
refactor: cleanup booking controller
docs: update architecture docs
chore: configure prettier
```

---

# Commit Rules

Commits should:

* remain small
* describe one logical change
* use semantic naming

Avoid:

* giant commits
* vague messages
* committing broken code

---

# Pull Request Philosophy

Pull requests should:

* remain focused
* contain tested code
* avoid unrelated changes

---

# Git Ignore Rules

Never commit:

* .env files
* node_modules
* secrets
* build artifacts

---

# Recommended .gitignore

```txt id="t2m9vk"
node_modules
.env
dist
build
coverage
```

---

# Merge Philosophy

Before merging:

* test features
* clean unused code
* resolve conflicts properly

---

# Rollback Strategy

If major issues occur:

* revert problematic commits
* isolate failing features
* avoid hotfix chaos

---

# Collaboration Guidelines

If working with multiple developers:

* use feature branches
* avoid direct main commits
* communicate schema changes clearly

---

# GitHub Integration

GitHub should be used for:

* version control
* deployment integration
* pull requests
* issue tracking

---

# Future Improvements

Possible future workflow upgrades:

* protected branches
* CI/CD pipelines
* automated linting
* automated testing
* release tagging
