
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

    // GET: SHOWTIMES
    public async Task<IActionResult> Index()    
    {
        return View(await _context.Showtimes.ToListAsync());
    }

    // GET: SHOWTIMES/Details/5
    public async Task<IActionResult> Details(int? id)
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

    // GET: SHOWTIMES/Create
    public IActionResult Create()
    {
        return View();
    }

    // POST: SHOWTIMES/Create
    // To protect from overposting attacks, enable the specific properties you want to bind to.
    // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
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

    // GET: SHOWTIMES/Edit/5
    public async Task<IActionResult> Edit(int? id)
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

    // POST: SHOWTIMES/Edit/5
    // To protect from overposting attacks, enable the specific properties you want to bind to.
    // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int? id, [Bind("Id,MovieId,RoomId,StartTime,EndTime,TicketPrice,BookingDetails,Bookings,Movie,Room")] Showtime showtime)
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

    // GET: SHOWTIMES/Delete/5
    public async Task<IActionResult> Delete(int? id)
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

    // POST: SHOWTIMES/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int? id)
    {
        var showtime = await _context.Showtimes.FindAsync(id);
        if (showtime != null)
        {
            _context.Showtimes.Remove(showtime);
        }

        await _context.SaveChangesAsync();
        return RedirectToAction(nameof(Index));
    }

    private bool ShowtimeExists(int? id)
    {
        return _context.Showtimes.Any(e => e.Id == id);
    }
}

