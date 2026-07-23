using appweb.Models;
using appweb.Repositories;
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
                avatar = u.Avatar
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
                avatar = u.Avatar
            });
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UserRoleDto dto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null) return NotFound(new { message = "User not found" });

            user.Role = dto.Role.ToUpper();
            await _userRepository.UpdateAsync(user);
            return Ok(new { message = "Role updated successfully", role = user.Role });
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
}
