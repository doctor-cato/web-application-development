$body = @{
    title = "Test Movie"
    duration = 120
    releaseDate = "2026-07-31T00:00:00.000Z"
    genre = "Hành Động"
    director = "Đang cập nhật"
    cast = "[]"
    language = "Tiếng Việt"
    posterUrl = ""
    backdropUrl = $null
    trailerUrl = ""
    ageRating = "T13"
    status = "now-showing"
    gallery = "[]"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5111/api/movies" -Method Post -Body $body -ContentType "application/json"
