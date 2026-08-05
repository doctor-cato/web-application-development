using appweb.Models;
using appweb.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using appweb.Hubs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace appweb.Controllers
{
    [ApiController]
    [Route("api/bookings")]
    public class ApiBookingsController : ControllerBase
    {
        private readonly BookingRepository _bookingRepository;
        private readonly UserRepository _userRepository;
        private readonly ShowtimeRepository _showtimeRepository;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly appweb.Infrastructure.ApplicationDbContext _context;
        private readonly appweb.Services.IPayOSService _payOSService;
        private readonly Microsoft.Extensions.Options.IOptions<PayOSConfig> _payOSConfig;

        public ApiBookingsController(BookingRepository bookingRepository, UserRepository userRepository, ShowtimeRepository showtimeRepository, IHubContext<NotificationHub> hubContext, appweb.Infrastructure.ApplicationDbContext context, appweb.Services.IPayOSService payOSService, Microsoft.Extensions.Options.IOptions<PayOSConfig> payOSConfig)
        {
            _bookingRepository = bookingRepository;
            _userRepository = userRepository;
            _showtimeRepository = showtimeRepository;
            _hubContext = hubContext;
            _context = context;
            _payOSService = payOSService;
            _payOSConfig = payOSConfig;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] BookingRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.ShowtimeId))
            {
                return BadRequest("Invalid booking data.");
            }

            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email)) return Unauthorized();

            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null) return Unauthorized();

            var showtime = await _showtimeRepository.GetByIdAsync(Guid.Parse(request.ShowtimeId));
            if (showtime == null) return BadRequest("Showtime not found.");

            var seatsArr = request.Seats.Split(',', StringSplitOptions.RemoveEmptyEntries);
            int seatCount = seatsArr.Length;
            if (seatCount == 0) return BadRequest("No seats selected.");

            decimal basePrice = seatCount * showtime.TicketPrice;

            decimal comboPrice = 0;
            if (request.ComboId == "single") comboPrice = 65000;
            else if (request.ComboId == "double") comboPrice = 95000;

            decimal total = basePrice + comboPrice;

            decimal discountAmount = 0;
            if (!string.IsNullOrEmpty(request.PromoCode))
            {
                var code = request.PromoCode.ToUpper();
                if (code == "GIAM50K" && total >= 200000) discountAmount = 50000;
                else if (code == "BAPFREE") discountAmount = 65000;
            }

            decimal vipDiscountAmount = 0;
            if (user.Role == "VIP" || !string.IsNullOrEmpty(user.VipPlan))
            {
                decimal vipPercent = user.VipPlan == "platinum" ? 0.10m : 0.05m;
                vipDiscountAmount = Math.Floor(total * vipPercent);
            }

            decimal loyaltyComboDiscountAmount = 0;
            if (comboPrice > 0)
            {
                if (user.Points >= 2000) loyaltyComboDiscountAmount = Math.Floor(comboPrice * 0.10m);
                else if (user.Points >= 1000) loyaltyComboDiscountAmount = Math.Floor(comboPrice * 0.08m);
                else if (user.Points >= 500) loyaltyComboDiscountAmount = Math.Floor(comboPrice * 0.05m);
                else if (user.Points >= 200) loyaltyComboDiscountAmount = Math.Floor(comboPrice * 0.02m);
            }

            total = Math.Max(0, total - discountAmount - vipDiscountAmount - loyaltyComboDiscountAmount);

            var isPaidImmediately = (request.PaymentMethod?.ToLower() == "cash");
            var isPayOS = (request.PaymentMethod?.ToLower() == "payos");

            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                UserId = user.UserId,
                ShowtimeId = showtime.Id,
                MovieId = Guid.Parse(request.MovieId),
                Seats = request.Seats,
                TotalPrice = total,
                PaymentMethod = request.PaymentMethod ?? "Cash",
                PaymentStatus = isPaidImmediately ? "Paid" : "Pending",
                CreatedAt = DateTime.Now
            };

            // In previous version, we added BookingDetails mapping here.
            // But since Seats table is empty in DB, it causes 400 Bad Request.
            // YAGNI: Just let the system work with booking.Seats (comma-separated string) as it did originally.

            if (isPaidImmediately)
            {
                user.Points += (int)Math.Floor(total / 1000);
                await _userRepository.UpdateAsync(user);
            }

            if (isPayOS)
            {
                bool isSaved = false;
                int retryCount = 0;
                while(!isSaved && retryCount < 3) {
                    try {
                        booking.OrderCode = long.Parse(DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString() + Random.Shared.Next(10, 99).ToString());
                        await _context.Bookings.AddAsync(booking);
                        await _context.SaveChangesAsync();
                        isSaved = true;
                    } catch(Microsoft.EntityFrameworkCore.DbUpdateException) {
                        retryCount++;
                        _context.ChangeTracker.Clear(); // clear tracked entities to retry
                    }
                }
                if(!isSaved) return StatusCode(500, "Failed to generate unique order code");

                // Call PayOS
                try {
                    var expiredAt = DateTimeOffset.UtcNow.AddMinutes(5).ToUnixTimeSeconds();
                    booking.ExpiredAt = DateTimeOffset.FromUnixTimeSeconds(expiredAt).DateTime.ToLocalTime();
                    
                    var cancelUrl = _payOSConfig.Value.CancelUrl;
                    if (cancelUrl.Contains("?")) cancelUrl += $"&orderCode={booking.OrderCode}";
                    else cancelUrl += $"?cancel=true&orderCode={booking.OrderCode}";

                    var returnUrl = _payOSConfig.Value.ReturnUrl;

                    var paymentResult = await _payOSService.CreatePaymentLink(booking.OrderCode.Value, (int)booking.TotalPrice, "Thanh toan ve xem phim", returnUrl, cancelUrl, expiredAt);
                    
                    booking.CheckoutUrl = paymentResult.checkoutUrl;
                    _context.Bookings.Update(booking);
                    await _context.SaveChangesAsync();

                    return Ok(new { message = "Booking successful", bookingId = booking.Id, checkoutUrl = paymentResult.checkoutUrl });
                } catch (Exception) {
                    // Rollback manually
                    _context.Bookings.Remove(booking);
                    await _context.SaveChangesAsync();
                    return StatusCode(500, "Lỗi tạo link thanh toán");
                }
            }
            else 
            {
                await _bookingRepository.AddAsync(booking);
            }

            var bookingData = new {
                customerEmail = user.Email,
                customerName = user.Fullname,
                customerPhone = user.Phone ?? "N/A",
                seats = request.Seats,
                totalAmount = total,
                time = DateTime.Now.ToString("HH:mm:ss")
            };
            await _hubContext.Clients.All.SendAsync("ReceiveNewBooking", bookingData);

            return Ok(new { message = "Booking successful", bookingId = booking.Id });
        }

        [HttpGet]
        public async Task<IActionResult> GetAllBookings()
        {
            var bookings = await _bookingRepository.GetAllAsync();
            return Ok(bookings);
        }

        [HttpGet("{email}")]
        public async Task<IActionResult> GetUserBookings(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                return Ok(new List<object>());
            }
            var bookings = await _bookingRepository.GetByUserIdAsync(user.UserId);
            return Ok(bookings);
        }

        [HttpPost("{orderCode}/cancel")]
        public async Task<IActionResult> CancelBooking(long orderCode)
        {
            try
            {
                // Call PayOS to cancel link
                try {
                    await _payOSService.CancelPaymentLink(orderCode, "Người dùng huỷ thanh toán");
                } catch {
                    // Ignore PayOS cancellation error (link might already be expired or cancelled)
                }

                // Atomic DB update to prevent race conditions
                var sql = "UPDATE bookings SET payment_status = 'Cancelled' WHERE OrderCode = @p0 AND payment_status = 'Pending'";
                var rowsAffected = await _context.Database.ExecuteSqlRawAsync(sql, orderCode);

                if (rowsAffected == 0)
                {
                    return BadRequest(new { message = "Giao dịch đã được xử lý hoặc không tồn tại." });
                }

                return Ok(new { message = "Huỷ giao dịch thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi huỷ giao dịch: " + ex.Message });
            }
        }
    }

    public class BookingRequest
    {
        public string ShowtimeId { get; set; } = string.Empty;
        public string MovieId { get; set; } = string.Empty;
        public string Seats { get; set; } = string.Empty;
        public string ComboId { get; set; } = string.Empty;
        public string? PromoCode { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public List<TicketItemDto>? Tickets { get; set; }
    }

    public class TicketItemDto
    {
        public string Seat { get; set; } = string.Empty;
        public string TicketCode { get; set; } = string.Empty;
    }
}
