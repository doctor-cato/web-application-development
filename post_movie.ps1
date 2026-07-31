$movie = @{
    title = "Backrooms: Thực Thể Quỷ Quyệt"
    description = "Theo chân Clark, một chủ cửa hàng nội thất vô tình phát hiện ra một cánh cửa bí ẩn dưới tầng hầm. Khi bước qua đó, anh bị lạc vào một chiều không gian vô tận với những căn phòng màu vàng méo mó, lặp đi lặp lại. Sau đó, nhà trị liệu tâm lý của anh là Mary đã quyết định bước vào không gian đó để tìm kiếm và giải cứu anh khỏi thực thể quỷ quyệt."
    duration = 105
    releaseDate = "2026-06-26T00:00:00Z"
    genre = "Kinh dị, Tâm lý, Khoa học viễn tưởng"
    posterUrl = "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800&q=80"
    backdropUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80"
    trailerUrl = "https://www.youtube.com/embed/5aLhJpG4Ijw"
    ageRating = "T16"
    status = "now-showing"
    director = "Kane Parsons"
    cast = '[{"name":"Chiwetel Ejiofor","role":"Clark","avatarUrl":"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop"},{"name":"Renate Reinsve","role":"Mary","avatarUrl":"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop"},{"name":"Mark Duplass","role":"Nhân vật bí ẩn","avatarUrl":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop"}]'
    language = "Tiếng Anh với Phụ đề Tiếng Việt"
    gallery = '["https://images.unsplash.com/photo-1621532813733-1002ce7614d9?w=800","https://images.unsplash.com/photo-1505236273191-1dce886b01e9?w=800","https://images.unsplash.com/photo-1596773347953-e5d8ff2f5eb8?w=800"]'
}

$json = $movie | ConvertTo-Json -Depth 5
$response = Invoke-RestMethod -Uri "http://3hd2k-api.somee.com/api/movies" -Method Post -Body $json -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $tokenString" }
$response | ConvertTo-Json -Depth 5
