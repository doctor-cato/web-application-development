# 3HD2Kcinema - Vanilla JS Booking Simulator

Đây là một ứng dụng web mô phỏng hệ thống đặt vé rạp chiếu phim, tập trung vào trải nghiệm UI Cinematic và đồng bộ trạng thái ghế thời gian thực (Real-time Seat Booking Simulation). Dự án này thuần Frontend và hoàn toàn không có Backend server.

## Công nghệ sử dụng
- **HTML5**
- **CSS3 / Tailwind CSS (CDN)**
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
2. Truy cập: `http://localhost:8000/index.html` (Trình duyệt sẽ tự động điều hướng vào trang chủ `home/index.html`).

Hoặc sử dụng extension **Live Server** trong VSCode, click chuột phải vào `src/index.html` -> Open with Live Server.

## Cấu trúc thư mục (Feature-Based Architecture)
Dự án được tổ chức theo từng tính năng (Feature) giống như các project hiện đại (Next.js, Angular, Domain-Driven Design), mặc dù code hoàn toàn là Vanilla JS.

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
