namespace appweb.DTOs.Showtime
{
    public class ShowtimeResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string MovieTitle { get; set; } = string.Empty;
        public string CinemaName { get; set; } = string.Empty;
        public string RoomName { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal TicketPrice { get; set; }

        // Hỗ trợ hiển thị nhanh định dạng giờ trên giao diện đặt vé (Ví dụ: 14:30)
        public string FormattedTime => StartTime.ToString("HH:mm");
    }
}