using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace appweb.Models
{
    [Table("cinematches")]
    public class CineMatch
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Column("user_id")]
        public Guid UserId { get; set; } // Người tạo yêu cầu

        [Column("showtime_id")]
        public Guid ShowtimeId { get; set; }

        [Column("seat_id")]
        public string SeatId { get; set; } = string.Empty;

        [Column("adjacent_seat_id")]
        public string AdjacentSeatId { get; set; } = string.Empty;

        [Column("match_preference")]
        public string MatchPreference { get; set; } = "any"; // "male", "female", "any"

        [Column("matched_user_id")]
        public Guid? MatchedUserId { get; set; } // Người được ghép đôi (có thể Null nếu đang chờ)

        [Column("status")]
        public string Status { get; set; } = "pending"; // "pending", "matched", "completed", "cancelled"

        [Column("reveal_code")]
        public string RevealCode { get; set; } = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper(); // Mã QR 8 ký tự

        [Column("is_revealed")]
        public bool IsRevealed { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User1 { get; set; }

        [ForeignKey("MatchedUserId")]
        public virtual User? User2 { get; set; }

        [ForeignKey("ShowtimeId")]
        public virtual Showtime Showtime { get; set; }
    }
}
