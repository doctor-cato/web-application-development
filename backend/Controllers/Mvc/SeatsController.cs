
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using appweb.Models;
using appweb.Infrastructure;

[Authorize(Roles = "Admin")]
    public class SeatsController : Controller
{
    private readonly ApplicationDbContext _context;

    public SeatsController(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IActionResult> Index()
    {
        return View(await _context.Seats.ToListAsync());
    }

    public async Task<IActionResult> Details(Guid? id)
    {
        if (id == null)
        {
            return NotFound();
        }

        var seat = await _context.Seats
            .FirstOrDefaultAsync(m => m.Id == id);
        if (seat == null)
        {
            return NotFound();
        }

        return View(seat);
    }

    public IActionResult Create()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([Bind("Id,RoomId,SeatRow,SeatNumber,SeatType,BookingDetails,Room")] Seat seat)
    {
        if (ModelState.IsValid)
        {
            _context.Add(seat);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }
        return View(seat);
    }

    public async Task<IActionResult> Edit(Guid? id)
    {
        if (id == null)
        {
            return NotFound();
        }

        var seat = await _context.Seats.FindAsync(id);
        if (seat == null)
        {
            return NotFound();
        }
        return View(seat);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Guid? id, [Bind("Id,RoomId,SeatRow,SeatNumber,SeatType,BookingDetails,Room")] Seat seat)
    {
        if (id != seat.Id)
        {
            return NotFound();
        }

        if (ModelState.IsValid)
        {
            try
            {
                _context.Update(seat);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SeatExists(seat.Id))
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
        return View(seat);
    }

    public async Task<IActionResult> Delete(Guid? id)
    {
        if (id == null)
        {
            return NotFound();
        }

        var seat = await _context.Seats
            .FirstOrDefaultAsync(m => m.Id == id);
        if (seat == null)
        {
            return NotFound();
        }

        return View(seat);
    }

    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(Guid? id)
    {
        var seat = await _context.Seats.FindAsync(id);
        if (seat != null)
        {
            _context.Seats.Remove(seat);
        }

        await _context.SaveChangesAsync();
        return RedirectToAction(nameof(Index));
    }

    private bool SeatExists(Guid? id)
    {
        return _context.Seats.Any(e => e.Id == id);
    }
}

