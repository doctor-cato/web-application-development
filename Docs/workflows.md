# Quy trình Phát triển & Git — 3HD2Kcinema

Dự án phát triển song song hai luồng mã nguồn. Để đảm bảo tính độc lập và khả năng triển khai nhanh chóng, toàn bộ quy trình làm việc thực tế xoay quanh việc phát triển thư mục `/frontend` (Luồng Client-side tự hành), sử dụng Mock Storage.

---

## 1. Quy tắc Code Frontend (Thư mục `/frontend`)

1. **Không sử dụng Bundler phức tạp ở Client**: Giữ cho ứng dụng thuần khiết bằng cách tuân thủ định dạng Vanilla ES6 Modules (`<script type="module">`). Không cài đặt React, Vue, Webpack hay Babel.
2. **Quản lý dữ liệu tập trung qua Wrapper**: Tuyệt đối không gọi trực tiếp `localStorage.getItem` hay `localStorage.setItem` rải rác khắp nơi trong code. Mọi thao tác đọc/ghi dữ liệu của các trang phải thông qua `frontend/src/shared/utils/storage.js` để tránh xung đột key và lỗi parse JSON.
3. **Không gọi API trực tiếp đến Backend**: Do Backend và Frontend đang chạy ở hai luồng kiến trúc song song độc lập, phía Frontend chạy chính thức không sử dụng lệnh `fetch()` hoặc `axios` để gọi đến Backend ASP.NET Core ở thời điểm hiện tại. Mọi hành động tương tác dữ liệu phải được giải quyết thông qua Mock Storage.
4. **Xây dựng Responsive cho thiết bị di động**: Mọi thành phần UI được phát triển mới hoặc chỉnh sửa phải hoạt động hoàn hảo trên các kích thước màn hình di động (đặc biệt là các màn hình nhỏ dưới 375px). Sử dụng Tailwind CSS kết hợp với CSS tùy biến trong các file `styles.css` cục bộ để xử lý giao diện di động.
5. **Auto-Close Dropdowns & Focus Jump**:
   - Khi click ra ngoài bất kỳ trình đơn thả xuống nào (như thông báo, tùy chọn tài khoản trên Navbar), trình đơn đó phải tự động đóng lại.
   - Các hành động mở modal hoặc chuyển trạng thái không được làm nhảy cuộn trang (focus jumping) ngoài ý muốn của người dùng.

---

## 2. Khởi chạy Ứng dụng ở Local (Frontend)

Mở terminal và chuyển hướng vào thư mục `/frontend`:

### Chạy bằng Python Web Server (Được khuyên dùng vì tính gọn nhẹ):
```bash
cd frontend
python -m http.server 3000 -d src
# Hoặc nếu máy bạn dùng lệnh python3:
python3 -m http.server 3000 -d src
```
Mở trình duyệt truy cập: `http://localhost:3000`.

### Theo dõi và tự động biên dịch Tailwind CSS (Watch Mode):
Để tự động xây dựng lại các lớp tiện ích Tailwind khi thay đổi file HTML/JS, mở một terminal mới và chạy:
```bash
cd frontend
npm install
npm run tailwind:watch
```

---

## 3. Quy trình làm việc với Git (Git Flow)

Hệ thống quản lý nhánh được chia thành các luồng rõ rệt:

```text
main ────────────────────────────────────────── (Nhánh ổn định chính)
  └── dev2 ──────────────────────────────────── (Nhánh tích hợp & thử nghiệm)
        ├── feature/payment-ui                 (Nhánh phát triển tính năng)
        ├── fix/button-alignment               (Nhánh sửa lỗi giao diện)
        └── docs/sync-documentation            (Nhánh cập nhật tài liệu)
```

- **`main`**: Chứa mã nguồn frontend ổn định, giao diện hoàn chỉnh đã qua kiểm nghiệm.
- **`dev2`**: Nhánh tích hợp chính dành cho việc thử nghiệm các tính năng mới từ các nhánh con trước khi gộp vào `main`.
- **`feature/*` / `fix/*`**: Được tạo từ `dev2` để phát triển tính năng hoặc sửa lỗi, sau đó merge trở lại `dev2` thông qua Pull Request.

### Quy ước COMMIT (Commit Convention)

Mỗi commit message phải tuân thủ định dạng chuẩn để các AI Agent khác và thành viên dự án có thể nắm bắt nhanh chóng lịch sử thay đổi:

| Tiền tố (Prefix) | Phạm vi áp dụng |
|---|---|
| `feat:` | Thêm tính năng UI mới hoặc logic xử lý JS mới. |
| `fix:` | Sửa lỗi (bug) hiển thị, lỗi responsive hoặc lỗi logic JS. |
| `refactor:` | Tái cấu trúc mã nguồn (tách component, tổ chức lại hàm CSS/JS) mà không đổi hành vi. |
| `style:` | Tinh chỉnh giao diện: sửa CSS/Tailwind, căn chỉnh khoảng cách, đổi mã màu. |
| `docs:` | Chỉ chỉnh sửa các tệp tin tài liệu `.md`. |
| `chore:` | Thiết lập cấu hình hệ thống (package.json, tailwind.config.js, gitignore,...). |

#### Ví dụ commit message tốt:
```text
feat(profile): implement partial cancellation for group tickets and fix backend seat lock ghosting

CHANGED: src/booking/seat-booking/bookingService.js, src/user/user-profile/profile.html
NOTE: users can now select specific seats to cancel instead of full ticket.
```

---

## 4. Quy tắc tương tác dành cho AI Agent (Cursor / Antigravity)

1. **Phạm vi hoạt động**: Chỉ chỉnh sửa các tệp tin bên trong thư mục `/frontend/src/` để hoàn thiện luồng client-side. Không tự ý sửa đổi tệp tin trong `/backend/` trừ khi có chỉ thị rõ ràng từ lập trình viên để tránh làm hỏng cấu trúc Razor/EF Core của Backend.
2. **Không Over-Engineering**: Tuyệt đối không tự ý cài đặt thêm các thư viện lớn như React, Vue, Angular, Svelte, Webpack, Babel hoặc Express. Hệ thống là một ứng dụng Vanilla JS thuần túy.
3. **Bảo tồn tài liệu**: Khi cập nhật code làm thay đổi luồng nghiệp vụ hoặc cấu trúc dữ liệu, AI Agent phải cập nhật các tệp tin tương ứng trong thư mục `/Docs/` và `README.md` để đảm bảo tính đồng bộ của dự án.
