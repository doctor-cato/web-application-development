# Authentication Service API

## Overview

The authentication logic is handled by `js/services/authService.js`. It interacts with `storage.js` to create user profiles in `LocalStorage` and manages the active user session in `SessionStorage`.

---

# Exported Functions

## register(name, email, password)

### Description
Creates a new user record in the local database.

### Parameters
* `name` (string): The user's display name.
* `email` (string): The user's email address (acts as login key).
* `password` (string): User password.

### Returns (Promise)
* Resolves on success:
  ```json
  {
    "success": true,
    "user": {
      "id": "usr_1717891200",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
  ```
* Rejects on failure (e.g. duplicate email, invalid validation):
  ```json
  {
    "success": false,
    "message": "Email is already registered."
  }
  ```

---

## login(email, password)

### Description
Validates credentials and logs the user in.

### Parameters
* `email` (string): Registered email.
* `password` (string): Account password.

### Returns (Promise)
* Resolves on success, setting the `3hd2k_current_user` item in `SessionStorage`:
  ```json
  {
    "success": true,
    "user": {
      "id": "usr_1717891200",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
  ```
* Rejects on failure:
  ```json
  {
    "success": false,
    "message": "Invalid email or password."
  }
  ```

---

## getCurrentUser()

### Description
Retrieves the logged-in user profile from the active browser session.

### Returns (Synchronous)
* Returns the active user object, or `null` if no user is authenticated:
  ```json
  {
    "id": "usr_1717891200",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
  ```

---

## logout()

### Description
Clears the active session from `SessionStorage`.

### Returns (Promise)
* Resolves with `{ success: true }` after clearing storage.

---

# Local Validation Rules

Before registration writes:
* Field emptiness checks: All three parameters must contain non-whitespace strings.
* Email formatting: Checked using regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
* Email uniqueness: Scans `3hd2k_users` array. Rejects if email already exists.
