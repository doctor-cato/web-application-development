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

        [HttpPost]
        public async Task<IActionResult> CreateShowtime([FromBody] Showtime showtime)
        {
            if (showtime.Id == Guid.Empty)
            {
                showtime.Id = Guid.NewGuid();
            }
            await _showtimeRepository.AddAsync(showtime);
            return Ok(showtime);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateShowtime(Guid id, [FromBody] Showtime showtime)
        {
            var existing = await _showtimeRepository.GetByIdAsync(id);
            if (existing == null) return NotFound();

            existing.MovieId = showtime.MovieId;
            existing.RoomId = showtime.RoomId;
            existing.StartTime = showtime.StartTime;
            existing.Price = showtime.Price;

            await _showtimeRepository.UpdateAsync(id, existing);
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShowtime(Guid id)
        {
            var existing = await _showtimeRepository.GetByIdAsync(id);
            if (existing == null) return NotFound();

            await _showtimeRepository.DeleteAsync(id);
            return Ok(new { message = "Showtime deleted successfully" });
        }
    }
}
