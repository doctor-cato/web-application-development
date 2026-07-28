using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using appweb.Models;
using appweb.Infrastructure;

namespace appweb.Controllers.HomeController.cs
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingDetailsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BookingDetailsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllBookings()
        {
            try
            {

                var bookings = await _context.BookingDetails.ToListAsync();
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy dữ liệu: " + ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] BookingDetail newBooking)
        {
            try
            {
                if (newBooking == null)
                {
                    return BadRequest(new { message = "Dữ liệu gửi lên không hợp lệ." });
                }

                _context.BookingDetails.Add(newBooking);

                await _context.SaveChangesAsync();

                return Ok(new { message = "Thêm mới chi tiết đặt vé thành công!", data = newBooking });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi thêm dữ liệu: " + ex.Message });
            }
        }
    }
}