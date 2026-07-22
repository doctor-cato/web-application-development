# Chi tiết Mã nguồn Frontend

Tài liệu này cung cấp hướng dẫn chi tiết về cấu trúc mã nguồn, ngôn ngữ thiết kế và các giải pháp kỹ thuật nổi bật của tầng Frontend trong 3HD2Kcinema.

---

## 🎨 Design System & Phong cách Giao diện

Giao diện 3HD2Kcinema được định hướng theo phong cách **Cinematic Noir & Glassmorphism**, mang đến cảm giác sang trọng của rạp chiếu phim hiện đại.

### Các thành phần Design Tokens

- **Tông màu chủ đạo**: Đen nhung (`#0b0c10`), Xám kim loại (`#1f2833`), Đỏ neon rạp phim (`#e50914`), Vàng VIP (`#ffd700`).
- **Hiệu ứng Glassmorphic**: Sử dụng `backdrop-filter: blur(12px)` kết hợp với đường viền mỏng trong suốt để tạo chiều sâu layer.
- **Typography**: Google Fonts (Inter / Outfit), tối ưu cho khả năng hiển thị thông tin rõ ràng.

---

## 📁 Tổ chức Thư mục `frontend/src/`

Mã nguồn được phân chia theo từng miền tính năng (Domain):

```text
frontend/src/
├── index.html                   # Trang điều hướng ban đầu (Redirect sang Trang chủ)
├── auth/                        # Phân hệ Xác thực
│   ├── user-login/              # Giao diện Đăng nhập & Controller
│   ├── user-register/           # Giao diện Đăng ký tài khoản
│   ├── forgot-password/         # Giao diện Quên & Cấp lại Mật khẩu
│   └── auth-services/           # authService.js (Xử lý Mock Session & Auth)
├── explore/                     # Phân hệ Khám phá Phim
│   ├── home-page/               # Trang chủ (Banner Hero, Danh sách Phim Hot)
│   ├── movie-details/           # Trang Chi tiết Phim, Trailer & Chọn Suất chiếu
│   ├── movie-search/            # Tìm kiếm phim thời gian thực & Lọc định dạng (2D/3D/IMAX)
│   └── cinema-map/              # Bản đồ cụm rạp & Định vị khoảng cách (Geolocation API)
├── booking/                     # Phân hệ Đặt vé
│   ├── seat-booking/            # Sơ đồ chọn ghế, Khóa ghế real-time & BroadcastChannel
│   ├── booking-food/            # Chọn Combo Bắp Nước (Cuộn ngang Responsive)
│   ├── checkout/                # Trang Hóa đơn thanh toán & Mã QR E-Ticket
│   ├── booking-success/         # Màn hình Xác nhận Đặt vé Thành công
│   └── group-booking/           # Phòng chờ đặt vé nhóm (Phát triển thử nghiệm WIP)
├── user/                        # Phân hệ Cá nhân
│   ├── user-profile/            # Hồ sơ người dùng, Lịch sử đặt vé & Hủy vé linh hoạt
│   ├── loyalty-points/          # Quản lý Điểm thưởng & Hạng thành viên
│   ├── vip-registration/        # Đăng ký Gói VIP Multiplier (Silver, Gold, Platinum)
│   └── user-notifications/      # Trung tâm Thông báo tin nhắn hệ thống
├── engagement/                  # Phân hệ Tương tác
│   └── minigame/                # Cinebet Minigame đặt cược điểm tích lũy
└── shared/                      # Thành phần Dùng chung
    ├── components/              # navbar.js (Tự đóng dropdown, tìm kiếm), footer.js
    ├── utils/                   # storage.js (Lớp thao tác Storage an toàn)
    └── css/                     # Dynamic Stylesheet & Design Tokens
```

---

## ⚡ Các Kỹ thuật Nổi bật tại Frontend

### 1. Đồng bộ Khóa Ghế Đa Tab qua BroadcastChannel

Khi một người dùng chọn ghế trên sơ đồ rạp (`seat-booking/booking.html`):

1. File `bookingService.js` cập nhật trạng thái tạm khóa ghế vào `LocalStorage` (`cinema_seat_locks`).
2. Phát đi một event qua `BroadcastChannel('seat_sync')`:

   ```javascript
   const channel = new BroadcastChannel('seat_sync');
   channel.postMessage({
     type: 'SEAT_LOCKED',
     showtimeId: 'ST101',
     seatId: 'A5',
     userId: 'user_123'
   });
   ```

3. Tất cả các tab khác đang mở cùng trang chọn ghế nhận sự kiện và vô hiệu hóa nút bấm của ghế `A5`, ngăn chặn đặt trùng lặp (Double-booking).

### 2. Tự động Nhả Ghế (Auto-Release)

- Ghế khóa có thời hạn mặc định là **15 phút**.
- Khi người dùng đóng tab hoặc chuyển trang, sự kiện `beforeunload` tự động được kích hoạt để loại bỏ thông tin khóa ghế tạm thời khỏi bộ nhớ.

### 3. Hủy vé & Hoàn ghế Từng phần (Partial Ticket Cancellation)

Tại trang Hồ sơ cá nhân (`user/user-profile/profile.html`), người dùng có thể mở từng hóa đơn đã mua và chọn hủy một số ghế nhất định. Hệ thống sẽ:

- Giải phóng các ghế bị hủy trên sơ đồ rạp.
- Trừ bớt số điểm thưởng tương ứng đã cộng trước đó.
- Cập nhật lại hóa đơn trong `LocalStorage` và bắn thông báo Toast thông tin.

### 4. Tối ưu Giao diện Di động (Mobile First UX)

- **Menu Bắp Nước**: Tối ưu cuộn ngang (`overflow-x: auto`) kèm hiệu ứng chạm mượt mượt trên điện thoại di động.
- **Tự đóng Dropdown**: Bất kỳ menu thả xuống nào (Avatar Profile, Notification Bell) sẽ tự động đóng lại khi người dùng nhấp hoặc chạm ra vùng ngoài màn hình (`click outside handler`).
