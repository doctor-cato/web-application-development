using System;
using System.Collections.Generic;

namespace appweb.Models;

public partial class Room
{
    public Guid Id { get; set; }

    public Guid? CinemaId { get; set; }

    public string Name { get; set; } = null!;

    public int TotalSeats { get; set; }

    public virtual Cinema? Cinema { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    public virtual ICollection<Seat> Seats { get; set; } = new List<Seat>();

    [System.Text.Json.Serialization.JsonIgnore]
    public virtual ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
}

