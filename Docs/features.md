# Tính năng & Luồng Ứng dụng — 3HD2Kcinema

Tài liệu chi tiết các tính năng và luồng nghiệp vụ của hệ thống mô phỏng.

## Bảng Theo Dõi Tiến Độ

> `✅` = Có code hoạt động | `🔄` = Mockup UI chưa có JS | `❌` = Chưa triển khai (chỉ có `.gitkeep`)

| # | Tính năng | Trạng thái | Vị trí code |
|---|---|---|---|
| 1 | Trang đăng nhập | ✅ | `src/auth/user-login/login.html` |
| 2 | Trang đăng ký | ✅ | `src/auth/user-register/register.html` |
| 3 | Quên mật khẩu & OTP | ❌ | `src/auth/forgot-password/` (chỉ `.gitkeep`) |
| 4 | Trang chủ (Hero + Now Showing + Coming Soon) | ✅ | `src/explore/home-page/` |
| 5 | Chi tiết phim (Trailer modal, Suất chiếu, Đặt vé) | ✅ | `src/explore/movie-details/` |
| 6 | Tìm kiếm & lọc phim nâng cao | ✅ | `src/explore/movie-search/` |
| 7 | Bản đồ & định vị cụm rạp | ✅ | `src/explore/cinema-map/` |
| 8 | Đặt ghế thời gian thực (BroadcastChannel) | ✅ | `src/booking/seat-booking/` |
| 9 | Chọn combo Bắp Nước | ✅ | `src/booking/booking-food/` |
| 10 | Thanh toán & Cổng giả lập (MoMo/VNPAY style) | ✅ | `src/booking/checkout/` |
| 11 | Hóa đơn điện tử + QR Code | ✅ | `src/booking/checkout/booking_invoice.html` |
| 12 | Hủy vé & Đổi suất chiếu | ✅ | `src/booking/cancel-booking/` |
| 13 | Lịch sử giao dịch | ✅ | `src/booking/cancel-booking/` (tab lịch sử) |
| 14 | Đặt & giữ ghế theo nhóm | 🔄 | `src/booking/group-booking/` (UI mockup, không có JS) |
| 15 | Hồ sơ cá nhân | ✅ | `src/user/user-profile/` |
| 16 | Hệ thống tích điểm & hạng thành viên | ✅ | `src/user/loyalty-points/` |
| 17 | Trung tâm thông báo | ✅ | `src/user/user-notifications/` |
| 18 | Chia tiền nhóm trong Profile | ❌ | Chưa triển khai |
| 19 | After-Credit Lounge (thảo luận & đánh giá phim) | ✅ | `src/engagement/aftercredit-lounge/` |
| 20 | Cinebet Minigame | ✅ | `src/engagement/minigame/` |

---

## 1. Trang chủ (`explore/home-page/`)

- **Hero Slider**: Tự động chuyển slide mỗi 5 giây, có fade transition. Dữ liệu từ `heroMovies[]` trong `data.js`.
- **Trailer Modal**: Nhúng YouTube iframe, phát hiện lỗi embed (Error 100/150/153) qua `postMessage` và hiển thị fallback.
- **Now Showing / Coming Soon**: Render danh sách phim động từ `data.js`.
- **Quick Book trên Navbar**: Dropdown chọn phim → rạp → ngày → giờ, render trong `navbar.js`.

---

## 2. Xác thực (`auth/`)

- Đăng nhập: Xác thực credentials với `cinema_users` trong LocalStorage.
- Đăng ký: Tạo tài khoản mới, lưu vào `cinema_users`.
- Phiên đăng nhập: Lưu `cinema_current_user` vào SessionStorage (tự xóa khi đóng tab).
- Mật khẩu: Encode Base64 — chỉ dùng cho demo, **không an toàn cho production**.
- `authService.js`: Hiện là skeleton (chỉ có TODO comments) — logic auth nằm trực tiếp trong các file HTML.

> ⚠️ **authService.js chưa có implementation** — đây là khoảng trống cần bổ sung.

---

## 3. Đặt ghế Thời gian thực (`booking/seat-booking/`)

Tính năng cốt lõi của bản mô phỏng, bắt chước concurrency của một nền tảng thực.

### Cơ chế Khóa Ghế
1. User click chọn ghế → `lockSeat(showtimeId, seatId, userId)`.
2. Ghi trạng thái vào `cinema_seat_locks` (LocalStorage).
3. Phát sự kiện `{ type: 'seat_locked', ... }` qua BroadcastChannel `seat_sync`.
4. Tất cả tab khác nhận sự kiện, cập nhật UI ngay lập tức.
5. Countdown **15 phút** bắt đầu. Hết thời gian → tự unlock + reload.

### Bot Simulation
- `setInterval` chạy mỗi **10 giây**, random lock ghế trống trong các hàng A–G.
- Giả lập người dùng khác đang đặt vé cùng lúc.

### Giá vé
| Loại ghế | Ngày thường | Cuối tuần |
|---|---|---|
| Regular | 50,000đ | 65,000đ |
| VIP | 65,000đ | 80,000đ |
| Couple | 100,000đ | 150,000đ |

---

## 4. Luồng Thanh toán (`booking/checkout/`)

1. `seat-booking/booking.js` lưu `pending_checkout` vào SessionStorage (`cinema_checkout`).
2. `checkout.html` đọc data từ `getCheckout()`, hiển thị order summary.
3. User chọn thêm combo Bắp Nước (none / single 65,000đ / double 95,000đ).
4. Chọn phương thức thanh toán → redirect `payment_simulation.html`.
5. Thanh toán giả lập 3 giây → gọi `confirmBooking()`:
   - Tạo booking record, push vào `cinema_bookings`.
   - Xóa seat locks, phát `seat_booked` event qua BroadcastChannel.
6. Redirect `booking_invoice.html` — hiển thị hóa đơn + QR string.

### QR Code Format
```
3HD2K-TICKET|ID:{bookingId}|MOVIE:{title}|SHOW:{showtime}|SEATS:{A1,B2}|TOTAL:{amount}
```

---

## 5. Lịch sử & Hủy vé (`booking/cancel-booking/`)

- Đọc tất cả bookings từ `cinema_bookings` (LocalStorage).
- Hiển thị 2 tab: **Vé của tôi** và **Lịch sử giao dịch**.
- Hủy vé: xóa booking khỏi mảng, hoàn điểm loyalty.
- Đổi suất chiếu: cập nhật `showtimeId` và thông tin mới trong booking.

---

## 6. Hệ thống Tích điểm (`user/loyalty-points/`)

4 hạng thành viên:

| Hạng | Điểm | Đặc quyền |
|---|---|---|
| THÀNH VIÊN | 0–199 | Tích điểm 1x |
| BẠC | 200–499 | Tích 1.5x, giảm 5% combo |
| VÀNG | 500–999 | Tích 2x cuối tuần, ưu tiên ghế đôi, giảm 10% combo |
| BẠCH KIM | 1000+ | Tích 3x, miễn phí upgrade, preview độc quyền |

---

## 7. After-Credit Lounge (`engagement/aftercredit-lounge/`)

Trang thảo luận và đánh giá phim sau khi xem. Toàn bộ là 1 file HTML inline (35.7KB), không tách JS riêng.

---

## 8. Cinebet Minigame (`engagement/minigame/`)

Mini-game giải trí tích hợp vào ứng dụng. Toàn bộ là 1 file HTML inline (14.2KB).
