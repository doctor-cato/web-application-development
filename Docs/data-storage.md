# Mô phỏng Lưu trữ Dữ liệu — 3HD2Kcinema

Vì 3HD2Kcinema không có backend, toàn bộ trạng thái ứng dụng được lưu trong trình duyệt qua 2 cơ chế:

1. **`LocalStorage`** — Dữ liệu vĩnh viễn (tồn tại sau khi đóng/mở lại tab).
2. **`SessionStorage`** — Dữ liệu phiên (tự xóa khi đóng tab).

Tất cả thao tác dữ liệu đi qua file `shared/utils/storage.js` — **không được** gọi `localStorage`/`sessionStorage` trực tiếp trong controller hay view.

---

## API của storage.js

```js
// LocalStorage
lsGet(key, defaultValue)   // đọc + parse JSON
lsSet(key, value)          // stringify + ghi
lsRemove(key)              // xóa key

// SessionStorage
ssGet(key, defaultValue)
ssSet(key, value)
ssRemove(key)

// Domain helpers
getBookings() / saveBookings(bookings)
getCheckout() / saveCheckout(data)       // SessionStorage
getLastBooking() / saveLastBooking(b)
getUsers() / saveUsers(users)
getCurrentUser() / setCurrentUser(u)     // SessionStorage
clearCurrentUser()
getPendingPayments() / savePendingPayments(map)
```

---

## Storage Keys thực tế

```js
KEYS = {
  USERS:            'cinema_users',           // LocalStorage
  CURRENT_USER:     'cinema_current_user',    // SessionStorage
  MOVIES:           'cinema_movies',          // LocalStorage
  BOOKINGS:         'cinema_bookings',        // LocalStorage
  SEAT_LOCKS:       'cinema_seat_locks',      // LocalStorage
  CHECKOUT:         'cinema_checkout',        // SessionStorage
  LAST_BOOKING:     'cinema_last_booking',    // LocalStorage
  PENDING_PAYMENTS: 'cinema_pending_payments' // LocalStorage
}
```

> **Lưu ý:** Key thực tế trong code là `cinema_*`, **không phải** `users_db`, `movies_db` như docs cũ ghi.

---

## Schema LocalStorage

### `cinema_users` (Array)
```json
[
  {
    "userId": "usr_1717891200",
    "name": "Nguyen Van A",
    "email": "a@example.com",
    "password": "base64_encoded_password",
    "role": "user"
  }
]
```

### `cinema_movies` (Array — tùy chọn)
Nếu có sẽ override `data.js`. Nếu không có, dữ liệu lấy từ `shared/js/data.js` (hardcoded).
```json
[
  {
    "id": "your-name",
    "title": "YOUR NAME - TÊN CẬU LÀ GÌ?",
    "showtimes": [
      { "id": "st_200", "date": "2026-06-20", "time": "19:30", "room": "Phòng 3" }
    ]
  }
]
```

### `cinema_bookings` (Array)
```json
[
  {
    "id": "bk_m5k2abc1XY",
    "movieTitle": "YOUR NAME",
    "showtimeId": "st_200",
    "showtimeText": "19:30",
    "room": "Phòng 3",
    "seats": ["A1", "A2"],
    "combo": "double",
    "total": 255000,
    "userId": "usr_1717891200",
    "transactionId": "TXN_20260616_482931",
    "paymentMethod": "momo",
    "createdAt": "2026-06-16T12:30:00.000Z"
  }
]
```

### `cinema_seat_locks` (Object — Dictionary theo showtimeId)
```json
{
  "st_200": {
    "A1": {
      "seatId": "A1",
      "userId": "usr_1717891200",
      "expiresAt": 1718540400000
    },
    "B4": {
      "seatId": "B4",
      "userId": "other_user_0.91234",
      "expiresAt": 1718540200000
    }
  }
}
```

> Ghế đã thanh toán sẽ bị **xóa khỏi** `cinema_seat_locks` (không còn tồn tại trong map). Trạng thái "booked" chỉ được xác định qua `cinema_bookings`.

### `cinema_last_booking` (Object)
Lưu booking gần nhất để hiển thị ở trang hóa đơn.

### `cinema_pending_payments` (Object)
Map `transactionId → paymentData`, dùng cho flow xác nhận thanh toán.

---

## Schema SessionStorage

### `cinema_current_user`
```json
{
  "userId": "usr_1717891200",
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "role": "user"
}
```

### `cinema_checkout`
```json
{
  "showtimeId": "st_200",
  "movieTitle": "YOUR NAME - TÊN CẬU LÀ GÌ?",
  "poster": "https://...",
  "room": "Phòng 3",
  "showtimeText": "19:30",
  "seats": ["A1", "A2"],
  "selectedSeats": ["A1", "A2"],
  "seatAmount": 100000,
  "seatTotal": 100000,
  "total": 100000,
  "expiresAt": 1718540700000
}
```

> `seats` và `selectedSeats` tồn tại song song — `seats` dùng cho `checkout.js`, `selectedSeats` là alias tương thích.

---

## Mock Data (data.js)

File `shared/js/data.js` (35.8KB) chứa toàn bộ dữ liệu hardcoded:
- `heroMovies[]` — 5 phim cho Hero Slider
- `nowShowingMovies[]` — Phim đang chiếu
- `comingSoonMovies[]` — Phim sắp chiếu
- Dữ liệu rạp/cụm rạp cho cinema map

Dữ liệu này được load bằng `<script src="...">` (non-module) nên expose ra global scope, các trang khác access trực tiếp qua `window.heroMovies`, `window.nowShowingMovies`, etc.
