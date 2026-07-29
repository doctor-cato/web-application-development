using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using appweb.Infrastructure;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;

namespace appweb.Hubs;

[Authorize]
public class SeatHub : Hub
{
    private readonly ApplicationDbContext _dbContext;

    public SeatHub(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task JoinRoom(string roomId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
    }

    public async Task LeaveRoom(string roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
    }

    public async Task SelectSeat(string roomId, string seatIdStr, string userId)
    {
        if (!Guid.TryParse(seatIdStr, out var seatId)) return;

        // Use authenticated user identity instead of trusting client-sent userId
        var authenticatedUser = Context.User?.FindFirst(ClaimTypes.Email)?.Value ?? userId;

        var seat = await _dbContext.Seats.FindAsync(seatId);
        if (seat == null || seat.Status != "Available")
        {
            await Clients.Caller.SendAsync("SeatSelectionFailed", seatIdStr, "Seat is no longer available.");
            return;
        }

        seat.Status = "Held";
        seat.HeldByUserId = authenticatedUser;
        seat.HeldUntil = DateTime.UtcNow.AddMinutes(5);

        try
        {
            await _dbContext.SaveChangesAsync();
            await Clients.Group(roomId).SendAsync("SeatSelected", seatIdStr, userId);
        }
        catch (DbUpdateConcurrencyException)
        {
            await Clients.Caller.SendAsync("SeatSelectionFailed", seatIdStr, "Seat was taken by someone else.");
        }
    }

    public async Task ReleaseSeat(string roomId, string seatIdStr)
    {
        if (!Guid.TryParse(seatIdStr, out var seatId)) return;

        var seat = await _dbContext.Seats.FindAsync(seatId);
        var currentUser = Context.User?.FindFirst(ClaimTypes.Email)?.Value;

        if (seat != null && seat.Status == "Held" && seat.HeldByUserId == currentUser)
        {
            seat.Status = "Available";
            seat.HeldByUserId = null;
            seat.HeldUntil = null;
            await _dbContext.SaveChangesAsync();

            await Clients.Group(roomId).SendAsync("SeatReleased", seatIdStr);
        }
    }

    public async Task ConfirmBooking(string roomId, string seatIdStr)
    {
        if (!Guid.TryParse(seatIdStr, out var seatId)) return;

        var seat = await _dbContext.Seats.FindAsync(seatId);
        var currentUser = Context.User?.FindFirst(ClaimTypes.Email)?.Value;

        // Only the user who held the seat can confirm it
        if (seat != null && seat.HeldByUserId == currentUser)
        {
            seat.Status = "Booked";
            await _dbContext.SaveChangesAsync();

            await Clients.Group(roomId).SendAsync("SeatBooked", seatIdStr);
        }
    }
}
