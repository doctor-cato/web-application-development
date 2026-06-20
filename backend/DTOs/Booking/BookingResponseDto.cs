using System;

namespace appweb.DTOs
{
    // ĐÃ ĐỔI TÊN: Tránh tuyệt đối việc đặt tên class trùng lặp "Booking" gây lỗi Ambiguity
    public class BookingResponseDto
    {
        public int Id { get; set; }
        public string Seats { get; set; } = string.Empty;
        public DateTime BookingDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; }
        public string MovieTitle { get; set; } = string.Empty;
    }
}