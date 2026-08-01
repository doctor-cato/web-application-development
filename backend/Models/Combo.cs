using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace appweb.Models
{
    [Table("combos")]
    public class Combo
    {
        [Key]
        [Column("id")]
        public string Id { get; set; } = string.Empty;

        [Required]
        [Column("name")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        public string Desc { get; set; } = string.Empty;

        [Column("price", TypeName = "decimal(10, 2)")]
        public decimal Price { get; set; }

        [Column("stock")]
        public int Stock { get; set; }

        [Column("image_url")]
        public string Image { get; set; } = string.Empty;

        [Column("category")]
        [MaxLength(100)]
        public string Category { get; set; } = "Combo";
    }
}
