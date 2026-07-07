using System;
using System.Collections.Generic;

namespace appweb.Models;

public partial class BookingDetail
{
    public Guid Id { get; set; }

    public Guid? BookingId { get; set; }

    public Guid? ShowtimeId { get; set; }

    public Guid? SeatId { get; set; }

    public decimal Price { get; set; }

    public virtual Booking? Booking { get; set; }

    public virtual Seat? Seat { get; set; }

    public virtual Showtime? Showtime { get; set; }
}

