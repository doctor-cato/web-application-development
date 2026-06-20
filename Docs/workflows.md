# Quy trình Phát triển & Git — 3HD2Kcinema

## Quy tắc Code

Khi làm việc với codebase này, cần chia rạch ròi quy tắc cho Frontend và Backend:

### Frontend
1. **Không bao giờ** import module Node.js bên ngoài hay dùng bundler (trừ công cụ Tailwind CLI) — tuân thủ định dạng Vanilla ES6 `<script type="module">`.
2. **Không bao giờ** viết logic thay đổi giao diện (DOM manipulation) trực tiếp vào các file service xử lý dữ liệu.
3. Các yêu cầu (requests) gửi về Backend cần sử dụng `fetch()` API tiêu chuẩn của trình duyệt.
4. Trong nhánh `dev`, hệ thống sử dụng Tailwind CSS để dựng UI.

### Backend
1. **Cấu trúc ASP.NET Core**: Tuân thủ Repository Pattern và Dependency Injection. Các controller chỉ tiếp nhận và điều phối request, logic xử lý phức tạp phải đặt trong thư mục `Services/`.
2. **Entity Framework Core**:
   - Khi thay đổi schema Database (thêm bảng, sửa cột trong các file `Models/`), phải tạo Migration (`dotnet ef migrations add <Name>`) và cập nhật DB (`dotnet ef database update`).
3. **Bảo mật**: Các endpoint yêu cầu người dùng đăng nhập phải có attribute `[Authorize]`.

---

## Chạy Local (Full-stack)

Để chạy toàn bộ hệ thống, bạn cần khởi chạy cả Backend và Frontend ở hai terminal riêng biệt.

### 1. Backend Server (API & MVC)

```bash
cd backend
# Khôi phục các package NuGet (chỉ cần chạy lần đầu hoặc khi có thay đổi package)
dotnet restore

# (Tùy chọn) Chạy migration cập nhật DB nếu chưa có hoặc có thay đổi Models
# dotnet ef database update

# Khởi chạy server
dotnet run
```

### 2. Frontend (Static Web Server)

```bash
cd frontend
# Cài dependencies (chỉ cần chạy 1 lần)
npm install

# Khởi chạy dev server phục vụ thư mục mã nguồn frontend/src
npm run dev
# → Truy cập ứng dụng tại: http://localhost:3000

# (Tùy chọn) Chạy watch-mode để tự động build Tailwind CSS khi thay đổi class trong mã nguồn
npm run tailwind:watch
```

---

## Luồng Git (Git Flow)

```text
main ──────────────────────────────── (stable, production-ready)
  └── develop ──────────────────────── (integration branch)
        └── feature/payment-gateway    (feature branches)
        └── fix/db-migration-error
```

- **`main`**: Code ổn định, API Backend và Frontend giao tiếp với nhau mượt mà.
- **`develop`**: Branch hội nhập chính.
- **`feature/*`**: Tạo từ `develop`, merge vào `develop` sau khi hoàn thành.

### Commit Convention

| Prefix | Dùng khi |
|---|---|
| `feat:` | Thêm tính năng mới (UI Frontend hoặc API Backend) |
| `fix:` | Sửa lỗi (bug) ở client hoặc server |
| `refactor:` | Tái cấu trúc code (chỉnh sửa thiết kế class, tách file...) mà không đổi behavior |
| `docs:` | Chỉ chỉnh sửa file markdown tài liệu |
| `chore:` | Thiết lập cấu hình, công cụ (package.json, file .csproj, appsettings.json...) |
| `style:` | Chỉ chỉnh sửa CSS/Tailwind, không đổi logic |

---

## Quy trình làm việc cùng AI (Cursor / Copilot / Antigravity)

1. **Đọc tài liệu (Docs) trước**: Hướng AI đọc các file `.md` trong thư mục `Docs/` để nắm vững context.
2. **Phân biệt rạch ròi Frontend & Backend**: Khi sửa UI, nhắc AI thao tác trong thư mục `/frontend`. Khi thêm tính năng API hoặc chỉnh sửa Database, nhắc AI thao tác trong `/backend`. Không để AI tạo lẫn lộn logic (như tự ý thêm Node.js express server vào Frontend).
3. **Đồng bộ docs**: Sau mỗi thay đổi kiến trúc, Database schema hoặc Endpoint API mới, yêu cầu AI cập nhật các file `Docs/features.md` và `Docs/data-storage.md`.
