# Hướng Dẫn Kiểm Tra Toàn Bộ Tính Năng (Feature Testing Guide)

Tài liệu này cung cấp các bước chi tiết để kiểm tra toàn bộ các tính năng đã được triển khai trong dự án 3HD2Kcinema. 

## Chuẩn bị
Trước khi bắt đầu, hãy đảm bảo bạn đã khởi chạy server tĩnh:
```bash
cd src/
python -m http.server 8000
```
Truy cập: `http://localhost:8000/index.html` hoặc `http://127.0.0.1:8000/index.html`

---

## Danh sách các tính năng đã hoàn thành và cách kiểm tra

### 1. Trang đăng nhập & Điều hướng (Index)
- **Đường dẫn**: `src/auth/user-login/` và `src/index.html`
- **Cách kiểm tra**:
  1. Mở `http://localhost:8000/`. Trình duyệt sẽ tự động chuyển hướng đến trang chủ hoặc yêu cầu đăng nhập nếu cần.
  2. Truy cập trực tiếp trang đăng nhập. Thử nhập sai định dạng email hoặc để trống mật khẩu để kiểm tra validation.
  3. Đăng nhập thành công, kiểm tra xem SessionStorage có lưu thông tin người dùng hay không và Navbar có thay đổi nút "Đăng nhập" thành dropdown Profile không.

### 2. Trang chủ (Home Page)
- **Đường dẫn**: `src/explore/home-page/`
- **Cách kiểm tra**:
  1. Kiểm tra danh sách phim đang chiếu và sắp chiếu được load đầy đủ.
  2. Click vào các bộ lọc thể loại phim để xem danh sách phim thay đổi tương ứng.
  3. Kiểm tra các hiệu ứng UI (hover, animation) trên poster phim.

### 3. Tìm kiếm và Lọc nâng cao
- **Đường dẫn**: `src/explore/movie-search/`
- **Cách kiểm tra**:
  1. Nhập từ khóa tên phim vào thanh tìm kiếm trên giao diện.
  2. Sử dụng các tùy chọn lọc kết hợp (thể loại, ngày chiếu, rạp).
  3. Kiểm tra xem kết quả hiển thị có chính xác theo các tiêu chí đã chọn không.

### 4. Bản đồ và Định vị rạp
- **Đường dẫn**: `src/explore/cinema-map/`
- **Cách kiểm tra**:
  1. Mở trang Bản đồ Rạp.
  2. Kiểm tra xem bản đồ (Leaflet.js) có hiển thị chính xác các vị trí rạp chiếu hay không.
  3. Tương tác với các marker trên bản đồ để xem thông tin chi tiết của từng rạp.

### 5. Đặt ghế & Giá ghế động (Dynamic Pricing)
- **Đường dẫn**: `src/booking/seat-booking/`
- **Cách kiểm tra**:
  1. Chọn một suất chiếu và tiến vào trang Đặt ghế.
  2. Kiểm tra **Giá ghế động**: Các ghế VIP, ghế đôi (Sweetbox) hoặc ghế trung tâm phải có giá khác biệt so với ghế thường.
  3. **Real-time Lock**: Click chọn 1 ghế, ghế đó phải chuyển sang trạng thái "Locked".
  4. Mở một tab ẩn danh (hoặc trình duyệt khác) vào cùng trang chọn ghế đó, ghế bạn vừa chọn ở tab 1 phải hiển thị trạng thái "Locked" và không thể chọn được.
  5. Kiểm tra đồng hồ đếm ngược (5 phút) sau khi chọn ghế.

### 6. Bắp nước / Bỏng nước
- **Đường dẫn**: `src/booking/booking-food/`
- **Cách kiểm tra**:
  1. Sau khi chọn ghế, chuyển sang bước mua bắp nước.
  2. Thêm/bớt các combo bắp nước và kiểm tra tổng tiền hiển thị trên màn hình có tự động cập nhật đúng hay không.
  3. Nhấn "Tiếp tục" để xem dữ liệu có được lưu trữ đúng vào `SessionStorage` (pending_checkout) không.

### 7. Thanh toán & Cổng thanh toán mô phỏng
- **Đường dẫn**: `src/booking/checkout/` và giao diện thanh toán.
- **Cách kiểm tra**:
  1. Ở trang Checkout, kiểm tra lại thông tin vé và bắp nước đã chọn xem có khớp không.
  2. Bấm "Thanh toán", hệ thống sẽ chuyển đến trang giả lập cổng thanh toán (MoMo/VNPAY).
  3. Thao tác thanh toán thành công. Kiểm tra `LocalStorage` xem ghế đã chuyển từ "locked" sang "booked" chưa.

### 8. Giao diện Hóa đơn có mã QR
- **Đường dẫn**: `src/booking/checkout/booking_invoice.html`
- **Cách kiểm tra**:
  1. Sau khi thanh toán thành công ở bước 7, hệ thống phải tự động chuyển đến trang Hóa đơn.
  2. Kiểm tra mã QR được gen ra trên màn hình. Sử dụng điện thoại để quét mã QR xem có trả về chuỗi hash/chi tiết vé hợp lệ không.
  3. Xác minh thông tin giao dịch hiển thị trên hóa đơn trùng khớp với những gì đã chọn.
  4. Kiểm tra xem email xác nhận có được mô phỏng gửi thành công (thông báo UI).

### 9. Hồ sơ cá nhân & Hệ thống Tích điểm
- **Đường dẫn**: `src/user/user-profile/` và `src/user/loyalty-points/`
- **Cách kiểm tra**:
  1. Truy cập vào trang Hồ sơ cá nhân từ Navbar.
  2. Kiểm tra thông tin cá nhân hiển thị.
  3. Xem mục **Hệ thống tích điểm**. Sau khi hoàn tất một giao dịch thành công (ở bước 7), số điểm tích lũy của người dùng trong Profile phải tự động được cộng thêm tương ứng với giá trị đơn hàng.

---

*Lưu ý: Nếu bạn gặp vấn đề lỗi về trạng thái ghế bị kẹt, hãy clear `LocalStorage` và `SessionStorage` trong DevTools (F12 > Application).*
