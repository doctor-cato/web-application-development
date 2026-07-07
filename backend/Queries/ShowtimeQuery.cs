using appweb.Infrastructure;
using appweb.Models;
using Microsoft.EntityFrameworkCore;

namespace appweb.Queries
{
    public class ShowtimeQuery
    {
        private readonly ApplicationDbContext _context;

        public ShowtimeQuery(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Showtime>> GetAllAsync()
        {
            return await _context.Showtimes.ToListAsync();
        }

        public async Task<List<Showtime>> GetByMovieIdAsync(Guid movieId)
        {
            return await _context.Showtimes
                .Where(x => x.MovieId == movieId)
                .ToListAsync();
        }

        public async Task<List<Showtime>> GetByDateAsync(DateTime date)
        {
            return await _context.Showtimes
                .Where(x => x.StartTime.Date == date.Date)
                .ToListAsync();
        }
    }
}
