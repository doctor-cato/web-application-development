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

        public async Task<List<Showtime>> GetAllAsync()
        {
            return await _context.Showtimes.Include(s => s.Room).ThenInclude(r => r.Cinema).Include(s => s.Movie).ToListAsync();
        }

        public async Task<Showtime?> GetByIdAsync(Guid id)
        {
            return await _context.Showtimes.Include(s => s.Room).ThenInclude(r => r.Cinema).Include(s => s.Movie).FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<List<Showtime>> GetByMovieIdAsync(Guid movieId)
        {
            return await _context.Showtimes.Include(s => s.Room).ThenInclude(r => r.Cinema).Include(s => s.Movie).Where(s => s.MovieId == movieId).ToListAsync();
        }

        public async Task AddAsync(Showtime showtime)
        {
            await _context.Showtimes.AddAsync(showtime);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Guid id, Showtime showtime)
        {
            _context.Showtimes.Update(showtime);
            await _context.SaveChangesAsync();
        }

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
