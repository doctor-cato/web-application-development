using appweb.Infrastructure;
using appweb.Models;
using Microsoft.EntityFrameworkCore;

namespace appweb.Repositories
{
    public class ShowtimeRepository
    {
        private readonly ApplicationDbContext _context;

        public ShowtimeRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // Lấy toàn bộ danh sách lịch chiếu
        public async Task<List<Showtime>> GetAllAsync()
        {
            return await _context.Showtimes.Include(s => s.Room).ThenInclude(r => r.Cinema).ToListAsync();
        }

        // Lấy chi tiết suất chiếu theo Id kiểu int
        public async Task<Showtime?> GetByIdAsync(Guid id)
        {
            return await _context.Showtimes.Include(s => s.Room).ThenInclude(r => r.Cinema).FirstOrDefaultAsync(s => s.Id == id);
        }

        // Lọc suất chiếu theo MovieId kiểu int
        public async Task<List<Showtime>> GetByMovieIdAsync(Guid movieId)
        {
            return await _context.Showtimes.Include(s => s.Room).ThenInclude(r => r.Cinema).Where(s => s.MovieId == movieId).ToListAsync();
        }

        // Tạo lịch chiếu mới
        public async Task AddAsync(Showtime showtime)
        {
            await _context.Showtimes.AddAsync(showtime);
            await _context.SaveChangesAsync();
        }

        // Cập nhật lịch chiếu
        public async Task UpdateAsync(Guid id, Showtime showtime)
        {
            _context.Showtimes.Update(showtime);
            await _context.SaveChangesAsync();
        }

        // Xóa lịch chiếu theo Id kiểu int
        public async Task DeleteAsync(Guid id)
        {
            var showtime = await GetByIdAsync(id);
            if (showtime != null)
            {
                _context.Showtimes.Remove(showtime);
                await _context.SaveChangesAsync();
            }
        }
    }
}
