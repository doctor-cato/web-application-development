using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace appweb.Models
{
    [Table("refresh_tokens")]
    public class RefreshToken
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Column("token")]
        public string Token { get; set; } = string.Empty;

        [Column("jwt_id")]
        public string JwtId { get; set; } = string.Empty;

        [Column("is_used")]
        public bool IsUsed { get; set; } = false;

        [Column("is_revoked")]
        public bool IsRevoked { get; set; } = false;

        [Column("user_id")]
        public Guid UserId { get; set; }

        [Column("added_date")]
        public DateTime AddedDate { get; set; } = DateTime.UtcNow;

        [Column("expiry_date")]
        public DateTime ExpiryDate { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
    }
}
