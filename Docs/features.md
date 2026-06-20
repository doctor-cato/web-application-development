# Tính năng & Luồng Ứng dụng — 3HD2Kcinema

Tài liệu chi tiết các tính năng và luồng nghiệp vụ của hệ thống Full-stack (Backend + Frontend).

## Bảng Theo Dõi Tiến Độ Tích Hợp

> `✅` = Đã hoàn thành (Có Backend xử lý) | `🔄` = Đang phát triển / Mockup UI | `❌` = Chưa triển khai

| # | Tính năng | Trạng thái | Nơi xử lý (Backend API) | Nơi hiển thị (Frontend) |
|---|---|---|---|---|
| 1 | Trang đăng nhập | ✅ | `AccountController.Login` | `frontend/src/auth/user-login/` |
| 2 | Trang đăng ký | ✅ | `AccountController.Register` | `frontend/src/auth/user-register/` |
| 3 | Quên mật khẩu & OTP | ❌ | Chưa có API | `frontend/src/auth/forgot-password/` |
| 4 | Trang chủ (Hero, Now Showing) | ✅ | `MoviesController` | `frontend/src/explore/home-page/` |
| 5 | Chi tiết phim (Trailer, Suất chiếu) | ✅ | `MoviesController`, `ShowtimesController` | `frontend/src/explore/movie-details/` |
| 6 | Tìm kiếm & lọc phim nâng cao | ✅ | `MoviesController` | `frontend/src/explore/movie-search/` |
| 7 | Bản đồ & định vị cụm rạp | ✅ | `CinemasController` | `frontend/src/explore/cinema-map/` |
| 8 | Đặt ghế thời gian thực | ✅ | `SeatsController`, BroadcastChannel (UI) | `frontend/src/booking/seat-booking/` |
| 9 | Chọn combo Bắp Nước | ✅ | Order API / Frontend Session | `frontend/src/booking/booking-food/` |
| 10 | Thanh toán & Cổng giả lập | ✅ | `BookingsController`, `BookingService` | `frontend/src/booking/checkout/` |
| 11 | Hóa đơn điện tử + QR Code | ✅ | `TicketVerificationService` | `frontend/src/booking/checkout/` |
| 12 | Trang Đặt Vé Thành Công | ✅ | `BookingDetailsController` | `frontend/src/booking/booking-success/` |
| 13 | Hủy vé & Đổi suất chiếu | ✅ | `BookingsController` | `frontend/src/booking/cancel-booking/` |
| 14 | Lịch sử giao dịch | ✅ | `BookingsController` | `frontend/src/booking/cancel-booking/` |
| 15 | Đặt & giữ ghế theo nhóm | 🔄 | Chưa có API | `frontend/src/booking/group-booking/` |
| 16 | Hồ sơ cá nhân | ✅ | `UsersController` | `frontend/src/user/user-profile/` |
| 17 | Tích điểm & hạng thành viên | ✅ | `UsersController` | `frontend/src/user/loyalty-points/` |
| 18 | Trung tâm thông báo | 🔄 | Đang hoàn thiện | `frontend/src/user/user-notifications/` |
| 19 | Chia tiền nhóm trong Profile | ❌ | Chưa triển khai | Chưa có |
| 20 | After-Credit Lounge | ✅ | Tĩnh | `frontend/src/engagement/aftercredit-lounge/` |
| 21 | Cinebet Minigame | ✅ | Tĩnh | `frontend/src/engagement/minigame/` |

---

## 1. Xác thực Người Dùng (Authentication)
Xử lý thông qua `AccountController` của ASP.NET Core sử dụng **Cookie Authentication**.
- **Đăng nhập**: Kiểm tra thông tin trong bảng `users` qua `UserRepository`. Nếu hợp lệ, hệ thống tạo session cookie an toàn trên server.
- **Đăng ký**: Thêm user mới vào bảng `users` với Role mặc định là `Customer`.

## 2. Quản lý Đặt Ghế & Thời gian thực (Seat Booking)
- Khi người dùng vào trang đặt ghế, Frontend gọi API từ `SeatsController` để lấy danh sách các ghế của phòng tương ứng.
- Frontend dùng **BroadcastChannel API (`seat_sync`)** để hiển thị real-time trạng thái "đang chọn" (locked) giữa các tab ở client, tạo hiệu ứng phản hồi mượt mà cho user đang thao tác đồng thời.
- Khi người dùng xác nhận và thanh toán, một request sẽ được gửi về `BookingsController` để thực sự lưu trạng thái `Booked` cố định vào SQL Server.

## 3. Luồng Thanh toán và Tạo Hóa Đơn
- Thông tin giỏ hàng (phim, rạp, ghế, giá tiền, bắp nước) được giữ tạm trong `SessionStorage` của Frontend trong quá trình user duyệt qua các bước.
- Khi người dùng hoàn thành bước Thanh toán (Momo/VNPAY giả lập), Frontend gửi dữ liệu POST về `BookingsController`.
- **BookingService** xử lý việc ghi lại hóa đơn (`Booking`) và chi tiết đặt vé (`BookingDetail`) vào CSDL.
- Backend trả về mã đơn hàng để Frontend sinh QR code điện tử.

## 4. Quản lý Thông tin Phim và Lịch Chiếu
- Dữ liệu phim được đọc từ CSDL SQL Server thông qua `MoviesController`.
- Khi server khởi động lần đầu, class `DbInitializer` sẽ tự động seed (tạo dữ liệu giả) từ file `backend/DataSeeding/movies.json` vào bảng `movies` nếu bảng này chưa có dữ liệu.

## 5. Lịch sử Giao dịch & Hủy Vé
- Lịch sử đặt vé được lấy trực tiếp từ database cho user đang đăng nhập qua `BookingsController`.
- Yêu cầu hủy vé gửi lệnh cập nhật/xóa bản ghi tương ứng trong bảng `bookings` và `booking_details`.
