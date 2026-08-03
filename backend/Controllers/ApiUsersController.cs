using appweb.Models;
using appweb.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace appweb.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "ADMIN")]
    public class ApiUsersController : ControllerBase
    {
        private readonly UserRepository _userRepository;

        public ApiUsersController(UserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [AllowAnonymous]
        [HttpGet("lookup")]
        public async Task<IActionResult> LookupUser([FromQuery] string? phone, [FromQuery] string? email)
        {
            if (string.IsNullOrWhiteSpace(phone) && string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new { message = "Vui lòng cung cấp SĐT hoặc Email" });
            }

            try
            {
                var users = await _userRepository.GetAllAsync();
                var user = users.FirstOrDefault(u =>
                    (!string.IsNullOrEmpty(phone) && u.Phone == phone) ||
                    (!string.IsNullOrEmpty(email) && u.Email.Equals(email, StringComparison.OrdinalIgnoreCase))
                );

                if (user == null) return NotFound(new { message = "Khách hàng chưa đăng ký VIP" });

                return Ok(new
                {
                    id = user.UserId,
                    fullname = user.Fullname,
                    name = user.Fullname,
                    email = user.Email,
                    phone = user.Phone,
                    role = user.Role ?? "CUSTOMER",
                    points = user.Points,
                    vipPlan = user.VipPlan ?? "STANDARD"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userRepository.GetAllAsync();
            var result = users.Select(u => new
            {
                id = u.UserId,
                fullname = u.Fullname,
                email = u.Email,
                phone = u.Phone,
                role = u.Role ?? "CUSTOMER",
                dateOfBirth = u.DateOfBirth,
                gender = u.Gender,
                avatar = u.AvatarUrl,
                points = u.Points,
                createdAt = u.CreatedAt,
                isLocked = u.LockoutEnd.HasValue && u.LockoutEnd.Value > DateTime.UtcNow
            });
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(Guid id)
        {
            var u = await _userRepository.GetByIdAsync(id);
            if (u == null) return NotFound();
            return Ok(new
            {
                id = u.UserId,
                fullname = u.Fullname,
                email = u.Email,
                phone = u.Phone,
                role = u.Role ?? "CUSTOMER",
                dateOfBirth = u.DateOfBirth,
                gender = u.Gender,
                avatar = u.AvatarUrl,
                points = u.Points,
                createdAt = u.CreatedAt,
                isLocked = u.LockoutEnd.HasValue && u.LockoutEnd.Value > DateTime.UtcNow
            });
        }

        private static readonly string[] ValidRoles = { "ADMIN", "STAFF", "CUSTOMER", "VIP" };

        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UserRoleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Role) || !ValidRoles.Contains(dto.Role.ToUpper()))
                return BadRequest(new { message = $"Role không hợp lệ. Chỉ chấp nhận: {string.Join(", ", ValidRoles)}" });

            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return NotFound(new { message = "User not found" });

            user.Role = dto.Role.ToUpper();
            await _userRepository.UpdateAsync(user);
            return Ok(new { message = "Role updated successfully", role = user.Role });
        }

        [HttpPut("{id}/toggle-lock")]
        public async Task<IActionResult> ToggleLockUser(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return NotFound(new { message = "User not found" });

            bool isCurrentlyLocked = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow;
            if (isCurrentlyLocked)
            {
                user.LockoutEnd = null;
            }
            else
            {
                user.LockoutEnd = DateTime.UtcNow.AddYears(100);
            }

            await _userRepository.UpdateAsync(user);
            return Ok(new { message = isCurrentlyLocked ? "Tài khoản đã được mở khóa" : "Tài khoản đã bị khóa", isLocked = !isCurrentlyLocked });
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest(new { message = "Vui lòng nhập Email" });

            var existing = await _userRepository.GetByEmailAsync(dto.Email);
            if (existing != null)
                return BadRequest(new { message = "Email này đã được đăng ký" });

            var user = new User
            {
                Fullname = dto.Fullname ?? dto.Email.Split('@')[0],
                Email = dto.Email.Trim().ToLower(),
                Phone = dto.Phone?.Trim() ?? string.Empty,
                Role = (string.IsNullOrWhiteSpace(dto.Role) ? "CUSTOMER" : dto.Role).ToUpper(),
                Password = BCrypt.Net.BCrypt.HashPassword(string.IsNullOrWhiteSpace(dto.Password) ? "123456" : dto.Password),
                IsVerifiedOtp = true,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user);
            return Ok(new { message = "Thêm người dùng thành công", id = user.UserId });
        }

        [AllowAnonymous]
        [HttpPost("add-points")]
        public async Task<IActionResult> AddUserPoints([FromBody] AddPointsDto dto)
        {
            if (dto == null || (string.IsNullOrWhiteSpace(dto.Phone) && string.IsNullOrWhiteSpace(dto.Email)))
            {
                return BadRequest(new { message = "Vui lòng cung cấp SĐT hoặc Email khách hàng" });
            }

            var allUsers = await _userRepository.GetAllAsync();
            var user = allUsers.FirstOrDefault(u =>
                (!string.IsNullOrEmpty(dto.Phone) && u.Phone == dto.Phone) ||
                (!string.IsNullOrEmpty(dto.Email) && u.Email.Equals(dto.Email, StringComparison.OrdinalIgnoreCase))
            );

            if (user == null)
            {
                return NotFound(new { message = "Khách hàng không tồn tại trong hệ thống API" });
            }

            user.Points += dto.Points;
            await _userRepository.UpdateAsync(user);

            return Ok(new { message = "Cộng điểm VIP thành công", userId = user.UserId, pointsAdded = dto.Points, totalPoints = user.Points });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return NotFound();

            await _userRepository.DeleteAsync(id);
            return Ok(new { message = "User deleted successfully" });
        }
    }

    public class UserRoleDto
    {
        public string Role { get; set; } = "CUSTOMER";
    }

    public class CreateUserDto
    {
        public string Fullname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Role { get; set; }
        public string? Password { get; set; }
    }

    public class AddPointsDto
    {
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public int Points { get; set; }
    }
}
