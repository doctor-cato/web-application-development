using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace appweb.Models
{
    [Table("movies")]
    public class Movie
    {
        [Key]
        [Column("movie_id")]
        public Guid MovieId { get; set; }

        // Cầu nối bảo vệ: Giúp code gọi .Id không bị đỏ
        [NotMapped]
        public Guid Id { get => MovieId; set => MovieId = value; }

        [Column("title")]
        public string Title { get; set; } = string.Empty;
        
        [Column("description")]
        public string Description { get; set; } = string.Empty;
        
        [Column("duration_minutes")]
        public int Duration { get; set; }
        
        [Column("release_date")]
        public DateTime ReleaseDate { get; set; }
        
        [Column("genres")]
        public string Genre { get; set; } = string.Empty;

        // Thêm đầy đủ cả 2 trường ảnh để không trượt phát nào
        [NotMapped]
        public string ImageUrl { get; set; } = string.Empty;
        
        [Column("poster_url")]
        public string PosterUrl { get; set; } = string.Empty;

        [Column("trailer_url")]
        public string? TrailerUrl { get; set; }
        
        [Column("age_rating")]
        public string AgeRating { get; set; } = string.Empty;

        [Column("status")]
        public string Status { get; set; } = "now-showing"; // now-showing or coming-soon

        // Khôi phục liên kết danh sách lịch chiếu của phim này
        public List<Showtime> Showtimes { get; set; } = new List<Showtime>();
    }
}
