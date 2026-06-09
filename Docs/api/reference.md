# REST API Reference

## Overview

3HD2Kcinema exposes a **RESTful ASP.NET Core Web API**. All endpoints are prefixed with `/api`. The frontend communicates with these endpoints via `fetch` or Axios.

**Base URL (development):** `http://localhost:5000/api`  
**Base URL (production):** `https://api.3hd2kcinema.vn/api`

---

# Authentication

All write endpoints (except `POST /api/auth/register` and `POST /api/auth/login`) require a valid **JWT Bearer token** in the request header:

```
Authorization: Bearer <access_token>
```

---

# Endpoints Map

| Module | Method | Path | Description |
|---|---|---|---|
| **Auth** | POST | `/auth/register` | Register a new account |
| | POST | `/auth/login` | Login and receive JWT |
| | POST | `/auth/logout` | Invalidate refresh token |
| **Movies** | GET | `/movies` | List all active movies |
| | GET | `/movies/{id}` | Get a single movie |
| | GET | `/movies/{id}/showtimes` | Get showtimes for a movie |
| | POST | `/movies` | *(admin)* Add a movie |
| | PUT | `/movies/{id}` | *(admin)* Update a movie |
| | DELETE | `/movies/{id}` | *(admin)* Delete a movie |
| **Showtimes** | GET | `/showtimes/{id}/seats` | Get seat map for a showtime |
| **Bookings** | POST | `/bookings/lock` | Lock a seat |
| | DELETE | `/bookings/lock` | Unlock a seat |
| | POST | `/bookings` | Create a booking |
| | GET | `/bookings/{id}` | Get booking details |
| | GET | `/bookings/my` | Get current user's bookings |
| **Payments** | POST | `/payments/create` | Initiate a payment |
| | POST | `/payments/callback` | Provider webhook callback |
| | GET | `/payments/{bookingId}` | Get payment status |

---

# Response Standard Envelope

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "The selected seat is already locked by another user."
}
```

---

# Real-time (SignalR)

Seat events are pushed to clients via **SignalR** at `/hubs/seat`.

| Event | Direction | Payload |
|---|---|---|
| `SeatLocked` | Server → Client | `{ showtimeId, seatLabel, lockedBy }` |
| `SeatUnlocked` | Server → Client | `{ showtimeId, seatLabel }` |
| `SeatBooked` | Server → Client | `{ showtimeId, seatLabel }` |

Frontend joins a showtime group on connection:
```javascript
connection.invoke("JoinShowtime", showtimeId);
```
