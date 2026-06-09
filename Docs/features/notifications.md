# Hệ thống Thông báo Giả Lập (Simulated Notifications)

## Tổng quan (Overview)
Hệ thống thông báo cho người dùng về các sự kiện quan trọng như: Đặt vé thành công, Suất chiếu sắp bắt đầu, hoặc các chương trình khuyến mãi. Hệ thống này hoạt động hoàn toàn trên Client, đọc/ghi dữ liệu thông báo từ `LocalStorage` và cập nhật giao diện chuông thông báo theo thời gian thực.

---

## Cơ chế hoạt động (Client-Side Logic)
- **Local Push**: Khi client thực hiện một hành động thành công (vd: Đặt vé thành công, thanh toán thành công), trang script sẽ tự động tạo một đối tượng thông báo mới và thêm vào danh sách thông báo của User trong `LocalStorage`.
- **Giả lập thông báo hệ thống**: Trang chủ sử dụng một hàm `setTimeout` ngẫu nhiên (sau 1-2 phút) để tạo ra các thông báo hệ thống giả lập (vd: *"Rạp Landmark 81 đang có chương trình giảm giá 20% bắp nước!"*) để người dùng thấy danh sách thông báo thay đổi sinh động.
- **Đọc thông báo**: Người dùng click vào icon Quả chuông -> Gọi hàm đánh dấu các thông báo đã xem (`isRead = true`) trong LocalStorage và ẩn dấu chấm đỏ báo hiệu.

---

## Kiến trúc Dữ liệu cục bộ (Notification Schema)

Dữ liệu được lưu trong LocalStorage dưới key `3hd2k_notifications` dạng mảng JSON:
```json
{
  "id": "not_1781018956",
  "userId": "usr_123",
  "title": "Đặt vé thành công",
  "message": "Vé cho phim Spider-Man (Suất 19:30) đã được xác nhận thanh toán.",
  "type": "booking_success",
  "link": "profile.html?tab=tickets",
  "isRead": false,
  "createdAt": "2026-06-09T15:26:00Z"
}
```

---

## Các hàm Module bổ trợ (`js/services/notificationService.js`)
* `getNotifications(userId)`: Lấy mảng thông báo của người dùng.
* `addNotification(userId, title, message, type, link)`: Tạo và ghi một thông báo mới.
* `markAsRead(notificationId)`: Chuyển trạng thái thông báo thành đã đọc.

---

## Giao diện Người dùng (Frontend UI)
* **Header / Navigation Bar**: Icon quả chuông (Bell) có hiển thị số đếm màu đỏ (Badge count) dựa trên số lượng thông báo có `isRead === false`.
* **Dropdown List**: Click quả chuông sẽ hiển thị menu nhỏ sổ xuống hiển thị danh sách 5 thông báo gần nhất và nút "Đánh dấu đọc tất cả".
