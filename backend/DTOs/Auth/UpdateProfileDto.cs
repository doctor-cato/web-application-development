using System;

namespace appweb.DTOs.Auth
{
    public class UpdateProfileDto
    {
        public string? Email { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Fullname { get; set; }
    }
}
