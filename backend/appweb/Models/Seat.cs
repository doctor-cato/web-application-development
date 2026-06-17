using System;
using System.Collections.Generic;

namespace appweb.Models;

public partial class Seat
{
    public int Id { get; set; }

    public int? RoomId { get; set; }

    public string SeatRow { get; set; } = null!;

    public int SeatNumber { get; set; }

    public string? SeatType { get; set; }

    public virtual ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();

    public virtual Room? Room { get; set; }
}
