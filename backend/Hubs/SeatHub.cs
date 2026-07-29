using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using appweb.Infrastructure;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace appweb.Hubs;

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

        var seat = await _dbContext.Seats.FindAsync(seatId);
        if (seat == null || seat.Status != "Available")
        {
            await Clients.Caller.SendAsync("SeatSelectionFailed", seatIdStr, "Seat is no longer available.");
            return;
        }

        seat.Status = "Held";
        seat.HeldByUserId = userId;
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
        if (seat != null && seat.Status == "Held")
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
        if (seat != null)
        {
            seat.Status = "Booked";
            await _dbContext.SaveChangesAsync();

            await Clients.Group(roomId).SendAsync("SeatBooked", seatIdStr);
        }
    }
}
