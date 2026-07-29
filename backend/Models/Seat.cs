using System;
using System.Collections.Generic;

namespace appweb.Models;

public partial class Seat
{
    public Guid Id { get; set; }

    public Guid? RoomId { get; set; }

    public string SeatRow { get; set; } = null!;

    public int SeatNumber { get; set; }

    public string? SeatType { get; set; }

    public string Status { get; set; } = "Available"; // Available, Held, Booked
    
    public string? HeldByUserId { get; set; }
    
    public DateTime? HeldUntil { get; set; }
    
    [System.ComponentModel.DataAnnotations.Timestamp]
    public byte[]? RowVersion { get; set; }

    public virtual ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();

    public virtual Room? Room { get; set; }
}

