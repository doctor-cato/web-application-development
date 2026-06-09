# Movie Catalog Service API

## Overview

The movie and showtime datasets are managed by `js/services/movieService.js`. It queries the `3hd2k_movies` and `3hd2k_showtimes` keys in `LocalStorage` and supplies catalog data to page scripts.

---

# Exported Functions

## getMovies()

### Description
Retrieves all movies currently in the catalog (both Now Showing and Coming Soon categories).

### Parameters
* None.

### Returns (Promise)
* Resolves with an array of movie objects:
  ```json
  [
    {
      "id": "mov_001",
      "title": "Spider-Man: Across the Spider-Verse",
      "poster": "images/posters/spiderman.jpg",
      "description": "Miles Morales encounters a team of Spider-People...",
      "genres": ["Animation", "Action"],
      "duration": 140,
      "releaseDate": "2023-06-02",
      "rating": 9.0,
      "trailerUrl": "https://www.youtube.com/embed/shW9i6k8Mc0"
    }
  ]
  ```

---

## getMovieById(id)

### Description
Fetches detailed info for a single movie profile.

### Parameters
* `id` (string): The movie's unique ID.

### Returns (Promise)
* Resolves with the matching movie object, or `null` if the movie does not exist.

---

## getShowtimes(movieId)

### Description
Retrieves all scheduled screening sessions for a specific movie.

### Parameters
* `movieId` (string): The target movie ID.

### Returns (Promise)
* Resolves with an array of showtime slot objects:
  ```json
  [
    {
      "id": "st_200",
      "movieId": "mov_001",
      "date": "2026-06-10",
      "time": "19:30",
      "room": "Room 3"
    }
  ]
  ```

---

## getShowtimeById(id)

### Description
Fetches details of a specific showtime slot (including its room number, time, and date). Note: To get seats, use `getShowtimeSeats()` from the booking service.

### Parameters
* `id` (string): Showtime unique ID.

### Returns (Promise)
* Resolves with the showtime slot object, or `null` if not found.

---

# Administrative Capabilities

If the active session belongs to an `"admin"` user, `movieService.js` provides helper actions:
* `addMovie(movieData)`: Inserts a new movie profile.
* `updateMovie(id, movieData)`: Edits fields for an existing movie.
* `deleteMovie(id)`: Removes a movie and deletes its associated showtime records.
* `addShowtime(showtimeData)`: Inserts a new screening session slot.
