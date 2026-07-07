using System;
using System.Collections.Generic;

namespace appweb.Models;

public partial class Cinema
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string Address { get; set; } = null!;

    public string City { get; set; } = null!;

    public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();
}

