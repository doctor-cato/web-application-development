# Cổng thanh toán & Luồng Checkout Giả Lập

## Tổng quan (Overview)
Hệ thống tích hợp các cổng thanh toán trực tuyến (VNPAY và MoMo) dạng giả lập trực tiếp trên client để hoàn thành quy trình đặt vé. Hệ thống này đồng bộ với dữ liệu giữ ghế trong `LocalStorage` và `SessionStorage` để đảm bảo quy trình diễn ra mượt mà và không trùng lặp ghế.

---

## Luồng người dùng đặt vé (User Booking Flow)

1. **Chọn Phim & Suất chiếu:** Duyệt danh sách phim từ file JSON cục bộ, chọn lịch chiếu trên giao diện.
2. **Chọn ghế (Seat Selection):** 
   - Click chọn ghế trống trên sơ đồ phòng chiếu.
   - **Hành động Client-Side:** Cập nhật trạng thái `locked` vào `LocalStorage` của suất chiếu đó và phát tin nhắn qua **BroadcastChannel** để đồng bộ với các tab khác. Hệ thống bắt đầu đếm ngược 5 phút để giữ ghế.
3. **Thanh toán (Checkout):**
   - Chuyển hướng sang trang `checkout.html`.
   - Giao diện hiển thị thông tin giỏ hàng (phim, suất chiếu, ghế, tổng tiền) kèm theo **Đồng hồ đếm ngược (Countdown Timer)**.
   - Chọn combo bắp nước đi kèm và chọn cổng thanh toán giả lập (MoMo hoặc VNPAY).
4. **Xử lý giao dịch giả lập:**
   - Client gọi hàm `paymentService.createPaymentRequest()`, ghi nhận giao dịch trạng thái `pending` và chuyển hướng sang trang `payment_simulation.html`.
   - Trang giả lập hiển thị mã QR Code thanh toán tương ứng và thông tin hóa đơn.
5. **Xác nhận giao dịch (Confirmation):**
   - **Thành công:** Người dùng click nút **"Thanh toán thành công"**. Hệ thống cập nhật trạng thái Booking thành `confirmed` và chuyển trạng thái ghế từ `locked` thành `booked` trong LocalStorage, tạo mã QR vé offline và chuyển về trang xem hóa đơn/hồ sơ.
   - **Thất bại / Hủy bỏ:** Người dùng click nút **"Hủy giao dịch"** hoặc đồng hồ đếm ngược hết giờ. Ghế bị khóa được nhả tự động về trạng thái `available` trong LocalStorage và gửi sự kiện đồng bộ đa tab. Người dùng được chuyển về trang chọn ghế kèm thông báo lỗi.

---

## Logic xử lý ngầm (Client-Side Task Handling)

### Countdown Timer (Đồng hồ đếm ngược)
Trang `checkout.html` sử dụng một timer JavaScript đếm ngược từ `300` giây (5 phút). Khi đếm ngược về 0:
* Tự động xóa giỏ hàng tạm thời trong `SessionStorage`.
* Gọi hàm `bookingService.unlockSeat()` để giải phóng ghế trong `LocalStorage`.
* Hiển thị thông báo "Hết thời gian thanh toán" và điều hướng người dùng quay trở lại trang sơ đồ ghế ngồi.

### Tạo Vé QR Offline
Sau khi xác nhận thanh toán thành công, trang hóa đơn sử dụng thư viện JavaScript `qrcode.js` để render một mã QR chứa thông tin mã vé (ví dụ: `TICKET_bk_1781018950_SEATS_A3_A4`). Mã QR này được vẽ trực tiếp trên canvas của trình duyệt, cho phép người dùng lưu trữ hoặc chụp màn hình để check-in tại quầy vé mà không cần kết nối mạng.
