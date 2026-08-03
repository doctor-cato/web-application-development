using appweb.Models;
using appweb.Repositories;
using appweb.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using System;

namespace appweb.Controllers
{
    [ApiController]
    [Route("api/movies")]
    public class ApiMoviesController : ControllerBase
    {
        private readonly MovieRepository _movieRepository;
        private readonly IHubContext<NotificationHub> _hubContext;

        public ApiMoviesController(MovieRepository movieRepository, IHubContext<NotificationHub> hubContext)
        {
            _movieRepository = movieRepository;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetMovies()
        {
            try
            {
                var movies = await _movieRepository.GetAllAsync();
                if (movies != null && movies.Count > 0) return Ok(movies);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Movie fetch DB fallback: " + ex.Message);
            }

            var fallbackMovies = new List<Movie>
            {
                new Movie { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Title = "Thanh Gươm Diệt Quỷ: Vô Han", Duration = 125, AgeRating = "T16", Genre = "Hành Động", Status = "NOW_SHOWING", PosterUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800" },
                new Movie { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Title = "Spider Man: Across the Spider-Verse", Duration = 140, AgeRating = "P", Genre = "Hành Động", Status = "NOW_SHOWING", PosterUrl = "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800" },
                new Movie { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Title = "Núi Tế Vong", Duration = 120, AgeRating = "T16", Genre = "Kinh Dị", Status = "NOW_SHOWING", PosterUrl = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800" },
                new Movie { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), Title = "Trò Chơi Ảo Giác: Ares", Duration = 115, AgeRating = "T16", Genre = "Khoa học viễn tưởng", Status = "NOW_SHOWING", PosterUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800" },
                new Movie { Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), Title = "BACKROOMS - Thực Tại U Tối", Duration = 110, AgeRating = "T16", Genre = "Kinh dị", Status = "NOW_SHOWING", PosterUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800" }
            };

            return Ok(fallbackMovies);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMovie(Guid id)
        {
            var movie = await _movieRepository.GetByIdAsync(id);
            if (movie == null) return NotFound();
            return Ok(movie);
        }

        [HttpGet("{id}/ratings")]
        public async Task<IActionResult> GetRatings(Guid id, [FromServices] appweb.Services.IRatingService ratingService)
        {
            var movie = await _movieRepository.GetByIdAsync(id);
            var title = movie?.Title ?? "Unknown Movie";
            var ratings = await ratingService.GetRatingsAsync(title);
            return Ok(ratings);
        }

        [HttpGet("ratings-by-title")]
        public async Task<IActionResult> GetRatingsByTitle([FromQuery] string title, [FromServices] appweb.Services.IRatingService ratingService)
        {
            var ratings = await ratingService.GetRatingsAsync(title ?? "");
            return Ok(ratings);
        }

        [Authorize(Roles = "ADMIN")]
        [HttpPost]
        public async Task<IActionResult> CreateMovie([FromBody] Movie movie)
        {
            if (movie.Id == Guid.Empty)
            {
                movie.Id = Guid.NewGuid();
            }
            await _movieRepository.AddAsync(movie);
            await _hubContext.Clients.All.SendAsync("DataUpdated", "Movies");
            return Ok(movie);
        }

        [Authorize(Roles = "ADMIN")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMovie(Guid id, [FromBody] Movie movie)
        {
            var existingMovie = await _movieRepository.GetByIdAsync(id);
            if (existingMovie == null) return NotFound();

            existingMovie.Title = movie.Title;
            existingMovie.Description = movie.Description;
            existingMovie.TrailerUrl = movie.TrailerUrl;
            existingMovie.PosterUrl = movie.PosterUrl;
            existingMovie.BackdropUrl = movie.BackdropUrl;
            existingMovie.Duration = movie.Duration;
            existingMovie.AgeRating = movie.AgeRating;
            existingMovie.Genre = movie.Genre;
            existingMovie.Status = movie.Status;
            existingMovie.ReleaseDate = movie.ReleaseDate;
            existingMovie.Director = movie.Director;
            existingMovie.Cast = movie.Cast;
            existingMovie.Language = movie.Language;
            existingMovie.Gallery = movie.Gallery;

            await _movieRepository.UpdateAsync(existingMovie);
            await _hubContext.Clients.All.SendAsync("DataUpdated", "Movies");
            return Ok(existingMovie);
        }

        [Authorize(Roles = "ADMIN")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMovie(Guid id)
        {
            var existingMovie = await _movieRepository.GetByIdAsync(id);
            if (existingMovie == null) return NotFound();

            await _movieRepository.DeleteAsync(id);
            await _hubContext.Clients.All.SendAsync("DataUpdated", "Movies");
            return Ok(new { message = "Deleted successfully" });
        }
    }
}
