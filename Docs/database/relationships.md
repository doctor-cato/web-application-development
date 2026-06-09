# JavaScript Object Relationships (Local Storage)

## Overview

Since data in 3HD2Kcinema is persisted as plain JSON lists in browser `LocalStorage`, document relationships are modeled using simple ID strings (foreign keys). The relationships are resolved programmatically in the JavaScript service layer using array searching and mapping (e.g., `.find()` and `.filter()`) instead of ODM populations (like Mongoose `.populate()`).

---

# Main Relationship Structure

```txt
3hd2k_users (id)
   │
   └───► 3hd2k_bookings (userId)
            │
            └───► 3hd2k_payments (bookingId)

3hd2k_movies (id)
   │
   └───► 3hd2k_showtimes (movieId)
            │
            └───► 3hd2k_bookings (showtimeId)
```

---

# User & Booking Relation

* **One User to Many Bookings**:
  - A user object has an `id` string (e.g., `"usr_1717891200"`).
  - Each booking record in the `3hd2k_bookings` array has a `userId` field matching the owner's ID.
* **Resolution Example in JS**:
  ```javascript
  // Get all bookings belonging to Nguyen Van A
  const bookings = storage.read('3hd2k_bookings') || [];
  const myBookings = bookings.filter(b => b.userId === currentUserId);
  ```

---

# Movie & Showtime Relation

* **One Movie to Many Showtimes**:
  - A movie object has an `id` string (e.g., `"mov_001"`).
  - Each showtime entry in `3hd2k_showtimes` has a `movieId` field referring to the movie shown.
* **Resolution Example in JS**:
  ```javascript
  // Populate movie details for a selected showtime page
  const showtimes = storage.read('3hd2k_showtimes') || [];
  const movies = storage.read('3hd2k_movies') || [];
  
  const targetShowtime = showtimes.find(st => st.id === showtimeId);
  const associatedMovie = movies.find(m => m.id === targetShowtime.movieId);
  
  // Combine data
  const showtimeWithMovie = { ...targetShowtime, movie: associatedMovie };
  ```

---

# Booking & Payment Relation

* **One Booking to One Payment**:
  - Each payment record in `3hd2k_payments` holds a `bookingId` field.
* **Resolution Example in JS**:
  ```javascript
  // Fetch transaction details for a ticket
  const payments = storage.read('3hd2k_payments') || [];
  const paymentDetails = payments.find(p => p.bookingId === bookingId);
  ```

---

# Seat Status Logic

Seat status values (`available`, `locked`, `booked`) are kept nested directly inside the specific Showtime record. This ensures:
* Easy loading: when viewing a showtime, the seating grid layout can be loaded directly from the `seats` dictionary on the showtime object.
* Fast sync: updates to seat locks require writing to a single showtime element in the showtimes array.

---

# Validation Rules

JavaScript services must enforce referential integrity during mutations:
1. **Existing Reference Check**: Before generating a booking record, `bookingService.js` confirms that both the user session (in SessionStorage) and showtime configurations (in LocalStorage) actually exist.
2. **Double Booking Prevention**: Before confirming payment, the system parses the latest showtimes list from LocalStorage to double-check that the requested seats have not transitioned to `booked` state by another concurrent action.
