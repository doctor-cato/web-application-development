# Dự án Web (HTML / CSS / JS)

Mô tả: Đây là một ứng dụng front-end đơn giản dùng HTML, CSS và JavaScript (không có backend). Dự án mô phỏng quy trình đặt vé - gồm trang danh sách, đăng nhập, đặt vé, thanh toán, và hoá đơn.

Công nghệ chính
- HTML5
- CSS (src/assets/css/style.css)
- Vanilla JavaScript (src/assets/js/)

Yêu cầu
- Trình duyệt hiện đại (Chrome/Edge/Firefox)
- (Tùy chọn) Python 3 hoặc một HTTP server tĩnh để phục vụ file khi cần

Chạy ứng dụng (cách nhanh nhất)
1. Mở file `src/public/index.html` trực tiếp bằng trình duyệt (cho phát triển đơn giản).
2. Hoặc chạy một HTTP server tĩnh để tránh hạn chế CORS/đường dẫn:
   - Python: `python -m http.server 8000` (mở http://localhost:8000/src/public/index.html)
   - VSCode: Dùng extension "Live Server" và mở `src/public/index.html`

Cấu trúc dự án (các file quan trọng)
- src/
  - public/ (HTML entry points)
    - index.html - Trang chính
    - login.html, register.html, booking.html, checkout.html, payment_simulation.html, booking_invoice.html, profile.html
  - assets/
    - css/ (style.css)
    - js/ (components/, pages/, services/)
      - components/ (toast, navbar, movieCard, seatGrid)
      - pages/ (index.js, login.js, register.js, booking.js, checkout.js, payment.js, profile.js, invoice.js)
      - services/ (movieService.js, bookingService.js, paymentService.js, authService.js, storage.js)

Hướng dẫn phát triển
- Chỉnh sửa HTML/CSS/JS trong `src/`.
- Nếu cần live reloading, dùng Live Server trong VSCode.

Đóng góp
- Mở issue để báo lỗi hoặc đề xuất tính năng.
- Gửi pull request kèm mô tả thay đổi và cách để kiểm tra.

Liên hệ
- Tác giả: (thêm thông tin liên hệ nếu muốn)

