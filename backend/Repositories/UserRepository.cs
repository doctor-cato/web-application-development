using appweb.Infrastructure;
using appweb.Models;
using Microsoft.EntityFrameworkCore;

namespace appweb.Repositories
{
    public class UserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return null;
            var normalizedEmail = email.Trim().ToLower();
            return await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        }

        public async Task<User?> GetByPhoneAsync(string phone)
        {
            if (string.IsNullOrWhiteSpace(phone)) return null;
            var normalizedPhone = phone.Trim();
            return await _context.Users.FirstOrDefaultAsync(u => u.Phone == normalizedPhone);
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public async Task<User?> CheckLoginAsync(string email, string? password = null)
        {
            var user = await GetByEmailAsync(email);
            if (user != null && !string.IsNullOrEmpty(password))
            {
                bool isValid = false;
                try
                {
                    if (user.Password.StartsWith("$2a$") || user.Password.StartsWith("$2b$") || user.Password.StartsWith("$2y$"))
                        isValid = BCrypt.Net.BCrypt.Verify(password, user.Password);
                    else
                        isValid = (user.Password == password);
                }
                catch
                {
                    isValid = (user.Password == password);
                }
                if (!isValid) return null;
            }
            return user;
        }

        public async Task<List<User>> GetAllAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var user = await GetByIdAsync(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
        }
    }
}