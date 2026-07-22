# Quy trình Đóng góp (Contributing Guidelines)

Cảm ơn bạn đã quan tâm đóng góp cho dự án **3HD2Kcinema**! Để đảm bảo mã nguồn luôn chất lượng, đồng bộ và dễ bảo trì, vui lòng đọc kỹ quy chuẩn dưới đây trước khi thực hiện Pull Request (PR).

---

## 🌳 1. Quy tắc Quản lý Nhánh (Git Flow)

Hệ thống nhánh được chia thành các tầng rõ rệt:

```text
main ────────────────────────────────────────────── (Nhánh sản phẩm ổn định)
  └── dev2 ──────────────────────────────────────── (Nhánh tích hợp tính năng)
        ├── feature/seat-lock-optimization         (Nhánh tính năng mới)
        ├── fix/mobile-nav-dropdown                 (Nhánh sửa lỗi UI/UX)
        └── docs/update-mkdocs-structure            (Nhánh cập nhật tài liệu)
```

- **`main`**: Nhánh chứa mã nguồn chính thức, hoạt động ổn định. Chỉ gộp từ `dev2` sau khi đã qua kiểm thử E2E.
- **`dev2`**: Nhánh phát triển chính. Mọi nhánh tính năng mới (`feature/*`) hoặc nhánh sửa lỗi (`fix/*`) đều phải checkout từ `dev2` và tạo Pull Request merge trở lại `dev2`.

---

## 📝 2. Quy ước Commit (Commit Convention)

Mỗi commit message phải tuân thủ định dạng tiêu chuẩn để toàn bộ thành viên và các AI Agent nắm bắt lịch sử thay đổi:

```text
<prefix>(<scope>): <mô tả ngắn gọn bằng tiếng Anh hoặc tiếng Việt>

[BODY: Mô tả lý do thay đổi nếu có]
[CHANGED: Danh sách các tệp tin đã chỉnh sửa]
[NOTE: Ghi chú quan trọng cho các lập trình viên khác]
```

### Danh sách các Tiền tố (Prefixes)

| Prefix | Ý nghĩa & Phạm vi áp dụng |
|---|---|
| `feat:` | Thêm tính năng UI mới hoặc logic JS mới. |
| `fix:` | Sửa lỗi (bug) hiển thị, lỗi responsive hoặc lỗi logic JavaScript. |
| `refactor:` | Tái cấu trúc code (tách module, tối ưu hàm) mà không thay đổi hành vi người dùng. |
| `style:` | Tinh chỉnh giao diện: CSS, mã màu, khoảng cách, font chữ. |
| `docs:` | Chỉ chỉnh sửa hoặc thêm mới các tệp tin tài liệu `.md`. |
| `chore:` | Thiết lập cấu hình dự án (`package.json`, `mkdocs.yml`, `.gitignore`,...). |
| `test:` | Thêm mới hoặc chỉnh sửa các bài test Playwright / Unit tests. |

#### Ví dụ commit message tốt
```text
feat(booking): add BroadcastChannel auto-reconnect on tab wake

CHANGED: frontend/src/booking/seat-booking/bookingService.js
NOTE: automatically syncs seat status when user re-opens background tab.
```

---

## 🎨 3. Quy chuẩn Mã nguồn (Code Style Standards)

### HTML & CSS Standards
1. **Semantic HTML5**: Sử dụng đúng các thẻ `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
2. **Không inline CSS**: Viết CSS tập trung trong file style của từng trang hoặc dùng Tailwind CSS.
3. **Mobile First**: Thiết kế mặc định cho màn hình di động, sau đó dùng các prefix responsive (`md:`, `lg:`) của Tailwind CSS.

### JavaScript Standards
1. **ES6 Modules**: Luôn dùng `import` / `export`. Khai báo script dạng `<script type="module">`.
2. **Tuyệt đối không dùng biến toàn cục**: Tránh gán trực tiếp vào `window.*` trừ các trường hợp thực sự cần thiết.
3. **Tương tác Storage tập trung**: Mọi thao tác đọc/ghi `LocalStorage` / `SessionStorage` **phải thông qua `Storage` wrapper** tại `frontend/src/shared/utils/storage.js`.

---

## 📋 4. Quy trình Gửi Pull Request (PR Checklist)

Trước khi bấm nút tạo PR:

- [ ] Đã chạy thử ứng dụng và kiểm tra không có lỗi Console Error nào.
- [ ] Đã kiểm tra giao diện mượt mượt trên cả màn hình Desktop và Mobile (DevTools).
- [ ] Đã chạy linter Markdown (`markdownlint docs/**/*.md`) nếu có sửa tệp tài liệu.
- [ ] Commit message đúng định dạng quy chuẩn.
- [ ] Đã tạo PR hướng về nhánh `dev2`.
