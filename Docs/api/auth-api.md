# Authentication API

## Overview

Authentication is handled by `POST /api/auth/*` endpoints. The backend stores user accounts in `dbo.Users` (SQL Server) with bcrypt-hashed passwords. Successful login returns a signed **JWT access token** and a **refresh token**.

---

# POST /api/auth/register

### Description
Creates a new user account. Email must be unique.

### Request Body
```json
{
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "password": "MyPassword123"
}
```

### Response — 201 Created
```json
{
  "success": true,
  "data": {
    "userId": "usr_1717891200",
    "name": "Nguyen Van A",
    "email": "a@example.com",
    "role": "user"
  }
}
```

### Response — 400 Bad Request (email taken)
```json
{
  "success": false,
  "message": "Email is already registered."
}
```

### SQL Operation
```sql
-- Uniqueness checked by UNIQUE constraint on dbo.Users.Email
INSERT INTO dbo.Users (UserId, Name, Email, Password, Role)
VALUES (@userId, @name, @email, @bcryptHash, 'user');
```

---

# POST /api/auth/login

### Description
Validates credentials and issues a JWT.

### Request Body
```json
{
  "email": "a@example.com",
  "password": "MyPassword123"
}
```

### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBh...",
    "user": {
      "userId": "usr_1717891200",
      "name": "Nguyen Van A",
      "email": "a@example.com",
      "role": "user"
    }
  }
}
```

### Response — 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

### SQL Operation
```sql
SELECT UserId, Name, Email, Password, Role
FROM dbo.Users
WHERE Email = @email;
-- password verified with bcrypt.Verify(inputPassword, storedHash)
```

---

# POST /api/auth/logout

### Description
Invalidates the user's refresh token server-side.

### Headers
```
Authorization: Bearer <access_token>
```

### Response — 200 OK
```json
{ "success": true }
```

---

# Validation Rules

| Rule | Detail |
|---|---|
| Name | Non-empty, max 100 chars |
| Email | Valid format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), max 200 chars, unique in `dbo.Users` |
| Password | Min 8 characters; stored as bcrypt hash |
| JWT expiry | Access token: 15 minutes; Refresh token: 7 days |
