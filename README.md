# 3HD2Kcinema — Mô phỏng Đặt Vé Rạp Chiếu Phim (Vanilla JS)

Ứng dụng web tĩnh mô phỏng toàn bộ luồng đặt vé rạp chiếu phim, từ xem phim, chọn ghế thời gian thực, thanh toán đến hóa đơn QR. Thuần Frontend — không có Backend server.

## Công nghệ sử dụng

| Công nghệ | Mô tả |
|---|---|
| **HTML5** | Cấu trúc trang, semantic markup |
| **Vanilla CSS3** | Cinematic Noir theme, Glassmorphism, CSS Custom Properties |
| **JavaScript ES6 Modules** | `<script type="module">`, không dùng framework |
| **LocalStorage** | Giả lập database: users, bookings, seat locks |
| **SessionStorage** | Phiên đăng nhập (`cinema_current_user`), giỏ hàng (`cinema_checkout`) |
| **BroadcastChannel API** | Đồng bộ ghế thời gian thực giữa nhiều tab |

## Cách chạy (Local)

> **Bắt buộc** phải chạy qua HTTP server (do chính sách CORS với `file://` và ES6 Modules).

### Cách 1 — `npm run dev` (Khuyến nghị)

```bash
npm install
npm run dev
# Mở trình duyệt: http://localhost:3000
```

### Cách 2 — Python HTTP Server

```bash
cd src/
python -m http.server 8000
# Mở trình duyệt: http://localhost:8000/index.html
```

### Cách 3 — VSCode Live Server

Click phải vào `src/index.html` → **Open with Live Server**

## Cấu trúc thư mục

```text
/ (repo root)
├── Docs/                      # Tài liệu kiến trúc & nghiệp vụ
├── src/                       # Source code chính
│   ├── index.html             # Redirect → explore/home-page/
│   ├── auth/                  # Domain: Xác thực (login, register)
│   ├── booking/               # Domain: Đặt vé (seat, food, checkout, cancel)
│   ├── user/                  # Domain: Người dùng (profile, loyalty, notifications)
│   ├── explore/               # Domain: Khám phá (home, movie-details, search, cinema-map)
│   ├── engagement/            # Domain: Tương tác (aftercredit-lounge, minigame)
│   └── shared/                # Dùng chung (navbar, footer, storage, data, CSS)
└── package.json               # npm scripts: dev (serve), build (tailwind)
```

## Bảng Theo Dõi Tiến Độ Tính Năng

| Trạng thái | Tính năng | Vị trí |
|---|---|---|
| ✅ Hoàn thành | Trang đăng nhập | `src/auth/user-login/login.html` |
| ✅ Hoàn thành | Trang đăng ký | `src/auth/user-register/register.html` |
| ✅ Hoàn thành | Trang chủ (Hero + Now Showing + Coming Soon) | `src/explore/home-page/` |
| ✅ Hoàn thành | Chi tiết phim (Trailer, Suất chiếu, Đặt vé) | `src/explore/movie-details/` |
| ✅ Hoàn thành | Tìm kiếm & lọc phim nâng cao | `src/explore/movie-search/` |
| ✅ Hoàn thành | Bản đồ & định vị cụm rạp | `src/explore/cinema-map/` |
| ✅ Hoàn thành | Đặt ghế thời gian thực (BroadcastChannel) | `src/booking/seat-booking/` |
| ✅ Hoàn thành | Chọn combo Bắp Nước | `src/booking/booking-food/` |
| ✅ Hoàn thành | Thanh toán & Cổng thanh toán giả lập | `src/booking/checkout/` |
| ✅ Hoàn thành | Hóa đơn điện tử (QR Code) | `src/booking/checkout/booking_invoice.html` |
| ✅ Hoàn thành | Trang Đặt Vé Thành Công | `src/booking/booking-success/` |
| ✅ Hoàn thành | Hủy vé & Đổi suất chiếu + Lịch sử | `src/booking/cancel-booking/` |
| ✅ Hoàn thành | Hồ sơ cá nhân | `src/user/user-profile/` |
| ✅ Hoàn thành | Hệ thống tích điểm & hạng thành viên | `src/user/loyalty-points/` |
| ✅ Hoàn thành | Trung tâm thông báo | `src/user/user-notifications/` |
| ✅ Hoàn thành | After-Credit Lounge (thảo luận phim) | `src/engagement/aftercredit-lounge/` |
| ✅ Hoàn thành | Cinebet Minigame | `src/engagement/minigame/` |
| 🔄 Mockup UI | Đặt & giữ ghế theo nhóm (không có JS) | `src/booking/group-booking/` |
| ❌ Chưa triển khai | Quên mật khẩu & Xác thực OTP | `src/auth/forgot-password/` |
| ❌ Chưa triển khai | Chia tiền nhóm trong Profile | — |

## Tài liệu

Xem thư mục [`Docs/`](./Docs/) để hiểu sâu hơn về kiến trúc, storage schema và quy trình phát triển:

- [`Docs/overview.md`](./Docs/overview.md) — Tổng quan dự án
- [`Docs/architecture.md`](./Docs/architecture.md) — Kiến trúc Feature-Based
- [`Docs/features.md`](./Docs/features.md) — Tính năng & luồng nghiệp vụ
- [`Docs/data-storage.md`](./Docs/data-storage.md) — Schema LocalStorage & SessionStorage
- [`Docs/workflows.md`](./Docs/workflows.md) — Git flow & quy tắc code
