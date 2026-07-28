using appweb.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace appweb.Controllers
{
    [Authorize]
    public class BookingsController : Controller
    {

        private readonly dynamic _bookingRepository;
        private readonly dynamic _userRepository;

        public BookingsController(dynamic bookingRepository, dynamic userRepository)
        {
            _bookingRepository = bookingRepository;
            _userRepository = userRepository;
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Guid showtimeId, string seats, string paymentMethod)
        {

            var email = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(email))
            {
                return RedirectToAction("Login", "Account");
            }

            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                return BadRequest("Không tìm thấy thông tin tài khoản người dùng.");
            }

            var booking = new Booking
            {
                UserId = user.Id,
                ShowtimeId = showtimeId,
                TotalPrice = 0,
                PaymentMethod = string.IsNullOrEmpty(paymentMethod) ? "Cash" : paymentMethod,
                PaymentStatus = "Pending",
                CreatedAt = DateTime.Now
            };

            await _bookingRepository.AddAsync(booking);

            return RedirectToAction("MyBookings");
        }

        public IActionResult MyBookings()
        {
            return View();
        }
    }
}

