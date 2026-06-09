# Đăng nhập Mạng Xã Hội Giả Lập (Simulated Social Login)

## Tổng quan (Overview)
Tính năng cho phép người dùng mô phỏng quá trình đăng nhập nhanh thông qua Google tài khoản trực tiếp ở giao diện người dùng. Giúp kiểm thử nhanh luồng đặt vé mà không cần điền form đăng ký dài dòng.

---

## Luồng hoạt động Giả Lập (Client-Side Simulation Flow)

1. **Giao diện**: Nút "Tiếp tục với Google" được thêm vào trang `login.html` và `register.html` với biểu tượng Google chuẩn.
2. **Kích hoạt sự kiện**: Khi click vào nút này, một hàm JS trong `login.js` sẽ mở một cửa sổ popup giả lập nhỏ (hoặc hiển thị modal con) mô phỏng giao diện chọn tài khoản Google:
   - Hiển thị danh sách 2 tài khoản mock: *Nguyen Van A (a@gmail.com)* và *Tran Thi B (b@gmail.com)*.
3. **Mô phỏng phản hồi (Mock Callback)**:
   - Khi người dùng click chọn một tài khoản mock, popup đóng lại.
   - Script client nhận được dữ liệu giả lập (họ tên, email, ảnh đại diện).
4. **Xử lý đăng nhập**:
   - Quét mảng `3hd2k_users` trong `LocalStorage`.
   - Nếu email của tài khoản Google chưa tồn tại, tự động tạo tài khoản mới với trường `role: "user"` và ghi vào LocalStorage.
   - Lưu thông tin tài khoản Google này vào `SessionStorage` (`3hd2k_current_user`) để đánh dấu đăng nhập thành công.
   - Điều hướng người dùng quay trở lại trang chủ hoặc giỏ hàng checkout.

---

## Thay đổi cấu trúc dữ liệu Local
Trong mảng `3hd2k_users`, các tài khoản đăng nhập qua mạng xã hội sẽ có thêm trường:
* `authProvider`: `"google"` (để phân biệt với tài khoản đăng ký thường là `"local"`).
* `password`: Trống (`null` hoặc không cần định nghĩa).
* `avatar`: URL ảnh đại diện Google giả lập (VD: `images/avatars/google_avatar.png`).
