using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace appweb.Models
{
    [Table("settings")]
    public class Setting
    {
        [Key]
        [Column("key")]
        [MaxLength(100)]
        public string Key { get; set; } = string.Empty;

        [Column("value")]
        public string Value { get; set; } = string.Empty;
    }
}
