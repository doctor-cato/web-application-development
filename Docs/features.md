# Tính năng & Luồng Ứng dụng

Tài liệu này chi tiết các tính năng tương tác cốt lõi của hệ thống mô phỏng 3HD2Kcinema.

## Bảng Theo Dõi Tiến Độ Tính Năng

Dưới đây là danh sách các tính năng được yêu cầu, được đánh dấu theo trạng thái thực tế trong mã nguồn hiện tại (`[x]` là đã có code triển khai hoạt động, `[ ]` là chưa có hoặc mới chỉ có file giữ chỗ `.gitkeep`):

### I. Danh sách Tính năng & Trạng thái

- [x] **Trang đăng nhập + Index**: Đã hoàn thành (nằm trong `src/auth/user-login/` và `src/index.html`).
- [x] **Trang chủ**: Đã hoàn thành (nằm trong `src/explore/home-page/`).
- [x] **Chi tiết phim**: Đã hoàn thành (nằm trong `src/explore/movie-details/`, tải dữ liệu động từ `data.js`).
- [x] **Hồ sơ cá nhân**: Đã hoàn thành (nằm trong `src/user/user-profile/`).
- [x] **Bắp nước / Bỏng nước**: Đã hoàn thành (nằm trong `src/booking/booking-food/`).
- [x] **Đặt ghế**: Đã hoàn thành (nằm trong `src/booking/seat-booking/`).
- [x] **Thanh toán**: Đã hoàn thành (nằm trong `src/booking/checkout/` và cổng giả lập).
- [x] **Hệ thống tích điểm**: Đã hoàn thành (nằm trong `src/user/loyalty-points/`).
- [x] **Tìm kiếm và lọc nâng cao**: Đã hoàn thành (nằm trong `src/explore/movie-search/`).
- [x] **Lịch sử giao dịch và đặt vé**: Đã hoàn thành (nằm trong tab Lịch sử giao dịch của trang Vé & Giao dịch `src/booking/cancel-booking/`).
- [ ] **Quên mật khẩu & Xác thực OTP**: Chưa có code triển khai.
- [x] **Giao diện đặt vé thành công**: Đã hoàn thành (giao diện hóa đơn đẹp mắt, hiển thị chi tiết tại `src/booking/checkout/booking_invoice.html`).
- [x] **Hủy vé và thay đổi suất chiếu**: Đã hoàn thành (nằm trong `src/booking/cancel-booking/`).
- [x] **Bản đồ và định vị rạp**: Đã hoàn thành.
- [x] **Trang ghép đôi Cine-Match**: Đã hoàn thành.
- [x] **Trung tâm thông báo**: Đã hoàn thành (nằm trong `src/user/user-notifications/`).
- [x] **Cinebet minigame**: Đã hoàn thành.
- [/] **Đặt và giữ ghế cho nhóm**: Giao diện Mockup.
- [x] **Thảo luận đánh giá về phim sau khi xem**: Đã hoàn thành.
- [ ] **Tính năng chia tiền nhóm & Hủy vé trong Profile**: Chưa có code triển khai.

---

## 1. Duyệt Danh mục (`explore/home-page/index.html`)
- Hiển thị danh sách phim được tải động từ `movieService.js`.
- Tích hợp tính năng lọc theo thể loại.
- Hiển thị các poster phim và lịch chiếu.

## 2. Xác thực (`auth/user-login/login.html` & `auth/user-register/register.html`)
- Xác minh tính hợp lệ của dữ liệu đầu vào người dùng một cách sạch sẽ.
- Mô phỏng quá trình mã hóa mật khẩu (password hashing) và tạo token.
- Lưu trữ phiên đăng nhập trong `SessionStorage`.
- Component `navbar.js` sẽ tự động phản ứng với trạng thái `active_session`, thay thế nút "Đăng nhập" bằng menu thả xuống của Hồ sơ Người dùng.

## 3. Khóa Ghế Thời gian thực (`booking/seat-booking/booking.html`)
Đây là tính năng quan trọng nhất của bản mô phỏng. Nó bắt chước các vấn đề về tương tranh (concurrency) của một nền tảng đặt vé rạp chiếu phim có lưu lượng truy cập cao.

### Cơ chế Khóa (Locking Mechanism):
- Khi một ghế được click chọn, nó sẽ chuyển sang trạng thái **"Đã khóa" (Locked)**.
- Một đồng hồ đếm ngược 5 phút sẽ bắt đầu. Nếu thời gian kết thúc trước khi quá trình thanh toán hoàn tất, ghế sẽ bị tự động mở khóa.
- `BroadcastChannel` gửi sự kiện khóa đến tất cả các tab khác, ngăn chặn việc đặt trùng vé.
- Nếu người dùng đóng tab giữa chừng lúc đang đặt vé, trình xử lý sự kiện `beforeunload` sẽ dọn dẹp các ghế đã khóa khỏi `LocalStorage` và phát đi sự kiện mở khóa.

### Mô phỏng Bot (Bot Simulation):
- Để thể hiện trực quan khả năng của giao diện thời gian thực, `booking.js` chứa một vòng lặp bot mô phỏng (`setInterval`) tự động khóa và mở khóa ngẫu nhiên các ghế trống sau mỗi vài giây.

## 4. Thanh toán & Mô phỏng Thanh toán (`booking/checkout/checkout.html` & `payment_simulation.html`)
- Trang checkout sẽ đọc dữ liệu `pending_checkout` từ `SessionStorage`.
- Người dùng có thể mua thêm Bắp Nước (Concessions).
- Khi tiến hành thanh toán, người dùng sẽ được chuyển hướng tới một màn hình Cổng thanh toán mô phỏng (`payment_simulation.html`), sao chép giao diện của MoMo hoặc VNPAY.
- Thanh toán thành công sẽ kích hoạt một bản cập nhật nguyên tử (atomic update) vào `LocalStorage`: chuyển trạng thái ghế từ `"locked"` sang `"booked"`, đồng thời lưu đơn hàng cuối cùng vào lịch sử đặt vé của người dùng.

## 5. Hóa đơn (`booking/checkout/booking_invoice.html`)
- Đọc thông tin chi tiết của giao dịch đặt vé đã được xác nhận.
- Hiển thị chi tiết poster phim, ghế đã đặt, combo bắp nước, và tổng số tiền thanh toán thông qua giao diện Glassmorphism cao cấp.
