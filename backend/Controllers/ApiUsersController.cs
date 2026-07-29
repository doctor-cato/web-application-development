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
    public class ApiUsersController : ControllerBase
    {
        private readonly UserRepository _userRepository;

        public ApiUsersController(UserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [Authorize(Roles = "ADMIN")]
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
                avatar = u.AvatarUrl
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
                avatar = u.AvatarUrl
            });
        }

        private static readonly string[] ValidRoles = { "ADMIN", "STAFF", "CUSTOMER", "VIP" };

        [Authorize(Roles = "ADMIN")]
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

        [Authorize(Roles = "ADMIN,STAFF")]
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

            return Ok(new { message = "Cộng điểm VIP thành công", userId = user.UserId, pointsAdded = dto.Points });
        }

        [Authorize(Roles = "ADMIN")]
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

    public class AddPointsDto
    {
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public int Points { get; set; }
    }
}
