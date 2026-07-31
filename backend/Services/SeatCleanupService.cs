using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using appweb.Infrastructure;
using appweb.Hubs;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace appweb.Services;

public class SeatCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IHubContext<SeatHub> _hubContext;

    public SeatCleanupService(IServiceProvider serviceProvider, IHubContext<SeatHub> hubContext)
    {
        _serviceProvider = serviceProvider;
        _hubContext = hubContext;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupExpiredHolds(stoppingToken);
            }
            catch (Exception)
            {
                // Prevent DB connection errors from crashing the entire ASP.NET Core host process
            }
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }

    private async Task CleanupExpiredHolds(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var expiredSeats = await dbContext.Seats
            .Where(s => s.Status == "Held" && s.HeldUntil < DateTime.UtcNow)
            .ToListAsync(stoppingToken);

        if (expiredSeats.Any())
        {
            foreach (var seat in expiredSeats)
            {
                seat.Status = "Available";
                seat.HeldByUserId = null;
                seat.HeldUntil = null;
            }

            await dbContext.SaveChangesAsync(stoppingToken);

            foreach (var seat in expiredSeats)
            {
                if (seat.RoomId.HasValue)
                {
                    await _hubContext.Clients.Group(seat.RoomId.Value.ToString()).SendAsync("SeatReleased", seat.Id.ToString(), cancellationToken: stoppingToken);
                }
            }
        }
    }
}
