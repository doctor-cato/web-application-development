using appweb.Models;
using appweb.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using appweb.Hubs;

namespace appweb.Controllers
{
    [ApiController]
    [Route("api/bookings")]
    public class ApiBookingsController : ControllerBase
    {
        private readonly BookingRepository _bookingRepository;
        private readonly UserRepository _userRepository;
        private readonly IHubContext<NotificationHub> _hubContext;

        public ApiBookingsController(BookingRepository bookingRepository, UserRepository userRepository, IHubContext<NotificationHub> hubContext)
        {
            _bookingRepository = bookingRepository;
            _userRepository = userRepository;
            _hubContext = hubContext;
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] BookingRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Email))
            {
                return BadRequest("Invalid booking data.");
            }

            var user = await _userRepository.GetByEmailAsync(request.Email);
            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                UserId = user?.UserId, // Guid?
                ShowtimeId = Guid.Parse(request.ShowtimeId),
                MovieId = Guid.Parse(request.MovieId),
                Seats = request.Seats,
                TotalPrice = request.TotalPrice,
                PaymentMethod = request.PaymentMethod ?? "Cash",
                PaymentStatus = "Paid",
                CreatedAt = DateTime.Now
            };

            await _bookingRepository.AddAsync(booking);

            var bookingData = new {
                customerEmail = request.Email,
                seats = request.Seats,
                totalAmount = request.TotalPrice,
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
        public string Email { get; set; } = string.Empty;
        public string ShowtimeId { get; set; } = string.Empty;
        public string MovieId { get; set; } = string.Empty;
        public string Seats { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
    }
}
