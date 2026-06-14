# 3HD2Kcinema - Trình mô phỏng Đặt vé Vanilla JS

Đây là một ứng dụng web mô phỏng hệ thống đặt vé rạp chiếu phim, tập trung vào trải nghiệm UI Cinematic và đồng bộ trạng thái ghế thời gian thực (Real-time Seat Booking Simulation). Dự án này thuần Frontend và hoàn toàn không có Backend server.

## Công nghệ sử dụng
- **HTML5**
- **Vanilla CSS3 (Cinematic Noir Theme, Glassmorphism)**
- **Vanilla JavaScript (ES6 Modules)**
- CSDL mô phỏng qua **LocalStorage** và **SessionStorage**
- Đồng bộ Real-time qua **BroadcastChannel API**

## Cách chạy ứng dụng (Local)
Vì dự án dùng Javascript Modules (`<script type="module">`), bạn cần một HTTP server tĩnh để tránh lỗi CORS.
1. Khởi chạy HTTP server tĩnh trong thư mục `src/`:
   ```bash
   cd src/
   python -m http.server 8000
   ```
2. Truy cập: `http://localhost:8000/index.html` (Trình duyệt sẽ tự động điều hướng vào trang chủ `explore/home-page/index.html`).

Hoặc sử dụng extension **Live Server** trong VSCode, click chuột phải vào `src/index.html` -> Open with Live Server.

## Cấu trúc thư mục (Kiến trúc theo Lĩnh vực / Domain-Based Architecture)
Dự án được tổ chức theo từng phân hệ (Domain/Feature) giống như các project hiện đại (Next.js, Angular, Domain-Driven Design), mặc dù code hoàn toàn là Vanilla JS.

```text
/ (repo root)
├─ Docs/                     # Toàn bộ tài liệu kiến trúc & ASCII Diagram
└─ src/                      # Source code chính
   ├─ index.html             # Chuyển hướng (Redirect)
   ├─ auth/                  # Domain: Xác thực (login, register, forgot-password)
   ├─ booking/               # Domain: Đặt vé (chọn ghế, thanh toán, hóa đơn)
   ├─ user/                  # Domain: Người dùng (hồ sơ, lịch sử, khách hàng thân thiết)
   ├─ explore/               # Domain: Khám phá (trang chủ, phim, bản đồ rạp)
   ├─ engagement/            # Domain: Tương tác (hẹn hò, minigame)
   └─ shared/                # Dùng chung (Shared Services, Components, CSS)
```

## Tài liệu
Hãy đọc thư mục `Docs/` để hiểu sâu hơn về kiến trúc phân tầng, cách lưu trữ dữ liệu, lộ trình phát triển (Roadmap), và cách thức hoạt động của cơ chế giả lập Real-time.

## Bảng Theo Dõi Tiến Độ Tính Năng

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
- [x] **Giao diện đặt vé thành công có mã QR**: Đã hoàn thành.
- [x] **Hủy vé và thay đổi suất chiếu**: Đã hoàn thành (nằm trong `src/booking/cancel-booking/`).
- [x] **Bản đồ và định vị rạp**: Đã hoàn thành.
- [x] **Trang ghép đôi Cine-Match**: Đã hoàn thành (giao diện Landing Page tại `src/engagement/dating/`).
- [x] **Trung tâm thông báo**: Đã hoàn thành (nằm trong `src/user/user-notifications/`).
- [x] **Cinebet minigame**: Đã hoàn thành (phần giả lập minigame tại `src/engagement/minigame/`).
- [/] **Đặt và giữ ghế cho nhóm**: Giao diện Mockup (nằm trong `src/booking/group-booking/`).
- [x] **Thảo luận đánh giá về phim sau khi xem**: Đã hoàn thành (phần giả lập After-Credit Lounge tại `src/engagement/aftercredit-lounge/`).
- [ ] **Tính năng chia tiền nhóm & Hủy vé trong Profile**: Chưa có code triển khai.
