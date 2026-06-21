# Cấu trúc Lưu trữ Dữ liệu — 3HD2Kcinema

Ứng dụng 3HD2Kcinema kết hợp song song hai giải pháp lưu trữ: lưu trữ thực tế phía trình duyệt (Client-side Storage) cho luồng chạy chính thức của Frontend, và thiết kế Cơ sở dữ liệu quan hệ (SQL Server) phía Backend phục vụ cho mô hình tích hợp sau này.

---

## 1. Lưu trữ phía Trình duyệt (Frontend - Mock DB chính thức)

Toàn bộ thông tin tài khoản, phim, vé đặt, tích điểm và thông báo được quản lý thông qua trình duyệt của người dùng để ứng dụng có thể chạy cục bộ độc lập.

Tất cả các truy xuất được đóng gói an toàn trong file `frontend/src/shared/utils/storage.js` để đảm bảo tính nhất quán và tránh lỗi phân tích JSON (JSON.parse).

### `SessionStorage` — Dữ liệu phiên (Mất khi đóng tab/trình duyệt)

| Tên Key | Dữ liệu Lưu trữ | Mục đích |
|---|---|---|
| `cinema_current_user` | Đối tượng User đang đăng nhập | Xác định phiên làm việc, phân quyền UI và tích điểm. |
| `cinema_checkout` | Đối tượng giỏ hàng tạm thời | Lưu trữ thông tin checkout (phim, rạp, suất chiếu, ghế, bắp nước, tổng tiền) trong quá trình chuyển bước. |

### `LocalStorage` — Dữ liệu bền vững (Lưu lâu dài)

| Tên Key | Dữ liệu Lưu trữ | Mục đích |
|---|---|---|
| `cinema_users` | Mảng chứa danh sách các tài khoản người dùng | Cơ sở dữ liệu tài khoản (Mật khẩu được mã hóa Base64 cho mục đích demo). |
| `cinema_bookings` | Mảng danh sách hóa đơn đã mua thành công | Lưu trữ lịch sử đặt vé của toàn rạp. |
| `cinema_seat_locks` | Bản đồ khóa ghế theo suất chiếu `{ showtimeId: { seatId: lockInfo } }` | Đồng bộ trạng thái khóa tạm thời giữa các tab qua BroadcastChannel API. |
| `3hd2k_rewards` | Đối tượng `{ points: number, history: Array }` | Quản lý điểm tích lũy và lịch sử giao dịch đổi điểm/tặng điểm của tài khoản. |
| `3hd2k_notifications` | Mảng các thông báo cá nhân | Lưu trữ các tin nhắn từ trung tâm thông báo (ví dụ: đặt vé thành công, hủy vé). |
| `3hd2k_rewards_processed` | Mảng các ID Booking đã được tích điểm | Ngăn chặn việc cộng điểm trùng lặp khi người dùng reload trang thành công. |
| `3hd2k_booking_notif_processed` | Mảng các ID Booking đã được gửi thông báo | Ngăn chặn việc gửi trùng lặp thông báo đặt vé thành công khi reload trang. |

---

## 2. Cơ sở Dữ liệu Quan hệ (Backend - SQL Server Scaffold)

Lớp cơ sở dữ liệu backend được thiết kế sẵn để lưu trữ dữ liệu bền vững khi dự án được nâng cấp lên Full-stack thực thụ. Entity Framework Core (`ApplicationDbContext`) đóng vai trò quản lý schema và ánh xạ các Model C# xuống SQL Server.

Tên Database mặc định: `movie_booking_db`

### Sơ đồ các bảng (Tables / Entities)

| Tên bảng | Lớp Model (C#) | Chức năng chính |
|---|---|---|
| `users` | `User` | Lưu thông tin tài khoản người dùng, mật khẩu băm, vai trò (Admin/Customer). |
| `movies` | `Movie` | Danh mục phim (tên phim, đạo diễn, mô tả, ảnh poster, thể loại). |
| `cinemas` | `Cinema` | Quản lý danh sách các cụm rạp chiếu phim 3HD2K. |
| `rooms` | `Room` | Danh sách các phòng chiếu, liên kết với rạp (CinemaId). |
| `seats` | `Seat` | Sơ đồ ghế tĩnh trong phòng chiếu, liên kết với phòng (RoomId). |
| `showtimes` | `Showtime` | Quản lý suất chiếu (thời gian bắt đầu, kết thúc), liên kết `Movie` và `Room`. |
| `bookings` | `Booking` | Hóa đơn đặt vé tổng hợp, liên kết `User` và `Showtime`. |
| `booking_details`| `BookingDetail`| Chi tiết mỗi ghế được đặt trong hóa đơn, liên kết `Booking` và `Seat`. |

### Một số quan hệ chính (Relationships)
- **User - Booking**: Một `User` có thể thực hiện nhiều `Bookings` (1-n).
- **Showtime - Booking**: Một suất chiếu `Showtime` có thể chứa nhiều hóa đơn đặt vé `Bookings` (1-n).
- **Booking - BookingDetail**: Một hóa đơn `Booking` có nhiều chi tiết ghế `BookingDetails` (1-n).
- **Room - Seat / Showtime**: Một phòng chiếu `Room` có nhiều ghế ngồi `Seats` cố định và nhiều suất chiếu `Showtimes` khác nhau.
- **Ràng buộc duy nhất (Unique Constraint)**: Bảng `booking_details` có một chỉ mục Unique kép cho cặp khóa `{ ShowtimeId, SeatId }` ở mức cơ sở dữ liệu. Điều này ngăn chặn tuyệt đối tình trạng đặt trùng ghế (double-booking) tại cùng một thời điểm suất chiếu nếu có hai luồng thanh toán đồng thời gửi lên SQL Server.

---

## 3. Quá trình Khởi tạo dữ liệu (Data Seeding ở Backend)

Kiến trúc mẫu Backend tích hợp sẵn cơ chế nạp dữ liệu khởi tạo tự động thông qua class `DbInitializer`:
- Dữ liệu phim gốc được khai báo dưới dạng file JSON tại thư mục: `backend/DataSeeding/movies.json`.
- Khi máy chủ backend ASP.NET Core khởi chạy (`dotnet run`), hệ thống sẽ gọi phương thức `context.Database.EnsureCreated()`. 
- Nếu phát hiện cơ sở dữ liệu SQL Server vừa được tạo mới hoặc bảng `movies` đang rỗng, `DbInitializer` sẽ tự động đọc file JSON phim mẫu, chuyển đổi và ghi đè danh sách phim ban đầu vào cơ sở dữ liệu.
