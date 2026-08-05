# Chi tiết Luồng hoạt động và Kiến trúc Backend (Backend Workflow Details)

Tài liệu này trình bày chi tiết về kiến trúc tổng thể, các cơ chế cốt lõi và các luồng hoạt động (workflows) nghiệp vụ quan trọng nhất trong Backend của hệ thống **3HD2Kcinema**.

> **Lưu ý**: Tài liệu này được đối chiếu trực tiếp với mã nguồn (source code) tại thời điểm hiện tại. Các phần ghi chú **[Schema vs Implementation]** chỉ ra khoảng cách giữa thiết kế schema database và triển khai thực tế trong controller.

---

## Mục lục

1. [Tổng quan Kiến trúc](#1-tổng-quan-kiến-trúc-architecture-overview)
2. [Bảo mật và Xác thực](#2-bảo-mật-và-xác-thực-security--authentication)
3. [Database & Entity Framework Core](#3-database--entity-framework-core)
4. [SignalR - Giao tiếp Thời gian thực](#4-signalr---giao-tiếp-thời-gian-thực-real-time)
5. [Chi tiết Các Luồng Hoạt Động Chính](#5-chi-tiết-các-luồng-hoạt-động-chính-core-workflows)
6. [Background Services](#6-background-services-tác-vụ-nền)
7. [Danh sách API Endpoints](#7-danh-sách-api-endpoints)
8. [Cấu hình Hệ thống](#8-cấu-hình-hệ-thống-configuration)
9. [Ghi chú Kỹ thuật & Khoảng cách Schema](#9-ghi-chú-kỹ-thuật--khoảng-cách-schema)

---

## 1. Tổng quan Kiến trúc (Architecture Overview)

Backend được xây dựng dựa trên framework **ASP.NET Core 8 Web API** và tuân theo mô hình kiến trúc phân tầng (Layered Architecture).

### 1.1. Các Tầng (Layers)

| Tầng | Thành phần | Trách nhiệm |
|------|-----------|-------------|
| **Giao tiếp** | `Controllers/`, `Hubs/` | Điểm vào của mọi request. Nhận HTTP Request / WebSocket Message, kiểm tra tính hợp lệ (Validation), chuyển giao cho Repository hoặc xử lý inline. |
| **Nghiệp vụ** | `Services/` | Xử lý logic nghiệp vụ cốt lõi. Hiện tại gồm: `FileService` (upload file), `RatingService` (lấy đánh giá phim), `SeatCleanupService` (tác vụ nền). |
| **Truy cập Dữ liệu** | `Repositories/` | Giao tiếp trực tiếp với DB qua Entity Framework Core. Cô lập các truy vấn LINQ. Bao gồm: `BookingRepository`, `MovieRepository`, `ShowtimeRepository`, `UserRepository`, `CinemaRepository`, `ComboRepository`, `VoucherRepository`. |

> **[Schema vs Implementation]** Tài liệu trước đây mô tả tồn tại một `BookingService` riêng biệt xử lý logic tính giá vé, áp voucher, kiểm tra điều kiện nghiệp vụ. Tuy nhiên, trong code hiện tại, logic booking được **viết trực tiếp (inline) trong `ApiBookingsController`** — không có lớp Service trung gian cho booking.

### 1.2. Dependency Injection (DI)

Tất cả thành phần được đăng ký qua DI trong `Program.cs`:

```csharp
// Repositories - Scoped (mỗi HTTP request tạo instance mới)
builder.Services.AddScoped<appweb.Repositories.UserRepository>();
builder.Services.AddScoped<appweb.Repositories.MovieRepository>();
builder.Services.AddScoped<appweb.Repositories.BookingRepository>();
builder.Services.AddScoped<appweb.Repositories.ShowtimeRepository>();
builder.Services.AddScoped<appweb.Repositories.CinemaRepository>();
builder.Services.AddScoped<appweb.Repositories.ComboRepository>();
builder.Services.AddScoped<appweb.Repositories.VoucherRepository>();

// Services
builder.Services.AddScoped<IFileService, FileService>();
builder.Services.AddScoped<IRatingService, RatingService>();
builder.Services.AddHttpClient();  // Cho RatingService gọi OMDb API
builder.Services.AddMemoryCache(); // Cho RatingService cache 24h

// Background Service - Singleton (chạy xuyên suốt vòng đời ứng dụng)
builder.Services.AddHostedService<appweb.Services.SeatCleanupService>();
```

**Lợi ích**: Dễ dàng mock/fake để viết Unit Test, quản lý kết nối Database an toàn (Scoped tránh chia sẻ DbContext giữa các request).

### 1.3. Middleware Pipeline

Thứ tự middleware trong `Program.cs` (thứ tự quan trọng):

```
UseDeveloperExceptionPage → UseSwagger → UseHttpsRedirection → UseStaticFiles
→ UseRouting → UseRateLimiter → UseCors("AllowAll")
→ UseAuthentication → UseAuthorization → MapControllers → MapHubs
```

- **CORS**: Policy `"AllowAll"` cho phép mọi origin, method, header, credentials.
- **Static Files**: Phục vụ file tĩnh từ `wwwroot/` và thư mục `frontend/` (nếu tồn tại).
- **JSON Options**: `ReferenceHandler.IgnoreCycles` để tránh vòng lặp tham chiếu khi serialize.

---

## 2. Bảo mật và Xác thực (Security & Authentication)

### 2.1. Xác thực bằng JWT (JSON Web Token)

Hệ thống sử dụng **JWT Bearer** để xác thực người dùng. Cấu hình trong `Program.cs`:

```csharp
options.TokenValidationParameters = new TokenValidationParameters
{
    ValidateIssuer = true,
    ValidateAudience = true,
    ValidateLifetime = true,
    ValidateIssuerSigningKey = true,
    ValidIssuer = builder.Configuration["Jwt:Issuer"],      // "3HD2KCinema"
    ValidAudience = builder.Configuration["Jwt:Audience"],  // "3HD2KCinemaApp"
    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
};
```

**Claims trong JWT Token** (tạo bởi `AuthController.GenerateJwtToken`):

| Claim Type | Giá trị | Mô tả |
|-----------|--------|-------|
| `ClaimTypes.Name` | `user.Email` | Tên định danh (email) |
| `ClaimTypes.Email` | `user.Email` | Email người dùng |
| `ClaimTypes.Role` | `user.Role` (mặc định "CUSTOMER") | Vai trò: CUSTOMER, VIP, ADMIN |
| `JwtRegisteredClaimNames.Jti` | `Guid.NewGuid()` | ID duy nhất của token (dùng cho refresh token) |

- **Thời gian hết hạn**: Cấu hình qua `Jwt:ExpireMinutes` (mặc định 30 phút).
- **Thuật toán ký**: `HmacSha256`.

> **Lưu ý**: Token **không chứa `UserId`** trực tiếp. Controller lấy email từ claims, rồi query DB để lấy User.

### 2.2. SignalR & WebSocket Authentication

Với các kết nối SignalR, token được lấy từ **query string** `?access_token=...`:

```csharp
options.Events = new JwtBearerEvents
{
    OnMessageReceived = context =>
    {
        var accessToken = context.Request.Query["access_token"];
        var path = context.HttpContext.Request.Path;
        if (!string.IsNullOrEmpty(accessToken) &&
            (path.StartsWithSegments("/seatHub") ||
             path.StartsWithSegments("/notificationHub") ||
             path.StartsWithSegments("/cinematchHub") ||
             path.StartsWithSegments("/supportChatHub")))
        {
            context.Token = accessToken;
        }
        return Task.CompletedTask;
    }
};
```

### 2.3. Refresh Token (Làm mới Token)

Hệ thống triển khai cơ chế **Refresh Token** để duy trì đăng nhập:

- **Tạo**: Khi đăng nhập thành công, server tạo thêm một Refresh Token (32 byte random, Base64) lưu vào bảng `refresh_tokens` với thời hạn **7 ngày**.
- **Làm mới** (`POST /api/auth/refresh-token`):
  1. Validate JWT (kể cả khi đã hết hạn — `ValidateLifetime = false`).
  2. Kiểm tra Refresh Token trong DB: tồn tại, chưa hết hạn, chưa dùng (`IsUsed = false`), chưa thu hồi (`IsRevoked = false`), `JwtId` khớp với Jti trong JWT.
  3. Đánh dấu Refresh Token cũ là `IsUsed = true`.
  4. Phát hành JWT mới + Refresh Token mới.
- **Đăng xuất** (`POST /api/auth/logout`): Đánh dấu Refresh Token là `IsRevoked = true`.

### 2.4. Xác minh 2 Bước (2FA - Two-Factor Authentication)

Người dùng có thể bật 2FA qua `PUT /api/auth/toggle-2fa`:

1. Khi đăng nhập với `IsTwoFactorEnabled = true`, server **không phát hành token ngay** mà gửi mã OTP 6 số qua email (hết hạn sau 5 phút).
2. Client gọi `POST /api/auth/verify-2fa-login` với email + OTP.
3. Nếu OTP đúng → phát hành JWT + Refresh Token.

### 2.5. Xác thực Email bằng OTP (Email Verification)

Khi đăng ký (`POST /api/auth/register`):

1. Mật khẩu được hash bằng **BCrypt** (`BCrypt.Net.BCrypt.HashPassword`).
2. Nếu SMTP/Resend được cấu hình → tạo mã OTP 6 số (hết hạn 5 phút), gửi email, `IsVerifiedOtp = false`.
3. Nếu SMTP không cấu hình → tự động `IsVerifiedOtp = true` (bỏ qua bước xác thực).
4. Client gọi `POST /api/auth/verify-email` với email + OTP để kích hoạt tài khoản.
5. **Resend OTP** (`POST /api/auth/resend-otp`): Có cooldown 60 giây giữa các lần yêu cầu.

### 2.6. Khóa Tài khoản (Account Lockout)

- Sau **5 lần đăng nhập sai liên tiếp** (`AccessFailedCount >= 5`), tài khoản bị khóa tạm thời **15 phút** (`LockoutEnd = DateTime.UtcNow.AddMinutes(15)`).
- Khi đăng nhập đúng: `AccessFailedCount = 0`, `LockoutEnd = null`.
- Hỗ trợ **legacy plaintext password**: Nếu mật khẩu trong DB là plaintext (không bắt đầu bằng `$2a$`, `$2b$`, `$2y$`), hệ thống so sánh trực tiếp rồi **tự động nâng cấp lên BCrypt**.

### 2.7. Rate Limiting (Chống Spam)

```csharp
options.AddFixedWindowLimiter("loginPolicy", opt =>
{
    opt.Window = TimeSpan.FromMinutes(1);  // Cửa sổ 1 phút
    opt.PermitLimit = 5;                   // Tối đa 5 requests
    opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    opt.QueueLimit = 0;                   // Không xếp hàng
});
options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
```

- Áp dụng cho: `POST /api/auth/login`, `POST /api/auth/forgot-password` (qua `[EnableRateLimiting("loginPolicy")]`).
- Vượt quá giới hạn → `429 Too Many Requests`.

### 2.8. Gửi Email (SMTP + Resend API)

Hệ thống gửi email qua 2 phương thức (thử theo thứ tự):

1. **Resend API** (`https://api.resend.com/emails`): Nếu `ResendApiKey` được cấu hình.
2. **SMTP Gmail** (`smtp.gmail.com:587`): Nếu `SenderEmail` hợp lệ.
3. **Console output** (Mock): Nếu cả hai đều không cấu hình — in email ra console.

---

## 3. Database & Entity Framework Core

### 3.1. Entity Framework Code-First

- Sử dụng **Code-First** với SQL Server.
- `ApplicationDbContext.cs` định nghĩa 13 DbSet:

| DbSet | Bảng DB | Mô tả |
|-------|---------|-------|
| `Bookings` | `bookings` | Hóa đơn đặt vé |
| `BookingDetails` | `booking_details` | Chi tiết từng ghế (per-seat) |
| `Movies` | `Movies` | Danh sách phim |
| `Users` | `users` | Tài khoản người dùng |
| `Showtimes` | `Showtimes` | Suất chiếu |
| `Cinemas` | - | Rạp chiếu |
| `Combos` | `combos` | Combo bắp nước |
| `Vouchers` | - | Mã giảm giá |
| `Rooms` | - | Phòng chiếu |
| `Seats` | - | Ghế trong phòng |
| `CineMatches` | `cinematches` | Mini-game ghép đôi |
| `RefreshTokens` | `refresh_tokens` | Token làm mới |
| `Settings` | `settings` | Cấu hình động key-value |

### 3.2. Các Index & Ràng buộc Quan trọng

#### Unique Index trên User
```csharp
entity.HasIndex(e => e.Email).IsUnique();
entity.HasIndex(e => e.Phone).IsUnique()
    .HasFilter("[phone_number] IS NOT NULL AND [phone_number] <> ''");
```
- Email là duy nhất — không thể đăng ký 2 tài khoản cùng email.
- Phone là duy nhất (filtered index — chỉ áp dụng khi phone không null/rỗng).

#### Unique Index trên BookingDetail (Kiểm soát đồng thời - Khóa ghế)
```csharp
entity.HasIndex(e => new { e.ShowtimeId, e.SeatId }, "UQ_Seat_Per_Showtime").IsUnique();
```
- Đảm bảo tại một suất chiếu, một ghế chỉ xuất hiện trong **một BookingDetail duy nhất**.
- Nếu 2 user cùng lưu BookingDetail cho cùng `{ShowtimeId, SeatId}`, request thứ hai sẽ văng lỗi Unique Constraint tại SQL Server.

> **[Schema vs Implementation]** Schema định nghĩa `BookingDetail` với Unique Index này, nhưng `ApiBookingsController` hiện tại **không sử dụng** `BookingDetail` — ghế được lưu dạng chuỗi phân tách bởi dấu phẩy trong trường `Booking.Seats`. Xem [Section 9](#9-ghi-chú-kỹ-thuật--khoảng-cách-schema) để biết chi tiết.

#### Optimistic Concurrency trên Seat (Kiểm soát đồng thời - Chọn ghế real-time)
```csharp
// Seat.cs
[Timestamp]
public byte[]? RowVersion { get; set; }
```
- Thuộc tính `[Timestamp]` (RowVersion) kích hoạt **optimistic concurrency** ở tầng EF Core.
- Khi 2 user cùng `SelectSeat` (qua SeatHub) cho cùng một ghế trong cùng phần nghìn giây, `SaveChangesAsync` của request thứ hai sẽ ném `DbUpdateConcurrencyException` vì `RowVersion` đã thay đổi.
- Đây là cơ chế chính kiểm soát race condition khi chọn ghế real-time.

#### Các Index phụ trợ
- **Showtime**: Index trên `MovieId`, `RoomId`, `StartTime` — tối ưu truy vấn suất chiếu theo phim/phòng/thời gian.
- **CineMatch**: Index trên `UserId`, `ShowtimeId`, `Status` — tối ưu tìm match.
- **Booking**: Index trên `UserId`, `ShowtimeId`, `CreatedAt` — tối ưu lịch sử đặt vé.

#### Foreign Key Relationships
- `Booking → User`: `OnDelete(DeleteBehavior.SetNull)` — xóa user không xóa booking (chỉ set UserId = null).
- `BookingDetail → Booking`: `OnDelete(DeleteBehavior.Cascade)` — xóa booking sẽ xóa tất cả BookingDetail.
- `BookingDetail → Seat`: FK đến bảng Seats.
- `BookingDetail → Showtime`: FK đến bảng Showtimes.

### 3.3. Seeding Dữ liệu (DbInitializer)

```csharp
if (builder.Configuration.GetValue<bool>("Database:InitializeOnStartup"))
{
    try { DbInitializer.Initialize(context); }
    catch (Exception ex) { app.Logger.LogError(ex, "Database initialization failed."); }
}
```

`DbInitializer.Initialize()`:
1. Gọi `context.Database.EnsureCreated()` — tạo DB nếu chưa tồn tại.
2. Nếu bảng `Movies` trống → chèn **11 phim mẫu** (GUID cố định: `a1111111-...`, `a2222222-...`, v.v.) với trailer YouTube, thể loại, độ tuổi, trạng thái (`now-showing` / `coming-soon`).

> **[Schema vs Implementation]** Tài liệu trước đây ghi "tự động chèn các rạp, phòng chiếu, danh sách phim ban đầu". Thực tế `DbInitializer` **chỉ seed Movies** — không seed Cinemas hay Rooms.

### 3.4. Migrations & Schema Evolution

Ngoài `EnsureCreated()`, `Program.cs` còn chạy các câu lệnh SQL raw để thêm cột mới (hot-patch schema mà không cần migration):

```csharp
context.Database.ExecuteSqlRaw("IF COL_LENGTH('users', 'is_two_factor_enabled') IS NULL ALTER TABLE users ADD is_two_factor_enabled BIT NOT NULL DEFAULT 0;");
context.Database.ExecuteSqlRaw(@"
    IF COL_LENGTH('Showtimes', 'cinema_id') IS NULL ALTER TABLE Showtimes ADD cinema_id nvarchar(100) NULL;
    IF COL_LENGTH('Showtimes', 'cinema_name') IS NULL ALTER TABLE Showtimes ADD cinema_name nvarchar(255) NULL;
    ...
");
```

Hệ thống cũng có 7 migration files trong `Migrations/`:
- `AddSeatRealTimeFields` — thêm `HeldByUserId`, `HeldUntil`, `RowVersion` cho Seat.
- `AuthPhase2` — thêm trường auth (OTP, 2FA, lockout, v.v.).
- `AddMovieExtraFields` — thêm `Director`, `Cast`, `Language`, `Gallery`, `BackdropUrl`.
- `AddTwoFactorAuth` — thêm `is_two_factor_enabled`.
- `AddComboTable` — tạo bảng `combos`.
- `AddVoucherTable` — tạo bảng `Vouchers`.
- `AddSettingsAndVoucherPoints` — tạo bảng `settings`, thêm `PointsRequired` cho Voucher.

---

## 4. SignalR - Giao tiếp Thời gian thực (Real-time)

Hệ thống sử dụng **4 Hub** cho các tính năng tương tác hai chiều:

### 4.1. SeatHub (`/seatHub`) — Chọn/Giữ ghế real-time

**[Authorize]** — yêu cầu đăng nhập.

| Method | Tham số | Mô tả | Signal phát |
|--------|---------|-------|-------------|
| `JoinRoom` | `roomId` | Tham gia group SignalR cho suất chiếu | — |
| `LeaveRoom` | `roomId` | Rời group | — |
| `SelectSeat` | `roomId, seatIdStr, userId` | Giữ ghế (chuyển `Available` → `Held`) | `SeatSelected` (group) hoặc `SeatSelectionFailed` (caller) |
| `ReleaseSeat` | `roomId, seatIdStr` | Nhả ghế (`Held` → `Available`) | `SeatReleased` (group) |
| `ConfirmBooking` | `roomId, seatIdStr` | Xác nhận đã đặt (`Held` → `Booked`) | `SeatBooked` (group) |

**Cơ chế giữ ghế (Seat Hold)**:
- Khi `SelectSeat`: `Status = "Held"`, `HeldByUserId = <email>`, `HeldUntil = DateTime.UtcNow.AddMinutes(5)`.
- Ghế ở trạng thái `Held` sẽ tự động được giải phóng sau **5 phút** (bởi `SeatCleanupService`).
- Chỉ người đang giữ ghế (`HeldByUserId == currentUser`) mới có thể `ReleaseSeat` hoặc `ConfirmBooking`.

**Xử lý Race Condition**:
```csharp
try
{
    await _dbContext.SaveChangesAsync();
    await Clients.Group(roomId).SendAsync("SeatSelected", seatIdStr, userId);
}
catch (DbUpdateConcurrencyException)
{
    await Clients.Caller.SendAsync("SeatSelectionFailed", seatIdStr, "Seat was taken by someone else.");
}
```
- Nếu 2 user chọn cùng ghế cùng lúc, `DbUpdateConcurrencyException` (do `RowVersion` thay đổi) sẽ chặn request thứ hai.

> **Sửa lỗi tài liệu trước**: Tài liệu cũ ghi tín hiệu là `SeatLocked` / `SeatUnlocked`. Thực tế là `SeatSelected` / `SeatReleased`.

### 4.2. NotificationHub (`/notificationHub`) — Thông báo hệ thống

Hub này **không có method nào** — nó được sử dụng qua `IHubContext<NotificationHub>` từ các Controller:

| Controller | Signal | Payload | Mô tả |
|-----------|--------|---------|-------|
| `ApiBookingsController` | `ReceiveNewBooking` | `{customerEmail, customerName, customerPhone, seats, totalAmount, time}` | Thông báo booking mới cho admin dashboard |
| `ApiMoviesController` | `DataUpdated` | `"Movies"` | Yêu cầu client refresh danh sách phim |
| `ApiShowtimesController` | `DataUpdated` | `"Showtimes"` | Yêu cầu client refresh suất chiếu |
| `ApiCombosController` | `DataUpdated` | `"Combos"` | Yêu cầu client refresh combos |
| `ApiVouchersController` | `DataUpdated` | `"Vouchers"` | Yêu cầu client refresh vouchers |

### 4.3. CineMatchHub (`/cinematchHub`) — Mini-game ghép đôi xem phim

**[Authorize]** — yêu cầu đăng nhập.

Sử dụng **in-memory** storage (không lưu DB):
- `ConcurrentBag<MatchRequest> _queue` — hàng đợi người đang tìm match.
- `ConcurrentDictionary<string, RoomInfo> _rooms` — các phòng match đang hoạt động.

| Method | Mô tả | Signal phát |
|--------|-------|-------------|
| `FindMatch` | Tìm partner cùng genre (hoặc "all"). Nếu tìm thấy → tạo room. | `OnMatchFound` (cả 2 user) |
| `AcceptMatch` | Đồng ý match. Cả 2 phải đồng ý. | `OnBothAccepted` (cả 2 user) |
| `SuggestMovie` | Đề xuất phim cho partner. | `OnMovieSuggested` (cả 2 user) |
| `SendMessage` | Chat trong room. | `OnMessageReceived` (cả 2 user) |
| `AgreeMovie` | Đồng ý phim. Xóa room. | `OnMovieAgreed` (cả 2 user) |
| `OnDisconnectedAsync` | (override) Dọn dẹp khi ngắt kết nối. | `OnPartnerDisconnected` (partner) |

**Match data** (giả lập): `MatchPercent` (85-100%), `Connections` (5-50), `Rating` (4.0-5.0).

### 4.4. SupportChatHub (`/supportChatHub`) — Live Chat Hỗ trợ

**Không yêu cầu [Authorize]** — cho phép khách (guest) chat.

- `ConcurrentDictionary<string, string> OnlineUsers` — theo dõi user online.
- `OnConnectedAsync`: Admin → vào group `"Admins"`. User/Guest → thêm vào `OnlineUsers` + thông báo `UserConnected` cho Admins.
- Guest được định danh: `"Khách (XXXXXX)"` (6 ký đầu ConnectionId).

| Method | Mô tả | Signal phát |
|--------|-------|-------------|
| `SendMessageToAdmin` | User gửi tin cho admin | `ReceiveMessageFromUser` (group Admins) |
| `SendMessageToUser` | Admin trả lời user cụ thể | `ReceiveMessage` (client) + `MessageSentEcho` (caller) |

---

## 5. Chi tiết Các Luồng Hoạt Động Chính (Core Workflows)

### 5.1. Luồng Đặt Vé (Booking Workflow)

Đây là luồng phức tạp nhất, kéo dài từ Frontend đến Backend.

#### Bước 1: Khởi tạo (Client)
User chọn: Phim → Suất Chiếu → Ghế (qua SeatHub) → Combo → Promo Code.

#### Bước 2: Tiếp nhận (`POST /api/bookings` — `ApiBookingsController.CreateBooking`)

**Request body** (`BookingRequest`):
```json
{
  "showtimeId": "guid",
  "movieId": "guid",
  "seats": "A1,A2,A3",
  "comboId": "single|double",
  "promoCode": "GIAM50K",
  "paymentMethod": "Cash|QR|Points"
}
```

**Xác thực**: `[Authorize]` — lấy email từ JWT claims → query `UserRepository.GetByEmailAsync`.

#### Bước 3: Tính toán Giá (Inline trong Controller)

Logic tính giá được viết **trực tiếp trong controller** (không có BookingService):

```
basePrice = seatCount × showtime.TicketPrice

comboPrice:
  - "single" → 65,000 VND (hardcode)
  - "double" → 95,000 VND (hardcode)

total = basePrice + comboPrice

discountAmount (Promo Code - hardcode):
  - "GIAM50K" → 50,000 VND (nếu total ≥ 200,000)
  - "BAPFREE" → 65,000 VND

vipDiscountAmount (VIP Discount):
  - VipPlan == "platinum" → 10% của total
  - VipPlan khác (VIP role) → 5% của total

loyaltyComboDiscountAmount (Loyalty Combo Discount):
  - Points ≥ 2000 → 10% của comboPrice
  - Points ≥ 1000 → 8% của comboPrice
  - Points ≥ 500  → 5% của comboPrice
  - Points ≥ 200  → 2% của comboPrice

total = max(0, total - discountAmount - vipDiscountAmount - loyaltyComboDiscountAmount)
```

> **[Schema vs Implementation]**:
> - Promo Code được **hardcode** trong controller (`GIAM50K`, `BAPFREE`) thay vì tra cứu từ bảng `Vouchers`.
> - Combo price được **hardcode** (`single`=65000, `double`=95000) thay vì tra cứu từ bảng `combos`.
> - Bảng `Voucher` có đầy đủ trường (`DiscountType`, `DiscountValue`, `MinOrderAmount`, `MaxDiscountAmount`, `ExpiryDate`, `IsActive`, `PointsRequired`) nhưng chưa được tích hợp vào luồng booking.

#### Bước 4: Lưu CSDL (`BookingRepository.AddAsync`)

```csharp
var booking = new Booking
{
    Id = Guid.NewGuid(),
    UserId = user.UserId,
    ShowtimeId = showtime.Id,
    MovieId = Guid.Parse(request.MovieId),
    Seats = request.Seats,           // Chuỗi "A1,A2,A3"
    TotalPrice = total,
    PaymentMethod = request.PaymentMethod ?? "Cash",
    PaymentStatus = "Paid",          // Đặt "Paid" ngay (không qua Pending)
    CreatedAt = DateTime.Now
};

user.Points += (int)Math.Floor(total / 1000);  // Cộng điểm thưởng
await _userRepository.UpdateAsync(user);
await _bookingRepository.AddAsync(booking);
```

`BookingRepository.AddAsync` đơn giản:
```csharp
public async Task AddAsync(Booking booking)
{
    await _context.Bookings.AddAsync(booking);
    await _context.SaveChangesAsync();
}
```

> **[Schema vs Implementation]**:
> - **Không có Database Transaction** rõ ràng (không `BeginTransaction` / `Commit` / `Rollback`).
> - **Không lưu `BookingDetail`** (per-seat) — ghế lưu dạng chuỗi trong `Booking.Seats`.
> - **Không lưu `BookingCombo`** — không có entity này.
> - **Không đánh dấu Voucher đã sử dụng** — Voucher entity không có trường `IsUsed`.
> - `PaymentStatus` được đặt `"Paid"` ngay (không qua trạng thái `"Pending"`).
> - Điểm thưởng được cộng ngay trong controller: `total / 1000` (1 điểm / 1000 VND).

#### Bước 5: Đồng bộ Real-time

```csharp
var bookingData = new {
    customerEmail = user.Email,
    customerName = user.Fullname,
    customerPhone = user.Phone ?? "N/A",
    seats = request.Seats,
    totalAmount = total,
    time = DateTime.Now.ToString("HH:mm:ss")
};
await _hubContext.Clients.All.SendAsync("ReceiveNewBooking", bookingData);
```

- Phát tín hiệu `ReceiveNewBooking` qua **NotificationHub** (không phải SeatHub) cho admin dashboard.

> **Lưu ý**: Việc chuyển ghế từ `Held` → `Booked` (đỏ) được thực hiện riêng qua `SeatHub.ConfirmBooking` từ Frontend, không tự động trong `CreateBooking`.

#### Bước 6: Trả về

```json
{ "message": "Booking successful", "bookingId": "guid" }
```

---

### 5.2. Luồng Thanh toán (Payment Workflow)

Hệ thống hỗ trợ thanh toán chuyển khoản qua mã QR (VietQR API).

#### Bước 1: Tạo mã QR (`GET /api/payment/generate-qr`)

**Query params**: `amount` (decimal), `description` (string, tùy chọn).

```csharp
var targetBank = _configuration["Payment:BankId"] ?? "MB";
var targetAccount = _configuration["Payment:AccountNo"] ?? "0345678999";
var accountName = _configuration["Payment:AccountName"] ?? "RAP PHIM 3HD2K";
var addInfo = string.IsNullOrEmpty(description)
    ? $"TT DON HANG 3HD2K {(long)amount}D"
    : description;

var qrUrl = $"https://img.vietqr.io/image/{targetBank}-{targetAccount}-compact2.png"
          + $"?amount={(long)amount}&addInfo={Uri.EscapeDataString(addInfo)}&accountName={Uri.EscapeDataString(accountName)}";
```

**Response**:
```json
{
  "qrUrl": "https://img.vietqr.io/image/MB-0345678999-compact2.png?amount=...",
  "bank": "MB",
  "accountNo": "0345678999",
  "accountName": "RAP PHIM 3HD2K",
  "amount": 150000,
  "addInfo": "TT DON HANG 3HD2K 150000D"
}
```

#### Bước 2: Người dùng thanh toán
Quét mã QR bằng App Ngân hàng, chuyển khoản với số tiền và nội dung chính xác.

#### Bước 3: Webhook xác nhận (`POST /api/payment/webhook`)

**Request body** (`WebhookPayload`):
```json
{
  "transactionId": "txn_123",
  "orderId": "booking-guid",
  "amount": 150000,
  "status": "success|failed",
  "provider": "vietqr",
  "signature": "hmac-sha256-hex"
}
```

**Xác thực Signature** (HMACSHA256):
```csharp
var rawData = $"{payload.TransactionId}|{payload.OrderId}|{payload.Amount}|{payload.Status}|{payload.Provider}";
using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawData));
var expectedSignature = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

if (!string.Equals(payload.Signature, expectedSignature, StringComparison.OrdinalIgnoreCase))
    return BadRequest("Invalid signature");
```

- **Định dạng raw data**: `TransactionId|OrderId|Amount|Status|Provider` (phân tách bằng `|`).
- **Secret**: Lấy từ `appsettings.json` → `Payment:WebhookSecret`.

**Xử lý**:
- `status == "success"` → `PaymentStatus = "Paid"`, cộng điểm thưởng.
- `status == "failed"` → `PaymentStatus = "Failed"`.

**Tính điểm thưởng**:
```csharp
var ticketRateStr = await _context.Settings
    .Where(s => s.Key == "TicketPointRate")
    .Select(s => s.Value)
    .FirstOrDefaultAsync();
decimal rate = 0.001m;  // Mặc định 0.1%
if (decimal.TryParse(ticketRateStr, out var parsedRate))
    rate = parsedRate;

int pointsEarned = (int)(payload.Amount * rate);  // VD: 150000 * 0.001 = 150 điểm
user.Points += pointsEarned;
```

- `TicketPointRate` lấy từ bảng `Settings` (có thể thay đổi qua `POST /api/settings` mà không cần deploy lại).

#### Bước 4: Kiểm tra trạng thái (`GET /api/payment/status/{bookingId}`)

```json
{ "status": "Paid" }
```

---

### 5.3. Luồng Quản lý Tệp Tin (File Upload)

#### Upload ảnh (`POST /api/uploads/image`)

**[Authorize]** — yêu cầu đăng nhập (không giới hạn Admin).

**Request**: `multipart/form-data` với field `file` (IFormFile).

**Xử lý** (`FileService.UploadImageAsync`):

| Kiểm tra | Giới hạn |
|----------|----------|
| File rỗng | Ném `ArgumentException` |
| Kích thước | Tối đa **5 MB** (`5 * 1024 * 1024`) |
| Định dạng | `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` |

```csharp
var uniqueFileName = Guid.NewGuid().ToString() + "_" + DateTime.Now.Ticks + extension;
// VD: "a1b2c3d4-..._638512345678901234.jpg"

var filePath = Path.Combine(uploadsFolder, uniqueFileName);
// Lưu vật lý vào: wwwroot/uploads/images/{uniqueFileName}

return $"/uploads/images/{uniqueFileName}";
// Trả về URL tĩnh để lưu vào PosterUrl, AvatarUrl, v.v.
```

**Response**:
```json
{ "url": "/uploads/images/a1b2c3d4-..._638512345678901234.jpg", "message": "Upload successful" }
```

**DeleteImage** (`FileService.DeleteImage`): Xóa file vật lý khỏi `wwwroot/uploads/images/`.

---

### 5.4. Luồng CineMatch (Mini-game Ghép Đôi)

Hệ thống có **2 luồng CineMatch** hoạt động song song:

#### 5.4.1. Real-time qua CineMatchHub (in-memory)

Xem [Section 4.3](#43-cinematchhub-cinematchhub--mini-game-ghép-đôi-xem-phim). Dữ liệu match lưu trong memory (mất khi restart server).

#### 5.4.2. REST API qua ApiCineMatchController (database-backed)

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/cinematch/create` | POST | Tạo match request (Status = "pending") |
| `/api/cinematch/join` | POST | Tham gia match (Status = "matched") |
| `/api/cinematch/pending/{showtimeId}` | GET | Lấy danh sách match pending cho suất chiếu |
| `/api/cinematch/my-matches/{userId}` | GET | Lấy lịch sử match của user (kèm MovieTitle, RoomId, Time) |
| `/api/cinematch/reveal` | POST | Mở khóa thông tin partner (cần RevealCode đúng) |

**CineMatch entity**:
- `RevealCode`: Auto-generate 8 ký tự uppercase (VD: `A1B2C3D4`).
- `IsRevealed`: Chỉ khi `true` mới hiển thị `FullName`, `AvatarUrl`, `Gender` của partner.
- `Status`: `"pending"` → `"matched"`.

---

### 5.5. Luồng Group Booking (Đặt vé nhóm)

`ApiGroupBookingController` — lưu trữ **in-memory** (ConcurrentDictionary), không dùng database:

| Endpoint | Method | Auth | Mô tả |
|----------|--------|------|-------|
| `/api/groupbooking/{orderId}` | POST | [Authorize] | Lưu order data (JSON string) |
| `/api/groupbooking/{orderId}` | GET | Không | Lấy order data |

> Dữ liệu mất khi restart server. Phù hợp cho chia sẻ giỏ hàng tạm thời giữa nhiều thiết bị.

---

### 5.6. Luồng Rating (Đánh giá Phim)

`RatingService` — lấy điểm IMDB và Rotten Tomatoes:

1. **Cache**: Kiểm tra `IMemoryCache` (key: `movie_ratings_{title_lowercase}`, TTL 24h).
2. **OMDb API**: Gọi `https://www.omdbapi.com/?t={title}&apikey=trilogy` (hoặc `?i={imdbId}`).
3. **Fallback**: Nếu OMDb fail → tính điểm giả định dựa trên hash của title:
   - IMDB: `7.5 + (hash % 20) / 10.0` (7.5 - 9.4)
   - RT: `75 + (hash % 23)` (75% - 97%)

**Endpoints**:
- `GET /api/movies/{id}/ratings` — lấy rating theo movie ID.
- `GET /api/movies/ratings-by-title?title=...` — lấy rating theo title.

---

## 6. Background Services (Tác vụ nền)

### 6.1. SeatCleanupService — Dọn dẹp ghế hết hạn giữ

```csharp
public class SeatCleanupService : BackgroundService
```

- **Vòng đời**: Singleton (đăng ký qua `AddHostedService`).
- **Chu kỳ**: Chạy lặp lại mỗi **30 giây** (`Task.Delay(TimeSpan.FromSeconds(30))`).

**Logic** (`CleanupExpiredHolds`):

1. Tạo scope mới (vì BackgroundService là Singleton nhưng DbContext là Scoped).
2. Tìm tất cả ghế thỏa: `Status == "Held" && HeldUntil < DateTime.UtcNow`.
3. Reset về: `Status = "Available"`, `HeldByUserId = null`, `HeldUntil = null`.
4. `SaveChangesAsync`.
5. Phát tín hiệu `SeatReleased` qua `IHubContext<SeatHub>` cho group `RoomId` của từng ghế.

> **Sửa lỗi tài liệu trước**: Tài liệu cũ ghi service này "tự động hủy hóa đơn (Cancelled) và giải phóng ghế". Thực tế service **không hủy booking** — nó chỉ reset trạng thái ghế từ `Held` → `Available` khi hết hạn 5 phút giữ. Không có tương tác với bảng `Bookings`.

---

## 7. Danh sách API Endpoints

### 7.1. Auth (`/api/auth`)

| Endpoint | Method | Auth | Rate Limit | Mô tả |
|----------|--------|------|-----------|-------|
| `/register` | POST | — | — | Đăng ký (BCrypt + OTP email) |
| `/verify-email` | POST | — | — | Xác thực OTP đăng ký |
| `/login` | POST | — | loginPolicy | Đăng nhập (JWT + Refresh Token) |
| `/verify-2fa-login` | POST | — | — | Xác thực OTP 2FA |
| `/refresh-token` | POST | — | — | Làm mới JWT |
| `/logout` | POST | — | — | Thu hồi Refresh Token |
| `/me` | GET | [Authorize] | — | Profile hiện tại |
| `/change-password` | PUT | [Authorize] | — | Đổi mật khẩu |
| `/resend-otp` | POST | — | — | Gửi lại OTP (cooldown 60s) |
| `/forgot-password` | POST | — | loginPolicy | Quên mật khẩu (gửi OTP) |
| `/reset-password` | POST | — | — | Đặt lại mật khẩu |
| `/toggle-2fa` | PUT | [Authorize] | — | Bật/tắt 2FA |
| `/upgrade-vip` | POST | [Authorize] | — | Nâng cấp VIP |
| `/update-avatar` | POST | [Authorize] | — | Upload avatar |
| `/update-profile` | PUT | — | — | Cập nhật profile |

### 7.2. Movies (`/api/movies`)

| Endpoint | Method | Auth | Mô tả |
|----------|--------|------|-------|
| `/` | GET | — | Lấy tất cả phim (có fallback hardcoded) |
| `/{id}` | GET | — | Lấy phim theo ID |
| `/{id}/ratings` | GET | — | Lấy rating IMDB/RT |
| `/ratings-by-title` | GET | — | Lấy rating theo title |
| `/` | POST | ADMIN | Tạo phim |
| `/{id}` | PUT | ADMIN | Cập nhật phim |
| `/{id}` | DELETE | ADMIN | Xóa phim |

### 7.3. Showtimes (`/api/showtimes`)

| Endpoint | Method | Auth | Mô tả |
|----------|--------|------|-------|
| `/` | GET | — | Lấy tất cả suất chiếu |
| `/movie/{movieId}` | GET | — | Lọc theo phim |
| `/{id}` | GET | — | Lấy theo ID |
| `/` | POST | — | Tạo suất chiếu |
| `/{id}` | PUT | — | Cập nhật |
| `/{id}` | DELETE | — | Xóa |

> **⚠️ Security Note**: `ApiShowtimesController` không có `[Authorize]` trên Create/Update/Delete — bất kỳ ai cũng có thể tạo/sửa/xóa suất chiếu.

### 7.4. Bookings (`/api/bookings`)

| Endpoint | Method | Auth | Mô tả |
|----------|--------|------|-------|
| `/` | POST | [Authorize] | Tạo booking |
| `/` | GET | — | Lấy tất cả booking |
| `/{email}` | GET | — | Lấy booking theo email user |

### 7.5. Payment (`/api/payment`)

| Endpoint | Method | Auth | Mô tả |
|----------|--------|------|-------|
| `/generate-qr` | GET | — | Tạo mã QR VietQR |
| `/webhook` | POST | — | Webhook xác nhận thanh toán |
| `/status/{bookingId}` | GET | [Authorize] | Kiểm tra trạng thái |

### 7.6. Combos (`/api/combos`)

| Endpoint | Method | Auth | Mô tả |
|----------|--------|------|-------|
| `/` | GET | — | Lấy tất cả |
| `/{id}` | GET | — | Lấy theo ID |
| `/` | POST | ADMIN | Tạo combo |
| `/{id}` | PUT | ADMIN | Cập nhật |
| `/{id}` | DELETE | ADMIN | Xóa |

### 7.7. Vouchers (`/api/vouchers`)

| Endpoint | Method | Auth | Mô tả |
|----------|--------|------|-------|
| `/` | GET | — | Lấy tất cả |
| `/{id}` | GET | — | Lấy theo ID |
| `/code/{code}` | GET | — | Lấy theo code |
| `/` | POST | ADMIN | Tạo voucher |
| `/{id}` | PUT | ADMIN | Cập nhật |
| `/{id}` | DELETE | ADMIN | Xóa |

### 7.8. Settings (`/api/settings`)

| Endpoint | Method | Auth | Mô tả |
|----------|--------|------|-------|
| `/` | GET | — | Lấy tất cả settings (key-value) |
| `/` | POST | ADMIN | Cập nhật/tạo settings |

### 7.9. Uploads (`/api/uploads`)

| Endpoint | Method | Auth | Mô tả |
|----------|--------|------|-------|
| `/image` | POST | [Authorize] | Upload ảnh (5MB max) |

### 7.10. Group Booking (`/api/groupbooking`)

| Endpoint | Method | Auth | Mô tả |
|----------|--------|------|-------|
| `/{orderId}` | POST | [Authorize] | Lưu group order (in-memory) |
| `/{orderId}` | GET | — | Lấy group order |

### 7.11. CineMatch (`api/cinematch`)

| Endpoint | Method | Auth | Mô tả |
|----------|--------|------|-------|
| `/create` | POST | [Authorize] | Tạo match request |
| `/join` | POST | [Authorize] | Tham gia match |
| `/pending/{showtimeId}` | GET | — | Match pending |
| `/my-matches/{userId}` | GET | — | Lịch sử match |
| `/reveal` | POST | [Authorize] | Mở khóa partner info |

---

## 8. Cấu hình Hệ thống (Configuration)

### 8.1. appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "workstation id=...;data source=movie_booking_db.mssql.somee.com;..."
  },
  "Database": {
    "InitializeOnStartup": false
  },
  "Jwt": {
    "Key": "3HD2K-Cinema-SuperSecret-Key-2024-Must-Be-At-Least-32-Bytes!",
    "Issuer": "3HD2KCinema",
    "Audience": "3HD2KCinemaApp",
    "ExpireMinutes": 30
  },
  "SmtpSettings": {
    "Server": "smtp.gmail.com",
    "Port": 587,
    "SenderName": "3HD2K Cinema",
    "SenderEmail": "3hd2k.cinema@gmail.com",
    "Username": "3hd2k.cinema@gmail.com",
    "Password": "srpw gktm cqax cmbr",
    "ResendApiKey": "YOUR_RESEND_API_KEY_HERE"
  },
  "Payment": {
    "WebhookSecret": "CHANGE-ME-webhook-secret-key"
  }
}
```

### 8.2. Settings động (Database)

Các cấu hình có thể thay đổi runtime qua `POST /api/settings`:

| Key | Mô tả | Default |
|-----|-------|---------|
| `TicketPointRate` | Tỷ lệ điểm thưởng trên giá trị thanh toán | `0.001` (0.1%) |

---

## 9. Ghi chú Kỹ thuật & Khoảng cách Schema

### 9.1. Schema vs Implementation Gaps

| # | Schema (DB) | Implementation (Code) | Trạng thái |
|---|------------|----------------------|-----------|
| 1 | `BookingDetail` entity với Unique Index `{ShowtimeId, SeatId}` | `ApiBookingsController` lưu ghế dạng chuỗi trong `Booking.Seats` | Schema tồn tại nhưng controller không dùng |
| 2 | `Voucher` entity đầy đủ (DiscountType, MinOrderAmount, MaxDiscountAmount, ExpiryDate, PointsRequired) | Controller hardcode promo code (`GIAM50K`, `BAPFREE`) | Voucher table không được tích hợp vào booking |
| 3 | `Combo` entity (Id, Name, Price, Stock, Image, Category) | Controller hardcode combo price (`single`=65000, `double`=95000) | Combo table không được tích hợp vào booking |
| 4 | `Booking.PaymentStatus` default `"pending"` | Controller đặt `"Paid"` ngay khi tạo | Không qua trạng thái Pending |
| 5 | `BookingDetail` cascade delete từ `Booking` | Không tạo BookingDetail nên không áp dụng | N/A |
| 6 | `Seat.RowVersion` [Timestamp] cho optimistic concurrency | `SeatHub.SelectSeat` catch `DbUpdateConcurrencyException` | ✅ Đang hoạt động |
| 7 | `Seat.HeldByUserId`, `Seat.HeldUntil` | `SeatHub` và `SeatCleanupService` sử dụng đầy đủ | ✅ Đang hoạt động |

### 9.2. Security Notes

- **`ApiShowtimesController`**: Create/Update/Delete không có `[Authorize]` — ai cũng có thể sửa suất chiếu.
- **`ApiBookingsController.GetAllBookings`**: Không có `[Authorize]` — ai cũng có thể xem tất cả booking.
- **`ApiBookingsController.GetUserBookings`**: Không có `[Authorize]` — có thể xem booking của người khác qua email.
- **`appsettings.json`**: Connection string và JWT Key được commit trực tiếp (nên dùng User Secrets hoặc Environment Variables cho production).
- **CORS `AllowAll`**: Cho phép mọi origin — nên giới hạn trong production.

### 9.3. Performance Notes

- **RatingService**: Cache 24h giúp giảm call OMDb API. Fallback hash-based đảm bảo luôn trả về rating.
- **SeatCleanupService**: Chạy mỗi 30s — nếu cần giải phóng ghế nhanh hơn, giảm `Task.Delay`.
- **CineMatchHub**: Dùng `ConcurrentBag` cho queue — `FirstOrDefault` trên ConcurrentBag là O(n), có thể chậm nếu queue lớn. Nên cân nhắc dùng `ConcurrentQueue`.
- **ApiMoviesController.GetMovies**: Có fallback hardcoded 5 phim nếu DB fail — đảm bảo UI luôn hiển thị dữ liệu.
- **JSON Serialization**: `ReferenceHandler.IgnoreCycles` tránh vòng lặp nhưng có thể ẩn dữ liệu liên quan nếu cần deep graph.

---

*Tài liệu này được cập nhật dựa trên việc đọc trực tiếp source code backend. Khi code thay đổi, hãy cập nhật tài liệu này để đảm bảo tính chính xác.*