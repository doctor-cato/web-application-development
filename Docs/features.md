# Tính năng & Luồng Nghiệp Vụ Frontend — 3HD2Kcinema

Ứng dụng 3HD2Kcinema tập trung tối đa vào trải nghiệm người dùng (UX/UI) và giao diện di động. Toàn bộ các tính năng dưới đây hoạt động hoàn chỉnh và mượt mà trên nền tảng dữ liệu giả lập lưu trong trình duyệt.

---

## Bảng Theo Dõi Tiến Độ Tính Năng (Frontend)

> `✅` = Hoàn thành (Hoạt động tốt với Mock DB) | `🔄` = Đang hoàn thiện | `❌` = Chưa làm

| # | Trạng thái | Tính năng | Vị trí (Mã nguồn Frontend) | Chi tiết triển khai |
|---|---|---|---|---|
| 1 | ✅ Hoàn thành | Trang đăng nhập | `frontend/src/auth/user-login/` | Xác thực qua Cookie/Session giả lập, chuyển đổi Base64 mật khẩu. |
| 2 | ✅ Hoàn thành | Trang đăng ký | `frontend/src/auth/user-register/` | Đăng ký thành viên, kiểm tra trùng lặp email và tài khoản. |
| 3 | ✅ Hoàn thành | Quên mật khẩu & Cấp lại | `frontend/src/auth/forgot-password/` | Giao diện lấy lại mật khẩu và cập nhật trực tiếp vào danh sách user. |
| 4 | ✅ Hoàn thành | Trang chủ (Hero, Now Showing) | `frontend/src/explore/home-page/` | Carousel phim nổi bật, tab lọc danh mục phim và căn chỉnh responsive di động. |
| 5 | ✅ Hoàn thành | Chi tiết phim (Trailer, Suất chiếu)| `frontend/src/explore/movie-details/` | Video trailer nhúng, danh sách suất chiếu động, sửa z-index dropdown. |
| 6 | ✅ Hoàn thành | Tìm kiếm & lọc phim nâng cao | `frontend/src/explore/movie-search/` | Tìm kiếm theo thời gian thực và lọc theo định dạng (2D/3D/IMAX), thể loại. |
| 7 | ✅ Hoàn thành | Bản đồ & định vị cụm rạp | `frontend/src/explore/cinema-map/` | Tích hợp Leaflet Map, định vị HTML5 Geolocation thực tính khoảng cách. |
| 8 | ✅ Hoàn thành | Đặt ghế thời gian thực | `frontend/src/booking/seat-booking/` | BroadcastChannel API đồng bộ trạng thái khóa ghế đa tab, bot giả lập chọn ghế. |
| 9 | ✅ Hoàn thành | Chọn combo Bắp Nước | `frontend/src/booking/booking-food/` | Hiển thị danh mục đồ ăn kèm, tối ưu cuộn ngang (horizontal scroll) trên di động. |
| 10| ✅ Hoàn thành | Thanh toán & Cổng giả lập | `frontend/src/booking/checkout/` | Tích hợp hiển thị giảm giá Loyalty, mô phỏng quét mã QR thanh toán MoMo/VNPAY. |
| 11| ✅ Hoàn thành | Hóa đơn điện tử + QR Code | `frontend/src/booking/checkout/` | Tự động tạo mã QR hóa đơn dạng `TK-XXXX`, hóa đơn responsive. |
| 12| ✅ Hoàn thành | Trang đặt vé thành công | `frontend/src/booking/booking-success/` | Hiển thị tóm tắt, tự động tích điểm loyalty, tạo thông báo hệ thống mới. |
| 13| ✅ Hoàn thành | Hủy vé, Hoàn trả ghế & Lịch sử | `frontend/src/user/user-profile/` | Hủy toàn bộ/hủy từng phần vé ngay tại Hồ sơ cá nhân, hoàn trả ghế, toast thành công. |
| 14| 🔄 Đang làm | Đặt & giữ ghế theo nhóm | `frontend/src/booking/group-booking/` | Thiết kế giao diện giới thiệu và phòng chờ. Nút hành động dẫn về trang WIP. |
| 15| ✅ Hoàn thành | Hồ sơ cá nhân người dùng | `frontend/src/user/user-profile/` | Đổi mật khẩu, xem thông tin cá nhân, cập nhật ảnh đại diện. |
| 16| ✅ Hoàn thành | Tích điểm & Cấp bậc thành viên | `frontend/src/user/loyalty-points/` | Tự động nhân hệ số điểm dựa trên VIP Plan / Loyalty Tier khi đặt vé thành công. |
| 17| ✅ Hoàn thành | Đăng ký thành viên VIP | `frontend/src/user/vip-registration/` | Chọn gói VIP (Silver, Gold, Platinum) để nhận đặc quyền nhân điểm và giảm giá. |
| 18| ✅ Hoàn thành | Trung tâm thông báo | `frontend/src/user/user-notifications/` | Quản lý thông báo chưa đọc/đọc, tự động gửi tin nhắn khi mua/hủy vé. |
| 19| ✅ Hoàn thành | Cinebet Minigame | `frontend/src/engagement/minigame/` | Trò chơi dự đoán sau phim (After-credit prediction), đặt cược điểm loyalty. |

---

## 3. Phân Tích Nghiệp Vụ Chính & Cơ Chế Xử Lý

### 1. Cơ Chế Khóa Ghế & Đồng Bộ Đa Tab (BroadcastChannel)
- Khi người dùng bấm chọn ghế trong `seat-booking/booking.html`, hệ thống gọi hàm `lockSeat()` của `bookingService.js`.
- Trạng thái được ghi vào key `cinema_seat_locks` trong LocalStorage. Kèm theo đó, một thông điệp dạng `{ type: 'seat_locked', showtimeId, seatId, userId, expiresAt }` được phát qua **BroadcastChannel ('seat_sync')**.
- Tất cả các tab khác đang mở cùng trang đặt ghế sẽ nhận được thông điệp, tự động cập nhật giao diện hiển thị ghế đó thành màu xám (đã bị khóa) để ngăn người khác nhấn vào.
- **Giải phóng khóa (Auto-release)**: Ghế sẽ tự động được mở khóa sau 15 phút nếu người dùng không tiến hành thanh toán. Khi người dùng đóng tab, sự kiện `beforeunload` được tận dụng để giải phóng các ghế đang giữ.
- **Bot Giả lập (Bot Simulation)**: Để tạo không khí chân thực như rạp đang hoạt động, một bộ đếm `setInterval` (10 giây) tự động chạy để giả lập khách hàng ảo ngẫu nhiên khóa hoặc nhả ghế.

### 2. Luồng Hủy Vé & Hoàn Ghế (Ticket Cancellation Flow)
- Người dùng truy cập tab **Lịch sử đặt vé** trong trang Hồ sơ cá nhân (`user-profile/profile.html`).
- Với mỗi hóa đơn, người dùng có thể bấm **Hủy vé**. Hệ thống hỗ trợ **Hủy từng phần (Partial Cancellation)**: người dùng có thể tích chọn những ghế cụ thể muốn hủy thay vì hủy toàn bộ.
- Khi xác nhận hủy:
  - Trạng thái của vé trong `cinema_bookings` được cập nhật (chuyển thành 'Cancelled' hoặc cập nhật danh sách ghế còn lại).
  - Các ghế bị hủy lập tức được loại bỏ khỏi danh sách đã đặt của suất chiếu đó, giúp giải phóng sơ đồ rạp cho người khác mua.
  - Điểm thưởng tương ứng bị trừ khỏi ví điểm tích lũy (`3hd2k_rewards`).
  - Hệ thống gửi một thông báo mới vào Trung tâm thông báo để lưu vết và hiển thị một thông báo Toast nổi trên giao diện báo thành công.

### 3. Hệ Thống Tích Điểm Tự Động & VIP Multiplier
- Khi đơn đặt vé hoàn tất thành công, hàm `awardLoyaltyPoints()` được kích hoạt.
- Hệ thống kiểm tra hai nguồn thông tin của tài khoản:
  1. **VIP Plan (Gói VIP)**: Đăng ký tại `vip-registration/` (Silver: 1.2x, Gold: 1.5x, Platinum: 2.0x).
  2. **Loyalty Tier (Hạng thành viên tích lũy)**: Dựa trên số điểm hiện có (Bạc [>200 PTS]: 1.25x, Vàng [>500 PTS]: 1.5x, VIP [>1000 PTS]: 1.75x, Diamond [>2000 PTS]: 2.0x).
- Hệ thống tự động chọn **hệ số nhân lớn nhất (Max Multiplier)** từ hai nguồn này để nhân với số điểm cơ bản nhận được (từ 50 đến 150 điểm cho mỗi ghế đặt mua).
- Số điểm tích lũy mới được cập nhật vào `3hd2k_rewards` kèm lịch sử giao dịch rõ ràng. Lớp chống trùng lặp `3hd2k_rewards_processed` đảm bảo việc tải lại trang thành công không làm tăng điểm của người dùng vô lý.

### 4. Định Vị Thực Tế Trực Quan (Cinema Map)
- Trang Bản đồ rạp (`cinema-map/cinemas.html`) tích hợp thư viện bản đồ Leaflet.
- Bản đồ sử dụng **HTML5 Geolocation API** (`navigator.geolocation.getCurrentPosition`) để xin quyền truy cập vị trí thực tế của thiết bị người dùng.
- Sau khi được cấp quyền, bản đồ sẽ hiển thị vị trí của người dùng bằng một marker đặc biệt, tính toán khoảng cách (theo kilomet) đến từng cụm rạp 3HD2K trong hệ thống và tự động sắp xếp danh sách rạp từ gần nhất đến xa nhất.
