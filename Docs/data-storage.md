# Mô phỏng Lưu trữ Dữ liệu

Vì 3HD2Kcinema không sử dụng cơ sở dữ liệu bên ngoài (như SQL Server, MongoDB), nên toàn bộ trạng thái của ứng dụng được bảo lưu cục bộ ngay trong trình duyệt của người dùng.

Chúng tôi sử dụng hai cơ chế:
1. **`LocalStorage`**: Dữ liệu vĩnh viễn (Người dùng, Danh mục Phim, Trạng thái Ghế).
2. **`SessionStorage`**: Dữ liệu tạm thời (Phiên đăng nhập hiện tại, Giỏ hàng đang kích hoạt).

Tất cả các tương tác với dữ liệu đều được tập trung xử lý trong `shared/utils/storage.js` để đảm bảo tính toàn vẹn của JSON và tính nhất quán của lược đồ (schema).

---

## Lược đồ LocalStorage

`LocalStorage` đóng vai trò như một cơ sở dữ liệu toàn cục của chúng ta chứa một số "bộ sưu tập" (tương ứng với các khóa - keys).

### 1. `users_db` (Mảng Đối tượng)
Lưu trữ thông tin các tài khoản đã đăng ký.
```json
[
  {
    "userId": "usr_1717891200",
    "name": "Nguyen Van A",
    "email": "a@example.com",
    "password": "hashed_password_simulation",
    "role": "user"
  }
]
```

### 2. `movies_db` (Mảng Đối tượng)
Danh mục các bộ phim hiện có.
```json
[
  {
    "movieId": "mov_001",
    "title": "Spider-Man: Across the Spider-Verse",
    "poster": "https://images...",
    "genres": ["Animation", "Action"],
    "duration": 140
  }
]
```

### 3. `showtimes_db` (Mảng Đối tượng)
Ánh xạ các suất chiếu phim tới các ngày và khung giờ cụ thể.
```json
[
  {
    "showtimeId": "st_200",
    "movieId": "mov_001",
    "date": "2026-06-10",
    "time": "19:30",
    "room": "Room 3"
  }
]
```

### 4. `seat_status_db` (Từ điển Đối tượng)
Theo dõi tình trạng sẵn sàng, đã khóa, và đã đặt chỗ trong thời gian thực của các ghế ngồi ứng với từng suất chiếu.
```json
{
  "st_200": {
    "A1": { "status": "available" },
    "A2": { 
      "status": "locked", 
      "lockedBy": "usr_1717891200", 
      "lockExpiresAt": 1717891500 
    },
    "B4": { 
      "status": "booked", 
      "bookedBy": "usr_1717891200", 
      "bookingId": "bk_8829" 
    }
  }
}
```

---

## Lược đồ SessionStorage

`SessionStorage` đóng vai trò như một môi trường phiên làm việc chủ động của chúng ta. Nó sẽ tự động xóa sạch khi tab hoặc trình duyệt bị đóng hoàn toàn.

### 1. `active_session`
Lưu trữ JWT/Mock Token của người dùng đang đăng nhập ở thời điểm hiện tại.
```json
{
  "token": "mock_jwt_abc123",
  "userId": "usr_1717891200",
  "role": "user"
}
```

### 2. `pending_checkout`
Lưu trữ giỏ hàng hiện tại khi chuyển hướng từ trang đặt vé sang trang thanh toán và hóa đơn.
```json
{
  "showtimeId": "st_200",
  "selectedSeats": ["A1", "A2"],
  "seatTotal": 160000,
  "combo": "DOUBLE",
  "comboTotal": 95000,
  "grandTotal": 255000,
  "expiresAt": 1717891500
}
```
