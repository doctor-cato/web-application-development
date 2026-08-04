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

namespace appweb.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class ApiPaymentController : ControllerBase
    {
        private readonly BookingRepository _bookingRepository;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;

        public ApiPaymentController(BookingRepository bookingRepository, IConfiguration configuration, ApplicationDbContext context)
        {
            _bookingRepository = bookingRepository;
            _configuration = configuration;
            _context = context;
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook([FromBody] WebhookPayload payload)
        {
            var secret = _configuration["Payment:WebhookSecret"];
            if (string.IsNullOrEmpty(secret))
                return StatusCode(500, "Webhook secret not configured");

            var rawData = $"{payload.TransactionId}|{payload.OrderId}|{payload.Amount}|{payload.Status}|{payload.Provider}";
            
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
            var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            var expectedSignature = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

            if (!string.Equals(payload.Signature, expectedSignature, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Invalid signature");
            }

            if (!Guid.TryParse(payload.OrderId, out Guid bookingId))
            {
                return BadRequest("Invalid OrderId format");
            }

            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null)
            {
                return NotFound("Booking not found");
            }

            if (payload.Status?.ToLower() == "success")
            {
                booking.PaymentStatus = "Paid";
                
                
                if (booking.UserId.HasValue)
                {
                    var user = await _context.Users.FindAsync(booking.UserId.Value);
                    if (user != null)
                    {
                        var ticketRateStr = await _context.Settings.Where(s => s.Key == "TicketPointRate").Select(s => s.Value).FirstOrDefaultAsync();
                        decimal rate = 0.001m; 
                        if (decimal.TryParse(ticketRateStr, out var parsedRate)) {
                            rate = parsedRate;
                        }
                        
                        int pointsEarned = (int)(payload.Amount * rate);
                        user.Points += pointsEarned;
                        _context.Users.Update(user);
                    }
                }
            }
            else if (payload.Status?.ToLower() == "failed")
            {
                booking.PaymentStatus = "Failed";
            }

            await _bookingRepository.UpdateAsync(booking);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Webhook processed successfully" });
        }

        [Authorize]
        [HttpGet("status/{bookingId}")]
        public async Task<IActionResult> GetPaymentStatus(string bookingId)
        {
            if (!Guid.TryParse(bookingId, out Guid bId))
                return BadRequest("Invalid bookingId format");

            var booking = await _bookingRepository.GetByIdAsync(bId);
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
