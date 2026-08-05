# 3HD2Kcinema — Hệ thống Đặt Vé Rạp Chiếu Phim

Ứng dụng web mô phỏng toàn bộ luồng đặt vé rạp chiếu phim chuyên nghiệp: xem phim, chọn ghế real-time, combo đồ ăn, thanh toán QR code, mini-game Cine-Match, chương trình VIP & Đổi thưởng, và quản lý tài khoản.

![3HD2Kcinema Banner](https://img.shields.io/badge/3HD2Kcinema-v3.7.0-red?style=for-the-badge)
![Git Commits](https://img.shields.io/badge/Commits-760-blue?style=for-the-badge)
![Vercel Deployment](https://img.shields.io/badge/Vercel-32dk--web--app--project.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Playwright Tests](https://img.shields.io/badge/Playwright-11%2F11%20Passed-brightgreen?style=for-the-badge&logo=playwright)
![MkDocs](https://img.shields.io/badge/Docs-MkDocs--Material-009688?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-blue?style=for-the-badge)

---

## 🌐 Trải nghiệm Trực tuyến (Live Demo)

Ứng dụng Frontend đã được triển khai và hoàn thiện trên Vercel:

👉 **Link Web App Trực tiếp**: [https://32dk-web-app-project.vercel.app](https://32dk-web-app-project.vercel.app)

---

## 🚀 Trạng thái Hiện tại của Dự án (Current Status & Version)

- **Tổng số commits**: **760 commits** (được kiểm tra tự động qua Git history).
- **Phiên bản hiện tại**: **`v3.7.0`** (Tuân thủ Semantic Versioning).
- **Kiểm thử E2E (Playwright)**: **11/11 test suites PASS 100%** (bao gồm Responsive layout, Visual regression, Booking flow, Minigame, và Profile).

---

## 📋 Cập nhật v3.7.0 | [Full ChangeLog](CHANGELOG.md)

Các thay đổi mới nhất tập trung vào tích hợp cổng thanh toán, quản lý vé và tối ưu hóa hệ thống:

- **Thanh toán PayOS**: Tích hợp trực tiếp cổng thanh toán trực tuyến PayOS vào Backend ASP.NET Core (`PayOSService`, `ApiPaymentController`), tự động tạo QR Code thanh toán, xử lý callback webhook và duy trì luồng tạm ứng/hủy vé.
- **Quản lý Vé (My Tickets)**: Nâng cấp và chuyển đổi module `cancel-booking` thành `my-tickets`, tối ưu giao diện theo chuẩn YAGNI cho phép xem danh sách vé đã mua và lịch sử đặt vé.
- **Dữ liệu & Seeding**: Tự động seed dữ liệu mẫu hoàn chỉnh (Phim, Suất chiếu, Phòng chiếu, Combo đồ ăn, Voucher) trực tiếp trên SQL Server database.
- **Tối ưu Real-time SignalR**: Khắc phục lỗi timeout kết nối WebSocket SignalR trên Vercel proxy (`/supportChatHub`), tự động dọn dẹp ghost users và hỗ trợ tự động kết nối lại (reconnect/rejoin) cho minigame CineMatch.
- **Giao diện POS Staff**: Tối ưu hóa UI thông báo đơn hàng Staff POS với kiểu hiển thị collapsible chi tiết theo phong cách CFD.

---

## 💻 Stack Công Nghệ Hiện Tại (Current Tech Stack)

Hệ thống được thiết kế theo mô hình **Hybrid Client Mock & ASP.NET Core Backend ready**, bao gồm đầy đủ các tầng công nghệ hiện đại:

| Phân tầng (Layer) | Công nghệ Sử dụng | Mô tả & Chi tiết Vai trò |
| :--- | :--- | :--- |
| **Frontend Core** | HTML5, CSS3 (Vanilla), ES6+ Modules | Mã nguồn giao diện chính, thiết kế theo chuẩn Modular ES Modules, hỗ trợ `async/await`, custom CSS variables & keyframe animations. |
| **Styling & UI** | Tailwind CSS v4, Glassmorphism, FontAwesome 6 | Hệ thống style linh hoạt kết hợp hiệu ứng kính mờ (Glassmorphism), phong cách Cinematic Dark Mode và icons FontAwesome. |
| **Client Storage Engine** | Web Storage (LocalStorage & SessionStorage) | Giả lập cơ sở dữ liệu Client-side hoàn chỉnh (người dùng, đặt vé, điểm thưởng, khóa ghế) cho môi trường demo không cần backend server. |
| **Real-time Sync** | BroadcastChannel API | Đồng bộ trạng thái giữ ghế & khóa ghế (Seat Locks) theo thời gian thực giữa nhiều tab trình duyệt đang mở. |
| **Backend Core** | ASP.NET Core 8.0 (C#) | Web API & Controllers MVC xử lý nghiệp vụ chính cho hệ thống sản xuất. |
| **Database & ORM** | Entity Framework Core 8.0 & SQL Server | Quản trị CSDL quan hệ SQL Server, mã nguồn khởi tạo `SeedMovies.sql` & `movie_booking_db.sql`. |
| **Real-time Engine** | SignalR Core | Hub kết nối Socket real-time phục vụ khóa ghế & thông báo đa người dùng khi kết nối backend. |
| **E2E & Visual Testing** | Playwright Test (`@playwright/test` v1.61) | Bộ test tự động End-to-End, chụp snapshot so sánh giao diện (Visual Regression) & kiểm định các luồng đặt vé. |
| **Accessibility Testing** | Axe-core (`@axe-core/playwright` v4.10) | Audit tự động tiêu chuẩn truy cập WCAG / ARIA Accessibility. |
| **Performance Audit** | Lighthouse CI (`@lhci/cli` v0.14) | Tự động đánh giá chỉ số Core Web Vitals (LCP, INP, CLS), PWA, SEO & Best Practices. |
| **Component Testing** | Storybook (`@storybook/html-vite` v8.5) & Chromatic | Phát triển và kiểm thử từng UI Component cô lập. |
| **Documentation & CI/CD** | MkDocs Material, Markdownlint, GitHub Actions, Vercel | Xuất bản website tài liệu tĩnh tự động trên GitHub Pages & Triển khai web app trực tiếp trên Vercel CDN. |

---

## 🛠️ Stack Công nghệ Tài liệu & Kiểm thử (Testing & Docs Stack)

- **Playwright Test Suite**: Kiểm thử tự động giao diện End-to-End, Visual Regression Snapshots và Accessibility (`npx playwright test`).
- **Lighthouse CI**: Tự động đánh giá hiệu năng (Performance), PWA, SEO và Best Practices (`.lighthouserc.js`).
- **Storybook HTML/Vite**: Xây dựng và kiểm định UI components độc lập (`npm run storybook`).
- **MkDocs Material**: Framework xuất bản trang tài liệu tĩnh (`mkdocs serve`).
- **Markdownlint**: Kiểm tra cú pháp Markdown tự động (`.markdownlint.yml`).

---

## 💻 Cách Chạy Ứng Dụng (Local Setup)

### 1. Khởi chạy Frontend (Client Mock Engine)

Mở terminal tại thư mục gốc hoặc thư mục `frontend`:

```bash
# Cài đặt các gói phụ thuộc testing/storybook
npm install

# Khởi chạy Frontend Dev Server
cd frontend
npm run dev
# Hoặc sử dụng Python static server:
python -m http.server 3000 -d src
```

> Truy cập ứng dụng tại: `http://localhost:3000`

### 2. Khởi chạy Backend (ASP.NET Core & SQL Server)

Hệ thống Backend yêu cầu cài đặt [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) và SQL Server.

1. **Cấu hình môi trường (`appsettings.json`)**:
   Mở file `backend/appsettings.json` (hoặc tạo `appsettings.Development.json`) và cấu hình chuỗi kết nối Database cũng như API Keys của cổng thanh toán PayOS:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=movie_booking_db;Trusted_Connection=True;MultipleActiveResultSets=true;Encrypt=False"
     },
     "PayOS": {
       "ClientId": "YOUR_PAYOS_CLIENT_ID",
       "ApiKey": "YOUR_PAYOS_API_KEY",
       "ChecksumKey": "YOUR_PAYOS_CHECKSUM_KEY"
     }
   }
   ```
2. **Cập nhật Database**:
   Mở terminal tại thư mục `backend`:
   ```bash
   dotnet ef database update
   ```
3. **Chạy Server**:
   ```bash
   dotnet run
   ```
   > Backend API sẽ chạy tại: `http://localhost:5000` hoặc `https://localhost:5001`.
   > Xem danh sách chi tiết các API endpoints tại: [docs/api.md](./docs/api.md)

### 3. Chạy Bộ Kiểm Thử (Testing Suite)

```bash
# Chạy toàn bộ Playwright E2E tests
npm run test:e2e

# Kiểm tra Accessibility (a11y)
npm run test:a11y

# Khởi chạy Storybook UI
npm run storybook
```

---

## 📁 Cấu trúc Thư mục Hệ thống (Directory Structure)

```text
3HD2Kcinema/
├── README.md                  # Tổng quan dự án, Trạng thái Audit & Hướng dẫn khởi chạy
├── LICENSE                    # Giấy phép bản quyền MIT
├── package.json               # Cấu hình npm scripts (Playwright, Storybook, Lighthouse CI)
├── playwright.config.js       # Cấu hình bộ kiểm thử Playwright E2E & Visual Regression
├── .lighthouserc.js           # Cấu hình kiểm thử hiệu năng Lighthouse CI
├── mkdocs.yml                 # Cấu hình website tài liệu MkDocs Material
├── .github/
│   └── workflows/             # Workflows CI/CD GitHub Actions (Playwright, Docs, Vercel, Lighthouse, Chromatic)
├── docs/                      # Thư mục tài liệu chi tiết (Architecture, API, DB, Testing,...)
├── tests/                     # Các kịch bản kiểm thử E2E và Accessibility
├── frontend/                  # Mã nguồn ứng dụng Frontend (Client-side)
│   ├── src/
│   │   ├── about/             # Trang giới thiệu dự án
│   │   ├── assets/            # CSS chung, fonts, icons tĩnh
│   │   ├── auth/              # Đăng nhập, Đăng ký, Quên mật khẩu & Auth Services
│   │   ├── booking/           # Chọn ghế, Đồ ăn combo, Checkout, PayOS flow, Hóa đơn & Vé của tôi (my-tickets)
│   │   ├── engagement/        # Minigame CinePredict & CineMatch
│   │   ├── explore/           # Trang chủ, Tìm kiếm phim, Chi tiết phim, Cụm rạp
│   │   ├── footer/            # Component Footer
│   │   ├── images/            # Hình ảnh động (posters, banners, qr)
│   │   ├── management/        # Giao diện Quản lý Admin & Nhân viên bán vé (POS)
│   │   ├── shared/            # Shared Components (Navbar, Storage Utils)
│   │   ├── user/              # Hồ sơ người dùng, Gói VIP, Đổi thưởng, Thông báo
│   │   ├── index.html         # Trang điều hướng ban đầu
│   │   └── wip.html           # Trang báo lỗi/Đang phát triển
│   └── package.json           # Tailwind CSS build scripts & serve
└── backend/                   # Khung mã nguồn Backend (ASP.NET Core 8.0 C#)
    ├── bin/                   # Thư mục chứa binaries đã biên dịch
    ├── Controllers/           # Controllers Web API & MVC (Movies, Bookings, Auth, Showtimes, Users, ApiPayment)
    ├── DTOs/                  # Data Transfer Objects cho API Request/Response
    ├── Hubs/                  # SignalR WebSockets Hubs (Real-time Booking & POS Notification)
    ├── Infrastructure/        # Cấu hình nạp dữ liệu ban đầu (DbInitializer / EF Seeding)
    ├── Migrations/            # EF Core Database Migrations
    ├── Models/                # Entity Framework Database Entities, DbContext & PayOSConfig
    ├── obj/                   # Thư mục tạm biên dịch C#
    ├── Properties/            # Launch settings & cấu hình ứng dụng
    ├── publish-latest/        # Bản đóng gói artifact sẵn sàng deploy production
    ├── Repositories/          # Data Access Layer (Repository Pattern)
    ├── Services/              # Business Logic Services (BookingService, FileService, Auth, PayOSService)
    ├── Views/                 # Giao diện MVC Views
    ├── wwwroot/               # Static assets backend (Uploads, Images)
    ├── appsettings.json       # Cấu hình hệ thống & chuỗi kết nối Database SQL Server
    ├── appsettings.Development.json # Cấu hình môi trường Development
    ├── appsettings.Production.json   # Cấu hình môi trường Production
    ├── appweb.csproj          # File dự án C# ASP.NET Core
    ├── appweb.slnx            # File Solution Visual Studio
    ├── fix_encoding.js        # Script sửa lỗi mã hóa dữ liệu
    ├── migrate_movie_fields.sql# Kịch bản SQL migration dữ liệu phim
    ├── migrate_somee_safe.sql # Kịch bản SQL tương thích Remote Hosting
    └── Program.cs             # ASP.NET Core Application Entry Point & Dependency Injection
```

---

## 📚 Hệ thống Tài liệu Chi tiết (Docs Directory)

- [🔗 Tổng quan (`docs/index.md`)](./docs/index.md)
- [🔗 Bắt đầu (`docs/getting-started.md`)](./docs/getting-started.md)
- [🔗 Kiến trúc (`docs/architecture.md`)](./docs/architecture.md)
- [🔗 Frontend (`docs/frontend.md`)](./docs/frontend.md)
- [🔗 Backend (`docs/backend.md`)](./docs/backend.md)
- [🔗 API (`docs/api.md`)](./docs/api.md)
- [🔗 Cơ sở Dữ liệu (`docs/database.md`)](./docs/database.md)
- [🔗 Triển khai (`docs/deployment.md`)](./docs/deployment.md)
- [🔗 Kiểm thử (`docs/testing.md`)](./docs/testing.md)
- [🔗 Quy trình Đóng góp (`docs/contributing.md`)](./docs/contributing.md)
