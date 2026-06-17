```Sơ dồ kiến trúc hệ thống text
┌─────────────────────────────────────────────────────────────┐
│                     TẦNG GIAO DIỆN (Views / HTML Pages)     │
│  (Trang Đăng nhập, Trang Chủ, Trang Đặt vé, Hồ sơ user...)  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Lắng nghe DOM Events / Render UI
┌──────────────────────────▼──────────────────────────────────┐
│                  TẦNG CONTROLLER (Page JS)                  │
│  (booking.js, checkout.js, home.js, cancel-booking.js...)   │
└──────────────────────────┬──────────────────────────────────┘
                           │ Gọi hàm xử lý nghiệp vụ
┌──────────────────────────▼──────────────────────────────────┐
│               TẦNG SERVICE (Domain Logic)                   │
│  (bookingService.js, authService.js, paymentService.js...)  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Đọc/Ghi dữ liệu & Đồng bộ
┌──────────────────────────▼──────────────────────────────────┐
│               TẦNG DỮ LIỆU & TIỆN ÍCH (Utilities)           │
│  ┌───────────────────┐     ┌──────────────────────────┐     │
│  │  storage.js       │     │  BroadcastChannel API    │     │
│  │ (Wrapper cho Local/     │ (Đồng bộ khóa ghế real-  │     │
│  │  Session Storage) │     │  time giữa các Tab)      │     │
│  └───────────────────┘     └──────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```
