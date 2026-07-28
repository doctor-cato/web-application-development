using appweb.Infrastructure;
using appweb.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace appweb.Controllers.HomeController.cs
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class CinemasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CinemasController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cinema>>> GetCinemas()
        {
            return await _context.Cinemas.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Cinema>> GetCinema(Guid id)
        {
            var cinema = await _context.Cinemas.FindAsync(id);
            if (cinema == null) return NotFound(new { message = "Không tìm thấy rạp phim này!" });
            return cinema;
        }

        [HttpPost]
        public async Task<ActionResult<Cinema>> PostCinema(Cinema cinema)
        {
            _context.Cinemas.Add(cinema);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCinema), new { id = cinema.Id }, cinema);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutCinema(Guid id, Cinema cinema)
        {
            if (id != cinema.Id) return BadRequest(new { message = "ID rạp không trùng khớp!" });

            _context.Entry(cinema).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Cinemas.Any(e => e.Id == id)) return NotFound();
                else throw;
            }

            return Ok(new { message = "Cập nhật thông tin rạp thành công!" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCinema(Guid id)
        {
            var cinema = await _context.Cinemas.FindAsync(id);
            if (cinema == null) return NotFound(new { message = "Không tìm thấy rạp để xóa!" });

            _context.Cinemas.Remove(cinema);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa rạp thành công!" });
        }
    }
}

