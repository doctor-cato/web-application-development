# Kiến trúc Frontend — 3HD2Kcinema

## Tổng quan

Kiến trúc hoàn toàn **client-side**, không có backend. Dựa trên mô hình **Feature-Based (Domain-Based)**: mỗi domain chứa đầy đủ HTML, JS controller, CSS và service riêng — tương tự cách tổ chức của Next.js App Router hoặc Angular modules, nhưng bằng Vanilla HTML/CSS/JS thuần.

---

## 1. Sơ đồ Kiến trúc Phân tầng

```text
┌─────────────────────────────────────────────────────────────┐
│                     GIAO DIỆN (HTML Pages)                   │
│  auth/*.html  explore/*.html  booking/*.html  user/*.html    │
└──────────────────────────┬──────────────────────────────────┘
                           │ DOM Events / Render
┌──────────────────────────▼──────────────────────────────────┐
│                  CONTROLLER (Page JS)                        │
│  booking.js  checkout.js  home.js  cancel-booking.js  ...   │
└──────────────────────────┬──────────────────────────────────┘
                           │ Function Calls
┌──────────────────────────▼──────────────────────────────────┐
│               FEATURE SERVICE (Domain Logic)                 │
│  bookingService.js  authService.js  paymentService.js  ...  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Read / Write / Sync
┌──────────────────────────▼──────────────────────────────────┐
│                   SHARED UTILITIES                           │
│  ┌───────────────────┐     ┌──────────────────────────┐     │
│  │  storage.js        │     │  BroadcastChannel API    │     │
│  │  (LocalStorage /   │     │  channel: 'seat_sync'    │     │
│  │   SessionStorage)  │     │  (Real-time seat lock)   │     │
│  └───────────────────┘     └──────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Domain-Based Structure

Mỗi domain tự chứa toàn bộ file liên quan:

```
src/
├── auth/
│   ├── user-login/login.html          ← View
│   ├── user-register/register.html    ← View
│   └── auth-services/authService.js   ← Service (skeleton, TODO)
├── booking/
│   ├── seat-booking/booking.js        ← Controller
│   ├── seat-booking/bookingService.js ← Service (BroadcastChannel logic)
│   ├── checkout/checkout.js           ← Controller
│   └── cancel-booking/cancel-booking.js ← Controller (hủy vé + lịch sử)
├── explore/
│   ├── home-page/home.js              ← Controller (hero slider, now showing)
│   └── movie-details/movie-detail.js  ← Controller (24KB — phức tạp nhất)
├── user/
│   └── loyalty-points/app.js         ← Controller (hệ thống điểm + tier)
└── shared/
    ├── components/navbar.js           ← Component dùng chung (1368 dòng)
    ├── utils/storage.js               ← Data layer (wrapper LS/SS)
    ├── utils/paymentService.js        ← Payment helper
    └── js/data.js                     ← Mock data (phim, rạp, suất chiếu)
```

**Quy tắc phân tầng:**
- **Controller**: xử lý DOM, render UI — **không được** gọi `localStorage` trực tiếp
- **Service**: chứa business logic, gọi qua `storage.js`
- **`storage.js`**: wrapper duy nhất cho `localStorage`/`sessionStorage`

---

## 3. Storage Keys thực tế (storage.js)

```js
KEYS = {
  USERS:            'cinema_users',
  CURRENT_USER:     'cinema_current_user',   // SessionStorage
  MOVIES:           'cinema_movies',
  BOOKINGS:         'cinema_bookings',
  SEAT_LOCKS:       'cinema_seat_locks',
  CHECKOUT:         'cinema_checkout',        // SessionStorage
  LAST_BOOKING:     'cinema_last_booking',
  PENDING_PAYMENTS: 'cinema_pending_payments'
}
```

---

## 4. Real-time Seat Sync (BroadcastChannel)

Channel name: **`seat_sync`** — khai báo trong `bookingService.js`

```
Tab A (User 1)                       Tab B (User 2)
─────────────────                    ─────────────────
click Ghế A5
→ bookingService.lockSeat()
  → lsSet(SEAT_LOCKS, ...)
  → channel.postMessage({            → channel.onmessage nhận
      type: 'seat_locked',           → updateSeat('A5', 'locked')
      showtimeId, seatId             → UI hiển thị ghế A5 bị khóa
    })
```

**Các event types:**
| Event | Mô tả |
|---|---|
| `seat_locked` | Ghế vừa bị khóa bởi user |
| `seat_unlocked` | Ghế được nhả (timeout hoặc deselect) |
| `seat_booked` | Ghế đã thanh toán thành công |

**Lock duration:** 15 phút (thực tế trong `bookingService.js`) — **Lưu ý:** docs cũ ghi 5 phút là sai.

---

## 5. Bot Simulation

Trong `booking.js`, hàm `simulateActivity()` dùng `setInterval` (mỗi **10 giây**) để giả lập người dùng khác ngẫu nhiên lock ghế — demo khả năng real-time của UI.

---

## 6. Pricing Logic

Giá vé tính theo ngày trong tuần (`booking.js`):

| Loại ghế | Ngày thường | Cuối tuần |
|---|---|---|
| Regular | 50,000đ | 65,000đ |
| VIP | 65,000đ | 80,000đ |
| Couple | 100,000đ | 150,000đ |

---

## 7. Shared Components

| Component | File | Mô tả |
|---|---|---|
| Navbar | `shared/components/navbar.js` | Render navbar động, hỗ trợ Quick Book dropdown, đa cấp path |
| Footer | `shared/components/footer.js` | Footer toàn site |
| MovieCard | `shared/components/movieCard.js` | Card phim tái sử dụng |
| SeatGrid | `shared/components/seatGrid.js` | Render lưới ghế ngồi |
| Toast | `shared/components/toast.js` | Thông báo popup |

---

## 8. Loyalty Tier System

Định nghĩa trong `user/loyalty-points/app.js`:

| Hạng | Điểm tối thiểu | Điểm tối đa |
|---|---|---|
| THÀNH VIÊN | 0 | 199 |
| BẠC | 200 | 499 |
| VÀNG | 500 | 999 |
| BẠCH KIM | 1000 | ∞ |
