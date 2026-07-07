using appweb.Infrastructure;
using appweb.Models;
using Microsoft.EntityFrameworkCore;

namespace appweb.Queries
{
    public class MovieQuery
    {
        private readonly ApplicationDbContext _context;

        public MovieQuery(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Movie>> GetAllMoviesAsync()
        {
            return await _context.Movies.ToListAsync();
        }

        public async Task<Movie?> GetMovieByIdAsync(Guid id)
        {
            return await _context.Movies
                .FirstOrDefaultAsync(x => x.MovieId == id);
        }

        public async Task<List<Movie>> SearchMovieAsync(string keyword)
        {
            return await _context.Movies
                .Where(x => x.Title.Contains(keyword))
                .ToListAsync();
        }
    }
}
