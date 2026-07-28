using System;

namespace appweb.DTOs
{

    public class BookingResponseDto
    {
        public Guid id { get; set; }
        public string Seats { get; set; } = string.Empty;
        public DateTime BookingDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; }
        public string MovieTitle { get; set; } = string.Empty;
    }
}
