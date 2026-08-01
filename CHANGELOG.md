# Changelog

All notable changes to this project will be documented in this file. 
Tuân thủ nguyên tắc `@ponytail` (YAGNI, Minimal, No Boilerplate): Chỉ ghi nhận các cột mốc thay đổi kiến trúc và nghiệp vụ cốt lõi từ commit 1 đến 594+.

## [3.6.7] - 2026-08-01 (Hiện tại)
- **Backend & Database**: Hoàn thiện kiến trúc ASP.NET Core API. Tích hợp SQL Server + EF Core (gỡ bỏ hoàn toàn fallback mock data).
- **Real-time Sync**: Tích hợp SignalR để đồng bộ trạng thái khóa ghế và cập nhật Admin Portal/Staff POS theo thời gian thực.
- **Bảo mật & Auth**: Triển khai xác thực JWT, 2FA, và gửi mã OTP qua Resend API.
- **Triển khai**: Hoàn tất Vercel proxy, fix HTTPS mixed-content, tự động hóa CI/CD qua GitHub Actions.

## [3.0.7] - 2026-07-29
- **Admin Portal & Staff POS**: Chuyển đổi 100% sang API-driven, loại bỏ hardcode data. Quản lý suất chiếu, thống kê doanh thu thực.
- **Thanh toán**: Bổ sung QR Code thanh toán động cho 3 phương thức (Bank, MoMo, ZaloPay).
- **Engagement**: Minigame CineMatch tích hợp Firebase Real-time và chat emoji.

## [2.7.7] - 2026-07-22
- **Testing & Audit**: Hoàn thiện CI/CD Pipeline (Playwright E2E, Lighthouse, Axe-core, Storybook). Test coverage đạt 100% E2E.
- **Frontend Core**: Hoàn thiện luồng nghiệp vụ mua vé nhóm, hủy vé (một phần/toàn bộ). Tích hợp định vị GPS cho bản đồ rạp.
- **Client Mock Engine**: Xử lý State qua Local/SessionStorage. Đồng bộ khóa ghế đa tab bằng BroadcastChannel.

## [2.0.0] - Giai đoạn UI & Client-side
- **Thiết kế UI**: Refactor toàn bộ dự án sang Semantic Vanilla CSS (gỡ bỏ Tailwind CDN). Áp dụng Glassmorphism & Cinematic Dark Mode.
- **Tính năng**: Ra mắt tính năng dự đoán CinePredict, thẻ thành viên VIP/Loyalty, bình luận/đánh giá phim.
- **Cấu trúc mã**: Phân tách code Frontend theo mô hình Domain-based (auth, booking, explore, user, management).

## [1.0.0] - Khởi tạo Prototype
- Khởi tạo repo, xây dựng cấu trúc HTML/CSS tĩnh ban đầu.
- Định hình chiến lược kiến trúc "Hybrid Client Mock & ASP.NET Core Backend Scaffold".
