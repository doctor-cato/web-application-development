# Tổng quan Dự án — 3HD2Kcinema

## Giới thiệu

**3HD2Kcinema** là một ứng dụng web mô phỏng hệ thống đặt vé xem phim trực tuyến. Dự án được phát triển theo mô hình song song:
1. **Frontend (Chạy chính thức)**: Được xây dựng hoàn toàn ở phía client (Client-side) dùng HTML5, CSS3, Vanilla JavaScript (ES6 Modules) và Tailwind CSS. Để đảm bảo ứng dụng có thể hoạt động độc lập và mượt mà mà không cần kết nối mạng hay cài đặt máy chủ phức tạp, toàn bộ luồng nghiệp vụ dữ liệu được **giả lập qua Local/Session Storage** và đồng bộ đa tab bằng **BroadcastChannel API**.
2. **Backend (Kiến trúc mẫu)**: Được xây dựng bằng **ASP.NET Core (C#)** kết hợp với Entity Framework Core và SQL Server, đóng vai trò là một khung kiến trúc mẫu (scaffold) để định hình giải pháp Full-stack trong tương lai. Hiện tại, phần backend này **chưa được tích hợp trực tiếp** vào luồng chạy của Frontend.

---

## Công nghệ Cốt lõi

### Phía Frontend (Ứng dụng chạy thực tế)

| Công nghệ | Vai trò |
|---|---|
| **HTML5 & Vanilla JS (ES6)** | Định nghĩa cấu trúc nội dung, semantic markup và quản trị logic điều hướng/DOM dạng module. |
| **Tailwind CSS & Vanilla CSS3** | Thiết lập Design System đồng bộ với phong cách Cinematic Noir và Glassmorphism cao cấp. |
| **LocalStorage & SessionStorage** | Đóng vai trò là Cơ sở dữ liệu giả lập (Mock DB) để lưu trữ tài khoản, vé đã đặt, lịch sử điểm thưởng, thông tin giỏ hàng và thông báo. |
| **BroadcastChannel API** | Đồng bộ hóa sự kiện khóa/mở khóa ghế (`seat_sync`) theo thời gian thực giữa nhiều tab trình duyệt đang mở. |
| **HTML5 Geolocation API** | Xác định vị trí thực tế của người dùng để tính khoảng cách và hiển thị rạp chiếu phim gần nhất trên bản đồ. |

### Phía Backend (Kiến trúc mô hình mẫu)

| Công nghệ | Vai trò |
|---|---|
| **ASP.NET Core MVC & Web API** | Xử lý logic nghiệp vụ, quản lý luồng điều hướng và cung cấp các RESTful API endpoints. |
| **Entity Framework Core (EF Core)** | Lớp ORM (Object-Relational Mapping) giúp ánh xạ dữ liệu C# sang Database. |
| **SQL Server** | Hệ quản trị cơ sở dữ liệu quan hệ được thiết kế làm nguồn dữ liệu trung tâm thực sự của hệ thống. |
| **Cookie Authentication** | Quản lý phiên xác thực an toàn, bảo vệ các route nhạy cảm. |
| **Swagger** | Tự động hóa tài liệu API, cho phép thử nghiệm các endpoint một cách trực quan. |

---

## Cách chạy Ứng dụng

Ứng dụng được chia làm 2 phần rõ rệt, hiện tại chạy độc lập với nhau.

### 1. Khởi chạy Frontend (Để xem giao diện & luồng đặt vé đầy đủ)
1. Mở terminal mới, chuyển hướng vào thư mục `frontend/`.
2. Khởi chạy một static server để chạy mã nguồn JavaScript Module một cách an toàn. Bạn có thể sử dụng Python:
   ```bash
   python -m http.server 3000 -d src
   ```
3. Truy cập vào `http://localhost:3000`.

*(Tùy chọn: Để tự động biên dịch lại Tailwind CSS khi phát triển)*
```bash
npm install
npm run tailwind:watch
```

### 2. Khởi chạy Backend (Khung kiến trúc mẫu)
1. Cần cài đặt .NET SDK và SQL Server trên máy.
2. Cấu hình chuỗi kết nối SQL Server trong `backend/appsettings.json`.
3. Mở terminal, chuyển hướng vào thư mục `backend/`.
4. Chạy lệnh:
   ```bash
   dotnet run
   ```
5. Server sẽ khởi chạy (mặc định tại `http://localhost:5000` hoặc cổng ngẫu nhiên trong cấu hình). Khi chạy lần đầu, Database sẽ tự động được khởi tạo (`EnsureCreated`) và nạp dữ liệu phim mẫu từ file `DataSeeding/movies.json` qua lớp `DbInitializer`.

---

## Cấu trúc Thư mục Tổng quan

```text
/ (repo root)
├── backend/                   # ── KIẾN TRÚC MÔ HÌNH BACKEND (ASP.NET Core) ──
│   ├── Controllers/           # Các Controller MVC/API (Movie, Booking, Account...)
│   ├── Infrastructure/        # Cấu hình DbContext, DbInitializer (SQL Server)
│   ├── Models/                # Các lớp Entity đại diện cho bảng DB (User, Movie, Seat...)
│   ├── Repositories/          # Lớp thao tác dữ liệu (Repository Pattern)
│   ├── Services/              # Các Business Logic Services (BookingService, FileService...)
│   ├── Views/                 # Các tệp giao diện Razor View (.cshtml) của MVC
│   └── appsettings.json       # Cấu hình môi trường và chuỗi kết nối database
├── frontend/                  # ── ỨNG DỤNG FRONTEND CHẠY THỰC TẾ (Client-side) ──
│   ├── package.json           # npm scripts và định nghĩa dependencies
│   ├── tailwind.config.js     # Cấu hình của Tailwind CSS
│   └── src/                   # Thư mục mã nguồn chính của Client
│       ├── index.html         # Điểm truy cập ban đầu, tự động redirect sang trang chủ
│       ├── auth/              # Đăng nhập, đăng ký, quên mật khẩu (sử dụng authService.js)
│       ├── booking/           # Đặt vé (chọn ghế, chọn bắp nước, thanh toán giả lập)
│       │   └── group-booking/ # Phòng chờ đặt ghế theo nhóm (WIP)
│       ├── explore/           # Khám phá (Trang chủ, chi tiết phim, bản đồ cụm rạp)
│       ├── user/              # Người dùng (Hồ sơ cá nhân, lịch sử vé, điểm thưởng VIP)
│       ├── engagement/        # Minigame đặt cược điểm tích lũy (Cinebet)
│       └── shared/            # Các component (navbar, footer), CSS và tiện ích dùng chung
└── Docs/                      # ── TÀI LIỆU HỆ THỐNG CHI TIẾT ──
```

---

## Luồng Điều Hướng Chính (Frontend)

```
index.html → explore/home-page/index.html (Trang chủ)
           → explore/movie-details/index.html?id={movieId} (Chi tiết phim & suất chiếu)
           → booking/seat-booking/booking.html?id={movieId}&showtimeId={id} (Chọn ghế & đặt chỗ)
           → booking/booking-food/index.html (Chọn combo bắp nước)
           → booking/checkout/checkout.html (Thông tin hóa đơn & chọn phương thức)
           → booking/checkout/payment_simulation.html (Trang quét mã QR/mô phỏng thanh toán)
           → booking/booking-success/index.html (Màn hình vé thành công & mã QR E-ticket)
```

> **Lưu ý quan trọng về Dữ liệu:** Toàn bộ luồng điều hướng trên hiện tại hoạt động dựa trên dữ liệu lưu trữ trong `LocalStorage` và `SessionStorage` để đảm bảo ứng dụng có thể chạy local mượt mà. Việc chuyển đổi sang tích hợp chính thức với SQL Server Backend thông qua API sẽ được thực hiện ở các giai đoạn sau của dự án.
