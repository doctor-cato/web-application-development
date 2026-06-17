using System;
using System.Collections.Generic;

namespace appweb.Models;

public partial class Showtime
{
    public int Id { get; set; }

    public int? MovieId { get; set; }

    public int? RoomId { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public decimal TicketPrice { get; set; }

    public virtual ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual Movie? Movie { get; set; }

    public virtual Room? Room { get; set; }
}
