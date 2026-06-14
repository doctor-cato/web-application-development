# Hướng dẫn dành cho AI Agent (Agent Guide)

Tài liệu này định nghĩa các quy tắc cốt lõi để các AI Agent (Cursor, Antigravity, GitHub Copilot) tuân thủ khi thao tác với codebase và tài liệu của 3HD2Kcinema.

## 1. Triết lý phát triển (Development Philosophy)
- Code cần: Hiện đại, Sạch sẽ, Dạng module (ES6 Modules), Dễ đọc, Dễ mở rộng.
- TRÁNH (Avoid): Overengineering, trừu tượng hóa không cần thiết, quản lý state quá phức tạp, tối ưu hóa sớm (premature optimization), và tạo ra các file quá lớn.
- **Code dễ đọc quan trọng hơn code thông minh/rườm rà.**

## 2. Quy tắc Frontend (HTML / CSS / JS)
- Sử dụng mã nguồn thuần (Vanilla HTML5, CSS3, ES6+ JavaScript).
- Phân định rõ công nghệ theo nhánh (branch):
  - **Nhánh `main`**: Sử dụng Vanilla CSS với phong cách Cinematic Noir, Glassmorphism. Tuyệt đối không dùng thư viện ngoài hay Tailwind CSS CDN.
  - **Nhánh `dev` (không phải dev2)**: Cho phép sử dụng Tailwind CSS.
- Sử dụng cấu trúc module JavaScript (`<script type="module">`) để chia nhỏ file logic thay vì viết code gộp trong một file lớn.
- Sử dụng CSS Custom Properties (Variables) để thiết lập design tokens nhất quán (màu sắc, khoảng cách, font chữ).
- Tất cả các tương tác UI (DOM manipulation) phải nhẹ nhàng, tối ưu hiệu năng và có hiệu ứng chuyển cảnh mượt mà.

## 3. Quy tắc Dữ liệu & Storage (Không Backend)
- **Database:** Sử dụng `LocalStorage` cho các dữ liệu cần lưu trữ lâu dài (tài khoản người dùng, danh sách phim mặc định, lịch sử đặt vé).
- **Session:** Sử dụng `SessionStorage` để quản lý trạng thái phiên đăng nhập của người dùng và thông tin giỏ hàng tạm thời.
- Viết các service quản lý dữ liệu (ví dụ: `js/services/storage.js`) làm lớp trung gian (Wrapper) để thao tác với `LocalStorage`/`SessionStorage` nhằm tránh gọi trực tiếp khắp nơi trong code.

## 4. Quy tắc cho Realtime Seat Booking (Tính năng giả lập)
- Đây là tính năng sống còn. Cần ngăn chặn trùng lặp ghế (double booking) và đồng bộ trạng thái.
- **Đồng bộ đa tab (Multi-tab Sync):** Sử dụng **BroadcastChannel API** để truyền tin nhắn đồng bộ trạng thái chọn ghế giữa các tab/cửa sổ trình duyệt khác nhau đang mở ứng dụng.
- **Giả lập người dùng khác (Simulation):** Sử dụng các hàm `setInterval` / `setTimeout` trong JS để giả lập các sự kiện người dùng khác đang đặt/nhả ghế ngẫu nhiên.
- **Tự động nhả (unlock) ghế:** Luôn tự động giải phóng ghế đang tạm giữ sau 5 phút nếu người dùng không tiến hành thanh toán hoặc khi tab bị đóng (sử dụng sự kiện `beforeunload` hoặc `pagehide`).

## 5. Quy trình làm việc & Tài liệu (Workflow & Docs)
- **Đồng bộ tài liệu:** Khi có bất kỳ thay đổi nào về tính năng, AI phải tự động nhắc nhở hoặc thực hiện việc cập nhật các file tài liệu chuẩn. **LƯU Ý:** Chỉ đọc và chỉnh sửa các file `.md` trong thư mục `Docs/`.
- Các nhánh chính: `main`, `develop`.
- Quy ước Commit: Dùng các tiền tố `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
