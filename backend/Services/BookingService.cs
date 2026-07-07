using appweb.Models;
using appweb.Repositories;

namespace appweb.Services
{
    public class BookingService
    {
        private readonly BookingRepository _bookingRepository;
        private readonly MovieRepository _movieRepository;

        public BookingService(BookingRepository bookingRepository, MovieRepository movieRepository)
        {
            _bookingRepository = bookingRepository;
            _movieRepository = movieRepository;
        }

        public async Task<bool> ProcessBookingAsync(User user, Movie movie, Guid showtimeId, string seats)
        {
            if (user == null || movie == null) return false;

            var booking = new Booking
            {
                // SỬA TẠI ĐÂY: Dùng .Id thay vì .UserId hay .MovieId cũ
                UserId = user.Id,
                MovieId = movie.Id,
                ShowtimeId = showtimeId,
                Seats = seats,
                CreatedAt = DateTime.Now,
                PaymentStatus = "Confirmed"
            };

            await _bookingRepository.AddAsync(booking);
            return true;
        }
    }
}
