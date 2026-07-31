using System;
using System.Collections.Generic;

namespace appweb.Models;

public partial class Showtime
{
    public Guid Id { get; set; }

    public Guid? MovieId { get; set; }

    public Guid? RoomId { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    [System.ComponentModel.DataAnnotations.Schema.Column("cinema_id")]
    public string? CinemaId { get; set; }

    [System.ComponentModel.DataAnnotations.Schema.Column("cinema_name")]
    public string? CinemaName { get; set; }

    [System.ComponentModel.DataAnnotations.Schema.Column("room_name")]
    public string? RoomName { get; set; }

    [System.ComponentModel.DataAnnotations.Schema.Column("movie_title")]
    public string? MovieTitle { get; set; }

    [System.ComponentModel.DataAnnotations.Schema.Column(TypeName = "decimal(18,2)")]
    public decimal TicketPrice { get; set; }
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();

    [System.Text.Json.Serialization.JsonIgnore]
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual Movie? Movie { get; set; }

    public virtual Room? Room { get; set; }
}

