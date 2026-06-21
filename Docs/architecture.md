# Kiến trúc Hệ thống — 3HD2Kcinema

## Tổng quan

Hệ thống 3HD2Kcinema được thiết kế dựa trên sự phân tách rõ ràng giữa giao diện hiển thị (Frontend) và logic nghiệp vụ cơ sở dữ liệu (Backend). Tuy nhiên, để đảm bảo tính gọn nhẹ và khả năng chạy độc lập của bản demo, ứng dụng hiện tại triển khai theo mô hình **Song song hai tầng kiến trúc**:

1. **Kiến trúc Client-Side Tự hành (Active Track)**: Hoạt động hoàn toàn trên trình duyệt của người dùng. Tầng dữ liệu được xử lý bởi LocalStorage/SessionStorage và đồng bộ hóa đa tab thông qua BroadcastChannel API. Đây là tầng chạy chính thức khi mở ứng dụng.
2. **Kiến trúc Full-Stack Mục tiêu (Scaffold Track)**: Bản dựng sẵn của tầng Backend dùng ASP.NET Core MVC & Web API và SQL Server, sẵn sàng cho việc kết nối tích hợp sau này.

---

## 1. Sơ đồ Kiến trúc Tổng thể

### Giai đoạn Chạy Hiện tại (Client-Side Mock)
```text
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Frontend)                       │
│  - HTML5, CSS3, Vanilla JS (ES6 Modules), Tailwind CSS      │
│  - DOM Controllers (DOM Events, UI Updates)                 │
│  - Sync: BroadcastChannel API (seat_sync channel)           │
│  - Map: HTML5 Geolocation API                               │
└──────────────────────────┬──────────────────────────────────┘
                           │ Đọc / Ghi dữ liệu cục bộ (Mock)
┌──────────────────────────▼──────────────────────────────────┐
│                 MOCK STORAGE ENGINE (Browser)               │
│  - storage.js (Wrapper đọc/ghi an toàn)                    │
│  - SessionStorage: Phiên đăng nhập, giỏ hàng checkout tạm    │
│  - LocalStorage: Danh sách tài khoản, hóa đơn, tích điểm    │
└─────────────────────────────────────────────────────────────┘
```

### Kiến trúc Full-Stack Mục tiêu (Khi tích hợp Backend)
```text
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Frontend)                       │
│  - UI Components & Page Controllers                         │
│  - Trạng thái UI tạm thời (SessionStorage)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP Requests (REST API / Cookie Auth)
┌──────────────────────────▼──────────────────────────────────┐
│                     SERVER (Backend scaffold)               │
│  - ASP.NET Core Controllers (Movie, Booking, Account)       │
│  - Services: Lớp xử lý logic nghiệp vụ (BookingService)     │
│  - Repositories: Lớp truy cập DB (Repository Pattern)       │
└──────────────────────────┬──────────────────────────────────┘
                           │ Entity Framework Core (ORM)
┌──────────────────────────▼──────────────────────────────────┐
│                     DATABASE (SQL Server)                   │
│  - movie_booking_db (Bảng: users, movies, bookings, seats)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Chi tiết Tầng Frontend (Client-Side)

Thư mục `frontend/src/` được tổ chức theo hướng **Domain-Based / Feature-Based (Theo tính năng nghiệp vụ)** giúp dễ dàng bảo trì và mở rộng độc lập.

### Cấu trúc Module của Frontend:
```text
frontend/src/
├── auth/                  ← Đăng nhập, đăng ký, quên mật khẩu
│   └── auth-services/     ← authService.js (Xử lý xác thực, session qua Mock Token)
├── booking/               ← Luồng đặt vé (chọn ghế, chọn combo, thanh toán)
│   ├── seat-booking/      ← booking.js & bookingService.js (Xử lý seat-locking & sync)
│   └── group-booking/     ← Đặt vé nhóm (Giao diện phòng chờ chốt ghế - WIP)
├── explore/               ← Khám phá phim (trang chủ, chi tiết, tìm kiếm, bản đồ rạp)
├── user/                  ← Hồ sơ người dùng (Loyalty points, thông báo, lịch sử)
└── shared/                ← Các component dùng chung (navbar, footer), CSS và tiện ích
    ├── components/        ← navbar.js (xử lý dropdown tự đóng, thanh tìm kiếm), footer.js
    └── utils/             ← storage.js (Single Source of Truth cho thao tác Storage)
```

### Đặc điểm thiết kế của Frontend:
- **ES6 Modules**: Toàn bộ mã nguồn JS được liên kết dưới dạng module (`<script type="module">`). Tránh việc khai báo biến toàn cục bừa bãi và giúp tách biệt các file controller/service.
- **Controller & Service Layer**: Mỗi trang HTML đi kèm với một file JS Page Controller chuyên biệt (ví dụ: `profile.html` đi kèm với `profile-ui.js` và `profile.js`) để lắng nghe sự kiện DOM, tương tác với tầng Service (như `bookingService.js`, `authService.js`), và cập nhật lại giao diện.
- **BroadcastChannel API**: Triển khai kênh `seat_sync` để đồng bộ UI hiển thị ghế "đang được chọn" giữa nhiều tab trình duyệt đang mở cùng lúc, nâng cao trải nghiệm real-time của người dùng trước khi gửi yêu cầu thanh toán.

---

## 3. Chi tiết Tầng Backend (Server Scaffold)

Tầng Backend được thiết kế theo tiêu chuẩn của một ứng dụng ASP.NET Core MVC & Web API thương mại, tuân thủ chặt chẽ **Repository Pattern** nhằm tách biệt dữ liệu với logic nghiệp vụ.

### Cấu trúc phân lớp của Backend:
```text
backend/
├── Controllers/           ← Tiếp nhận HTTP requests, xử lý phân quyền và trả về JSON/Views
│   ├── HomeController.cs/ ← (Thư mục chứa các controller chính của hệ thống)
│   │   ├── AccountController.cs    (Xác thực Cookie, quản lý phiên làm việc)
│   │   ├── MoviesController.cs     (API/View Quản lý phim)
│   │   ├── BookingsController.cs   (API Quản lý đơn đặt vé và hóa đơn)
│   │   ├── SeatsController.cs      (Quản lý vị trí ghế)
│   │   └── ...
│   └── UploadsController.cs (Xử lý lưu trữ và phân phối file hình ảnh)
├── Services/              ← Lớp chứa Business logic (ví dụ: FileService quản lý upload ảnh)
├── Repositories/          ← Data Access Layer (Các class CRUD tương tác SQL Server qua EF Core)
├── Models/                ← Các lớp Entity đại diện cho thực thể CSDL (User, Movie, Booking,...)
├── Infrastructure/        ← Cấu hình DB (ApplicationDbContext, DbInitializer nạp dữ liệu phim mẫu)
└── appsettings.json       ← Cấu hình kết nối SQL Server và môi trường
```

### Quy tắc hoạt động phân tầng:
1. **Controllers**: Tiếp nhận request từ client, kiểm tra xác thực (Cookie Authentication), gọi Service/Repository tương ứng và trả về định dạng dữ liệu phù hợp (JSON cho API hoặc Razor Views cho MVC).
2. **Services**: Giải quyết các nghiệp vụ đặc thù (như tính toán hóa đơn, kiểm tra hạn mức VIP, xử lý tệp tin).
3. **Repositories**: Thực hiện truy vấn CSDL qua EF Core một cách an toàn và tập trung, che giấu chi tiết triển khai truy cập dữ liệu của EF Core khỏi tầng Controller.
