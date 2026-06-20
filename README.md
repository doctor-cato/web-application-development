# 3HD2Kcinema — Hệ thống Đặt Vé Rạp Chiếu Phim

Ứng dụng web mô phỏng toàn bộ luồng đặt vé rạp chiếu phim, từ xem phim, chọn ghế, thanh toán đến hóa đơn QR. Định hướng của dự án là một hệ thống full-stack hoàn chỉnh (có Frontend, Backend và Cơ sở dữ liệu), tuy nhiên **hiện tại dự án đang trong giai đoạn hoàn thiện Frontend** (vẫn sử dụng giả lập LocalStorage/SessionStorage), trong khi thư mục Backend đã được khởi tạo nhưng chưa tích hợp.

## Công nghệ sử dụng

### Frontend (Thư mục `/frontend`) - Trọng tâm hiện tại
- **HTML5 & Vanilla CSS3**: Cấu trúc trang và style (Cinematic Noir theme, Glassmorphism).
- **JavaScript ES6 Modules**: Logic xử lý giao diện (`<script type="module">`).
- **Tailwind CSS**: Utility-first CSS framework.
- **Trạng thái tạm thời**: Sử dụng `SessionStorage` và `LocalStorage` để giả lập database (giỏ hàng, danh sách phim, tài khoản) và BroadcastChannel để đồng bộ đa tab.

### Backend & Database (Thư mục `/backend`) - Chưa tích hợp
- **ASP.NET Core (C#)**: Kiến trúc MVC & Web API.
- **Entity Framework Core & SQL Server**: Lớp truy cập dữ liệu và lưu trữ.
- *(Lưu ý: Phần backend hiện tại đã có khung mã nguồn nhưng đang "để trưng", chưa được gọi từ frontend).*

## Cách chạy ứng dụng (Local)

Hiện tại bạn **chỉ cần chạy Frontend** để kiểm tra và phát triển UI.

### Khởi chạy Frontend (Giao diện)

Mở terminal, trỏ đến thư mục frontend và chạy:

```bash
cd frontend
npm install
npm run dev
```

> Mở trình duyệt tại: `http://localhost:3000`. Toàn bộ luồng đặt vé và tính năng sẽ hoạt động hoàn toàn dựa vào LocalStorage.

*(Tùy chọn) Để theo dõi và tự động build lại Tailwind CSS khi code giao diện thay đổi, mở thêm 1 terminal và chạy:* `npm run tailwind:watch`

## Cấu trúc thư mục

```text
/ (repo root)
├── backend/                   # Khung Source code Backend (ASP.NET Core C#) - Chưa tích hợp
│   ├── Controllers/           # Các API/MVC Controllers
│   ├── Models/                # Entity Framework Models (Schema DB)
│   ├── Infrastructure/        # Cấu hình DbContext
│   ├── Services/              # Business Logic Services
│   └── appsettings.json       # Cấu hình kết nối SQL Server
├── frontend/                  # Source code Frontend (Đang phát triển chính)
│   ├── src/                   # Mã nguồn chính
│   │   ├── index.html         # Điểm vào, redirect → explore/home-page/
│   │   ├── auth/              # Giao diện: Xác thực (Login, Register)
│   │   ├── booking/           # Giao diện: Đặt vé (Chọn ghế, Thanh toán)
│   │   ├── user/              # Giao diện: Người dùng (Hồ sơ, Điểm)
│   │   ├── explore/           # Giao diện: Khám phá (Trang chủ, Phim, Rạp)
│   │   ├── engagement/        # Giao diện: Tương tác (Minigame, Lounge)
│   │   └── shared/            # Dùng chung (CSS, Components, Utilities)
│   ├── package.json           # npm scripts (`dev`, `build`)
│   └── tailwind.config.js     # Cấu hình TailwindCSS
├── Docs/                      # Tài liệu hệ thống chi tiết
└── README.md                  # Tổng quan dự án (file này)
```

## Bảng Theo Dõi Tiến Độ Tính Năng (Frontend)

| Trạng thái | Tính năng | Vị trí (Frontend) |
|---|---|---|
| ✅ Hoàn thành | Trang đăng nhập & Đăng ký | `frontend/src/auth/` |
| ✅ Hoàn thành | Trang chủ (Hero, Phim đang chiếu) | `frontend/src/explore/home-page/` |
| ✅ Hoàn thành | Chi tiết phim (Trailer, Đặt vé) | `frontend/src/explore/movie-details/` |
| ✅ Hoàn thành | Bản đồ & định vị cụm rạp | `frontend/src/explore/cinema-map/` |
| ✅ Hoàn thành | Đặt ghế & Chọn bắp nước | `frontend/src/booking/seat-booking/` |
| ✅ Hoàn thành | Thanh toán giả lập & QR Hóa đơn | `frontend/src/booking/checkout/` |
| ✅ Hoàn thành | Hủy vé & Lịch sử giao dịch | `frontend/src/booking/cancel-booking/` |
| ✅ Hoàn thành | Hồ sơ & Tích điểm thành viên | `frontend/src/user/` |
| 🔄 Đang hoàn thiện | Đặt & giữ ghế theo nhóm | `frontend/src/booking/group-booking/` |

## Tài liệu Dự Án

Hãy tham khảo thư mục [`Docs/`](./Docs/) để hiểu sâu hơn về kiến trúc và quy trình làm việc. (*Lưu ý: Một số tài liệu trong thư mục Docs đang mô tả định hướng tích hợp Full-stack cho tương lai*):

- [`Docs/overview.md`](./Docs/overview.md) — Tổng quan dự án & Cấu trúc.
- [`Docs/architecture.md`](./Docs/architecture.md) — Kiến trúc phân tầng Client-Server.
- [`Docs/features.md`](./Docs/features.md) — Tính năng & luồng nghiệp vụ.
- [`Docs/data-storage.md`](./Docs/data-storage.md) — Cấu trúc SQL Server Database & Data Models.
- [`Docs/workflows.md`](./Docs/workflows.md) — Quy tắc code & Git flow.
