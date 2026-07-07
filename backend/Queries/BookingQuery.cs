using appweb.Infrastructure;
using appweb.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace appweb.Queries
{
    public class BookingQuery
    {
        private readonly ApplicationDbContext _context;

        public BookingQuery(ApplicationDbContext context)
        {
            _context = context;
        }

        // Lấy toàn bộ danh sách booking
        public async Task<List<Booking>> GetAllAsync()
        {
            return await _context.Bookings.ToListAsync();
        }

        // Lấy chi tiết booking theo Id
        public async Task<Booking?> GetByIdAsync(Guid id)
        {
            return await _context.Bookings
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        // Lấy danh sách booking theo cấu trúc UserId
        public async Task<List<Booking>> GetByUserIdAsync(Guid userId)
        {
            return await _context.Bookings
                .Where(x => x.UserId == userId)
                .ToListAsync();
        }
    }
}
