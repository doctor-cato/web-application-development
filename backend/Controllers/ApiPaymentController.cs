using appweb.Models;
using appweb.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace appweb.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class ApiPaymentController : ControllerBase
    {
        private readonly BookingRepository _bookingRepository;
        private readonly IConfiguration _configuration;

        public ApiPaymentController(BookingRepository bookingRepository, IConfiguration configuration)
        {
            _bookingRepository = bookingRepository;
            _configuration = configuration;
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
            }
            else if (payload.Status?.ToLower() == "failed")
            {
                booking.PaymentStatus = "Failed";
            }

            await _bookingRepository.UpdateAsync(booking);

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
