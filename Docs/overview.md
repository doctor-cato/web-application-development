# Tổng quan Dự án — 3HD2Kcinema

## Giới thiệu

**3HD2Kcinema** là một ứng dụng web mô phỏng hệ thống đặt vé xem phim. Dự án trước đây được xây dựng dưới dạng Client-side thuần (chỉ dùng Frontend), nhưng hiện tại đã được nâng cấp thành một **Hệ thống Full-stack hoàn chỉnh**, bao gồm Frontend độc lập, Backend API và Cơ sở dữ liệu.

Mục tiêu dự án:
- Trình diễn cách phát triển Web Full-stack bằng công nghệ hiện đại.
- **Frontend**: Phát triển web theo hướng module (HTML + CSS + JS thuần), có sử dụng Tailwind CSS để dựng giao diện.
- **Backend**: Xây dựng Restful API và các Web Controller sử dụng **ASP.NET Core (C#)**.
- **Database**: Sử dụng SQL Server và Entity Framework Core để quản lý và lưu trữ dữ liệu bền vững (movies, users, bookings, seats).
- Giữ lại một số tính năng đồng bộ thời gian thực nguyên bản của trình duyệt qua **BroadcastChannel API** phục vụ cho tương tác UI đa tab.

---

## Công nghệ Cốt lõi

### Phía Frontend
| Công nghệ | Vai trò |
|---|---|
| **HTML5 & Vanilla JS** | Cấu trúc nội dung, semantic markup, logic điều khiển module. |
| **Tailwind CSS & Vanilla CSS3** | Hệ thống Design System: Cinematic Noir theme, Glassmorphism. |
| **LocalStorage & SessionStorage** | Dữ liệu phiên: user đang đăng nhập (session), giỏ hàng checkout tạm thời. |
| **BroadcastChannel API** | Đồng bộ sự kiện real-time (khóa ghế) giữa nhiều tab trình duyệt phía Client. |

### Phía Backend
| Công nghệ | Vai trò |
|---|---|
| **ASP.NET Core MVC & Web API** | Xử lý logic nghiệp vụ, quản lý luồng điều hướng và cung cấp API endpoints. |
| **Entity Framework Core (EF Core)** | Lớp ORM (Object-Relational Mapping) giúp ánh xạ dữ liệu C# sang Database. |
| **SQL Server** | Hệ quản trị cơ sở dữ liệu quan hệ, làm nguồn dữ liệu trung tâm thực sự của hệ thống. |
| **Cookie Authentication** | Quản lý phiên xác thực an toàn, bảo vệ các route nhạy cảm. |
| **Swagger** | Tự động hóa tài liệu API, cho phép thử nghiệm các endpoint một cách trực quan. |

---

## Cách chạy Ứng dụng

Ứng dụng được chia làm 2 phần rõ rệt, cần chạy song song.

### 1. Backend (ASP.NET Core)
1. Mở terminal, chuyển hướng vào thư mục `backend/`.
2. Chạy lệnh:
   ```bash
   dotnet run
   ```
3. Server sẽ chạy (mặc định ở `http://localhost:5000` hoặc tương tự). Cơ sở dữ liệu sẽ tự động được tạo và thêm dữ liệu khởi tạo.

### 2. Frontend (Static Web Server)
1. Mở terminal mới, chuyển hướng vào thư mục `frontend/`.
2. Chạy lệnh:
   ```bash
   npm install
   npm run dev
   ```
3. Truy cập vào `http://localhost:3000`.

---

## Cấu trúc Thư mục

```text
/ (repo root)
├── backend/                   # ── SERVER & DATABASE ──
│   ├── Controllers/           # Controller xử lý Request (Movie, Booking, Account...)
│   ├── Infrastructure/        # DbContext, DbInitializer (SQL Server)
│   ├── Models/                # Entity Framework Classes (User, Movie, Seat...)
│   ├── Repositories/          # Data Access Layer (thao tác CRUD)
│   ├── Services/              # Business Logic
│   └── appsettings.json       # Config chuỗi kết nối
├── frontend/                  # ── CLIENT & UI ──
│   ├── package.json           # npm scripts (dev: serve, build: tailwind)
│   └── src/                   # Mã nguồn Frontend
│       ├── auth/              # Domain: Xác thực (Login, Register)
│       ├── booking/           # Domain: Đặt vé (Seat, Food, Checkout)
│       ├── explore/           # Domain: Khám phá (Home, Movies, Map)
│       ├── user/              # Domain: Người dùng (Profile, Loyalty)
│       ├── engagement/        # Domain: Tương tác ngoài lề
│       └── shared/            # Dùng chung (Component, Util, CSS)
└── Docs/                      # ── TÀI LIỆU HỆ THỐNG ──
```

---

## Luồng Điều Hướng Chính (Frontend)

```
index.html → explore/home-page/index.html
           → explore/movie-details/index.html?id={movieId}
           → booking/seat-booking/booking.html?id={movieId}&showtimeId={id}
           → booking/booking-food/index.html
           → booking/checkout/checkout.html
           → booking/checkout/payment_simulation.html
           → booking/booking-success/index.html
```

> **Lưu ý:** Trước đây luồng điều hướng này phụ thuộc hoàn toàn vào dữ liệu Mock và LocalStorage. Hiện tại, nó đã được liên kết với Backend (các REST API hoặc MVC Routes) để lấy và lưu dữ liệu trên SQL Server.
