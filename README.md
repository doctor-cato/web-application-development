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

Phân bổ theo feature branches (mẫu)
- main (static — HTML/CSS only)
  - src/public/* (HTML entry points)
  - src/assets/css/style.css

- feat/html-css-proto (HTML/CSS-only prototype)
  - Các trang HTML tĩnh đã được tinh chỉnh để demo UI mà không cần JS (booking.html, checkout.html, payment_simulation.html, booking_invoice.html)

- feat/seat-locking-proto (BroadcastChannel — front-end prototype)
  - src/assets/js/services/lockProto.js  (BroadcastChannel + localStorage TTL)
  - src/assets/js/services/storage.js
  - src/assets/js/services/paymentService.js (prototype wiring)
  - src/assets/js/pages/booking.js (loads lockProto in this branch)
  - src/public/booking.html (loads prototype script in this branch)

- feat/seat-locking (Socket/WebSocket, server required)
  - src/assets/js/services/seatSocket.js
  - src/assets/js/services/bookingService.js (socket hooks)
  - optional: server/ (example ws + redis pub/sub)

- feat/payment-flow (client-side payment + QR prototype)
  - src/assets/js/services/paymentService.js (create/confirm/cancel tx, build QR string)
  - src/assets/js/pages/checkout.js, payment.js, invoice.js
  - demo pages in src/public wired to these scripts on the feature branch

Lưu ý quản lý nhánh
- Giữ "main" chỉ chứa HTML/CSS; tất cả logic JS phát triển trên các nhánh feature.
- Khi hợp nhất, đặt mã feature vào thư mục rõ ràng: src/assets/js/features/<feature-name>/ hoặc src/features/<feature-name>/ trước khi refactor vào cấu trúc chung.
- Ghi chú: BroadcastChannel chỉ dùng cho demo trong cùng một profile trình duyệt. Production cần server (TTL authoritative, Redis, WebSocket).

Muốn mình thêm phần hướng dẫn merge hoặc ví dụ filepaths cho mỗi feature không?

Hướng dẫn phát triển
- Chỉnh sửa HTML/CSS/JS trong `src/`.
- Nếu cần live reloading, dùng Live Server trong VSCode.

Đóng góp
- Mở issue để báo lỗi hoặc đề xuất tính năng.
- Gửi pull request kèm mô tả thay đổi và cách để kiểm tra.

Liên hệ
- Tác giả: (thêm thông tin liên hệ nếu muốn)

