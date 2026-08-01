using System;
using System.ComponentModel.DataAnnotations;

namespace appweb.Models
{
    public class Voucher
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;
        
        /// <summary>
        /// "PERCENTAGE" or "FIXED_AMOUNT"
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string DiscountType { get; set; } = "PERCENTAGE";
        
        [Required]
        public decimal DiscountValue { get; set; }
        
        public decimal MinOrderAmount { get; set; } = 0;
        
        public decimal? MaxDiscountAmount { get; set; }
        
        public DateTime ExpiryDate { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public int PointsRequired { get; set; } = 0;
    }
}
