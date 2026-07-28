
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using appweb.Models;
using appweb.Infrastructure;

[Authorize(Roles = "Admin")]
    public class ShowtimesController : Controller
{
    private readonly ApplicationDbContext _context;

    public ShowtimesController(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IActionResult> Index()
    {
        return View(await _context.Showtimes.ToListAsync());
    }

    public async Task<IActionResult> Details(Guid? id)
    {
        if (id == null)
        {
            return NotFound();
        }

        var showtime = await _context.Showtimes
            .FirstOrDefaultAsync(m => m.Id == id);
        if (showtime == null)
        {
            return NotFound();
        }

        return View(showtime);
    }

    public IActionResult Create()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("Id,MovieId,RoomId,StartTime,EndTime,TicketPrice,BookingDetails,Bookings,Movie,Room")] Showtime showtime)
    {
        if (ModelState.IsValid)
        {
            _context.Add(showtime);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }
        return View(showtime);
    }

    public async Task<IActionResult> Edit(Guid? id)
    {
        if (id == null)
        {
            return NotFound();
        }

        var showtime = await _context.Showtimes.FindAsync(id);
        if (showtime == null)
        {
            return NotFound();
        }
        return View(showtime);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Guid? id, [Bind("Id,MovieId,RoomId,StartTime,EndTime,TicketPrice,BookingDetails,Bookings,Movie,Room")] Showtime showtime)
    {
        if (id != showtime.Id)
        {
            return NotFound();
        }

        if (ModelState.IsValid)
        {
            try
            {
                _context.Update(showtime);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ShowtimeExists(showtime.Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return RedirectToAction(nameof(Index));
        }
        return View(showtime);
    }

    public async Task<IActionResult> Delete(Guid? id)
    {
        if (id == null)
        {
            return NotFound();
        }

        var showtime = await _context.Showtimes
            .FirstOrDefaultAsync(m => m.Id == id);
        if (showtime == null)
        {
            return NotFound();
        }

        return View(showtime);
    }

    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(Guid? id)
    {
        var showtime = await _context.Showtimes.FindAsync(id);
        if (showtime != null)
        {
            _context.Showtimes.Remove(showtime);
        }

        await _context.SaveChangesAsync();
        return RedirectToAction(nameof(Index));
    }

    private bool ShowtimeExists(Guid? id)
    {
        return _context.Showtimes.Any(e => e.Id == id);
    }
}

