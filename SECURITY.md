# Chính sách Bảo mật (Security Policy)

## 1. Quản lý Bí mật & Biến môi trường (Secrets & Environment Variables)

Để đảm bảo không rò rỉ các thông tin nhạy cảm (Connection Strings, SMTP Passwords, JWT Secret Keys, API Keys) vào mã nguồn công khai, hệ thống tuân thủ các quy tắc sau:

- **Tuyệt đối không hardcode secrets** trong `appsettings.json` hoặc `appsettings.Production.json`.
- Mọi thông tin nhạy cảm trong môi trường **Development** phải sử dụng `User Secrets` hoặc biến môi trường cục bộ.
- Trong môi trường **Production**, các cấu hình được nạp thông qua biến môi trường của hệ thống/container:
  - `ConnectionStrings__DefaultConnection`: Chuỗi kết nối SQL Server.
  - `Jwt__Key`: Khóa mã hóa JWT Token (độ dài tối thiểu 32 bytes).
  - `SmtpSettings__Username` / `SmtpSettings__Password`: Thông tin đăng nhập SMTP Mailer.
  - `SmtpSettings__ResendApiKey`: Resend API Key để gửi email OTP.
  - `Payment__WebhookSecret`: Khóa bảo mật webhook thanh toán.

## 2. Xác thực và Phân quyền (Authentication & Authorization)

- **Password Hashing**: Sử dụng thư viện `BCrypt.Net.BCrypt` mã hóa mật khẩu trước khi lưu trữ.
- **OTP Generation**: Sử dụng `RandomNumberGenerator` (Cryptographically Secure Pseudo-Random Number Generator) để khởi tạo mã OTP ngẫu nhiên.
- **JWT Authorization**: Tất cả các API nhạy cảm (Đặt vé, Quản lý tài khoản, Nâng cấp VIP, CRUD Phim) phải được bảo vệ bởi nhãn `[Authorize]` hoặc `[Authorize(Roles = "ADMIN")]`.
- **Broken Access Control Prevention**: API truy cập thông tin người dùng (`/api/users/{id}`) chỉ cho phép người dùng chính chủ hoặc tài khoản Quản trị viên (ADMIN) truy cập.

## 3. Báo cáo lỗ hổng bảo mật

Nếu bạn phát hiện bất kỳ lỗ hổng bảo mật nào trong dự án, vui lòng không tạo public issue. Hãy gửi email trực tiếp tới bộ phận quản trị để xử lý.
