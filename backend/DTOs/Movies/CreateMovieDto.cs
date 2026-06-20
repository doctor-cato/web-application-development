using System.ComponentModel.DataAnnotations;

namespace appweb.DTOs.Movie
{
    public class CreateMovieDto
    {
        [Required(ErrorMessage = "Tên phim không được để trống")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mô tả phim không được để trống")]
        public string Description { get; set; } = string.Empty;

        [Range(1, 500, ErrorMessage = "Thời lượng phim phải từ 1 đến 500 phút")]
        public int Duration { get; set; } // Tính theo số phút

        [Required(ErrorMessage = "Vui lòng chọn ngày khởi chiếu")]
        [DataType(DataType.Date)]
        public DateTime ReleaseDate { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập thể loại phim")]
        public string Genre { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vui lòng thêm ảnh bìa phim (URL)")]
        public string ImageUrl { get; set; } = string.Empty;

        public string? TrailerUrl { get; set; }
    }
}