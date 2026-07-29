using appweb.Models;
using appweb.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using appweb.Hubs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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

        public ApiBookingsController(BookingRepository bookingRepository, UserRepository userRepository, ShowtimeRepository showtimeRepository, IHubContext<NotificationHub> hubContext)
        {
            _bookingRepository = bookingRepository;
            _userRepository = userRepository;
            _showtimeRepository = showtimeRepository;
            _hubContext = hubContext;
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

            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                UserId = user.UserId,
                ShowtimeId = showtime.Id,
                MovieId = Guid.Parse(request.MovieId),
                Seats = request.Seats,
                TotalPrice = total,
                PaymentMethod = request.PaymentMethod ?? "Cash",
                PaymentStatus = "Paid",
                CreatedAt = DateTime.Now
            };

            user.Points += (int)Math.Floor(total / 1000);
            await _userRepository.UpdateAsync(user);

            await _bookingRepository.AddAsync(booking);

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
