using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace appweb.Models
{
    public class Movie
    {
        [Key]
        public int MovieId { get; set; }

        // Cầu nối bảo vệ: Giúp code gọi .Id không bị đỏ
        [NotMapped]
        public int Id { get => MovieId; set => MovieId = value; }

        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Duration { get; set; }
        public DateTime ReleaseDate { get; set; }
        public string Genre { get; set; } = string.Empty;

        // Thêm đầy đủ cả 2 trường ảnh để không trượt phát nào
        public string ImageUrl { get; set; } = string.Empty;
        public string PosterUrl { get; set; } = string.Empty;

        public string? TrailerUrl { get; set; }
        public string AgeRating { get; set; } = string.Empty; // Sửa lỗi thiếu giới hạn tuổi (C13, C16, C18...)

        // Khôi phục liên kết danh sách lịch chiếu của phim này
        public List<Showtime> Showtimes { get; set; } = new List<Showtime>();
    }
}