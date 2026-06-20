# Cấu trúc Lưu trữ Dữ liệu — 3HD2Kcinema

Ứng dụng 3HD2Kcinema sử dụng mô hình kết hợp giữa cơ sở dữ liệu quan hệ phía Backend (SQL Server) cho việc lưu trữ bền vững và Storage của trình duyệt (Frontend) cho các trạng thái giao diện tạm thời.

---

## 1. Cơ sở Dữ liệu Quan hệ (Backend - SQL Server)

Hệ thống sử dụng **SQL Server** làm nguồn dữ liệu chính (Single Source of Truth). Entity Framework Core (`ApplicationDbContext`) đóng vai trò quản lý schema và thao tác dữ liệu.

Tên Database mặc định: `movie_booking_db`

### Sơ đồ các bảng (Tables / Entities)

| Tên bảng | Lớp Model (C#) | Chức năng chính |
|---|---|---|
| `users` | `User` | Lưu thông tin tài khoản người dùng, mật khẩu, vai trò (Role). |
| `movies` | `Movie` | Lưu thông tin phim (tên, đạo diễn, mô tả, ảnh poster). |
| `cinemas` | `Cinema` | Quản lý danh sách các cụm rạp chiếu phim. |
| `rooms` | `Room` | Danh sách các phòng chiếu, liên kết với rạp (CinemaId). |
| `seats` | `Seat` | Trạng thái và vị trí ghế tĩnh, liên kết với phòng (RoomId). |
| `showtimes` | `Showtime` | Quản lý suất chiếu (thời gian bắt đầu, kết thúc), liên kết `Movie` và `Room`. |
| `bookings` | `Booking` | Hóa đơn đặt vé tổng hợp, liên kết `User` và `Showtime`. |
| `booking_details`| `BookingDetail`| Chi tiết mỗi ghế trong một hóa đơn, liên kết `Booking` và `Seat`. |

### Một số quan hệ chính (Relationships)
- Một `User` có nhiều `Bookings`.
- Một `Showtime` có nhiều `Bookings`.
- Một `Booking` có nhiều `BookingDetails`.
- Một `Room` có nhiều `Seats` và `Showtimes`.
- Bảng `booking_details` có index Unique cho cặp `{ ShowtimeId, SeatId }` để ngăn chặn double-booking (2 người mua cùng 1 ghế trong cùng 1 suất chiếu) ở cấp độ cơ sở dữ liệu.

---

## 2. Lưu trữ phía Trình duyệt (Frontend Storage)

Dù đã có Backend, Frontend vẫn tận dụng trình duyệt để lưu trạng thái phiên làm việc (Session) và giỏ hàng tạm thời, giúp giao diện phản hồi nhanh và giảm tải cho Server.

### `SessionStorage` — Dữ liệu phiên (Mất khi đóng tab)

- `cinema_checkout`: Lưu thông tin giỏ hàng tạm thời trong lúc user chuyển qua các bước (chọn phim -> chọn ghế -> chọn combo -> thanh toán).
  *Lý do:* Giảm tải lưu trữ rác trên server khi user chưa quyết định hoàn tất thanh toán mua hàng.

### `LocalStorage` — Dữ liệu UI (Không bắt buộc tồn tại lâu dài)

- Trạng thái khóa ghế tạm: Frontend có thể ghi tạm danh sách ghế đang được "lock" để kết hợp với `BroadcastChannel API` đồng bộ hiển thị màu trạng thái đang chọn giữa các tab, trước khi giao dịch thực sự thành công ở Database.

---

## 3. Quá trình Khởi tạo Dữ liệu (Data Seeding)

Thay vì dùng file `shared/js/data.js` hardcode như trước, hệ thống nay dùng class `DbInitializer` ở Backend.
- File JSON chứa dữ liệu gốc: `backend/DataSeeding/movies.json`
- Khi ứng dụng backend chạy (`dotnet run`), hệ thống sẽ gọi `context.Database.EnsureCreated()`. Nếu bảng `movies` rỗng, hệ thống sẽ tự động đọc file JSON và insert (seed) danh sách phim ban đầu vào SQL Server.
