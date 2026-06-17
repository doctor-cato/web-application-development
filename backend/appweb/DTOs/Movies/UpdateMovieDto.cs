using System.ComponentModel.DataAnnotations;

namespace appweb.DTOs.Movie
{
    public class UpdateMovieDto
    {
        [Required]
        public string Id { get; set; } = string.Empty; // Id dạng string để khớp với MongoDB Object Id

        [Required(ErrorMessage = "Tên phim không được để trống")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mô tả phim không được để trống")]
        public string Description { get; set; } = string.Empty;

        [Range(1, 500)]
        public int Duration { get; set; }

        [Required]
        public DateTime ReleaseDate { get; set; }

        [Required]
        public string Genre { get; set; } = string.Empty;

        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        public string? TrailerUrl { get; set; }

        public bool IsShowing { get; set; } // Trạng thái phim đang chiếu hay đã ngừng chiếu
    }
}