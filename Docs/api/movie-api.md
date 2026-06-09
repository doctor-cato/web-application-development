# Movie Catalog API

## Overview

Movie and showtime data is managed by `/api/movies` and `/api/showtimes` endpoints. Data is stored in `dbo.Movies` and `dbo.Showtimes` (SQL Server).

---

# GET /api/movies

### Description
Returns all active movies in the catalog.

### Response — 200 OK
```json
{
  "success": true,
  "data": [
    {
      "movieId": "mov_001",
      "title": "Spider-Man: Across the Spider-Verse",
      "poster": "images/posters/spiderman.jpg",
      "description": "Miles Morales encounters a team of Spider-People...",
      "genres": ["Animation", "Action", "Adventure"],
      "duration": 140,
      "releaseDate": "2023-06-02",
      "rating": 9.0,
      "trailerUrl": "https://www.youtube.com/embed/shW9i6k8Mc0"
    }
  ]
}
```

### SQL Operation
```sql
SELECT MovieId, Title, Poster, Description, Genres, Duration, ReleaseDate, Rating, TrailerUrl
FROM dbo.Movies
WHERE IsActive = 1
ORDER BY ReleaseDate DESC;
```

---

# GET /api/movies/{id}

### Description
Returns details for a single movie.

### Response — 200 OK
Single movie object (same schema as above).

### Response — 404 Not Found
```json
{ "success": false, "message": "Movie not found." }
```

---

# GET /api/movies/{id}/showtimes

### Description
Returns all upcoming scheduled showtimes for a given movie.

### Response — 200 OK
```json
{
  "success": true,
  "data": [
    {
      "showtimeId": "st_200",
      "movieId": "mov_001",
      "showDate": "2026-06-10",
      "showTime": "19:30",
      "room": "Room 3"
    }
  ]
}
```

### SQL Operation
```sql
SELECT ShowtimeId, MovieId, ShowDate, ShowTime, Room
FROM dbo.Showtimes
WHERE MovieId   = @movieId
  AND ShowDate  >= CAST(GETUTCDATE() AS DATE)
  AND IsActive  = 1
ORDER BY ShowDate, ShowTime;
```

---

# Admin Endpoints

The following endpoints require `role: "admin"` in the JWT claims.

## POST /api/movies

Creates a new movie entry.

### Request Body
```json
{
  "title": "New Movie",
  "poster": "images/posters/new.jpg",
  "description": "...",
  "genres": ["Action"],
  "duration": 120,
  "releaseDate": "2026-07-01",
  "rating": 8.5,
  "trailerUrl": "https://youtube.com/embed/..."
}
```

### Response — 201 Created
```json
{ "success": true, "data": { "movieId": "mov_002", ... } }
```

---

## PUT /api/movies/{id}

Updates fields for an existing movie.

### Response — 200 OK
```json
{ "success": true, "data": { ...updatedMovie } }
```

---

## DELETE /api/movies/{id}

Soft-deletes a movie by setting `IsActive = 0`. Associated showtimes are also deactivated.

### SQL Operation
```sql
UPDATE dbo.Movies    SET IsActive = 0 WHERE MovieId = @id;
UPDATE dbo.Showtimes SET IsActive = 0 WHERE MovieId = @id;
```

### Response — 200 OK
```json
{ "success": true }
```

---

## POST /api/showtimes

Creates a new showtime slot for a movie.

### Request Body
```json
{
  "movieId": "mov_001",
  "showDate": "2026-06-15",
  "showTime": "14:00",
  "room": "Room 1",
  "seats": [
    { "seatLabel": "A1", "seatType": "normal", "price": 80000 },
    { "seatLabel": "A2", "seatType": "vip",    "price": 110000 }
  ]
}
```

### SQL Operation
```sql
BEGIN TRANSACTION;
  INSERT INTO dbo.Showtimes (ShowtimeId, MovieId, ShowDate, ShowTime, Room) VALUES (...);
  INSERT INTO dbo.Seats     (ShowtimeId, SeatLabel, SeatType, Price, Status)
  VALUES (...), (...), ...;
COMMIT;
```

### Response — 201 Created
```json
{ "success": true, "data": { "showtimeId": "st_201", ... } }
```
