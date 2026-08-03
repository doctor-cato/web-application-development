using appweb.Infrastructure;
using appweb.Models;
using appweb.Repositories;
using appweb.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;

namespace appweb.Controllers
{
    [ApiController]
    [Route("api/showtimes")]
    public class ApiShowtimesController : ControllerBase
    {
        private readonly ShowtimeRepository _showtimeRepository;
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public ApiShowtimesController(ShowtimeRepository showtimeRepository, ApplicationDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _showtimeRepository = showtimeRepository;
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetShowtimes()
        {
            try
            {
                var showtimes = await _showtimeRepository.GetAllAsync();
                if (showtimes != null && showtimes.Count > 0) return Ok(showtimes);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Showtimes fetch DB fallback: " + ex.Message);
            }

            return Ok(new List<Showtime>());
        }

        [HttpGet("movie/{movieId}")]
        public async Task<IActionResult> GetShowtimesByMovie(string movieId)
        {
            try
            {
                var showtimes = await _showtimeRepository.GetAllAsync();
                Guid guidId;
                bool isGuid = Guid.TryParse(movieId, out guidId);

                var filtered = showtimes.Where(s =>
                    (isGuid && s.MovieId == guidId) ||
                    (!string.IsNullOrEmpty(s.MovieTitle) && s.MovieTitle.Contains(movieId, StringComparison.OrdinalIgnoreCase)) ||
                    (s.MovieId != null && s.MovieId.ToString().Equals(movieId, StringComparison.OrdinalIgnoreCase))
                ).ToList();

                return Ok(filtered);
            }
            catch (Exception)
            {
                return Ok(new List<Showtime>());
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetShowtime(string id)
        {
            Guid guidId;
            if (!Guid.TryParse(id, out guidId))
            {
                var all = await _showtimeRepository.GetAllAsync();
                var st = all.FirstOrDefault(s => s.Id.ToString().Equals(id, StringComparison.OrdinalIgnoreCase));
                if (st == null) return NotFound();
                return Ok(st);
            }
            var showtime = await _showtimeRepository.GetByIdAsync(guidId);
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
            if (showtime.StartTime != default && showtime.EndTime == default)
            {
                showtime.EndTime = showtime.StartTime.AddHours(2);
            }

            // Auto-resolve MovieId from MovieTitle if MovieId is missing
            if ((showtime.MovieId == null || showtime.MovieId == Guid.Empty) && !string.IsNullOrEmpty(showtime.MovieTitle))
            {
                var matchedMovie = await _context.Movies.FirstOrDefaultAsync(m => m.Title == showtime.MovieTitle || m.Title.Contains(showtime.MovieTitle));
                if (matchedMovie != null)
                {
                    showtime.MovieId = matchedMovie.Id;
                }
            }

            if (string.IsNullOrEmpty(showtime.CinemaId)) showtime.CinemaId = "ha-dong";
            if (string.IsNullOrEmpty(showtime.CinemaName)) showtime.CinemaName = "3HD2K HÀ ĐÔNG";
            if (string.IsNullOrEmpty(showtime.RoomName)) showtime.RoomName = "Phòng chiếu 1";

            await _showtimeRepository.AddAsync(showtime);
            await _hubContext.Clients.All.SendAsync("DataUpdated", "Showtimes");
            return Ok(showtime);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateShowtime(string id, [FromBody] Showtime showtime)
        {
            Guid guidId;
            if (!Guid.TryParse(id, out guidId)) return BadRequest(new { message = "Invalid Guid" });

            var existing = await _showtimeRepository.GetByIdAsync(guidId);
            if (existing == null) return NotFound();

            existing.MovieId = showtime.MovieId;
            existing.RoomId = showtime.RoomId;
            existing.StartTime = showtime.StartTime;
            existing.EndTime = showtime.EndTime != default ? showtime.EndTime : showtime.StartTime.AddHours(2);
            existing.TicketPrice = showtime.TicketPrice;
            existing.CinemaId = showtime.CinemaId;
            existing.CinemaName = showtime.CinemaName;
            existing.RoomName = showtime.RoomName;
            existing.MovieTitle = showtime.MovieTitle;

            await _showtimeRepository.UpdateAsync(guidId, existing);
            await _hubContext.Clients.All.SendAsync("DataUpdated", "Showtimes");
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShowtime(string id)
        {
            Guid guidId;
            if (!Guid.TryParse(id, out guidId))
            {
                var all = await _showtimeRepository.GetAllAsync();
                var target = all.FirstOrDefault(s => s.Id.ToString().Equals(id, StringComparison.OrdinalIgnoreCase));
                if (target != null)
                {
                    await _showtimeRepository.DeleteAsync(target.Id);
                    await _hubContext.Clients.All.SendAsync("DataUpdated", "Showtimes");
                    return Ok(new { message = "Showtime deleted successfully" });
                }
                return NotFound();
            }

            var existing = await _showtimeRepository.GetByIdAsync(guidId);
            if (existing == null) return NotFound();

            await _showtimeRepository.DeleteAsync(guidId);
            await _hubContext.Clients.All.SendAsync("DataUpdated", "Showtimes");
            return Ok(new { message = "Showtime deleted successfully" });
        }
    }
}
