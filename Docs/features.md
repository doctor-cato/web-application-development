# Tính năng & Luồng Ứng dụng Frontend — 3HD2Kcinema

Dự án hiện tại đang tập trung hoàn thiện giao diện và trải nghiệm người dùng (UX/UI) ở tầng Frontend. Các tính năng dưới đây hoạt động dựa trên dữ liệu giả lập lưu trong `LocalStorage` và `SessionStorage`.

## Bảng Theo Dõi Tiến Độ Tính Năng (Frontend)

> `✅` = Hoàn thành (Hoạt động tốt với Mock DB) | `🔄` = Đang hoàn thiện UI/UX | `❌` = Chưa làm

| # | Trạng thái | Tính năng | Vị trí (Mã nguồn Frontend) |
|---|---|---|---|
| 1 | ✅ Hoàn thành | Trang đăng nhập | `frontend/src/auth/user-login/` |
| 2 | ✅ Hoàn thành | Trang đăng ký | `frontend/src/auth/user-register/` |
| 3 | ✅ Hoàn thành | Quên mật khẩu & Cấp lại | `frontend/src/auth/forgot-password/` |
| 4 | ✅ Hoàn thành | Trang chủ (Hero, Now Showing) | `frontend/src/explore/home-page/` |
| 5 | ✅ Hoàn thành | Chi tiết phim (Trailer, Suất chiếu) | `frontend/src/explore/movie-details/` |
| 6 | ✅ Hoàn thành | Tìm kiếm & lọc phim nâng cao | `frontend/src/explore/movie-search/` |
| 7 | ✅ Hoàn thành | Bản đồ & định vị cụm rạp | `frontend/src/explore/cinema-map/` |
| 8 | ✅ Hoàn thành | Đặt ghế thời gian thực (BroadcastChannel)| `frontend/src/booking/seat-booking/` |
| 9 | ✅ Hoàn thành | Chọn combo Bắp Nước | `frontend/src/booking/booking-food/` |
| 10| ✅ Hoàn thành | Thanh toán & Cổng thanh toán giả lập | `frontend/src/booking/checkout/` |
| 11| ✅ Hoàn thành | Hóa đơn điện tử + QR Code | `frontend/src/booking/checkout/` (booking_invoice.html) |
| 12| ✅ Hoàn thành | Trang Xác nhận Đặt Vé Thành Công | `frontend/src/booking/booking-success/` |
| 13| ✅ Hoàn thành | Hủy vé, Đổi suất chiếu & Lịch sử | `frontend/src/booking/cancel-booking/` |
| 14| 🔄 Đang làm | Đặt & giữ ghế theo nhóm | `frontend/src/booking/group-booking/` |
| 15| ✅ Hoàn thành | Hồ sơ cá nhân người dùng | `frontend/src/user/user-profile/` |
| 16| ✅ Hoàn thành | Hệ thống tích điểm & cấp bậc thành viên | `frontend/src/user/loyalty-points/` |
| 17| ✅ Hoàn thành | Đăng ký thành viên VIP | `frontend/src/user/vip-registration/` |
| 18| ✅ Hoàn thành | Trung tâm thông báo | `frontend/src/user/user-notifications/` |
| 19| ✅ Hoàn thành | After-Credit Lounge (thảo luận phim) | `frontend/src/engagement/aftercredit-lounge/` |
| 20| ✅ Hoàn thành | Cinebet Minigame | `frontend/src/engagement/minigame/` |

---

## 1. Xác thực Người Dùng (Mock)
Toàn bộ thông tin tài khoản được mã hóa base64 (chỉ dùng cho demo) và lưu trữ trong `cinema_users` (LocalStorage). Trạng thái phiên hiện tại lưu ở `cinema_current_user` (SessionStorage). 

## 2. Quản lý Đặt Ghế & Thời gian thực (BroadcastChannel)
- Tính năng sống còn của bản Frontend: Sử dụng **BroadcastChannel API (`seat_sync`)** để truyền tin nhắn đồng bộ trạng thái "đang chọn" (locked) giữa các tab, tạo hiệu ứng mượt mà.
- **Bot Simulation**: Tự động random giả lập người khác đặt ghế sau mỗi 10 giây (tại `booking.js`) để tạo tính chân thực.
- Ghế sẽ tự động unlock nếu không hoàn tất thanh toán sau 15 phút.

## 3. Luồng Thanh toán và Tạo Hóa Đơn
- Thông tin giỏ hàng được giữ trong `cinema_checkout` (SessionStorage).
- Màn hình giả lập thanh toán (MoMo, VNPAY). Khi thanh toán thành công, sẽ ghi đè record vào mảng `cinema_bookings` trong LocalStorage và tự động giải phóng ghế bị lock.
- Hóa đơn điện tử tự động sinh mã QR với định dạng string `3HD2K-TICKET|...`.

## 4. Engagement & Minigame
Dự án được mở rộng thêm các tính năng tương tác độc đáo như phòng chờ After-Credit và Minigame đặt cược điểm loyalty để tăng tính tương tác trên giao diện. Các trang này hoạt động dựa trên thao tác DOM mạnh mẽ và quản lý điểm qua LocalStorage.
