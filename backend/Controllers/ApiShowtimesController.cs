using appweb.Models;
using appweb.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace appweb.Controllers
{
    [ApiController]
    [Route("api/showtimes")]
    public class ApiShowtimesController : ControllerBase
    {
        private readonly ShowtimeRepository _showtimeRepository;

        public ApiShowtimesController(ShowtimeRepository showtimeRepository)
        {
            _showtimeRepository = showtimeRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetShowtimes()
        {
            var showtimes = await _showtimeRepository.GetAllAsync();
            return Ok(showtimes);
        }

        [HttpGet("movie/{movieId}")]
        public async Task<IActionResult> GetShowtimesByMovie(Guid movieId)
        {
            var showtimes = await _showtimeRepository.GetByMovieIdAsync(movieId);
            return Ok(showtimes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetShowtime(Guid id)
        {
            var showtime = await _showtimeRepository.GetByIdAsync(id);
            if (showtime == null) return NotFound();
            return Ok(showtime);
        }
    }
}
