
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

    // GET: SEATS
    public async Task<IActionResult> Index()    
    {
        return View(await _context.Seats.ToListAsync());
    }

    // GET: SEATS/Details/5
    public async Task<IActionResult> Details(int? id)
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

    // GET: SEATS/Create
    public IActionResult Create()
    {
        return View();
    }

    // POST: SEATS/Create
    // To protect from overposting attacks, enable the specific properties you want to bind to.
    // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
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

    // GET: SEATS/Edit/5
    public async Task<IActionResult> Edit(int? id)
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

    // POST: SEATS/Edit/5
    // To protect from overposting attacks, enable the specific properties you want to bind to.
    // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int? id, [Bind("Id,RoomId,SeatRow,SeatNumber,SeatType,BookingDetails,Room")] Seat seat)
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

    // GET: SEATS/Delete/5
    public async Task<IActionResult> Delete(int? id)
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

    // POST: SEATS/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int? id)
    {
        var seat = await _context.Seats.FindAsync(id);
        if (seat != null)
        {
            _context.Seats.Remove(seat);
        }

        await _context.SaveChangesAsync();
        return RedirectToAction(nameof(Index));
    }

    private bool SeatExists(int? id)
    {
        return _context.Seats.Any(e => e.Id == id);
    }
}

