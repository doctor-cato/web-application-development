# Tổng quan Dự án — 3HD2Kcinema

## Giới thiệu

**3HD2Kcinema** là một ứng dụng web tĩnh, không sử dụng server (client-side only) mô phỏng hệ thống đặt vé xem phim. Dự án tập trung vào việc mô phỏng một trải nghiệm người dùng chuẩn điện ảnh theo thời gian thực hoàn toàn bên trong trình duyệt.

Mục tiêu dự án:
- Trình diễn cách phát triển web Vanilla theo hướng module (HTML + CSS + JS thuần), không dùng React, Vue hay Angular.
- Giới thiệu khả năng đồng bộ thời gian thực nguyên bản của trình duyệt qua **BroadcastChannel API**.
- Vận dụng `LocalStorage` và `SessionStorage` để mô phỏng cơ sở dữ liệu phía client.
- Chạy được ngay trên local không cần cài backend SDK (Node, ASP.NET, SQL Server...).

---

## Công nghệ Cốt lõi

| Công nghệ | Vai trò |
|---|---|
| **HTML5** | Cấu trúc nội dung, semantic markup |
| **Vanilla CSS3** | Cinematic Noir theme, Glassmorphism, CSS Custom Properties (không dùng Tailwind trên `main`) |
| **JavaScript ES6 Modules** | Logic theo module: controller, service, component tách biệt |
| **LocalStorage** | Giả lập database lâu dài: users, bookings, seat locks, movies |
| **SessionStorage** | Dữ liệu phiên: user đang đăng nhập, giỏ hàng checkout tạm thời |
| **BroadcastChannel API** | Đồng bộ sự kiện real-time (khóa ghế) giữa nhiều tab trình duyệt |

---

## Cách chạy Ứng dụng

Do ứng dụng dùng ES6 Modules, **bắt buộc phải chạy qua HTTP server** (trình duyệt chặn `file://` với modules).

### Cách 1 — npm run dev (Khuyến nghị — tương đương Live Server)

```bash
npm install
npm run dev
```
Mở trình duyệt tại: `http://localhost:3000`

> Server `serve` tự động phục vụ thư mục `src/` với hot-reload tương tự Live Server của VSCode.

### Cách 2 — Python HTTP Server

```bash
cd src/
python -m http.server 8000
```
Mở trình duyệt tại: `http://localhost:8000/index.html`

### Cách 3 — VSCode Live Server

Cài extension **Live Server**, click phải vào `src/index.html` → **Open with Live Server**.

---

## Cấu trúc Thư mục

```text
/ (repo root)
├── Docs/                      # Tài liệu dự án
├── package.json               # npm scripts (dev: serve, build: tailwind)
└── src/                       # Mã nguồn
    ├── index.html             # Redirect → explore/home-page/index.html
    ├── auth/                  # Domain: Xác thực
    │   ├── user-login/        # Trang đăng nhập
    │   ├── user-register/     # Trang đăng ký
    │   ├── forgot-password/   # Chưa triển khai
    │   └── auth-services/     # authService.js, auth.css
    ├── booking/               # Domain: Đặt vé
    │   ├── seat-booking/      # Chọn ghế + BroadcastChannel
    │   ├── booking-food/      # Combo Bắp Nước
    │   ├── checkout/          # Thanh toán + Cổng giả lập + Hóa đơn QR
    │   ├── cancel-booking/    # Hủy vé, đổi suất, lịch sử giao dịch
    │   └── group-booking/     # Mockup UI (chưa có JS)
    ├── user/                  # Domain: Người dùng
    │   ├── user-profile/      # Hồ sơ cá nhân
    │   ├── loyalty-points/    # Tích điểm & hạng thành viên (Member/Silver/Gold/Platinum)
    │   ├── user-notifications/# Trung tâm thông báo
    │   └── booking-history/   # Thư mục dự phòng (chức năng nằm ở cancel-booking)
    ├── explore/               # Domain: Khám phá
    │   ├── home-page/         # Trang chủ: Hero slider, Now Showing, Coming Soon
    │   ├── movie-details/     # Chi tiết phim: trailer, suất chiếu, đặt vé
    │   ├── movie-search/      # Tìm kiếm & lọc phim nâng cao
    │   └── cinema-map/        # Bản đồ cụm rạp
    ├── engagement/            # Domain: Tương tác ngoài lề
    │   ├── aftercredit-lounge/# Thảo luận & đánh giá phim sau khi xem
    │   └── minigame/          # Cinebet minigame
    └── shared/                # Dùng chung toàn dự án
        ├── css/               # main.css (design system), style.css
        ├── js/                # data.js (toàn bộ mock data phim/rạp)
        ├── components/        # navbar.js, footer.js, movieCard.js, seatGrid.js, toast.js
        └── utils/             # storage.js (wrapper LocalStorage/SessionStorage), paymentService.js
```

---

## Luồng Điều Hướng Chính

```
index.html → explore/home-page/index.html
           → explore/movie-details/index.html?id={movieId}
           → booking/seat-booking/booking.html?id={movieId}&showtimeId={id}
           → booking/booking-food/index.html
           → booking/checkout/checkout.html
           → booking/checkout/payment_simulation.html
           → booking/checkout/booking_invoice.html
```
