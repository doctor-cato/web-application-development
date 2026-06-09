# Client-Side Authentication System

## Overview

The authentication system is handled entirely inside the browser. It implements user registration, credential validation, active session tracking, and protected page access without server dependencies.

---

# Goals & Strategy

The authentication system should:
* **Persist Profiles**: Keep user details stored securely in `LocalStorage` (`3hd2k_users`).
* **Manage Sessions**: Track the logged-in state of the active browser window/tab in `SessionStorage` (`3hd2k_current_user`).
* **Protect Pages**: Prevent non-logged-in visitors from accessing checkout or booking history screens by performing JS check-redirects.

---

# Technology Stack

* **HTML Forms**: Standard username/email/password inputs with basic HTML5 validation.
* **JavaScript DOM**: Captures form submits, delegates values to `authService.js`, and reacts to success/failure.
* **Session & Local Storage**: Storage engines for active sessions and permanent user account databases.

---

# Authentication Flows

## User Registration Flow

```txt
User fills form -> Clicks Submit
       ↓
Page script validates inputs (email regex, password length)
       ↓
Reads '3hd2k_users' list from LocalStorage
       ↓
Checks if email is already registered -> If duplicate, rejects
       ↓
Pushes new user object to array -> Writes back to LocalStorage
       ↓
Stores user session in SessionStorage -> Redirects to index.html
```

---

## User Login Flow

```txt
User enters email & password -> Clicks Login
       ↓
Reads '3hd2k_users' list from LocalStorage
       ↓
Finds user record matching input credentials -> If no match, displays error
       ↓
Writes user profile details to SessionStorage ('3hd2k_current_user')
       ↓
Redirects user to homepage (or previous page context)
```

---

# Protected Page Redirection

Since there is no server routing middleware, page protection is handled at the start of page loading:

```javascript
// Included at the top of protected page handlers (e.g. profile.js, booking.js)
import { getCurrentUser } from './services/authService.js';

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    // Save current URL context to redirect back after login
    sessionStorage.setItem('redirect_after_login', window.location.href);
    window.location.href = 'login.html';
  } else {
    // Proceed with page rendering...
  }
});
```

---

# Security Considerations

* **Local Auth Only**: This local storage approach is for design prototyping and simulated workflows. It does not provide cryptographic backend security.
* **Sensitive Data**: Avoid storing actual user passwords. For simulated purposes, dummy credentials (e.g. `password123`) should be used.
* **Role Check**: Simulated administrator dashboard access checks if the `role` property of the `3hd2k_current_user` object equals `"admin"`.
