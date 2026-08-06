# Báo cáo Audit Toàn diện: 3HD2K Cinema

**Người thực hiện:** Senior Full-stack Security Auditor & QA Engineer
**Thời gian:** 2026-08-05

Báo cáo này trình bày kết quả audit chuyên sâu theo 10 hạng mục yêu cầu, cung cấp bằng chứng cụ thể từ source code và đánh giá mức độ nghiêm trọng.

---

## 1. Kiến trúc & Code Quality

| Mức độ       | Khu vực        | File/Dòng                           | Mô tả                                                                                                           | Bằng chứng                                                                                              | Đề xuất fix                                                             |
| ------------ | -------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **High**     | Architecture   | `Program.cs` (Dòng 98-104)          | Đăng ký Dependency Injection sai chuẩn SOLID. Sử dụng concrete class thay vì interface.                         | `builder.Services.AddScoped<UserRepository>();` thay vì `AddScoped<IUserRepository, UserRepository>();` | Tạo các interface (vd: `IUserRepository`) và đăng ký qua interface.     |
| **Medium**   | Architecture   | `ApiBookingsController.cs`          | Logic nghiệp vụ (tính toán giá vé, giảm giá VIP, điểm loyalty) bị nhét toàn bộ vào Controller (Fat Controller). | Dòng 57-90 chứa toàn bộ logic tính `total`, `discountAmount`, `vipDiscountAmount`.                      | Tách logic ra `IBookingService` hoặc `PricingService`.                  |
| **Critical** | Config/Secrets | `appsettings.json` (Dòng 3, 16, 27) | Hardcode thông tin nhạy cảm: Database Connection String (có password), `Jwt:Key`, `SMTP Password`.              | `"pwd=jmgavwj41z"`, `"Key": "3HD2K-Cinema-SuperSecret..."`                                              | Sử dụng Environment Variables, Azure Key Vault, hoặc .NET User Secrets. |

---

## 2. Authentication & Authorization (JWT)

| Mức độ | Khu vực | File/Dòng | Mô tả | Bằng chứng | Đề xuất fix |
|--------|---------|-----------|-------|-----------|-------------|
| **Critical** | Authorization | `ApiShowtimesController.cs` (Dòng 81, 112, 136) | Toàn bộ các API Thêm (`HttpPost`), Sửa (`HttpPut`), Xóa (`HttpDelete`) suất chiếu **hoàn toàn không có `[Authorize]`**. Bất kỳ ai cũng có thể thao tác. | Không có Attribute `[Authorize(Roles = "ADMIN")]` nào trên class hay các method này. | Thêm `[Authorize(Roles = "ADMIN")]` vào các endpoint chỉnh sửa suất chiếu. |
| **Low** | JWT Expiry | `AuthController.cs` (Dòng 485) | Access token có thời hạn 30 phút, nhưng Refresh token không thu hồi tự động nếu phát hiện abuse. | `expires: DateTime.UtcNow.AddMinutes(expireMinutes)` | Cấu hình đúng chuẩn, cân nhắc thời gian token ngắn hơn (15p) cho ứng dụng tài chính/thanh toán. |

---

## 3. Input Validation & Injection

| Mức độ | Khu vực | File/Dòng | Mô tả | Bằng chứng | Đề xuất fix |
|--------|---------|-----------|-------|-----------|-------------|
| **Pass** | SQL Injection | `ApiPaymentController.cs` (Dòng 54-55) | Các câu lệnh raw SQL đã sử dụng parameter hóa (`@p0`), an toàn trước SQL Injection. | `ExecuteSqlRawAsync("... WHERE OrderCode = @p0...", orderCode);` | Giữ nguyên, hoặc chuyển sang dùng Entity Framework LINQ Update (EF Core 7+ `ExecuteUpdateAsync`). |
| **Medium** | XSS | `frontend/.../room.html`, `register.js` | Giao diện sử dụng tràn lan `innerHTML` để nối chuỗi (String Interpolation) render giao diện. Rủi ro XSS nếu dữ liệu từ DB (tên user, tin nhắn) không được encode. | `card.innerHTML = ... <span class="member-name">${friendName}</span>` | Sử dụng `.textContent` đối với dữ liệu user-input hoặc thư viện sanitize (DOMPurify) trước khi gán `innerHTML`. |

---

## 4. SignalR / Real-time (SeatHub)

| Mức độ | Khu vực | File/Dòng | Mô tả | Bằng chứng | Đề xuất fix |
|--------|---------|-----------|-------|-----------|-------------|
| **High** | Rate Limiting | `SeatHub.cs` (Dòng 32-59) | Không giới hạn số lượng ghế một user có thể giữ (Hold). Kẻ xấu có thể spam `SelectSeat` để khóa toàn bộ rạp trong 5 phút. | Không có kiểm tra: `if (UserHeldSeats > MAX) return;` | Giới hạn tối đa 6-8 ghế / 1 tài khoản trong cùng 1 thời điểm. |
| **Medium** | State Management | `SeatHub.cs` / `SeatCleanupService.cs` | Khi client ngắt kết nối đột ngột (Close tab/Mất mạng), ghế không được nhả ngay lập tức mà phải đợi Background Service quét (lên tới 5 phút). | `SeatHub` không override method `OnDisconnectedAsync`. | Override `OnDisconnectedAsync` trong `SeatHub` để reset `Status = "Available"` ngay lập tức cho các ghế user đó đang giữ. |

---

## 5. Payment / QR Flow

| Mức độ | Khu vực | File/Dòng | Mô tả | Bằng chứng | Đề xuất fix |
|--------|---------|-----------|-------|-----------|-------------|
| **Critical** | Race Condition / ACID | `ApiBookingsController.cs` (Dòng 107-109, 124) | API Đặt vé bỏ qua việc tạo `BookingDetail` (nơi có unique constraint ở DB) và **không kiểm tra trạng thái ghế** trước khi tạo Booking. 2 user có thể tạo thanh toán cho cùng 1 ghế. | Comment code: `// But since Seats table is empty in DB, it causes 400... YAGNI: Just let the system work with booking.Seats` | Bắt buộc kiểm tra `Seat.Status == "Held"` bởi đúng `UserId` trong 1 `IDbContextTransaction` Serializable trước khi Insert Booking. |
| **High** | Webhook ACID | `ApiPaymentController.cs` (Dòng 54-121) | Webhook PayOS xử lý cập nhật trạng thái `Paid` và Cập nhật `Seat` thành `Booked` nhưng không nằm trong Database Transaction. Nếu bước sau lỗi, vé đã Paid nhưng ghế vẫn trống. | `await _context.Database.ExecuteSqlRawAsync(sql, orderCode);` sau đó mới duyệt mảng seats và `_context.SaveChangesAsync();` | Gói toàn bộ logic Webhook trong `using var transaction = await _context.Database.BeginTransactionAsync();` |

---

## 6. Database & Cấu trúc Dữ liệu

| Mức độ | Khu vực | File/Dòng | Mô tả | Bằng chứng | Đề xuất fix |
|--------|---------|-----------|-------|-----------|-------------|
| **High** | Normalization | `Booking.cs` (Dòng 12) | Lưu trữ danh sách ghế dưới dạng chuỗi (VD: "A1,A2") vi phạm chuẩn 1NF, làm mất khả năng ràng buộc Unique ghế/suất chiếu ở cấp độ DB. | `public string? Seats { get; set; }` thay vì dùng quan hệ 1-N `BookingDetails`. | Khôi phục lại logic lưu `BookingDetail` cho từng ghế. |
| **Medium** | Indexing | `ApplicationDbContext.cs` | Background Service `SeatCleanupService` liên tục quét bảng `Seats` mỗi 30s với điều kiện `Status = "Held"` và `HeldUntil < DateTime.UtcNow`. Tuy nhiên bảng `Seats` không được đánh index. | Không có `modelBuilder.Entity<Seat>().HasIndex(...)` | Thêm composite index cho `(Status, HeldUntil)` trên bảng `Seats`. |

---

## 7. Email Notification & External Integrations

| Mức độ | Khu vực | File/Dòng | Mô tả | Bằng chứng | Đề xuất fix |
|--------|---------|-----------|-------|-----------|-------------|
| **Critical** | Info Leakage | `AuthController.cs` (Dòng 750-751) | Khi SMTP hoặc Resend API lỗi/chưa cấu hình, hệ thống sẽ in trực tiếp OTP và nội dung email ra Console. Nếu log này bị theo dõi, có thể chiếm đoạt tài khoản. | `Console.WriteLine($"To: {toEmail}\nSubject: {subject}\nBody: {body}");` | Xóa việc log nội dung body/OTP ra console. Chỉ log trạng thái gửi thất bại. |

---

## 8. Error Handling & Logging

| Mức độ | Khu vực | File/Dòng | Mô tả | Bằng chứng | Đề xuất fix |
|--------|---------|-----------|-------|-----------|-------------|
| **High** | Info Leakage | `Program.cs` (Dòng 111) | `app.UseDeveloperExceptionPage();` được bật Vĩnh viễn (kể cả Production). Trả về Stack trace chi tiết, query EF Core và cấu trúc thư mục máy chủ. | Nằm ngoài block `if (app.Environment.IsDevelopment())` | Chuyển dòng code này vào trong block kiểm tra môi trường Development. |

---

## 9. API Testing / Business Logic

| Mức độ | Khu vực | File/Dòng | Mô tả | Bằng chứng | Đề xuất fix |
|--------|---------|-----------|-------|-----------|-------------|
| **Medium** | Business Logic | `ApiBookingsController.cs` (Dòng 68-71) | Promo code được hardcode (`GIAM50K`, `BAPFREE`) và không hề có bảng theo dõi lượt sử dụng. User có thể dùng mã này vô hạn lần. | `if (code == "GIAM50K" && total >= 200000) discountAmount = 50000;` | Quản lý PromoCode trong bảng `Vouchers` và kiểm tra logic/cập nhật số lượt dùng trong Transaction. |

---

## 10. Performance & Scalability

| Mức độ | Khu vực | File/Dòng | Mô tả | Bằng chứng | Đề xuất fix |
|--------|---------|-----------|-------|-----------|-------------|
| **Pass** | N+1 Query | `ShowtimeRepository.cs` (Dòng 18) | EF Core `Include` và `ThenInclude` được sử dụng đúng cách để Join các bảng, tránh lỗi N+1 Query. | `_context.Showtimes.Include(s => s.Room).ThenInclude(r => r.Cinema)...` | Giữ nguyên. |
| **High** | Pagination | `ApiMoviesController.cs` (Dòng 30) | Toàn bộ danh sách phim, suất chiếu, và giao dịch đều được query và trả về bằng `.GetAllAsync()` (Lấy tất cả). Khi dữ liệu lớn sẽ gây tràn RAM (OOM) và chậm API. | Không có phương thức `.Skip().Take()` nào trong Repository và Controller. | Implement Server-side Pagination với tham số `page` và `pageSize`. |

---

## TỔNG HỢP & KẾT LUẬN

**Thống kê lỗi:**
- **Critical:** 4
- **High:** 5
- **Medium:** 4
- **Low:** 1

**Top 3 vấn đề cần fix ngay lập tức (P0):**
1. **Thiếu Authorize ở CRUD Suất chiếu:** Bất kỳ user nào cũng có thể xóa/sửa suất chiếu qua API (`ApiShowtimesController.cs`).
2. **Lỗi Race Condition Đặt vé:** Database thiếu ràng buộc Unique và Controller không kiểm tra lại trạng thái ghế, dẫn đến việc bán trùng ghế (`ApiBookingsController.cs`).
3. **Lộ lọt thông tin nhạy cảm:** Database Connection, SMTP Password, JWT Key bị check-in thẳng vào file cấu hình; Mã OTP bị in ra Console; Lỗi hệ thống trả thẳng về Client (`Program.cs`, `appsettings.json`, `AuthController.cs`).

**Trạng thái Test Case (Checklist):**
- [x] Gọi API bảo vệ không token -> **PASS** (401)
- [x] Sửa suất chiếu với user thường -> **FAIL** (Thành công do thiếu Authorize)
- [x] SQL Injection (`' OR '1'='1`) -> **PASS** (Đã dùng tham số)
- [x] Rate limit SeatHub spam -> **FAIL** (Không có rate limit giữ ghế)
- [x] Disconnect nhả ghế -> **FAIL** (Phải chờ 5 phút mới nhả)
- [x] Race condition 2 user đặt chung ghế -> **FAIL** (Cả 2 đều tạo được link thanh toán)
