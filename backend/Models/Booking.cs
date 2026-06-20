using System;
using System.Collections.Generic;

namespace appweb.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public int ShowtimeId { get; set; }
        public int MovieId { get; set; }
        public string? Seats { get; set; }
        public decimal TotalPrice { get; set; }
        public string? PaymentMethod { get; set; }
        public string PaymentStatus { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Quan hệ giữa các bảng (Navigation Properties)
        public virtual User? User { get; set; }
        public virtual Movie? Movie { get; set; }
        public virtual Showtime? Showtime { get; set; }
        public virtual ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();
    }
}