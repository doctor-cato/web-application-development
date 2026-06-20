# Kiến trúc Hệ thống — 3HD2Kcinema

## Tổng quan

Kiến trúc của 3HD2Kcinema là mô hình **Client-Server (Full-stack)**, phân tách rõ ràng giữa giao diện hiển thị (Frontend) và logic nghiệp vụ, cơ sở dữ liệu (Backend).

---

## 1. Sơ đồ Kiến trúc Tổng thể

```text
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Frontend)                       │
│  - Vanilla HTML, CSS, JS, Tailwind CSS                      │
│  - Storage: LocalStorage / SessionStorage                   │
│  - Realtime: BroadcastChannel API (cho UI sync)             │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP Requests (REST APIs / MVC)
┌──────────────────────────▼──────────────────────────────────┐
│                     SERVER (Backend)                        │
│  - ASP.NET Core (C#)                                        │
│  - API Controllers (Movie, Booking, Account,...)            │
│  - Services (BookingService, FileService,...)               │
│  - Swagger OpenAPI                                          │
└──────────────────────────┬──────────────────────────────────┘
                           │ Entity Framework Core
┌──────────────────────────▼──────────────────────────────────┐
│                     DATABASE                                │
│  - SQL Server                                               │
│  - Tables: users, movies, bookings, seats, showtimes,...    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Chi tiết Tầng Frontend (Client)

Frontend theo mô hình **Feature-Based (Domain-Based)**. Mỗi tính năng có thư mục riêng, chứa HTML, CSS, và JS Controller chuyên biệt.

```text
frontend/src/
├── auth/                  ← Giao diện đăng nhập, đăng ký
├── booking/               ← Giao diện đặt vé (chọn ghế, bắp nước, thanh toán)
├── explore/               ← Khám phá phim (trang chủ, chi tiết, bản đồ)
├── user/                  ← Quản lý hồ sơ và điểm thưởng
└── shared/                ← Components (navbar, footer), Utilities (storage.js)
```

**Đặc điểm Frontend:**
- Sử dụng **ES6 Modules** (`<script type="module">`).
- **Controller Layer** trong Frontend chịu trách nhiệm xử lý sự kiện DOM và tương tác dữ liệu.
- Vẫn giữ lại **BroadcastChannel API (`seat_sync`)** để đồng bộ UI hiển thị "ghế đang được chọn" giữa nhiều tab theo thời gian thực (phục vụ trải nghiệm UI trước khi Submit thanh toán về Backend).

---

## 3. Chi tiết Tầng Backend (Server)

Backend xây dựng bằng **ASP.NET Core (MVC & Web API)** và tuân thủ mô hình **Repository Pattern** nhằm tách biệt phần truy xuất dữ liệu với xử lý logic.

```text
backend/
├── Controllers/           ← Xử lý HTTP Request, trả về View hoặc JSON
│   ├── HomeController.cs/
│   │   ├── AccountController.cs    (Xác thực qua Cookie)
│   │   ├── MoviesController.cs     (API Quản lý Phim)
│   │   ├── BookingsController.cs   (API Xử lý Đặt vé)
│   │   └── ...
├── Services/              ← Chứa Business logic (Ví dụ: OrderService, BookingService)
├── Repositories/          ← Lớp truy cập dữ liệu (CRUD trên SQL Server qua EF Core)
├── Models/                ← Lớp Entity đại diện cho bảng DB (User, Movie, Booking,...)
├── Infrastructure/        ← Cấu hình DB (ApplicationDbContext, DbInitializer)
└── appsettings.json       ← Chứa cấu hình môi trường và kết nối SQL Server
```

**Quy tắc phân tầng:**
1. **Controllers**: Tiếp nhận request, kiểm tra xác thực (Authorization), gọi Repository/Service và trả về kết quả (JSON hoặc MVC View).
2. **Services**: Xử lý logic nghiệp vụ phức tạp (ví dụ: xác minh hóa đơn, gen QR).
3. **Repositories**: Tương tác với CSDL qua Entity Framework Core.
4. **Database (SQL Server)**: Đóng vai trò là nguồn dữ liệu thực sự của toàn bộ ứng dụng (thay thế vai trò của LocalStorage trong phiên bản mockup tĩnh cũ).
