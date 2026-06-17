using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace appweb.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        // Cầu nối bảo vệ: Giúp các file sửa từ trước gọi .Id vẫn chạy chuẩn
        [NotMapped]
        public int Id { get => UserId; set => UserId = value; }

        // Hệ thống đang gọi chữ 'n' viết thường
        public string Fullname { get; set; } = string.Empty;

        // Cầu nối bảo vệ cho trường FullName viết hoa chữ N
        [NotMapped]
        public string FullName { get => Fullname; set => Fullname = value; }

        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty; // Sửa lỗi thiếu Phone
        public string Role { get; set; } = "Customer";
        public DateTime CreatedAt { get; set; } = DateTime.Now; // Sửa lỗi thiếu CreatedAt

        // Khôi phục liên kết 1-nhiều sang bảng Booking
        public List<Booking> Bookings { get; set; } = new List<Booking>();
    }
}