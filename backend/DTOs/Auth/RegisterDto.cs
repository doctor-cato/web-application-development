using System.ComponentModel.DataAnnotations;

namespace appweb.DTOs.Auth
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Họ và tên không được để trống")]
        [StringLength(50, ErrorMessage = "Tên không được vượt quá 50 ký tự")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Định dạng Email không hợp lệ")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu phải từ 6 ký tự trở lên")]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;

        [DataType(DataType.Password)]
        [Compare("Password", ErrorMessage = "Mật khẩu xác nhận không trùng khớp")]
        public string ConfirmPassword { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public System.DateTime? DateOfBirth { get; set; }

        public string? Gender { get; set; }
    }

    public class UpgradeVipDto
    {
        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Plan { get; set; } = string.Empty;
    }
}