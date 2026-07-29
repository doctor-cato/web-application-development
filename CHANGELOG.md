# Changelog

All notable changes to this project will be documented in this file.

## [3.0.7] - 2026-07-29

### Added

- **CineMatch Redesign**: Giao diện card-based hoàn toàn mới với emoji chat, Firebase real-time sync, phân tích độ tương thích chi tiết và match timer đếm ngược.
- **QR Code Thanh toán Động**: Thêm hỗ trợ 3 phương thức QR Code (Chuyển khoản Ngân hàng, ZaloPay, MoMo) với hình ảnh QR riêng biệt và kích thước container tối ưu.
- **Admin Portal - Quản lý Suất chiếu**: Tab quản lý showtime mới trong Admin Portal cho phép lập lịch, thêm và xóa suất chiếu.
- **Staff POS - Bán vé tại quầy**: Hoàn thiện luồng bán vé trực tiếp cho nhân viên (Staff POS) với đồng bộ dữ liệu VIP và combo thực tế.
- **Backend Database Seeding Thực tế**: Nạp đầy đủ 12 bộ phim và suất chiếu thực vào SQL Server, đồng bộ dropdown quick-booking trong Admin.
- **Role-Based Navigation**: Thêm nút điều hướng theo vai trò (Admin Portal, Staff POS) vào navbar với tooltip icon buttons phát sáng.

### Changed

- **Admin Portal - 100% API-driven**: Toàn bộ dữ liệu phim, thống kê doanh thu, suất chiếu và combo đều kết nối trực tiếp qua API thay vì hardcode mock data.
- **Frontend - Loại bỏ toàn bộ Fallback Movie Data**: Xóa sạch `data.js` fallback cũ, áp dụng Cinema Availability Matrix và strict Hero Banner Rules.
- **Booking Success**: Mỗi ghế trong booking nhóm được cấp mã vé QR riêng biệt thay vì dùng chung một mã.
- **Seat Lock BroadcastChannel**: Cải thiện vòng đời `BroadcastChannel` — tự động đóng kênh khi tab unload, xóa dead code khóa ghế cũ.
- **Navbar**: Tái thiết kế icon Admin và Staff portal thành compact glowing icon buttons với tooltip, thay thế booking dropdown bằng quick-book form.
- **SignalR Resilience**: Cải thiện khả năng phục hồi kết nối SignalR, thêm guard kiểm tra `userId`/`username` trước khi gửi lên Hub.
- **Hero Banner**: Cập nhật transition, căn chỉnh navbar CineMatch, cập nhật poster Obsession và Iron Man 2.
- **Code Comments**: Dọn dẹp toàn bộ code comments thừa qua refactor commit.

### Fixed

- **Login & Authentication**: Sửa nhiều lỗi authentication — chuỗi kết nối database, timeout 15 giây cho API fetch, syntax error trong form action, `session is not defined` trên homepage.
- **Responsive Design**: Chuẩn hóa layout trên tất cả frontend components — navbar, admin portal, staff POS, home page.
- **CineMatch SignalR**: Tránh gửi `undefined` userId/username lên SignalR Hub gây lỗi kết nối.
- **VIP Callback**: Xử lý TypeError khi user name bị thiếu trong success callback của VIP module.
- **Group Booking**: Sửa lỗi `unexpected reserved word await` trong non-async callback.
- **Embed YouTube**: Cập nhật meta referrer policy và cải thiện xử lý embed trailer YouTube.
- **Registration**: Sửa lỗi đăng ký báo trùng SĐT dù nhập email mới, điều chỉnh vị trí hiển thị thông báo lỗi.
- **Cinema Map**: Sửa lỗi city filtering, hiển thị cinema rỗng, fallback showtimes và syntax error booking.js.
- **Avatar**: Sửa lỗi avatar đen ngòm khi không có ảnh (dùng ui-avatars fallback), sau đó hoàn tác và áp dụng phương án ổn định hơn.
- **Staff Sales**: Sửa lỗi flexbox height overflow, payment methods, ticket TDZ error và notification center.
- **Backend**: Cập nhật connection string, cấu hình frontend API config, vô hiệu hóa khởi tạo DB khi startup.

### Performance

- **Responsive Optimization**: Tối ưu toàn diện responsive design trên tất cả các trang frontend.
- **Navbar Icon**: Giới hạn nghiêm ngặt 36px icon-only bounds và font-size 0 để loại bỏ overflow text label.

## [2.7.7] - 2026-07-22

### Added
- **Loyalty & VIP Multiplier System**: Implemented dynamic reward points calculation based on user's Loyalty Tier (Silver: 1.25x, Gold: 1.5x, VIP: 1.75x, Diamond: 2.0x) or VIP Plan (Silver: 1.2x, Gold: 1.5x, Platinum: 2.0x), picking the highest multiplier.
- **Ticket Cancellation Flow**: Added full cancellation and partial cancellation support in the user profile page, which dynamically releases booked seats, updates local storage, and pops a success toast notification.
- **Real Geolocation**: Integrated active browser geolocation on the Cinema Map to calculate distances to nearby theaters.
- **Storage Service (`storage.js`)**: Centralized local storage management for constants and safe parsing.
- **Authentication Service (`authService.js`)**: Core logic for authentication including register, login, session management (JWT mock), and logout.
- **Forgot Password Flow (`forgot-password`)**: Added UI and logic for password recovery.
- **Profile UI logic (`profile-ui.js`)**: Decoupled interactive UI logic (accordions, tabs, modals) for the user profile page.

### Changed
- **Navbar & Navigation**:
  - Implemented auto-closing for all dropdown menus (notifications, user menu) upon clicking outside.
  - Switched from raw `localStorage` reading to using `getSession` and `logout` from `authService`.
  - Fixed relative pathing bugs by enforcing root-relative paths (`/`).
- **User Profile Page**: Refactored cancel ticket modal layout, removed hardcoded mock data to avoid ghost ticket cancellations, and integrated functional mock tickets for testing.
- **Login Module (`login.js`, `login.html`)**: Refactored massive inline scripts into ES modules. Absolute pathing configured.
- **Register Module (`register.js`, `register.html`)**: Refactored inline scripts into ES modules, integrated with `authService`.
- **Profile Module (`profile.js`, `profile.html`)**: Abstracted 400+ lines of inline script into modular JS, securely fetching user profile data via `authService`.
- **Group Booking**: Updated waiting room CTA link to point to `wip.html` since the collaborative feature is still in progress.

### Fixed
- **Mobile Responsive Layouts**:
  - Home Page: Fixed hero section button spacing and layout overlap on small screens.
  - Booking Food: Added horizontal scroll behavior for category food tabs on mobile to prevent layout overflow.
  - Movie Details: Fixed dropdown z-index issues and mobile viewport layout overlaps.
  - Booking Success: Fixed font rendering, points display bugs, and duplicate QR code generation.
  - E-Ticket: Made the modal scrollable and fully responsive on mobile.
  - Cinema Map: Fixed zoom control overlays and layout alignment on small screens.

### Security
- **Mock Tokenization**: Plain-text passwords from legacy users are now safely hashed (Base64 for demo purposes) and migrated upon login. Session tokens are used instead of storing raw passwords in local storage.

### Removed
- **Redundant Files**: Removed the deprecated and monolithic `frontend/stitch_booking.html` file.
- **Temp Folders**: Removed `Project` and `So_sanh` template/prototype folders as they are no longer needed.
- **Tooling Scripts**: Removed all one-off Python and JS tooling scripts from the root and src directories to clean up the repository.
