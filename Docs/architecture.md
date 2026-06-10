# Kiến trúc Frontend

## Tổng quan

Kiến trúc ứng dụng hoàn toàn nằm ở **phía client** và dựa trên các API nguyên bản của trình duyệt (native browser APIs). Nó được cấu trúc theo mô hình **Feature-Based (Dựa trên Tính năng / Lĩnh vực)**, mô phỏng các framework hiện đại như Next.js hoặc Angular, trong khi vẫn chỉ sử dụng Vanilla HTML/CSS/JS thuần túy.

Mặc dù hiện tại chưa có cơ sở dữ liệu backend, các lớp kiến trúc được thiết kế sao cho việc kết nối với API ASP.NET Core hoặc máy chủ Node.js trong tương lai sẽ diễn ra một cách liền mạch.

---

## 1. Sơ đồ Kiến trúc Dựa trên Tính năng

```text
+-------------------------------------------------------------+
|                       GIAO DIỆN NGƯỜI DÙNG (UI)             |
|  (auth/*/*.html, explore/*/*.html, booking/*/*.html, etc.)  |
+------------------------------+------------------------------+
                               | Sự kiện DOM / Render
+------------------------------v------------------------------+
|                    CONTROLLER TÍNH NĂNG                     |
|  (auth/*.js, booking/*.js, checkout/*.js, v.v.)             |
+------------------------------+------------------------------+
                               | Gọi hàm (Function Calls)
+------------------------------v------------------------------+
|                     SERVICE TÍNH NĂNG                       |
|  (*Service.js bên trong các thư mục tính năng)              |
+------------------------------+------------------------------+
                               | Đọc / Ghi / Đồng bộ
+------------------------------v------------------------------+
|                      TIỆN ÍCH DÙNG CHUNG                    |
|   +-----------------------+     +-----------------------+   |
|   |  storage.js (DB Mock) |     | BroadcastChannel API  |   |
|   | (LocalStorage/Session)|     | (Đồng bộ Real-time)   |   |
|   +-----------------------+     +-----------------------+   |
+-------------------------------------------------------------+
```

---

## 2. Phân nhóm Thư mục theo Lĩnh vực (Domain-Based)

Thay vì nhóm các file theo loại (tất cả HTML nằm chung, tất cả JS nằm chung), chúng tôi nhóm các file theo **Domain/Feature** (Lĩnh vực/Tính năng).
Điều này có nghĩa là `src/auth/` sẽ chứa các tính năng phụ như `user-login/` (chứa `login.html`, `login.js`), `user-register/`, và các dịch vụ dùng chung trong `auth-services/` (chứa `authService.js`).

* **Controller Tính năng**: Xử lý các sự kiện DOM, render giao diện và logic bố cục. Chúng **không bao giờ** được phép tương tác trực tiếp với `LocalStorage`.
* **Service Tính năng**: Đóng vai trò như một API backend mô phỏng cho tính năng cụ thể đó.
* **Lớp dùng chung (`src/shared/`)**: Chứa các component toàn cục (như Navbar), CSS hệ thống và các tiện ích cốt lõi (như `storage.js`).

---

## 3. Mô phỏng Đồng bộ hóa Thời gian thực

Khi không có máy chủ WebSocket, việc đồng bộ hóa thời gian thực được xử lý hoàn toàn trong trình duyệt thông qua **BroadcastChannel API**.

1. **Tab A (Người dùng 1)** click chọn Ghế A5.
2. `booking.js` gọi hàm `bookingService.lockSeat()`.
3. Service ghi trạng thái khóa vào `LocalStorage` và phát đi một sự kiện: `{ type: 'LOCK_SEAT', seat: 'A5' }` trên kênh `seat_sync`.
4. **Tab B (Người dùng 2)** lắng nghe trên kênh `seat_sync`, nhận sự kiện và tự động cập nhật giao diện để hiển thị Ghế A5 đã bị khóa.
