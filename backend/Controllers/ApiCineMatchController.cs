using appweb.Infrastructure;
using appweb.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace appweb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApiCineMatchController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ApiCineMatchController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class CreateMatchRequest
        {
            public Guid UserId { get; set; }
            public Guid ShowtimeId { get; set; }
            public string SeatId { get; set; } = string.Empty;
            public string AdjacentSeatId { get; set; } = string.Empty;
            public string MatchPreference { get; set; } = "any";
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateMatch([FromBody] CreateMatchRequest req)
        {
            var match = new CineMatch
            {
                UserId = req.UserId,
                ShowtimeId = req.ShowtimeId,
                SeatId = req.SeatId,
                AdjacentSeatId = req.AdjacentSeatId,
                MatchPreference = req.MatchPreference,
                Status = "pending",
                CreatedAt = DateTime.Now
            };

            _context.CineMatches.Add(match);
            await _context.SaveChangesAsync();

            return Ok(match);
        }

        public class JoinMatchRequest
        {
            public Guid MatchId { get; set; }
            public Guid UserId { get; set; }
        }

        [HttpPost("join")]
        public async Task<IActionResult> JoinMatch([FromBody] JoinMatchRequest req)
        {
            var match = await _context.CineMatches.FindAsync(req.MatchId);
            if (match == null || match.Status != "pending")
            {
                return BadRequest(new { message = "Match is not available" });
            }

            match.MatchedUserId = req.UserId;
            match.Status = "matched";
            
            await _context.SaveChangesAsync();
            return Ok(match);
        }

        [HttpGet("pending/{showtimeId}")]
        public async Task<IActionResult> GetPendingMatches(Guid showtimeId)
        {
            var matches = await _context.CineMatches
                .Where(m => m.ShowtimeId == showtimeId && m.Status == "pending")
                .Select(m => new { m.Id, m.UserId, m.SeatId, m.AdjacentSeatId, m.MatchPreference })
                .ToListAsync();
            return Ok(matches);
        }

        [HttpGet("my-matches/{userId}")]
        public async Task<IActionResult> GetMyMatches(Guid userId)
        {
            var myMatches = await _context.CineMatches
                .Include(m => m.Showtime)
                .ThenInclude(s => s.Movie)
                .Where(m => m.UserId == userId || m.MatchedUserId == userId)
                .Select(m => new
                {
                    m.Id,
                    m.ShowtimeId,
                    m.SeatId,
                    m.AdjacentSeatId,
                    m.Status,
                    m.RevealCode,
                    m.IsRevealed,
                    IsInitiator = m.UserId == userId,
                    MovieTitle = m.Showtime.Movie.Title,
                    RoomId = m.Showtime.RoomId,
                    Time = m.Showtime.StartTime
                })
                .ToListAsync();

            return Ok(myMatches);
        }

        public class RevealRequest
        {
            public Guid MatchId { get; set; }
            public string Code { get; set; } = string.Empty;
        }

        [HttpPost("reveal")]
        public async Task<IActionResult> RevealMatch([FromBody] RevealRequest req)
        {
            var match = await _context.CineMatches
                .Include(m => m.User1)
                .Include(m => m.User2)
                .FirstOrDefaultAsync(m => m.Id == req.MatchId);

            if (match == null) return NotFound();

            if (match.RevealCode == req.Code)
            {
                match.IsRevealed = true;
                await _context.SaveChangesAsync();
                
                return Ok(new
                {
                    success = true,
                    user1 = new { match.User1.FullName, match.User1.AvatarUrl, match.User1.Gender },
                    user2 = match.User2 != null ? new { match.User2.FullName, match.User2.AvatarUrl, match.User2.Gender } : null
                });
            }

            return BadRequest(new { success = false, message = "Mã QR không hợp lệ!" });
        }
    }
}
