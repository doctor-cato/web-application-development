using appweb.Models;
using appweb.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

using appweb.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Microsoft.AspNetCore.SignalR;
using appweb.Hubs;
using Net.payOS.Types;
using appweb.Services;

namespace appweb.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class ApiPaymentController : ControllerBase
    {
        private readonly BookingRepository _bookingRepository;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<SeatHub> _seatHubContext;
        private readonly IHubContext<NotificationHub> _notificationHub;
        private readonly IPayOSService _payOSService;

        public ApiPaymentController(BookingRepository bookingRepository, IConfiguration configuration, ApplicationDbContext context, IHubContext<SeatHub> seatHubContext, IHubContext<NotificationHub> notificationHub, IPayOSService payOSService)
        {
            _bookingRepository = bookingRepository;
            _configuration = configuration;
            _context = context;
            _seatHubContext = seatHubContext;
            _notificationHub = notificationHub;
            _payOSService = payOSService;
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook([FromBody] WebhookType payload)
        {
            try {
                WebhookData data = _payOSService.VerifyWebhookData(payload);
                if (data == null || data.orderCode == 0) return Ok();

                long orderCode = data.orderCode;

                if (data.code == "00" && (data.desc == "success" || data.desc == "Thanh cong"))
                {
                    // Atomic update to Paid
                    var sql = "UPDATE bookings SET payment_status = 'Paid' WHERE OrderCode = @p0 AND payment_status = 'Pending'";
                    var rowsAffected = await _context.Database.ExecuteSqlRawAsync(sql, orderCode);

                    if (rowsAffected == 0)
                    {
                        var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.OrderCode == orderCode);
                        if (booking == null) {
                            return Ok(); // webhook for a deleted order
                        }

                        if (booking.PaymentStatus == "Cancelled" || booking.PaymentStatus == "Expired")
                        {
                            // Late webhook or Paid after cancelled -> needs manual refund
                            booking.PaymentStatus = "RefundRequired";
                            _context.Bookings.Update(booking);
                            await _context.SaveChangesAsync();
                        }
                    }
                    else 
                    {
                        var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.OrderCode == orderCode);
                        if (booking != null) {
                            // Update Seat status in DB to "Booked"
                            if (!string.IsNullOrEmpty(booking.Seats))
                            {
                                var seatsList = booking.Seats.Split(',', StringSplitOptions.RemoveEmptyEntries);
                                var showtime = await _context.Showtimes.FindAsync(booking.ShowtimeId);
                                if (showtime != null && showtime.RoomId.HasValue)
                                {
                                    foreach (var seatStr in seatsList)
                                    {
                                        var trimmed = seatStr.Trim();
                                        if (trimmed.Length >= 2)
                                        {
                                            string row = trimmed.Substring(0, 1);
                                            if (int.TryParse(trimmed.Substring(1), out int number))
                                            {
                                                var seat = await _context.Seats.FirstOrDefaultAsync(s => 
                                                    s.RoomId == showtime.RoomId && 
                                                    s.SeatRow == row && 
                                                    s.SeatNumber == number);
                                                if (seat != null)
                                                {
                                                    seat.Status = "Booked";
                                                    seat.HeldByUserId = null;
                                                    seat.HeldUntil = null;
                                                    _context.Seats.Update(seat);
                                                    await _seatHubContext.Clients.Group(showtime.RoomId.Value.ToString()).SendAsync("SeatBooked", trimmed);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            
                            // Update points
                            if (booking.UserId.HasValue)
                            {
                                var user = await _context.Users.FindAsync(booking.UserId.Value);
                                if (user != null)
                                {
                                    int pointsEarned = (int)(data.amount / 1000);
                                    user.Points += pointsEarned;
                                    _context.Users.Update(user);
                                }
                            }
                            await _context.SaveChangesAsync();
                        }
                        
                        // Successfully moved from Pending to Paid. Broadcast via SignalR to specific group!
                        await _notificationHub.Clients.Group(orderCode.ToString()).SendAsync("PaymentConfirmed", new { orderCode = orderCode, status = "Paid" });
                    }
                }
                return Ok(new { success = true });
            } catch (Exception ex) {
                return Ok(new { success = false, message = ex.Message }); // return 200 so PayOS stops retrying on verification fail
            }
        }

        [HttpGet("status/{orderCode}")]
        public async Task<IActionResult> GetPaymentStatus(long orderCode)
        {
            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.OrderCode == orderCode);
            if (booking == null)
                return NotFound("Booking not found");

            return Ok(new { status = booking.PaymentStatus });
        }

        [HttpGet("generate-qr")]
        public IActionResult GenerateQr([FromQuery] decimal amount, [FromQuery] string? description)
        {
            var targetBank = _configuration["Payment:BankId"] ?? "MB";
            var targetAccount = _configuration["Payment:AccountNo"] ?? "0345678999";
            var accountName = _configuration["Payment:AccountName"] ?? "RAP PHIM 3HD2K";
            var addInfo = string.IsNullOrEmpty(description) ? $"TT DON HANG 3HD2K {(long)amount}D" : description;
            
            
            var qrUrl = $"https://img.vietqr.io/image/{targetBank}-{targetAccount}-compact2.png?amount={(long)amount}&addInfo={Uri.EscapeDataString(addInfo)}&accountName={Uri.EscapeDataString(accountName)}";

            return Ok(new {
                qrUrl = qrUrl,
                bank = targetBank,
                accountNo = targetAccount,
                accountName = accountName,
                amount = amount,
                addInfo = addInfo
            });
        }
    }

    public class WebhookPayload
    {
        public string? TransactionId { get; set; }
        public string? OrderId { get; set; }
        public decimal Amount { get; set; }
        public string? Status { get; set; }
        public string? Provider { get; set; }
        public string? Signature { get; set; }
    }
}
