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
├── about/                       # Trang giới thiệu dự án
├── assets/                      # CSS chung, fonts, icons tĩnh
├── auth/                        # Phân hệ Xác thực
├── booking/                     # Phân hệ Đặt vé & Thanh toán
├── engagement/                  # Phân hệ Tương tác (Minigame CineMatch, v.v.)
├── explore/                     # Phân hệ Khám phá Phim & Bản đồ rạp
├── footer/                      # Component Footer
├── images/                      # Hình ảnh động (posters, banners, qr)
├── management/                  # Giao diện Quản lý Admin & Staff POS
├── shared/                      # Thành phần Dùng chung (Navbar, Storage Utils)
├── user/                        # Phân hệ Cá nhân (Profile, Loyalty, VIP)
├── index.html                   # Trang điều hướng ban đầu
└── wip.html                     # Trang báo lỗi/Đang phát triển
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

- **Menu Bắp Nước**: Tối ưu cuộn ngang (`overflow-x: auto`) kèm hiệu ứng chạm mượt trên điện thoại di động.
- **Tự đóng Dropdown**: Bất kỳ menu thả xuống nào (Avatar Profile, Notification Bell) sẽ tự động đóng lại khi người dùng nhấp hoặc chạm ra vùng ngoài màn hình (`click outside handler`).
- **Responsive Toàn diện**: Chuẩn hóa layout trên tất cả trang — navbar, admin portal, staff POS, home page bằng Tailwind CSS breakpoints.

---

## 📡 5. CineMatch Minigame (Firebase Real-time)

CineMatch là minigame kết nối người dùng với nhau dựa trên thị hiếu phim, được tiếp tục được nâng cấp lên giao diện card-based mới:

- **Firebase Real-time Database**: Đồng bộ trạng thái match giữa các người dùng theo thời gian thực.
- **Emoji Chat**: Người dùng có thể phản ứng nhanh bằng emoji trong quá trình soán tương thích.
- **Compatibility Breakdown**: Phân tích chi tiết mức độ tương thích theo từng thể loại phim.
- **Match Timer**: Đồng hồ đếm ngược để tạo áp lực và tăng tính cạnh tranh.
- **SignalR Guard**: Kiểm tra `userId` và `username` trước khi gửi lên Hub, tránh lỗi khi user chưa đăng nhập.

---

## 💳 6. Thanh toán QR Code Đa Phương thức

Checkout page hỗ trợ 3 phương thức QR Code với hình ảnh động:

- **Chuyển khoản Ngân hàng**: QR code tài khoản ngân hàng.
- **ZaloPay**: QR code đặc trưng ZaloPay.
- **MoMo**: QR code ví MoMo.

Mỗi ghế trong booking nhóm được cấp mã vé QR riêng biệt (độc lập) thay vì dùng chung một mã.
