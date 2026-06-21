# 3HD2Kcinema — Hệ thống Đặt Vé Rạp Chiếu Phim

Ứng dụng web mô phỏng toàn bộ luồng đặt vé rạp chiếu phim, từ xem phim, chọn ghế, thanh toán đến hóa đơn QR và quản lý tài khoản. 

## Trạng thái Hiện tại của Dự án

Dự án được cấu trúc theo mô hình song song:
1. **Frontend (Thư mục `/frontend`) - Nhánh chạy chính thức**: Là một ứng dụng client-side hoàn chỉnh được phát triển bằng HTML5, CSS3, Vanilla JS và Tailwind CSS. Để phục vụ việc chạy độc lập không phụ thuộc môi trường mạng, toàn bộ luồng dữ liệu (users, bookings, seat locks, rewards, notifications) được **giả lập qua LocalStorage và SessionStorage** cùng **BroadcastChannel API** để đồng bộ trạng thái khóa ghế thời gian thực giữa các tab.
2. **Backend & Database (Thư mục `/backend`) - Khung mô hình**: Là ứng dụng ASP.NET Core MVC (C#) sử dụng Entity Framework Core và SQL Server. Phần này đóng vai trò là khung kiến trúc mẫu (scaffold) và hiện tại **chưa được tích hợp/gọi trực tiếp** từ giao diện Frontend chạy chính thức.

---

## Các Tính năng Nổi bật Mới Cập Nhật

- **Hệ thống Điểm thưởng & VIP Multiplier**: Cộng điểm loyalty thông minh khi mua vé thành công. Tự động áp dụng hệ số nhân cao nhất từ thứ hạng thành viên VIP (Silver: 1.2x, Gold: 1.5x, Platinum: 2.0x) hoặc Loyalty Tier (Bạc: 1.25x, Vàng: 1.5x, VIP: 1.75x, Diamond: 2.0x).
- **Hủy vé & Hoàn ghế linh hoạt**: Cho phép người dùng hủy toàn bộ hoặc hủy từng phần (partial cancellation) vé đã đặt trực tiếp từ trang hồ sơ cá nhân. Hệ thống tự động cập nhật LocalStorage và đồng bộ giải phóng ghế ngồi tương ứng trên sơ đồ rạp.
- **Tối ưu hóa Giao diện Di động (Mobile Responsive)**:
  - Thanh cuộn ngang mượt mà cho các danh mục đồ ăn (Booking Food) trên màn hình nhỏ.
  - Sắp xếp hợp lý các nút bấm và thông tin trên trang chủ và trang chi tiết phim.
  - Hóa đơn điện tử (E-ticket) và mã QR có khả năng cuộn và co giãn linh hoạt trên thiết bị di động.
  - Tự động đóng các menu thả xuống (dropdowns) trên thanh điều hướng (Navbar) khi nhấn ra ngoài.
- **Bản đồ Rạp & Định vị Thực tế**: Tích hợp HTML5 Geolocation API để định vị vị trí thực của người dùng và tính khoảng cách đến các cụm rạp.

---

## Cách Chạy Ứng Dụng (Local)

Hiện tại bạn **chỉ cần chạy thư mục Frontend** để kiểm nghiệm toàn bộ các tính năng của ứng dụng.

### Khởi chạy Frontend (Giao diện)

Mở terminal, chuyển vào thư mục `frontend` và chạy server tĩnh:

```bash
cd frontend

# Sử dụng Python để chạy web tĩnh (khuyên dùng):
python -m http.server 3000 -d src
# Hoặc nếu dùng python3:
python3 -m http.server 3000 -d src
```

> Truy cập trình duyệt tại: `http://localhost:3000`. Toàn bộ luồng từ đăng nhập, đặt ghế, thanh toán đến kiểm tra hồ sơ sẽ chạy mượt mà bằng Mock DB.

*(Tùy chọn) Để tự động biên dịch lại Tailwind CSS khi bạn thay đổi mã nguồn HTML:*
```bash
cd frontend
npm install
npm run tailwind:watch
```

---

## Cấu trúc Thư mục

```text
/ (repo root)
├── backend/                   # Khung mã nguồn Backend (ASP.NET Core C#) - Chưa tích hợp
│   ├── Controllers/           # Các MVC & API Controllers (Movie, Booking, Account,...)
│   ├── Models/                # Entity Framework Models (User, Movie, Booking,...)
│   ├── Infrastructure/        # Cấu hình DbContext & Seed dữ liệu (DbInitializer)
│   ├── Services/              # Lớp Business Logic (BookingService, FileService,...)
│   └── appsettings.json       # Cấu hình kết nối SQL Server
├── frontend/                  # Mã nguồn Frontend chạy chính thức (Client-side)
│   ├── src/                   # Thư mục mã nguồn chính
│   │   ├── index.html         # Điểm vào chính, chuyển hướng hướng về explore/home-page
│   │   ├── auth/              # Giao diện & Dịch vụ: Đăng nhập, Đăng ký, Quên mật khẩu
│   │   ├── booking/           # Giao diện & Dịch vụ: Chọn ghế, Chọn đồ ăn, Thanh toán, Thành công
│   │   │   └── group-booking/ # Giao diện phòng chờ đặt vé theo nhóm (WIP)
│   │   ├── user/              # Giao diện: Hồ sơ cá nhân (Lịch sử đặt vé, Hạng thành viên)
│   │   ├── explore/           # Giao diện: Trang chủ, Chi tiết phim, Bản đồ rạp
│   │   ├── engagement/        # Giao diện: Minigame tích điểm (Cinebet)
│   │   └── shared/            # Thành phần dùng chung (CSS, Components Navbar/Footer, Utilities)
│   ├── package.json           # Các scripts npm ( Tailwind watch, serve )
│   └── tailwind.config.js     # Cấu hình Tailwind CSS
├── Docs/                      # Tài liệu hệ thống chi tiết
├── README.md                  # Tổng quan dự án (file này)
└── AGENT_GUIDE.md             # Quy tắc và hướng dẫn dành cho AI Agent
```

---

## Bảng Theo Dõi Tiến Độ Tính Năng (Frontend)

> `✅` = Hoàn thành (Hoạt động tốt với Mock DB) | `🔄` = Đang hoàn thiện | `❌` = Chưa làm

| # | Trạng thái | Tính năng | Vị trí (Mã nguồn Frontend) |
|---|---|---|---|
| 1 | ✅ Hoàn thành | Trang đăng nhập (Hỗ trợ xác thực Mock) | `frontend/src/auth/user-login/` |
| 2 | ✅ Hoàn thành | Trang đăng ký (Hỗ trợ kiểm tra trùng lặp) | `frontend/src/auth/user-register/` |
| 3 | ✅ Hoàn thành | Quên mật khẩu & Cấp lại | `frontend/src/auth/forgot-password/` |
| 4 | ✅ Hoàn thành | Trang chủ (Hero banner, danh sách phim) | `frontend/src/explore/home-page/` |
| 5 | ✅ Hoàn thành | Chi tiết phim (Trailer, thông tin, chọn suất) | `frontend/src/explore/movie-details/` |
| 6 | ✅ Hoàn thành | Tìm kiếm & lọc phim nâng cao | `frontend/src/explore/movie-search/` |
| 7 | ✅ Hoàn thành | Bản đồ & định vị cụm rạp (Geolocation) | `frontend/src/explore/cinema-map/` |
| 8 | ✅ Hoàn thành | Đặt ghế thời gian thực (BroadcastChannel API)| `frontend/src/booking/seat-booking/` |
| 9 | ✅ Hoàn thành | Chọn combo Bắp Nước (Cuộn ngang mobile) | `frontend/src/booking/booking-food/` |
| 10| ✅ Hoàn thành | Thanh toán & Cổng thanh toán giả lập | `frontend/src/booking/checkout/` |
| 11| ✅ Hoàn thành | Hóa đơn điện tử + QR Code (Responsive) | `frontend/src/booking/checkout/booking_invoice.html` |
| 12| ✅ Hoàn thành | Trang Xác nhận Đặt Vé Thành công | `frontend/src/booking/booking-success/` |
| 13| ✅ Hoàn thành | Hủy vé & Hoàn trả ghế (Trong Hồ sơ) | `frontend/src/user/user-profile/` |
| 14| 🔄 Đang làm | Đặt & giữ ghế theo nhóm (Đang liên kết trang WIP)| `frontend/src/booking/group-booking/` |
| 15| ✅ Hoàn thành | Hồ sơ cá nhân & Lịch sử đặt vé | `frontend/src/user/user-profile/` |
| 16| ✅ Hoàn thành | Hệ thống tích điểm & Hạng thành viên | `frontend/src/user/loyalty-points/` |
| 17| ✅ Hoàn thành | Đăng ký thành viên VIP | `frontend/src/user/vip-registration/` |
| 18| ✅ Hoàn thành | Trung tâm thông báo (Nhận khi đặt/hủy vé) | `frontend/src/user/user-notifications/` |
| 19| ✅ Hoàn thành | Cinebet Minigame đặt cược điểm | `frontend/src/engagement/minigame/` |

---

## Tài liệu Dự Án

Hãy tham khảo thư mục [`Docs/`](./Docs/) để hiểu sâu hơn về kiến trúc và quy trình làm việc:
- [`Docs/overview.md`](./Docs/overview.md) — Tổng quan dự án, mục tiêu & phân cấp.
- [`Docs/architecture.md`](./Docs/architecture.md) — Kiến trúc phân tầng chi tiết của Frontend và Backend.
- [`Docs/features.md`](./Docs/features.md) — Luồng nghiệp vụ chi tiết của từng tính năng.
- [`Docs/data-storage.md`](./Docs/data-storage.md) — Cấu trúc dữ liệu Local/Session Storage và mô hình SQL Server.
- [`Docs/workflows.md`](./Docs/workflows.md) — Quy tắc viết code, Git flow & làm việc với AI Agent.
