# 🔍 Báo cáo Đánh giá Maintainability — 3HD2Kcinema

> **Dự án:** 3HD2Kcinema — Hệ thống Đặt Vé Rạp Chiếu Phim
> **Phiên bản:** v3.7.0 | **Ngày đánh giá:** 2026-08-05
> **Stack:** Vanilla JS + Tailwind CSS (Frontend) | ASP.NET Core 8.0 + EF Core + SQL Server (Backend)
> **Quy mô:** ~30 HTML files, ~22 CSS files, ~45 JS files, ~50 C# files

---

## Tổng quan Điểm Maintainability

| Tiêu chí | Điểm | Đánh giá nhanh |
|:---|:---:|:---|
| 1. Cấu trúc & Tổ chức | **6/10** | Tốt ở macro, yếu ở micro |
| 2. Chất lượng Code | **4/10** | God classes, massive duplication |
| 3. Khả năng Mở rộng | **4/10** | Missing abstractions, SOLID violations |
| 4. Xử lý Lỗi & Độ tin cậy | **4/10** | Security vulns, silent fails |
| 5. Tài liệu & Dễ hiểu | **8/10** | ⭐ Điểm sáng của dự án |
| 6. Testing | **4/10** | Thiếu unit tests nghiêm trọng |
| 7. Dependency | **7/10** | Quản lý tốt, ít vấn đề |
| **⭐ TỔNG ĐIỂM** | **5.0/10** | **Cần cải thiện đáng kể** |

---

## 1. CẤU TRÚC & TỔ CHỨC (6/10)

### ✅ Điểm tốt

- **Cấu trúc macro rõ ràng:** `frontend/`, `backend/`, `tests/`, `docs/` — dễ định vị.
- **Frontend feature-based:** `auth/`, `booking/`, `explore/`, `engagement/`, `user/`, `management/` tương ứng nghiệp vụ.
- **Backend theo layer:** `Controllers → Services → Repositories → Models` của ASP.NET Core.
- **Shared components:** `shared/components/` (navbar, toast, footer, seatGrid, movieCard), `shared/utils/` (storage, apiConfig, authGuard).

### ⚠️ Vấn đề

#### 1.1 Service Layer bị thiếu nghiêm trọng (Backend)

> [!CAUTION]
> Chỉ có 4 services (`FileService`, `PayOSService`, `RatingService`, `SeatCleanupService`). Các domain chính **không có service** — business logic nằm trực tiếp trong Controllers.

| Domain | Service? | Business logic thực tế ở đâu? |
|--------|:---:|---|
| Auth (JWT, OTP, SMTP, 2FA) | ❌ | [AuthController.cs](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/Controllers/AuthController.cs) (761 dòng) |
| Booking (pricing, promo, seats) | ❌ | [ApiBookingsController.cs](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/Controllers/ApiBookingsController.cs) (243 dòng) |
| User management | ❌ | [ApiUsersController.cs](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/Controllers/ApiUsersController.cs) (231 dòng) |
| Showtime | ❌ | [ApiShowtimesController.cs](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/Controllers/ApiShowtimesController.cs) (162 dòng) |
| Payment webhook | ❌ | [ApiPaymentController.cs](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/Controllers/ApiPaymentController.cs) (175 dòng) |
| File upload | ✅ | `FileService` + `IFileService` |
| Payment (PayOS) | ✅ | `PayOSService` + `IPayOSService` |
| Rating | ✅ | `RatingService` + `IRatingService` |

**Đề xuất:** Tạo `IAuthService`, `IBookingService`, `IUserService`, `IShowtimeService` và chuyển business logic từ Controllers sang.

---

#### 1.2 Repository không có Interface

> [!WARNING]
> 7/7 repositories là **concrete classes**, không qua interface.

**Vị trí:** [Program.cs](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/Program.cs) L98-104:
```csharp
builder.Services.AddScoped<appweb.Repositories.UserRepository>();     // ❌ Không có IUserRepository
builder.Services.AddScoped<appweb.Repositories.BookingRepository>();  // ❌ Không có IBookingRepository
// ... tương tự cho tất cả repositories
```

**Ảnh hưởng:** Không mock được trong unit test, coupling cao.

**Đề xuất:** Tạo interfaces và đăng ký DI: `AddScoped<IUserRepository, UserRepository>()`.

---

#### 1.3 Data access không nhất quán

Một số controllers dùng Repository, một số dùng trực tiếp `ApplicationDbContext`, một số **dùng cả hai**. Ví dụ: `ApiBookingsController` inject cả `BookingRepository` lẫn `ApplicationDbContext`.

---

#### 1.4 Frontend: God Modules

| File | Kích thước | Dòng | Vấn đề |
|------|-----------|------|---------|
| [`management/js/admin.js`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/frontend/src/management/js/admin.js) | **121.6 KB** | **3,203** | Dashboard, movie CRUD, cinema CRUD, room layout builder, POS, charts, inventory, vouchers — ALL in ONE file |
| [`shared/components/navbar.js`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/frontend/src/shared/components/navbar.js) | **71.3 KB** | **1,915** | 1000+ line HTML template literal + embedded CSS + search + notifications |
| [`explore/movie-details/movie-detail.js`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/frontend/src/explore/movie-details/movie-detail.js) | **39.3 KB** | **927** | Movie detail + ratings/reviews + trailer modal + Leaflet map |
| [`booking/checkout/checkout.js`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/frontend/src/booking/checkout/checkout.js) | **37.3 KB** | **875** | Pricing + voucher validation + payment methods + PayOS |
| [`user/user-profile/profile.js`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/frontend/src/user/user-profile/profile.js) | **33.2 KB** | **745** | Profile + password change + avatar + booking history |
| [`engagement/cinematch/cinematch.js`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/frontend/src/engagement/cinematch/cinematch.js) | **28.9 KB** | ~700 | Game logic + UI + SignalR networking |
| [`user/loyalty-points/app.js`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/frontend/src/user/loyalty-points/app.js) | **27.1 KB** | ~600 | Rewards + points wallet |

---

#### 1.5 Orphaned Dead Files & Duplicate Directories

> [!WARNING]
> Có nhiều file JS trùng lặp (phiên bản cũ) chưa được xóa:

| File đang sử dụng | File trùng lặp (DEAD CODE) |
|---|---|
| `booking/booking-food/app.js` (18.6KB) | `booking/booking-food/js/app.js` (8.6KB) ❌ |
| `explore/cinema-map/cinemas.js` (9KB) | `explore/cinema-map/js/cinemas.js` (9KB) ❌ |
| `explore/movie-search/movies.js` (10KB) | `explore/movie-search/js/movies.js` (6.3KB) ❌ |
| `user/loyalty-points/app.js` (27.1KB) | `user/loyalty-points/js/app.js` (23.8KB) ❌ |
| `explore/cinema-map/` (kebab-case) | `explore/cinema_map/` (snake_case) — **thư mục trùng** ❌ |

**Đề xuất:** Xóa tất cả dead files và thư mục `cinema_map/` trùng.

---

#### 1.6 Root directory lộn xộn

Các file nên được tổ chức vào thư mục `scripts/` hoặc `database/`:
- `movie_booking_db.sql`, `patch_combos.sql` → `database/`
- `get_images.ps1`, `post_movie.ps1`, `test.ps1` → `scripts/`
- `payload.json`, `movies.json` → `data/`
- `start.bat`, `run_servers.bat` → `scripts/`
- `backend/publish-latest.zip` (11MB), `backend/backend_somee.zip` (11.5MB) → `.gitignore`
- `migrate_users_app/` → **xóa** (orphan directory, chỉ chứa bin/obj rỗng)
- `run-mock.js` → **xóa** (file bị corrupted/truncated)

---

## 2. CHẤT LƯỢNG CODE (4/10)

### ✅ Điểm tốt
- Models backend clean, dùng data annotations hợp lý.
- CSS sử dụng custom variables (`:root`) tốt trong `main.css`.

### ⚠️ Vấn đề

#### 2.1 Code Duplication nghiêm trọng

##### A. `formatPrice` — Viết lại 7 lần trong 7 file khác nhau!

| Vị trí | Implementation |
|--------|---------------|
| [`user/user-profile/profile.js`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/frontend/src/user/user-profile/profile.js) L7 | `amount.toLocaleString('vi-VN') + 'đ'` |
| [`booking/checkout/checkout.js`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/frontend/src/booking/checkout/checkout.js) | `new Intl.NumberFormat('vi-VN').format(value)` |
| [`booking/booking-food/app.js`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/frontend/src/booking/booking-food/app.js) L15 | `` `${new Intl.NumberFormat('vi-VN').format(value)}đ` `` |
| `booking/booking-food/js/app.js` L6 | (Dead file — cùng logic) |
| `explore/home-page/movieService.js` | (Thêm implementation khác) |
| `shared/js/data.js` | (Thêm implementation khác) |
| `engagement/cinematch/cinematch.js` | (Thêm implementation khác) |

**Đề xuất:** Tạo `shared/utils/formatters.js`:
```javascript
export const formatPrice = (amount) => new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
export const formatDate = (date) => new Intl.DateTimeFormat('vi-VN').format(new Date(date));
```

##### B. Password Verification — Trùng 3 nơi (Backend)

```csharp
// Logic NÀY xuất hiện tại cả 3 nơi:
if (user.Password.StartsWith("$2a$") || user.Password.StartsWith("$2b$") || user.Password.StartsWith("$2y$"))
    isValid = BCrypt.Net.BCrypt.Verify(password, user.Password);
else
    isValid = (user.Password == password); // ⚠️ Plaintext comparison fallback!
```

- [AuthController.cs](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/Controllers/AuthController.cs) L153-160
- [AuthController.cs](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/Controllers/AuthController.cs) L215-226
- [UserRepository.cs](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/Repositories/UserRepository.cs) L47-57

**Đề xuất:** Extract vào `PasswordHelper.Verify()` static method.

##### C. AuthGuard — Duplicate 95% giống nhau

- [`shared/utils/authGuard.js`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/frontend/src/shared/utils/authGuard.js) (157 dòng — ES Module)
- [`shared/utils/authGuard-global.js`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/frontend/src/shared/utils/authGuard-global.js) (144 dòng — IIFE Global)

Cả hai chứa 95% code modal giống nhau. **Đề xuất:** Xóa bản `-global.js`, chuẩn hóa ES Module.

##### D. Toast Notification — 3 implementation khác nhau

1. `shared/components/toast.js` — Hệ thống toast chính thức
2. `user/user-profile/profile.js` L22-46 — Tự tạo `#profile-toast-container`
3. `explore/movie-details/movie-detail.js` L57-64 — Lightweight toast helper riêng

---

#### 2.2 Magic Numbers & Magic Strings

##### Backend

| Magic Value | Vị trí | Nên là |
|------------|--------|--------|
| `65000`, `95000` (giá ghế) | `ApiBookingsController.cs` L60-87 | Config/DB lookup |
| `"GIAM50K"`, `"BAPFREE"` (promo codes) | `ApiBookingsController.cs` L60-87 | Database/config |
| `2000`, `1000`, `500`, `200` (loyalty thresholds) | `ApiBookingsController.cs` | Constants class |
| `DateTime.UtcNow.AddYears(100)` (lockout) | `ApiUsersController.cs` L133 | Constant |
| `"123456"` (default password!) | `ApiUsersController.cs` L156 | ❌ Bỏ hoàn toàn |
| `"ha-dong"`, `"3HD2K HÀ ĐÔNG"` | `ApiShowtimesController.cs` L103-105 | Config/DB |
| `TimeSpan.FromMinutes(15)` (token expiry) | `AuthController.cs` | `appsettings.json` |
| `TimeSpan.FromDays(7)` (refresh token) | `AuthController.cs` | `appsettings.json` |
| Port `587` (SMTP) | `AuthController.cs` | Config |

##### Frontend

| Magic Value | Vị trí | Nên là |
|------------|--------|--------|
| `75000`, `90000`, `120000` (giá ghế) | `seatGrid.js`, `booking.js` | API config |
| `3000ms`, `3200ms`, `3500ms` (timeout) | Nhiều files | Named constant |
| `'http://127.0.0.1:5111/api'` | `admin.js` L15, `booking-food/app.js` L7 | `apiConfig.js` |
| `'http://3hd2k-api.somee.com/api'` | `apiConfig.js` L12 | Environment variable |

---

#### 2.3 Naming Conventions không nhất quán (Frontend)

- **File naming:** `authGuard.js` (camelCase) vs `chat-widget.js` (kebab-case) vs `movieCard.js` (camelCase)
- **Directory naming:** `cinema-map/` (kebab-case) vs `cinema_map/` (snake_case)
- **LocalStorage keys hỗn loạn:** `'jwt_token'`, `'auth_token'`, `'3hd2k_token'`, `'isLoggedIn'`, `'userEmail'`, `'userName'`, `'user_role'`, `'role'`, `'3hd2k_user'`, `'cinema_current_user'` — **15+ keys** không theo quy ước nhất quán

---

#### 2.4 Module System phân mảnh

- **ES Modules:** `checkout.js`, `profile.js`, `apiConfig.js`, `storage.js`, `navbar.js`
- **Global IIFE/window:** `authGuard-global.js`, `data.js`, `main.js`, `cinemas.js`, `movie-detail.js`

**Bug thực tế:** [`user/loyalty-points/index.html`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/frontend/src/user/loyalty-points/index.html) L11:
```html
<script src="/shared/utils/apiConfig.js"></script>  <!-- ❌ Missing type="module"! -->
```
`apiConfig.js` dùng `export const` → **SyntaxError** khi load không có `type="module"`.

---

#### 2.5 CSS Issues

- **Bypass CSS variables:** Feature CSS files thường hardcode hex (`#e50914`, `#1a1a1a`, `#111111`) thay vì dùng `:root` variables từ `main.css`.
- **Button/card class trùng lặp** across `main.css`, `booking.css`, `admin.css`, `profile.css`, `movies.css`.
- **Responsive breakpoints không thống nhất:** `600px`, `768px`, `1024px`, `1200px` tùy file.

---

## 3. KHẢ NĂNG MỞ RỘNG (4/10)

### Vi phạm SOLID

| Nguyên tắc | Vi phạm | Vị trí |
|------------|---------|--------|
| **S**RP | `AuthController` xử lý 12+ chức năng | [AuthController.cs](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/Controllers/AuthController.cs) |
| **S**RP | `admin.js` — 3,203 dòng, ~15 chức năng | [admin.js](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/frontend/src/management/js/admin.js) |
| **O**CP | Thêm payment method → sửa trực tiếp checkout | `checkout.js`, `ApiPaymentController.cs` |
| **D**IP | Controllers phụ thuộc concrete Repositories | [Program.cs](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/Program.cs) L98-104 |
| **I**SP | `storage.js` expose mọi operations cho mọi consumer | `shared/utils/storage.js` |

### Thiếu DTOs cho hầu hết endpoints

[DTOs/](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/DTOs) chỉ có `Auth/` (6 DTOs). Các controller `Movies`, `Bookings`, `Showtimes`, `Users`, `Payment` trả về **entity models trực tiếp** → thay đổi DB schema = thay đổi API contract = frontend phải sửa.

### Hardcoded config trong frontend

API base URL nằm rải rác:
- `apiConfig.js` → `'http://3hd2k-api.somee.com/api'`
- `admin.js` → `'http://127.0.0.1:5111/api'`
- `booking-food/app.js` → `'http://127.0.0.1:5111/api'`

**Đề xuất:** Centralize trong `apiConfig.js` và import nhất quán.

---

## 4. XỬ LÝ LỖI & ĐỘ TIN CẬY (4/10)

### 🔴 Vấn đề bảo mật NGHIÊM TRỌNG

#### 4.1 Production Secrets trong Source Control

> [!CAUTION]
> [`appsettings.json`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/appsettings.json) & [`appsettings.Production.json`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/appsettings.Production.json) chứa **credentials thật** đã commit vào Git:

```json
// SQL Server credentials
"DefaultConnection": "...user id=lekhuong_SQLLogin_1;pwd=jmgavwj41z;..."

// JWT Secret Key
"Key": "3HD2K-Cinema-SuperSecret-Key-2024-Must-Be-At-Least-32-Bytes!"

// Gmail App Password
"Password": "srpw gktm cqax cmbr"

// Bank Account
"AccountNumber": "0327124317", "AccountName": "HUY NGUYEN"
```

**Hành động cần thiết NGAY:** Rotate tất cả credentials, chuyển sang environment variables, thêm vào `.gitignore`.

---

#### 4.2 Auth Bypass Vulnerability (Frontend)

> [!CAUTION]
> [`auth/auth-services/authService.js`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/frontend/src/auth/auth-services/authService.js) L31-42: Nếu server trả lỗi non-JSON, code **tự động tạo tài khoản Admin/Staff cục bộ**:

```javascript
const lowerEmail = (email || '').toLowerCase();
if (lowerEmail === 'staff@gmail.com' || lowerEmail === 'admin@gmail.com' 
    || lowerEmail.includes('staff') || lowerEmail.includes('admin')) {
    const role = lowerEmail.includes('admin') ? 'ADMIN' : 'STAFF';
    const user = { email: email, name: 'Quản Trị Viên', role: role };
    setCurrentUser(user);
    localStorage.setItem('jwt_token', 'local_dev_token_' + Date.now());
    return { ok: true, user: user };  // ❌ Bypass authentication!
}
```

**Bất kỳ ai** có email chứa "admin" hoặc "staff" đều có thể truy cập admin dashboard nếu backend lỗi!

---

#### 4.3 CORS "Allow All" + Credentials

[Program.cs](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/Program.cs) L35-40:
```csharp
policy.SetIsOriginAllowed(_ => true)  // ❌ MỌI origin
      .AllowAnyMethod()
      .AllowAnyHeader()
      .AllowCredentials();             // ❌ Kết hợp wildcard + credentials = CSRF risk
```

**Đề xuất:** `policy.WithOrigins("https://32dk-web-app-project.vercel.app", "http://localhost:3000")`

---

#### 4.4 Developer Exception Page luôn bật

[Program.cs](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/Program.cs) L111:
```csharp
app.UseDeveloperExceptionPage(); // ❌ Lộ stack trace trong Production!
```

---

#### 4.5 Default Password "123456"

[ApiUsersController.cs](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/Controllers/ApiUsersController.cs) L156: Khi admin tạo user mới, password mặc định là `"123456"`.

---

#### 4.6 XSS Risk

User comments trong `movie-detail.js` và profile fields trong `profile.js` được interpolate trực tiếp vào `innerHTML` **không sanitize**.

---

#### 4.7 Silent Catch Blocks

| Vị trí | Code |
|--------|------|
| [`SeatCleanupService.cs`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/Services/SeatCleanupService.cs) L33-36 | `catch (Exception) { }` — Background worker fail im lặng |
| [`shared/utils/storage.js`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/frontend/src/shared/utils/storage.js) L143 | `catch (e) {}` trong `parseJwtPayload()` |
| `storage.js` L176 | `catch (_) {}` trong `getCurrentUser()` |
| `profile.js` L57 | `catch(e) {}` khi load movies |

---

#### 4.8 `Console.WriteLine` thay vì `ILogger`

[AuthController.cs](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/Controllers/AuthController.cs) L712, 717, 722, 744, 750, 756 và [ApiShowtimesController.cs](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/Controllers/ApiShowtimesController.cs) L36 dùng `Console.WriteLine` thay vì DI `ILogger<T>`.

---

#### 4.9 Exception Details Leak

`ApiBookingsController.cs` L221:
```csharp
return StatusCode(500, new { message = "Lỗi khi huỷ giao dịch: " + ex.Message });
// ❌ Leak internal exception message to client
```

---

#### 4.10 Raw SQL ALTER TABLE chạy mỗi startup

[Program.cs](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/backend/Program.cs) L121-127 — Fragile, bypass EF Core migrations.

---

#### 4.11 Monkey-patching `window.fetch`

[`shared/utils/apiConfig.js`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/frontend/src/shared/utils/apiConfig.js) L26-45 override global `window.fetch` để tự động xử lý 401 refresh token. Side-effect khi import, khó debug.

---

#### 4.12 Vercel Mixed Content (HTTP ↔ HTTPS)

[`vercel.json`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/vercel.json) rewrite API proxy tới `http://3hd2k-api.somee.com/api/` (HTTP) nhưng Vercel serve trên HTTPS → **Mixed Content** warnings/blocks trên browsers hiện đại.

---

#### 4.13 Corrupted & Broken Scripts

| File | Vấn đề |
|------|--------|
| [`run-mock.js`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/run-mock.js) | File bị truncated giữa chừng (line 27 cắt ngang HTML string) — **corrupted** |
| [`run_servers.bat`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/run_servers.bat) | Hardcode đường dẫn máy cá nhân: `c:\Users\Le Minh Khuong 1\...` — **fail trên mọi máy khác** |
| `migrate_users_app/` | Thư mục orphan — chỉ chứa `bin/` và `obj/` rỗng, không có source code |

---

## 5. TÀI LIỆU & DỄ HIỂU (8/10) ⭐

### ✅ Điểm sáng

- [**README.md**](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/README.md) (12KB) — Badges, live demo, tech stack table, directory structure, setup instructions.
- [**docs/**](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/docs) — 16 file tài liệu: architecture, API, database, testing, deployment, contributing, ai-contribution.
- **MkDocs Material** cho documentation website.
- [**CHANGELOG.md**](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/CHANGELOG.md) — Semantic versioning, lịch sử phiên bản.
- [**SECURITY.md**](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/SECURITY.md) — Chính sách bảo mật.

### ⚠️ Vấn đề

- README thiếu hướng dẫn setup backend (SQL Server, .NET SDK, cấu hình `appsettings.json`).
- Không có troubleshooting section.
- Code comments ít cho business logic phức tạp.
- API docs (`docs/api.md`) có thể chưa cover hết endpoints.
- **CHANGELOG.md không chính xác:** Ghi "Test coverage đạt 100% E2E" (v2.7.7) nhưng thực tế `home.spec.js` test wildcard, `booking-flow.spec.js` chưa hoàn thành, backend tests = 0% coverage.
- **TEST_PLAN.md liệt kê `FluentAssertions`** nhưng package này không có trong `appweb.Tests.csproj`.

---

## 6. TESTING (4/10)

### ✅ Có gì

- **11 E2E test suites** (Playwright) — báo cáo 100% PASS.
- **Accessibility testing** tích hợp Axe-core.
- **Lighthouse CI** cho performance auditing.
- **Storybook + Chromatic** cho component visual testing.
- **CI/CD:** GitHub Actions cho Playwright, Docs, Lighthouse, Chromatic.

### ⚠️ Vấn đề nghiêm trọng

#### 6.1 Backend Unit Tests — Tautological (Test chính nó, không test app code)

> [!CAUTION]
> `tests/backend.tests/BookingLogicTests.cs` chứa 3 "unit tests" nhưng **không test BẤT KỲ code nào từ ứng dụng**:

| Test Name | Thực tế test cái gì |
|-----------|---------------------|
| `CalculateTotalPrice_WithSingleCombo` | Tính toán inline `(seatCount * ticketPrice) + comboPrice` **ngay trong body test** — không gọi bất kỳ service/method nào |
| `PasswordHashing_VerifiesCorrectPassword` | Test library `BCrypt.Net` trực tiếp — không test application logic |
| `ComboPricing_ReturnsExpectedAmount` | Test một `if-else` viết ngay trong test body |

→ **Actual backend code coverage = 0%**

#### 6.2 E2E Tests — Chất lượng assertions thấp

- **`home.spec.js`:** Assertion `expect(page).toHaveURL(/.*|localhost|vercel.app/)` dùng regex `.*` → **match ANY URL** → test luôn pass bất kể trang load gì.
- **`booking-flow.spec.js`:** Test dừng ở `#section-showtimes`, **không hoàn thành** flow chọn ghế, combo, hay thanh toán. Chứa TODO comments.

#### 6.3 CI Visual Regression — Bị vô hiệu hóa

> [!WARNING]
> `.github/workflows/playwright.yml` L30:
> ```bash
> npx playwright test --update-snapshots || npx playwright test
> ```
> Chạy `--update-snapshots` trên **MỌI CI run** → tự động ghi đè baselines mỗi lần → **visual regression testing hoàn toàn vô nghĩa**.

#### 6.4 Storybook Stories — Không test component thật

`tests/stories/Button.stories.js` và `MovieCard.stories.js` **không import** component từ `frontend/src/`. Thay vào đó, tự tạo mock HTML bằng `document.createElement('div')` + inline strings → thay đổi UI thật không phản ánh trong Storybook.

#### 6.5 Lighthouse — Chỉ warn, không fail

`.lighthouserc.js` set tất cả assertions (`performance`, `accessibility`, `best-practices`, `seo`) thành `'warn'` thay vì `'error'` → CI **không bao giờ fail** dù performance giảm.

#### 6.6 Thiếu hoàn toàn

| Loại test | Trạng thái | Impact |
|-----------|:---:|---|
| Backend Unit Tests (thực) | ❌ **0% coverage** | Auth, payment, booking — không test |
| Frontend Unit Tests | ❌ **Không có** | formatPrice, storage, auth validation |
| Backend CI/CD | ❌ **Không có** | Không build/test .NET trong GitHub Actions |
| Cross-browser testing | ❌ **Disabled** | Chỉ test Chromium, Firefox/WebKit bị tắt |
| Linting CI | ❌ **Không có** | Không ESLint hoặc C# analysis |

**Đề xuất:**
1. **Viết lại** `BookingLogicTests.cs` để test actual services (sau khi refactor)
2. Setup Vitest cho frontend → test `storage.js`, formatting, auth logic
3. Thêm `.github/workflows/dotnet.yml` cho backend CI
4. Xóa `--update-snapshots` khỏi CI playwright command
5. Đổi Lighthouse assertions sang `'error'` cho thresholds quan trọng

---

## 7. DEPENDENCY (7/10)

### ✅ Điểm tốt
- Backend packages (EF Core 8.0.27, JWT Bearer 8.0.12, BCrypt 4.0.3) — pinned, up-to-date.
- Frontend minimal: `tailwindcss` + `live-server`.
- Lock files (`package-lock.json`) có mặt.

### ⚠️ Vấn đề

| Issue | Vị trí |
|-------|--------|
| `puppeteer` (production dep) có thể unused — Playwright là test runner | Root [`package.json`](file:///c:/Users/Admin/Documents/code_workspace/web-application-development/package.json) L14 |
| `deno.lock` (94KB) ở root nhưng không có Deno config | Root directory |
| Build artifacts committed: `publish-latest.zip` (11MB), `backend_somee.zip` (11.5MB) | `backend/` |
| `.bat` scripts chỉ chạy trên Windows, thiếu cross-platform | Root directory |

---

## 📊 TỔNG KẾT BẢNG VẤN ĐỀ

### 🔴 Critical (Cần sửa ngay)

| # | Vấn đề | Vị trí |
|---|--------|--------|
| 1 | Production credentials committed to Git | `appsettings.json`, `appsettings.Production.json` |
| 2 | Auth bypass vulnerability — auto-create Admin | `authService.js` L31-42 |
| 3 | CORS AllowAll + AllowCredentials | `Program.cs` L35-40 |
| 4 | DevExceptionPage always enabled | `Program.cs` L111 |
| 5 | Default password `"123456"` | `ApiUsersController.cs` L156 |

### 🟡 High (Nên sửa sớm)

| # | Vấn đề | Vị trí |
|---|--------|--------|
| 6 | God class `AuthController.cs` (761 dòng) | Backend Controllers |
| 7 | God module `admin.js` (3,203 dòng) | Frontend management |
| 8 | No service layer for core domains | Backend |
| 9 | No repository interfaces | Backend Repositories |
| 10 | No unit tests (backend & frontend) | Tests directory |
| 11 | XSS risk — unsanitized innerHTML | `movie-detail.js`, `profile.js` |
| 12 | 5+ orphaned dead JS files | Frontend feature dirs |
| 13 | `formatPrice` duplicated 7 times | Across 7 JS files |
| 14 | Password verification duplicated 3 times | Backend Auth/Repos |
| 15 | Missing DTOs for most endpoints | Backend DTOs |

### 🟢 Medium/Low (Cải thiện dần)

| # | Vấn đề | Vị trí |
|---|--------|--------|
| 16 | Inconsistent naming conventions | Frontend file/var names |
| 17 | Module system fragmentation (ESM vs IIFE) | Frontend JS files |
| 18 | Silent catch blocks | `storage.js`, `SeatCleanupService.cs` |
| 19 | `Console.WriteLine` thay vì `ILogger` | Backend controllers |
| 20 | CSS hardcoded colors bypass variables | Feature CSS files |
| 21 | Root directory clutter | SQL files, .bat scripts |
| 22 | Build artifacts in repo | `publish-latest.zip` etc. |
| 23 | Broken script import (missing `type="module"`) | `loyalty-points/index.html` L11 |
| 24 | Monkey-patching `window.fetch` | `apiConfig.js` L26-45 |

---

## 🏆 TOP 3 ƯU TIÊN SỬA QUAN TRỌNG NHẤT

### 🥇 Ưu tiên 1: Fix Critical Security Issues NGAY LẬP TỨC

> **Impact:** Ngăn chặn data breach, unauthorized access, và information leakage trên production đang live.

**Hành động:**
1. ❗ **Rotate ALL credentials** (DB password, JWT key, Gmail App Password, PayOS keys, bank info) — chúng đã bị lộ trong Git history
2. Chuyển secrets sang environment variables / `dotnet user-secrets` / Azure Key Vault
3. Thêm `appsettings.Production.json` vào `.gitignore`
4. **Xóa auth bypass** trong `authService.js` L31-42
5. CORS whitelist cụ thể thay vì `AllowAll`
6. Wrap `UseDeveloperExceptionPage()` trong `IsDevelopment()` check
7. Xóa default password `"123456"`

⏱ **Ước lượng:** 1 ngày | **Urgency:** 🔴 Phải làm trước khi deploy tiếp

---

### 🥈 Ưu tiên 2: Refactor God Classes + Build Service Layer

> **Impact:** Giải quyết đồng thời SRP violations, code duplication, khả năng test, và maintainability lâu dài.

**Hành động — Backend:**
1. Tạo `IAuthService` + `AuthService` — chuyển JWT/password/OTP/SMTP logic từ `AuthController`
2. Tạo `IBookingService` + `BookingService` — chuyển pricing/promo/seat logic
3. Tạo repository interfaces (`IUserRepository`, `IBookingRepository`...)
4. Extract `PasswordHelper` static class cho password verification
5. Tạo DTOs cho Movie, Booking, Showtime, User endpoints

**Hành động — Frontend:**
6. Tách `admin.js` (3,203 dòng) → `admin-movies.js`, `admin-showtimes.js`, `admin-cinemas.js`, `admin-pos.js`, `admin-dashboard.js`
7. Tách `navbar.js` (1,915 dòng) → HTML template trong `<template>` tag + JS logic riêng
8. Xóa dead files và thư mục trùng
9. Centralize `formatPrice`, `formatDate` vào `shared/utils/formatters.js`
10. Unify `authGuard.js` + `authGuard-global.js`

⏱ **Ước lượng:** 3-5 ngày

---

### 🥉 Ưu tiên 3: Thêm Unit Tests + Backend CI

> **Impact:** Tạo safety net cho refactoring, phát hiện bugs sớm, tự động hóa quality gates.

**Hành động:**
1. Setup xUnit test project → test `AuthService`, `PayOSService`, `RatingService` (sau refactor)
2. Setup Vitest → test `storage.js`, `formatters.js`, auth validation
3. Thêm `.github/workflows/dotnet.yml` cho `dotnet build` + `dotnet test`
4. Thêm ESLint workflow cho frontend

⏱ **Ước lượng:** 3-4 ngày

---

> [!IMPORTANT]
> **Thứ tự thực hiện:** Ưu tiên 1 (Security) → Ưu tiên 2 (Refactor) → Ưu tiên 3 (Testing).
> Security fixes phải được thực hiện **NGAY** vì ứng dụng đang live trên Vercel với credentials bị lộ trong public Git repo.
