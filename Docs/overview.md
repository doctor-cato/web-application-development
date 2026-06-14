# Tổng quan Dự án

## Giới thiệu

**3HD2Kcinema** là một ứng dụng web tĩnh, không sử dụng server (server-free client-side) mô phỏng hệ thống đặt vé xem phim. Dự án tập trung vào việc mô phỏng một trải nghiệm người dùng chuẩn điện ảnh theo thời gian thực (real-time) hoàn toàn bên trong trình duyệt.

Dự án này được thiết kế nhằm:
* Trình diễn cách phát triển web Vanilla theo hướng module sử dụng HTML, CSS, và JS mà không cần các framework nặng nề (Không dùng React, Vue, hay Angular).
* Giới thiệu khả năng đồng bộ hóa thời gian thực nguyên bản của trình duyệt bằng cách sử dụng **BroadcastChannel API**.
* Vận dụng bộ nhớ cục bộ của trình duyệt (`LocalStorage`, `SessionStorage`) để duy trì và lưu trữ dữ liệu.
* Đảm bảo tính dễ dàng khi chạy cục bộ mà không cần phải cài đặt bất kỳ bộ SDK backend nào (Node, ASP.NET, SQL Server).

---

## Công nghệ Cốt lõi

* **HTML5**: Cấu trúc nội dung đánh dấu.
* **Vanilla CSS3**: Tạo kiểu thông qua các class CSS Semantic nguyên bản (Cinematic Noir, Glassmorphism) không sử dụng Tailwind hay thư viện CSS ngoài.
* **JavaScript (ES6 Modules)**: Logic theo module được tách biệt thành các component, service, và controller của từng trang.
* **LocalStorage & SessionStorage**: Đóng vai trò là "cơ sở dữ liệu" mô phỏng.
* **BroadcastChannel API**: Đồng bộ hóa các sự kiện thời gian thực (ví dụ như việc khóa ghế ngồi) trên nhiều tab trình duyệt khác nhau.

---

## Cách chạy Ứng dụng

Do ứng dụng hoàn toàn là HTML/CSS/JS tĩnh kết hợp với ES6 Modules, bạn **bắt buộc phải chạy ứng dụng thông qua một máy chủ HTTP tĩnh cục bộ** (do chính sách CORS của trình duyệt đối với các liên kết `file://`).

### Khởi chạy Nhanh (với Python)
1. Mở terminal tại thư mục gốc của dự án `src`.
2. Chạy lệnh `python -m http.server 8000`.
3. Mở trình duyệt và điều hướng tới địa chỉ `http://localhost:8000/index.html`.

### Khởi chạy Nhanh (với VSCode)
1. Mở dự án trong VSCode.
2. Cài đặt extension **Live Server**.
3. Click chuột phải vào file `src/index.html` và chọn **"Open with Live Server"**.

---

## Cấu trúc Thư mục

```text
/
├── Docs/                    # Tài liệu dự án
├── src/                     # Thư mục chứa mã nguồn (Source code)
│   ├── auth/                # Domain: Xác thực (đăng nhập, đăng ký)
│   ├── booking/             # Domain: Đặt vé và thanh toán
│   ├── user/                # Domain: Thông tin & Hồ sơ người dùng
│   ├── explore/             # Domain: Khám phá phim và trang chủ
│   ├── engagement/          # Domain: Các tính năng tương tác ngoài lề
│   ├── shared/              # Thư mục dùng chung (components, css, utils)
│   └── index.html           # Trang chủ (Redirect)
```
