using appweb.DTOs.Auth;
using appweb.Models;
using appweb.Repositories;
using appweb.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace appweb.Controllers
{
    public class VerifyEmailDto
    {
        public string Email { get; set; } = string.Empty;
        public string OtpCode { get; set; } = string.Empty;
    }

    public class TokenRequestDto
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserRepository _userRepository;
        private readonly Microsoft.AspNetCore.Hosting.IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;

        public AuthController(UserRepository userRepository, Microsoft.AspNetCore.Hosting.IWebHostEnvironment environment, IConfiguration configuration, ApplicationDbContext context)
        {
            _userRepository = userRepository;
            _environment = environment;
            _configuration = configuration;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            
            var smtpSettings = _configuration.GetSection("SmtpSettings");
            var senderEmail = smtpSettings["SenderEmail"];
            var resendApiKey = smtpSettings["ResendApiKey"];
            bool isSmtpConfigured = (!string.IsNullOrEmpty(senderEmail) && senderEmail != "YOUR_GMAIL_HERE@gmail.com") || !string.IsNullOrEmpty(resendApiKey);

            var user = new User
            {
                Fullname = model.Name,
                Email = model.Email,
                Phone = model.Phone ?? string.Empty,
                DateOfBirth = model.DateOfBirth,
                Gender = model.Gender,
                Password = BCrypt.Net.BCrypt.HashPassword(model.Password),
                Role = "CUSTOMER",
                IsVerifiedOtp = !isSmtpConfigured 
            };

            if (isSmtpConfigured)
            {
                string otp = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
                user.OtpCode = otp;
                user.OtpExpiryTime = DateTime.UtcNow.AddMinutes(5);
            }

            try
            {
                await _userRepository.AddAsync(user);
                if (isSmtpConfigured)
                {
                    await SendEmailAsync(model.Email, "Xác nhận tài khoản - 3HD2K Cinema", $"Xin chào,\n\nMã OTP kích hoạt tài khoản của bạn là: {user.OtpCode}\n\nMã này sẽ hết hạn sau 5 phút.\n\nTrân trọng,\nĐội ngũ 3HD2K Cinema.");
                }
            }
            catch (DbUpdateException ex)
            {
                var innerMessage = ex.InnerException?.Message ?? ex.Message;
                if (innerMessage.Contains("phone", StringComparison.OrdinalIgnoreCase) || innerMessage.Contains("IX_users_phone", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new { message = "Số điện thoại này đã được sử dụng." });
                }
                if (innerMessage.Contains("email", StringComparison.OrdinalIgnoreCase) || innerMessage.Contains("IX_users_email", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new { message = "Email này đã được sử dụng." });
                }
                return BadRequest(new { message = "Đã xảy ra lỗi khi tạo tài khoản: " + innerMessage });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi kết nối hoặc xử lý dữ liệu: " + ex.Message });
            }

            if (isSmtpConfigured)
            {
                return Ok(new { message = "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác nhận.", requireOtp = true, user = new { user.Email, user.Fullname } });
            }
            return Ok(new { message = "Đăng ký thành công! Bạn có thể đăng nhập ngay.", requireOtp = false, user = new { user.Email, user.Fullname } });
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto model)
        {
            var user = await _userRepository.GetByEmailAsync(model.Email);
            if (user == null) return NotFound(new { message = "Không tìm thấy tài khoản." });

            if (user.IsVerifiedOtp) return BadRequest(new { message = "Tài khoản đã được xác nhận." });
            if (user.OtpCode != model.OtpCode) return BadRequest(new { message = "Mã OTP không chính xác." });
            if (user.OtpExpiryTime < DateTime.UtcNow) return BadRequest(new { message = "Mã OTP đã hết hạn." });

            user.IsVerifiedOtp = true;
            user.OtpCode = null;
            user.OtpExpiryTime = null;
            await _userRepository.UpdateAsync(user);

            return Ok(new { message = "Xác nhận email thành công. Bạn có thể đăng nhập ngay bây giờ." });
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            if (model == null || string.IsNullOrEmpty(model.CurrentPassword) || string.IsNullOrEmpty(model.NewPassword))
                return BadRequest(new { message = "Dữ liệu không hợp lệ." });

            var emailClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;
            if (string.IsNullOrEmpty(emailClaim))
                return Unauthorized(new { message = "Vui lòng đăng nhập để thực hiện chức năng này." });

            var user = await _userRepository.GetByEmailAsync(emailClaim);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy tài khoản." });

            bool isPasswordValid = false;
            if (user.Password.StartsWith("$2a$") || user.Password.StartsWith("$2b$") || user.Password.StartsWith("$2y$"))
            {
                isPasswordValid = BCrypt.Net.BCrypt.Verify(model.CurrentPassword, user.Password);
            }
            else if (user.Password == model.CurrentPassword)
            {
                isPasswordValid = true;
            }

            if (!isPasswordValid)
                return BadRequest(new { message = "Mật khẩu hiện tại không chính xác." });

            user.Password = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
            await _userRepository.UpdateAsync(user);

            return Ok(new { message = "Đổi mật khẩu thành công." });
        }

        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOtp([FromBody] ForgotPasswordDto model)
        {
            var user = await _userRepository.GetByEmailAsync(model.Email);
            if (user == null) return NotFound(new { message = "Không tìm thấy tài khoản." });

            if (user.IsVerifiedOtp) return BadRequest(new { message = "Tài khoản đã được xác nhận." });

            if (user.LastOtpRequestTime.HasValue && (DateTime.UtcNow - user.LastOtpRequestTime.Value).TotalSeconds < 60)
            {
                return StatusCode(StatusCodes.Status429TooManyRequests, new { message = "Vui lòng chờ 60 giây trước khi yêu cầu mã mới." });
            }

            string otp = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
            user.OtpCode = otp;
            user.OtpExpiryTime = DateTime.UtcNow.AddMinutes(5);
            user.LastOtpRequestTime = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            await SendEmailAsync(model.Email, "Mã xác nhận tài khoản - 3HD2K Cinema", $"Xin chào,\n\nMã OTP mới của bạn là: {otp}\n\nMã này sẽ hết hạn sau 5 phút.\n\nTrân trọng,\nĐội ngũ 3HD2K Cinema.");

            return Ok(new { message = "Đã gửi lại mã OTP thành công." });
        }

        [EnableRateLimiting("loginPolicy")]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var email = model.Email?.Trim();
            var user = await _userRepository.GetByEmailAsync(email ?? string.Empty);

            if (user == null)
                return Unauthorized(new { message = "Tài khoản hoặc mật khẩu không chính xác." });

            if (user.LockoutEnd.HasValue && user.LockoutEnd > DateTime.UtcNow)
                return StatusCode(StatusCodes.Status429TooManyRequests, new { message = "Tài khoản của bạn đang bị khóa tạm thời. Vui lòng thử lại sau." });


            bool isPasswordValid = false;
            if (!string.IsNullOrEmpty(user.Password))
            {
                if (user.Password.StartsWith("$2a$") || user.Password.StartsWith("$2b$") || user.Password.StartsWith("$2y$"))
                {
                    isPasswordValid = BCrypt.Net.BCrypt.Verify(model.Password, user.Password);
                }
                else if (user.Password == model.Password)
                {
                    isPasswordValid = true;
                    
                    user.Password = BCrypt.Net.BCrypt.HashPassword(model.Password);
                    await _userRepository.UpdateAsync(user);
                }
            }

            if (!isPasswordValid)
            {
                user.AccessFailedCount += 1;
                if (user.AccessFailedCount >= 5)
                {
                    user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
                }
                await _userRepository.UpdateAsync(user);
                return Unauthorized(new { message = "Tài khoản hoặc mật khẩu không chính xác." });
            }

            user.AccessFailedCount = 0;
            user.LockoutEnd = null;

            if (user.Role == "ADMIN" && user.IsTwoFactorEnabled)
            {
                user.IsTwoFactorEnabled = false;
            }

            await _userRepository.UpdateAsync(user);

            if (user.IsTwoFactorEnabled)
            {
                string otp = System.Security.Cryptography.RandomNumberGenerator.GetInt32(100000, 999999).ToString();
                user.OtpCode = otp;
                user.OtpExpiryTime = DateTime.UtcNow.AddMinutes(5);
                await _userRepository.UpdateAsync(user);

                await SendEmailAsync(user.Email, "Mã xác minh 2 bước (2FA) - 3HD2K Cinema", $"Xin chào,\n\nMã OTP xác minh 2 bước của bạn là: {otp}\n\nMã này sẽ hết hạn sau 5 phút.\n\nTrân trọng,\nĐội ngũ 3HD2K Cinema.");

                return Ok(new { require2fa = true, message = "Vui lòng nhập mã OTP để hoàn tất đăng nhập.", email = user.Email });
            }

            var jwtId = Guid.NewGuid().ToString();
            var token = GenerateJwtToken(user, jwtId);
            var refreshToken = GenerateRefreshToken();

            var rt = new RefreshToken
            {
                JwtId = jwtId,
                IsUsed = false,
                IsRevoked = false,
                UserId = user.UserId,
                AddedDate = DateTime.UtcNow,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                Token = refreshToken
            };

            await _context.RefreshTokens.AddAsync(rt);
            await _context.SaveChangesAsync();

            return Ok(new {
                message = "Đăng nhập thành công",
                token,
                refreshToken,
                user = new {
                    email = user.Email,
                    fullname = user.Fullname,
                    phone = user.Phone,
                    dateOfBirth = user.DateOfBirth,
                    gender = user.Gender,
                    role = user.Role,
                    vipPlan = user.VipPlan,
                    avatar = user.AvatarUrl,
                    isTwoFactorEnabled = user.IsTwoFactorEnabled
                }
            });
        }

        [HttpPost("verify-2fa-login")]
        public async Task<IActionResult> Verify2faLogin([FromBody] VerifyEmailDto model)
        {
            var user = await _userRepository.GetByEmailAsync(model.Email);
            if (user == null) return Unauthorized(new { message = "Không tìm thấy người dùng." });

            if (user.OtpCode != model.OtpCode) return BadRequest(new { message = "Mã OTP không chính xác." });
            if (user.OtpExpiryTime < DateTime.UtcNow) return BadRequest(new { message = "Mã OTP đã hết hạn." });

            user.OtpCode = null;
            user.OtpExpiryTime = null;
            await _userRepository.UpdateAsync(user);

            var jwtId = Guid.NewGuid().ToString();
            var token = GenerateJwtToken(user, jwtId);
            var refreshToken = GenerateRefreshToken();

            var rt = new RefreshToken
            {
                JwtId = jwtId,
                IsUsed = false,
                IsRevoked = false,
                UserId = user.UserId,
                AddedDate = DateTime.UtcNow,
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                Token = refreshToken
            };

            await _context.RefreshTokens.AddAsync(rt);
            await _context.SaveChangesAsync();

            return Ok(new {
                message = "Đăng nhập thành công",
                token,
                refreshToken,
                user = new {
                    email = user.Email,
                    fullname = user.Fullname,
                    phone = user.Phone,
                    dateOfBirth = user.DateOfBirth,
                    gender = user.Gender,
                    role = user.Role,
                    vipPlan = user.VipPlan,
                    avatar = user.AvatarUrl,
                    isTwoFactorEnabled = user.IsTwoFactorEnabled
                }
            });
        }

        [Authorize]
        [HttpPut("toggle-2fa")]
        public async Task<IActionResult> Toggle2fa([FromBody] Toggle2faDto model)
        {
            var email = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
                return Unauthorized();

            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null) return NotFound("User not found");

            user.IsTwoFactorEnabled = model.IsEnabled;
            await _userRepository.UpdateAsync(user);

            return Ok(new { message = "Đã cập nhật trạng thái Xác minh hai bước.", isTwoFactorEnabled = user.IsTwoFactorEnabled });
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] TokenRequestDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var jwtKey = _configuration["Jwt:Key"]!;
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = false, 
                ValidateIssuerSigningKey = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidAudience = _configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                var principal = tokenHandler.ValidateToken(model.Token, tokenValidationParameters, out SecurityToken securityToken);
                var jwtSecurityToken = securityToken as JwtSecurityToken;
                if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                    return Unauthorized(new { message = "Invalid token" });

                var jti = principal.Claims.SingleOrDefault(x => x.Type == JwtRegisteredClaimNames.Jti)?.Value;
                
                var storedRefreshToken = await _context.RefreshTokens.FirstOrDefaultAsync(x => x.Token == model.RefreshToken);
                if (storedRefreshToken == null) return Unauthorized(new { message = "Refresh token doesn't exist" });
                
                if (DateTime.UtcNow > storedRefreshToken.ExpiryDate) return Unauthorized(new { message = "Refresh token has expired" });
                if (storedRefreshToken.IsUsed) return Unauthorized(new { message = "Refresh token has been used" });
                if (storedRefreshToken.IsRevoked) return Unauthorized(new { message = "Refresh token has been revoked" });
                if (storedRefreshToken.JwtId != jti) return Unauthorized(new { message = "Refresh token does not match JWT" });

                storedRefreshToken.IsUsed = true;
                _context.RefreshTokens.Update(storedRefreshToken);
                await _context.SaveChangesAsync();

                var user = await _userRepository.GetByIdAsync(storedRefreshToken.UserId);
                if (user == null) return Unauthorized();

                var newJwtId = Guid.NewGuid().ToString();
                var newToken = GenerateJwtToken(user, newJwtId);
                var newRefreshToken = GenerateRefreshToken();

                var rt = new RefreshToken
                {
                    JwtId = newJwtId,
                    IsUsed = false,
                    IsRevoked = false,
                    UserId = user.UserId,
                    AddedDate = DateTime.UtcNow,
                    ExpiryDate = DateTime.UtcNow.AddDays(7),
                    Token = newRefreshToken
                };
                await _context.RefreshTokens.AddAsync(rt);
                await _context.SaveChangesAsync();

                return Ok(new { token = newToken, refreshToken = newRefreshToken });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = "Invalid token configuration: " + ex.Message });
            }
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] TokenRequestDto model)
        {
            if (!string.IsNullOrEmpty(model.RefreshToken))
            {
                var storedRefreshToken = await _context.RefreshTokens.FirstOrDefaultAsync(x => x.Token == model.RefreshToken);
                if (storedRefreshToken != null)
                {
                    storedRefreshToken.IsRevoked = true;
                    _context.RefreshTokens.Update(storedRefreshToken);
                    await _context.SaveChangesAsync();
                }
            }
            return Ok(new { message = "Đăng xuất thành công" });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUserProfile()
        {
            var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;
            if (string.IsNullOrEmpty(emailClaim)) return Unauthorized(new { message = "Không tìm thấy thông tin đăng nhập." });

            var user = await _userRepository.GetByEmailAsync(emailClaim);
            if (user == null) return NotFound(new { message = "Không tìm thấy tài khoản." });

            return Ok(new
            {
                id = user.UserId,
                email = user.Email,
                fullname = user.Fullname,
                name = user.Fullname,
                phone = user.Phone,
                dateOfBirth = user.DateOfBirth,
                gender = user.Gender,
                role = user.Role,
                vipPlan = user.VipPlan,
                avatar = user.AvatarUrl,
                points = user.Points,
                isTwoFactorEnabled = user.IsTwoFactorEnabled
            });
        }

        private string GenerateJwtToken(User user, string jwtId)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role ?? "CUSTOMER"),
                new Claim(JwtRegisteredClaimNames.Jti, jwtId)
            };

            var expireMinutes = int.Parse(_configuration["Jwt:ExpireMinutes"] ?? "30");
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expireMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }

        [EnableRateLimiting("loginPolicy")]
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userRepository.GetByEmailAsync(model.Email);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy tài khoản với email này." });

            if (user.LastOtpRequestTime.HasValue && (DateTime.UtcNow - user.LastOtpRequestTime.Value).TotalSeconds < 60)
            {
                return StatusCode(StatusCodes.Status429TooManyRequests, new { message = "Vui lòng chờ 60 giây trước khi yêu cầu mã mới." });
            }

            string otp = RandomNumberGenerator.GetInt32(100000, 999999).ToString();

            user.OtpCode = otp;
            user.OtpExpiryTime = DateTime.UtcNow.AddMinutes(5);
            user.LastOtpRequestTime = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            await SendEmailAsync(model.Email, "Mã xác nhận đặt lại mật khẩu - 3HD2K Cinema", $"Xin chào,\n\nMã OTP để đặt lại mật khẩu của bạn là: {otp}\n\nMã này sẽ hết hạn sau 5 phút.\n\nTrân trọng,\nĐội ngũ 3HD2K Cinema.");

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

            if (user.OtpCode != model.OtpCode)
                return BadRequest(new { message = "Mã OTP không chính xác." });

            if (user.OtpExpiryTime < DateTime.UtcNow)
                return BadRequest(new { message = "Mã OTP đã hết hạn." });

            user.Password = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
            user.OtpCode = null;
            user.OtpExpiryTime = null;
            await _userRepository.UpdateAsync(user);

            return Ok(new { message = "Cập nhật mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới." });
        }

        [Authorize]
        [HttpPost("upgrade-vip")]
        public async Task<IActionResult> UpgradeVip([FromBody] UpgradeVipDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (User.Identity?.Name != model.Email && !User.IsInRole("ADMIN"))
                return Forbid("Bạn không có quyền nâng cấp tài khoản này.");

            var user = await _userRepository.GetByEmailAsync(model.Email);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy tài khoản với email này." });

            user.Role = "VIP";
            user.VipPlan = model.Plan;

            await _userRepository.UpdateAsync(user);

            return Ok(new { message = "Nâng cấp VIP thành công." });
        }

        [Authorize]
        [HttpPost("update-avatar")]
        public async Task<IActionResult> UpdateAvatar([FromForm] string email, IFormFile file)
        {
            if (string.IsNullOrEmpty(email) || file == null || file.Length == 0)
                return BadRequest(new { message = "Thiếu thông tin email hoặc file ảnh." });

            if (User.Identity?.Name != email && !User.IsInRole("ADMIN"))
                return Forbid("Bạn không có quyền cập nhật ảnh đại diện của tài khoản này.");

            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng." });

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Định dạng ảnh không hợp lệ." });

            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "images");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + DateTime.UtcNow.Ticks + extension;
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

        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto model)
        {
            if (model == null)
                return BadRequest(new { message = "Dữ liệu cập nhật không hợp lệ." });

            string? userEmail = null;

            var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;
            if (!string.IsNullOrEmpty(emailClaim))
            {
                userEmail = emailClaim;
            }
            else if (!string.IsNullOrEmpty(model.Email))
            {
                userEmail = model.Email.Trim().ToLower();
            }

            if (string.IsNullOrEmpty(userEmail))
            {
                return BadRequest(new { message = "Không xác định được tài khoản người dùng." });
            }

            var user = await _userRepository.GetByEmailAsync(userEmail);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy tài khoản người dùng." });
            }

            if (model.DateOfBirth.HasValue)
            {
                user.DateOfBirth = model.DateOfBirth.Value;
            }
            if (!string.IsNullOrWhiteSpace(model.Gender))
            {
                user.Gender = model.Gender;
            }
            if (!string.IsNullOrWhiteSpace(model.Fullname))
            {
                user.Fullname = model.Fullname;
            }

            await _userRepository.UpdateAsync(user);

            return Ok(new
            {
                message = "Cập nhật thông tin thành công.",
                user = new
                {
                    id = user.UserId,
                    fullname = user.Fullname,
                    email = user.Email,
                    phone = user.Phone,
                    dateOfBirth = user.DateOfBirth,
                    gender = user.Gender,
                    avatar = user.AvatarUrl
                }
            });
        }

        private async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                var smtpSettings = _configuration.GetSection("SmtpSettings");
                var senderEmail = smtpSettings["SenderEmail"];
                var password = smtpSettings["Password"];
                var resendApiKey = smtpSettings["ResendApiKey"];
                var senderName = smtpSettings["SenderName"] ?? "3HD2K Cinema";

                bool sentSuccessfully = false;

                if (!string.IsNullOrEmpty(resendApiKey))
                {
                    try
                    {
                        using var httpClient = new HttpClient();
                        httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", resendApiKey);
                        
                        
                        var fromEmail = "onboarding@resend.dev";
                        
                        var payload = new
                        {
                            from = $"{senderName} <{fromEmail}>",
                            to = new[] { toEmail },
                            subject = subject,
                            text = body
                        };

                        var jsonPayload = JsonSerializer.Serialize(payload);
                        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                        var response = await httpClient.PostAsync("https://api.resend.com/emails", content);
                        var responseString = await response.Content.ReadAsStringAsync();

                        if (response.IsSuccessStatusCode)
                        {
                            Console.WriteLine("Đã gửi email thành công qua Resend API.");
                            sentSuccessfully = true;
                        }
                        else
                        {
                            Console.WriteLine($"Lỗi khi gửi email Resend API: {response.StatusCode} - {responseString}. Chuyển sang thử SMTP...");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Resend API Exception: {ex.Message}. Chuyển sang thử SMTP...");
                    }
                }

                if (!sentSuccessfully && !string.IsNullOrEmpty(senderEmail) && senderEmail != "YOUR_GMAIL_HERE@gmail.com")
                {
                    var client = new SmtpClient(smtpSettings["Server"], int.Parse(smtpSettings["Port"] ?? "587"))
                    {
                        Credentials = new NetworkCredential(smtpSettings["Username"], password),
                        EnableSsl = true
                    };

                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(senderEmail, senderName),
                        Subject = subject,
                        Body = body,
                        IsBodyHtml = false,
                    };
                    mailMessage.To.Add(toEmail);

                    await client.SendMailAsync(mailMessage);
                    Console.WriteLine("Đã gửi email thật thành công qua SMTP.");
                    sentSuccessfully = true;
                }

                if (!sentSuccessfully)
                {
                    Console.WriteLine("SMTP/Resend chưa được cấu hình hoặc gặp lỗi. (Mock Email send)");
                    Console.WriteLine($"To: {toEmail}\nSubject: {subject}\nBody: {body}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi khi gửi email: " + ex.Message);
            }
        }
    }
}
