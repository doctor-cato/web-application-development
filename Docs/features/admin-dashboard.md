# Bảng Điều Khiển Quản Trị Giả Lập (Simulated Admin Dashboard)

## Tổng quan (Overview)
Hệ thống Admin Dashboard được giả lập trực tiếp trên client để hỗ trợ quản trị viên quản lý danh sách phim, rạp chiếu, suất chiếu, và theo dõi doanh thu mô phỏng. Toàn bộ các tương tác CRUD (Create, Read, Update, Delete) đều tác động trực tiếp lên cơ sở dữ liệu `LocalStorage`.

---

## Phân Quyền Giả Lập (Role-Based Access Control)
Trạng thái phân quyền được kiểm tra khi người dùng truy cập trang Hồ sơ (`profile.html`):
* Giao diện quản trị là một phân vùng (Tab Admin) chỉ xuất hiện trong `profile.html` khi đối tượng người dùng đăng nhập hiện tại (`3hd2k_current_user` trong SessionStorage) có trường `role` bằng `"admin"`.
* Nếu người dùng là khách vãng lai hoặc tài khoản thường (`role: "user"`), giao diện này sẽ tự động ẩn đi.

---

## Tính Năng Quản Trị Cốt Lõi (Core Admin Features)

### 1. Thống Kê Doanh Thu Giả Lập (Analytics Simulation)
* **Tính Toán Doanh Thu**: Script quản trị (`profile.js`) duyệt qua mảng `3hd2k_bookings` lưu trong LocalStorage, tính tổng số tiền của các vé có trạng thái `"confirmed"`.
* **Biểu Đồ Thống Kê**: Vẽ biểu đồ dạng cột đơn giản sử dụng CSS (hoặc thư viện JS nhẹ như Chart.js) để trực quan hóa doanh thu theo từng cụm rạp hoặc theo phim.

### 2. Quản Lý Danh Sách Phim (Movie Configuration)
* Thêm mới phim mới bằng Form nhập liệu (Tên, Poster, Thể loại, Thời lượng, Trailer URL).
* Cập nhật thông tin hoặc xóa phim khỏi mảng `3hd2k_movies` trong LocalStorage.

### 3. Quản Lý Suất Chiếu (Showtime Scheduling)
* Gán phim vào phòng chiếu và thiết lập khung giờ chiếu (`3hd2k_showtimes`).
* Kiểm tra hợp lệ giờ chiếu (tránh xếp hai suất chiếu trùng phòng, trùng giờ bằng so khớp khoảng thời gian trong mảng dữ liệu).

### 4. Quản Lý Vé & Đơn Hàng (Order Tracking)
* Hiển thị danh sách tất cả các vé đã đặt trên toàn hệ thống từ mảng `3hd2k_bookings` để hỗ trợ tra cứu.
* Cung cấp nút giả lập hủy vé, hoàn trạng thái ghế về `"available"` trong LocalStorage của suất chiếu đó.

---

## Kiến Trúc Dữ Liệu Cục Bộ (Data Schema)

Để quản lý chuỗi rạp, dữ liệu trong LocalStorage được cấu trúc liên kết qua các ID:
1. **Cinemas (Danh sách rạp)**: Mảng tĩnh chứa tên rạp (VD: *3HD2K Landmark 81, 3HD2K Vincom Ba Trieu*).
2. **Movies (Phim)**: Mảng `3hd2k_movies` lưu thông tin mô tả phim.
3. **Showtimes (Suất chiếu)**: Mỗi suất chiếu trong `3hd2k_showtimes` liên kết với phim qua `movieId` và rạp qua `cinemaName`.
4. **Bookings (Đơn đặt vé)**: Lưu thông tin đặt chỗ liên kết với `showtimeId` và `userId`.
