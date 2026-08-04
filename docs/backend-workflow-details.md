# Chi tiết Luồng hoạt động và Kiến trúc Backend (Backend Workflow Details)

Tài liệu này trình bày chi tiết về kiến trúc tổng thể, các cơ chế cốt lõi và các luồng hoạt động (workflows) nghiệp vụ quan trọng nhất trong Backend của hệ thống **3HD2Kcinema**.

---

## 1. Tổng quan Kiến trúc (Architecture Overview)

Backend được xây dựng dựa trên framework **ASP.NET Core 8 Web API** và tuân theo mô hình kiến trúc phân tầng (Layered Architecture).

### 1.1. Các Tầng (Layers)
- **Tầng Giao tiếp (Controllers & SignalR Hubs)**: Điểm vào của mọi request. Nhận dữ liệu (HTTP Request, WebSocket Message), kiểm tra tính hợp lệ (Validation) và chuyển giao cho Service.
- **Tầng Nghiệp vụ (Services)**: Xử lý logic nghiệp vụ cốt lõi (tính giá vé, áp dụng mã giảm giá, kiểm tra điều kiện nghiệp vụ). Tách biệt hoàn toàn khỏi Database và HTTP Context.
- **Tầng Truy cập Dữ liệu (Repositories)**: Chịu trách nhiệm giao tiếp trực tiếp với cơ sở dữ liệu thông qua Entity Framework Core. Cô lập các truy vấn LINQ/SQL tại đây.

### 1.2. Dependency Injection (DI)
Tất cả các thành phần đều được đăng ký qua hệ thống DI trong `Program.cs`.
- Các `Repository` và `Service` sử dụng vòng đời **Scoped** (mỗi HTTP Request tạo một instance mới).
- Lợi ích: Dễ dàng mock/fake để viết Unit Test và quản lý kết nối Database an toàn.

---

## 2. Bảo mật và Xác thực (Security & Authentication)

### 2.1. Xác thực bằng JWT (JSON Web Token)
- Hệ thống sử dụng **JWT Bearer** để xác thực người dùng.
- Sau khi đăng nhập thành công (`AuthController`), máy chủ tạo một Token chứa thông tin: `UserId`, `Role` (Customer/Admin), `Email`.
- Token này được cấu hình tự động trích xuất trong `Program.cs`. Đặc biệt, với các kết nối **SignalR (WebSocket)**, token được lấy từ query string `?access_token=...`.

### 2.2. Rate Limiting (Chống Spam)
- Để bảo vệ hệ thống khỏi tấn công Brute-force, API áp dụng **Rate Limiter** policy (`loginPolicy` trong `Program.cs`).
- Giới hạn: Tối đa **5 requests / phút** cho các endpoint nhạy cảm như Đăng nhập, Đăng ký. Vượt quá sẽ nhận lỗi `429 Too Many Requests`.

---

## 3. Database & Entity Framework Core

### 3.1. Entity Framework
- Sử dụng phương pháp **Code-First**. Database schema được tự động sinh ra từ các Model C# thông qua Migrations.
- File `ApplicationDbContext.cs` định nghĩa cấu trúc bảng và các mối quan hệ (1-n, n-n).

### 3.2. Concurrency Control (Kiểm soát đồng thời - Khóa ghế)
- **Bài toán**: Hai người dùng cùng chọn một ghế và thanh toán cùng một phần nghìn giây.
- **Giải pháp**: 
  - Tại tầng Database, tạo một **Unique Index** cho cặp `{ ShowtimeId, SeatId }` trong bảng `BookingDetails`.
  - Khi transaction lưu xuống DB, SQL Server sẽ tự chặn request thứ hai và văng lỗi. `BookingRepository` bắt lỗi này và thông báo "Ghế đã bị đặt" cho Client thứ hai, đảm bảo dữ liệu không bao giờ sai lệch.

### 3.3. Seeding Dữ liệu (DbInitializer)
- Khi khởi động (`InitializeOnStartup=true`), `DbInitializer` sẽ kiểm tra nếu DB trống, nó sẽ tự động chèn các rạp, phòng chiếu, danh sách phim ban đầu để hệ thống sẵn sàng hoạt động ngay lập tức.

---

## 4. SignalR - Giao tiếp Thời gian thực (Real-time)

Hệ thống sử dụng **SignalR** cho các tính năng tương tác hai chiều không độ trễ:

- **`SeatHub`**: Khi một user đang chọn ghế (Click vào ghế), hệ thống phát tín hiệu `SeatLocked` tới TẤT CẢ các user khác đang xem cùng suất chiếu đó để hiển thị ghế màu vàng (đang có người chọn). Tín hiệu `SeatUnlocked` được gửi nếu user bỏ chọn.
- **`NotificationHub`**: Gửi thông báo hệ thống (ví dụ: Admin gửi tin khuyến mãi).
- **`SupportChatHub`**: Hỗ trợ khách hàng trực tuyến (Live Chat).
- **`CineMatchHub`**: Hỗ trợ luồng mini-game ghép đôi xem phim.

---

## 5. Chi tiết Các Luồng Hoạt Động Chính (Core Workflows)

### 5.1. Luồng Đặt Vé (Booking Workflow)

Đây là luồng phức tạp nhất của hệ thống, kéo dài từ Frontend đến Backend.

1. **Khởi tạo (Client)**: User chọn Phim -> Suất Chiếu -> Ghế -> Combo -> Voucher.
2. **Tiếp nhận (ApiBookingsController)**: Nhận `BookingRequest` (bao gồm `UserId`, `ShowtimeId`, mảng `SeatIds`, mảng `ComboIds`, `VoucherCode`).
3. **Kiểm tra nghiệp vụ (BookingService)**:
   - Kiểm tra suất chiếu còn tồn tại không.
   - Tính tổng tiền vé dựa trên loại ghế (VIP/Thường).
   - Cộng thêm tiền Combo (nếu có).
   - Kiểm tra `VoucherCode` có hợp lệ không. Tính toán giảm giá.
   - Tính toán hệ số điểm thành viên (Point Rate).
4. **Lưu trữ CSDL (BookingRepository)**:
   - Bắt đầu một **Database Transaction**.
   - Lưu `Booking` (Hóa đơn tổng).
   - Lưu danh sách `BookingDetail` (Chi tiết từng ghế). Nếu vi phạm Unique Index, rollback transaction và báo lỗi.
   - Lưu danh sách `BookingCombo` (nếu có).
   - Đánh dấu Voucher đã sử dụng (nếu là voucher dùng 1 lần).
   - Trừ điểm User (nếu dùng điểm thanh toán).
   - **Commit Transaction**.
5. **Đồng bộ Real-time**: Gọi `SeatHub` phát tín hiệu `SeatBooked` để các màn hình khác cập nhật trạng thái ghế thành màu đỏ (Đã bán).

### 5.2. Luồng Thanh toán (Payment Workflow)

Hệ thống hỗ trợ thanh toán chuyển khoản qua mã QR (VietQR API).

1. **Tạo mã QR (Generate)**: Client gọi `GET /api/payment/generate-qr?amount=...`. Backend lấy cấu hình ngân hàng (BankId, AccountNo) từ `appsettings.json`, ghép chuỗi tạo URL ảnh VietQR.
2. **Người dùng thanh toán**: Quét mã bằng App Ngân hàng.
3. **Webhook (Xác nhận)**:
   - Khi tiền vào tài khoản, nhà cung cấp dịch vụ thanh toán gọi POST vào `/api/payment/webhook`.
   - Backend nhận payload (TransactionId, OrderId, Amount, Signature).
   - **Xác thực Signature**: Dùng HMACSHA256 với `WebhookSecret` để đảm bảo request thực sự đến từ cổng thanh toán, không phải fake.
   - Cập nhật `PaymentStatus = "Paid"` cho Booking tương ứng.
   - Cộng điểm thưởng (Loyalty Points) cho `User`.

### 5.3. Luồng Quản lý Tệp Tin (File Upload)

1. **Upload**: Admin tải ảnh Poster phim lên `UploadsController`.
2. **Xử lý (FileService)**: `FileService` lưu file vật lý vào thư mục `wwwroot/uploads`, tự động đổi tên file (dùng GUID) để tránh trùng lặp.
3. **Lưu DB**: Trả về URL đường dẫn tĩnh (VD: `/uploads/poster-123.jpg`) để lưu vào thuộc tính `PosterUrl` của Entity `Movie`.

---

## 6. Background Services (Tác vụ nền)

Hệ thống tích hợp các Hosted Service chạy ngầm độc lập với các HTTP Request:

- **`SeatCleanupService`**: 
  - Chạy lặp lại theo chu kỳ.
  - Mục đích: Tìm các hóa đơn đang ở trạng thái chờ thanh toán (Pending) quá lâu (ví dụ 10 phút), tự động hủy hóa đơn (Cancelled) và giải phóng ghế để người khác có thể mua.
