# Tài liệu API (API Specifications)

Tài liệu này tổng hợp danh sách các RESTful API Endpoint ở tầng Backend ASP.NET Core cũng như các giao diện Mock Services ở Client-side.

---

## 🌐 1. RESTful APIs (Backend ASP.NET Core Scaffold)

Toàn bộ các RESTful API của hệ thống hỗ trợ định dạng dữ liệu `JSON`. Khi chạy máy chủ Backend, bạn có thể truy cập giao diện Swagger tại: `http://localhost:5000/swagger`.

### Phân hệ Phim & Suất chiếu (`/api/movies`)

| HTTP Method | Endpoint | Mô tả | Quyền hạn |
|---|---|---|---|
| `GET` | `/api/movies` | Lấy danh sách toàn bộ các bộ phim đang chiếu & sắp chiếu | Public |
| `GET` | `/api/movies/{id}` | Lấy thông tin chi tiết một bộ phim theo ID | Public |
| `GET` | `/api/movies/{id}/showtimes` | Lấy danh sách suất chiếu của phim | Public |
| `POST` | `/api/movies` | Thêm mới bộ phim | Admin |
| `PUT` | `/api/movies/{id}` | Cập nhật thông tin bộ phim | Admin |
| `DELETE` | `/api/movies/{id}` | Xóa bộ phim | Admin |

#### Ví dụ Request Response (`GET /api/movies/1`)
```json
{
  "id": 1,
  "title": "Avatar: The Way of Water",
  "director": "James Cameron",
  "durationMinutes": 192,
  "posterUrl": "/uploads/avatar2.jpg",
  "rating": 8.8,
  "genres": ["Sci-Fi", "Action"]
}
```

---

### Phân hệ Đặt vé & Ghế ngồi (`/api/bookings`)

| HTTP Method | Endpoint | Mô tả | Quyền hạn |
|---|---|---|---|
| `GET` | `/api/seats?showtimeId={id}` | Trạng thái toàn bộ sơ đồ ghế của suất chiếu | Public |
| `POST` | `/api/bookings` | Tạo hóa đơn đặt vé mới (khóa ghế & tính tiền) | Authenticated |
| `GET` | `/api/bookings/my-history` | Lấy danh sách lịch sử đặt vé của user hiện tại | Authenticated |
| `POST` | `/api/bookings/{id}/cancel` | Hủy toàn bộ hoặc một phần ghế của hóa đơn | Authenticated |

#### Ví dụ Payload Tạo đơn đặt vé (`POST /api/bookings`)
```json
{
  "showtimeId": 105,
  "seatIds": ["A5", "A6"],
  "comboFood": [
    { "foodId": "F01", "quantity": 2 }
  ],
  "paymentMethod": "MOMO"
}
```

---

### Phân hệ Tài khoản & Xác thực (`/api/account`)

| HTTP Method | Endpoint | Mô tả | Quyền hạn |
|---|---|---|---|
| `POST` | `/api/account/register` | Đăng ký tài khoản người dùng mới | Public |
| `POST` | `/api/account/login` | Đăng nhập và tạo Cookie Authentication Session | Public |
| `POST` | `/api/account/logout` | Hủy phiên đăng nhập | Authenticated |
| `GET` | `/api/account/profile` | Lấy thông tin tài khoản & điểm loyalty | Authenticated |

---

## 💻 2. Client-Side Mock Services (Frontend Running Track)

Trong luồng chạy Frontend chính thức, các dịch vụ Javascript module sau đây đóng vai trò là "Virtual APIs":

### `shared/utils/storage.js` Wrapper APIs
- `Storage.get(key, defaultValue)`: Đọc an toàn từ LocalStorage/SessionStorage với xử lý JSON fallback.
- `Storage.set(key, value)`: Ghi dữ liệu dạng JSON stringify.
- `Storage.remove(key)`: Xóa tệp key dữ liệu.

### `booking/seat-booking/bookingService.js`
- `lockSeat(showtimeId, seatId, userId)`: Khóa tạm thời 15 phút.
- `releaseSeat(showtimeId, seatId)`: Giải phóng khóa ghế.
- `getLockedSeats(showtimeId)`: Lấy mảng ID các ghế đang bị khóa.

### `auth/auth-services/authService.js`
- `login(email, password)`: Kiểm tra tài khoản trong `cinema_users` và lưu `cinema_current_user`.
- `register(userData)`: Đăng ký tài khoản mới và lưu trữ bền vững.
- `getCurrentUser()`: Lấy thông tin tài khoản phiên hiện tại.
