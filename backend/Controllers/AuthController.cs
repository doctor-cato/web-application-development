using appweb.DTOs.Auth;
using appweb.Models;
using appweb.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;

namespace appweb.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserRepository _userRepository;
        private readonly Microsoft.AspNetCore.Hosting.IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;

        public AuthController(UserRepository userRepository, Microsoft.AspNetCore.Hosting.IWebHostEnvironment environment, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _environment = environment;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingUser = await _userRepository.GetByEmailAsync(model.Email);
            if (existingUser != null)
                return BadRequest(new { message = "Email này đã được sử dụng." });

            // Kiểm tra trùng số điện thoại
            if (!string.IsNullOrEmpty(model.Phone))
            {
                var existingPhone = await _userRepository.GetByPhoneAsync(model.Phone);
                if (existingPhone != null)
                    return BadRequest(new { message = "Số điện thoại này đã được sử dụng." });
            }

            var user = new User
            {
                Fullname = model.Name,
                Email = model.Email,
                Phone = model.Phone ?? string.Empty,
                DateOfBirth = model.DateOfBirth,
                Gender = model.Gender,
                Password = model.Password, // Nên hash mật khẩu thực tế
                Role = "CUSTOMER"
            };

            try
            {
                await _userRepository.AddAsync(user);
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
            {
                // Bắt lỗi UNIQUE constraint violation và trả về thông báo thân thiện
                var innerMessage = ex.InnerException?.Message ?? ex.Message;
                if (innerMessage.Contains("phone", StringComparison.OrdinalIgnoreCase) || innerMessage.Contains("UQ__users__A1936A6B", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new { message = "Số điện thoại này đã được sử dụng." });
                }
                if (innerMessage.Contains("email", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new { message = "Email này đã được sử dụng." });
                }
                return BadRequest(new { message = "Đã xảy ra lỗi khi tạo tài khoản. Vui lòng thử lại." });
            }

            return Ok(new { message = "Đăng ký thành công", user = new { user.Email, user.Fullname } });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userRepository.CheckLoginAsync(model.Email, model.Password);

            if (user == null)
                return Unauthorized(new { message = "Tài khoản hoặc mật khẩu không chính xác." });

            // Trả về token hoặc cookie thực tế, ở đây trả về json đơn giản cho Frontend JS dùng
            return Ok(new { 
                message = "Đăng nhập thành công", 
                user = new { 
                    email = user.Email, 
                    fullname = user.Fullname, 
                    phone = user.Phone,
                    dateOfBirth = user.DateOfBirth,
                    gender = user.Gender,
                    role = user.Role,
                    avatar = user.AvatarUrl
                } 
            });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userRepository.GetByEmailAsync(model.Email);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy tài khoản với email này." });

            // Sinh mã OTP 6 số
            Random rand = new Random();
            string otp = rand.Next(100000, 999999).ToString();

            // Lưu vào DB
            user.OtpCode = otp;
            user.OtpExpiryTime = DateTime.Now.AddMinutes(5); // Hết hạn sau 5 phút
            await _userRepository.UpdateAsync(user);

            // Gửi email giả lập ra màn hình Console
            Console.WriteLine($"\n========================================");
            Console.WriteLine($"MÃ OTP GỬI TỚI EMAIL {model.Email}: {otp}");
            Console.WriteLine($"========================================\n");

            // Gửi email thật qua SMTP
            try
            {
                var smtpSettings = _configuration.GetSection("SmtpSettings");
                var senderEmail = smtpSettings["SenderEmail"];
                var password = smtpSettings["Password"];
                
                if (!string.IsNullOrEmpty(senderEmail) && senderEmail != "YOUR_GMAIL_HERE@gmail.com")
                {
                    var client = new SmtpClient(smtpSettings["Server"], int.Parse(smtpSettings["Port"]))
                    {
                        Credentials = new NetworkCredential(smtpSettings["Username"], password),
                        EnableSsl = true
                    };
                    
                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(senderEmail, smtpSettings["SenderName"]),
                        Subject = "Mã xác nhận đặt lại mật khẩu - 3HD2K Cinema",
                        Body = $"Xin chào,\n\nMã OTP để đặt lại mật khẩu của bạn là: {otp}\n\nMã này sẽ hết hạn sau 5 phút.\n\nTrân trọng,\nĐội ngũ 3HD2K Cinema.",
                        IsBodyHtml = false,
                    };
                    mailMessage.To.Add(model.Email);
                    
                    await client.SendMailAsync(mailMessage);
                    Console.WriteLine("Đã gửi email thật thành công qua SMTP.");
                }
                else
                {
                    Console.WriteLine("SMTP chưa được cấu hình, chỉ in OTP ra console.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi khi gửi email SMTP: " + ex.Message);
            }

            return Ok(new { message = "Mã OTP đã được gửi tới email của bạn (Vui lòng kiểm tra màn hình dòng lệnh Backend)." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userRepository.GetByEmailAsync(model.Email);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy tài khoản." });

            // Kiểm tra OTP hợp lệ
            if (user.OtpCode != model.OtpCode)
                return BadRequest(new { message = "Mã OTP không chính xác." });

            if (user.OtpExpiryTime < DateTime.Now)
                return BadRequest(new { message = "Mã OTP đã hết hạn." });

            // Cập nhật mật khẩu mới
            user.Password = model.NewPassword;
            user.OtpCode = null;
            user.OtpExpiryTime = null;
            await _userRepository.UpdateAsync(user);

            return Ok(new { message = "Cập nhật mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới." });
        }

        [HttpPost("upgrade-vip")]
        public async Task<IActionResult> UpgradeVip([FromBody] UpgradeVipDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userRepository.GetByEmailAsync(model.Email);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy tài khoản với email này." });

            user.Role = "VIP";
            user.VipPlan = model.Plan;
            
            await _userRepository.UpdateAsync(user);

            return Ok(new { message = "Nâng cấp VIP thành công." });
        }

        [HttpPost("update-avatar")]
        public async Task<IActionResult> UpdateAvatar([FromForm] string email, IFormFile file)
        {
            if (string.IsNullOrEmpty(email) || file == null || file.Length == 0)
                return BadRequest(new { message = "Thiếu thông tin email hoặc file ảnh." });

            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng." });

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            if (!System.Linq.Enumerable.Contains(allowedExtensions, extension))
                return BadRequest(new { message = "Định dạng ảnh không hợp lệ." });

            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "images");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + DateTime.Now.Ticks + extension;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            var avatarUrl = $"/uploads/images/{uniqueFileName}";
            user.AvatarUrl = avatarUrl;
            await _userRepository.UpdateAsync(user);

            return Ok(new { message = "Cập nhật ảnh đại diện thành công", avatarUrl });
        }
    }
}
