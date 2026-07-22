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
        // Khai báo các Repository để tương tác với Cơ sở dữ liệu
        // (Lưu ý: Nếu dự án của bạn dùng Interface như IBookingRepository, hãy đổi lại cho đúng tên)
        private readonly dynamic _bookingRepository;
        private readonly dynamic _userRepository;

        // Constructor để Inject (tiêm) các Repository vào Controller
        public BookingsController(dynamic bookingRepository, dynamic userRepository)
        {
            _bookingRepository = bookingRepository;
            _userRepository = userRepository;
        }

        // Action xử lý đặt vé khi người dùng bấm nút đặt
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Guid showtimeId, string seats, string paymentMethod)
        {
            // 1. Lấy Email của người dùng hiện tại đang đăng nhập hệ thống
            var email = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(email))
            {
                return RedirectToAction("Login", "Account");
            }

            // 2. Tìm thông tin User trong cơ sở dữ liệu qua Email
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                return BadRequest("Không tìm thấy thông tin tài khoản người dùng.");
            }

            // 3. Khởi tạo thực thể Booking khớp hoàn toàn với cấu trúc bảng bookings trong DbContext của bạn
            var booking = new Booking
            {
                UserId = user.Id,
                ShowtimeId = showtimeId,
                TotalPrice = 0, // Bạn có thể bổ sung logic tính toán giá tiền tại đây nếu cần
                PaymentMethod = string.IsNullOrEmpty(paymentMethod) ? "Cash" : paymentMethod,
                PaymentStatus = "Pending",
                CreatedAt = DateTime.Now
            };

            // 4. Gọi Repository để lưu thông tin Booking vào SQL Server
            await _bookingRepository.AddAsync(booking);

            // 5. Chuyển hướng người dùng về trang danh sách lịch sử đặt vé của họ
            return RedirectToAction("MyBookings");
        }

        // Action hiển thị danh sách vé đã đặt của tôi
        public IActionResult MyBookings()
        {
            return View();
        }
    }
}

