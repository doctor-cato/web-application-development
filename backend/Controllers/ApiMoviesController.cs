using appweb.Models;
using appweb.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace appweb.Controllers
{
    [ApiController]
    [Route("api/movies")]
    public class ApiMoviesController : ControllerBase
    {
        private readonly MovieRepository _movieRepository;

        public ApiMoviesController(MovieRepository movieRepository)
        {
            _movieRepository = movieRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetMovies()
        {
            var movies = await _movieRepository.GetAllAsync();
            return Ok(movies);
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

            await _movieRepository.UpdateAsync(existingMovie);
            return Ok(existingMovie);
        }

        [Authorize(Roles = "ADMIN")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMovie(Guid id)
        {
            var existingMovie = await _movieRepository.GetByIdAsync(id);
            if (existingMovie == null) return NotFound();

            await _movieRepository.DeleteAsync(id);
            return Ok(new { message = "Deleted successfully" });
        }
    }
}

