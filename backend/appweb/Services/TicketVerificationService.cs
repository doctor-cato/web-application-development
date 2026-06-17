using System.Threading.Tasks;

namespace appweb.Services
{
    public class TicketVerificationService
    {
        // Đảm bảo tên biến Repository khớp với dự án của bạn
        private readonly dynamic _bookingRepository;

        public TicketVerificationService(dynamic bookingRepository)
        {
            _bookingRepository = bookingRepository;
        }

        public async Task<bool> VerifyTicketAsync(int id)
        {
            // Sửa tên hàm gọi bị gạch đỏ thành GetByIdAsync
            var booking = await _bookingRepository.GetByIdAsync(id);

            if (booking == null)
            {
                return false;
            }

            return true;
        }
    }
}