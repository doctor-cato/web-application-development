# Tính năng & Luồng Ứng dụng

Tài liệu này chi tiết các tính năng tương tác cốt lõi của hệ thống mô phỏng 3HD2Kcinema.

---

## 1. Duyệt Danh mục (`explore/home/index.html`)
- Hiển thị danh sách phim được tải động từ `movieService.js`.
- Tích hợp tính năng lọc theo thể loại.
- Hiển thị các poster phim và lịch chiếu.

## 2. Xác thực (`auth/login/login.html` & `auth/register/register.html`)
- Xác minh tính hợp lệ của dữ liệu đầu vào người dùng một cách sạch sẽ.
- Mô phỏng quá trình mã hóa mật khẩu (password hashing) và tạo token.
- Lưu trữ phiên đăng nhập trong `SessionStorage`.
- Component `navbar.js` sẽ tự động phản ứng với trạng thái `active_session`, thay thế nút "Đăng nhập" bằng menu thả xuống của Hồ sơ Người dùng.

## 3. Khóa Ghế Thời gian thực (`booking/core/booking.html`)
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

## 5. Hóa đơn Mã QR (`booking/checkout/booking_invoice.html`)
- Đọc thông tin chi tiết của giao dịch đặt vé đã được xác nhận.
- Sử dụng thư viện `qrcode.js` để tạo ra một mã QR vé có thể quét được hoàn toàn ở phía client, dựa trên một chuỗi băm vé duy nhất.
