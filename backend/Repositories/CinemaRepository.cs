using appweb.Infrastructure;
using appweb.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace appweb.Repositories
{
    public class CinemaRepository
    {
        private readonly ApplicationDbContext _context;

        // Tiêm hạ tầng kết nối Database (ApplicationDbContext) vào đây
        public CinemaRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. Lấy danh sách toàn bộ các rạp chiếu phim
        public async Task<List<Cinema>> GetAllCinemasAsync()
        {
            // Lệnh EF Core lấy toàn bộ dữ liệu từ bảng Cinemas trong SQL Server
            return await _context.Cinemas.ToListAsync();
        }

        // 2. Tìm kiếm thông tin một rạp cụ thể theo ID
        public async Task<Cinema?> GetCinemaByIdAsync(Guid id)
        {
            return await _context.Cinemas.FindAsync(id);
        }

        // 3. Admin sử dụng: Thêm một cụm rạp mới vào hệ thống
        public async Task AddCinemaAsync(Cinema cinema)
        {
            await _context.Cinemas.AddAsync(cinema);
            await _context.SaveChangesAsync(); // Lưu thay đổi xuống SQL Server
        }

        // 4. Admin sử dụng: Cập nhật thông tin rạp (Sửa tên, sửa địa chỉ phòng chiếu)
        public async Task UpdateCinemaAsync(Cinema cinema)
        {
            _context.Cinemas.Update(cinema);
            await _context.SaveChangesAsync();
        }

        // 5. Admin sử dụng: Xóa một rạp chiếu phim ra khỏi hệ thống
        public async Task DeleteCinemaAsync(Guid id)
        {
            var cinema = await _context.Cinemas.FindAsync(id);
            if (cinema != null)
            {
                _context.Cinemas.Remove(cinema);
                await _context.SaveChangesAsync();
            }
        }
    }
}
