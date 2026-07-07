using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace appweb.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("user_id")]
        public Guid UserId { get; set; } = Guid.NewGuid();

        [NotMapped]
        [System.Text.Json.Serialization.JsonIgnore]
        public Guid Id { get => UserId; set => UserId = value; }

        [Column("full_name")]
        public string Fullname { get; set; } = string.Empty;

        [NotMapped]
        [System.Text.Json.Serialization.JsonIgnore]
        public string FullName { get => Fullname; set => Fullname = value; }

        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("phone_number")]
        public string Phone { get; set; } = string.Empty;

        [Column("password_hash")]
        public string Password { get; set; } = string.Empty;

        [Column("role")]
        public string Role { get; set; } = "CUSTOMER";

        [Column("is_verified_otp")]
        public bool IsVerifiedOtp { get; set; } = false;

        [Column("avatar_url")]
        public string? AvatarUrl { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        [Column("date_of_birth")]
        public DateTime? DateOfBirth { get; set; }

        [Column("gender")]
        public string? Gender { get; set; }

        // OTP Fields (Add columns to DB)
        [Column("otp_code")]
        public string? OtpCode { get; set; }

        [Column("otp_expiry_time")]
        public DateTime? OtpExpiryTime { get; set; }

        [Column("vip_plan")]
        public string? VipPlan { get; set; }

        public List<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
