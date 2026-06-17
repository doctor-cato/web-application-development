using System.ComponentModel.DataAnnotations;

namespace appweb.DTOs.Booking
{
    public class CreateBookingDto
    {
        [Required(ErrorMessage = "Vui lòng chọn suất chiếu")]
        public string ShowtimeId { get; set; } = string.Empty; // Để string phục vụ cho Id của MongoDB

        [Required(ErrorMessage = "Vui lòng chọn ít nhất một vị trí ghế")]
        public List<string> SeatIds { get; set; } = new List<string>();

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Range(0, double.MaxValue, ErrorMessage = "Tổng tiền không hợp lệ")]
        public decimal TotalPrice { get; set; }
    }
}