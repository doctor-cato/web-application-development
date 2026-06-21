# Quy trình Phát triển Frontend & Git — 3HD2Kcinema

Hiện tại dự án đang tập trung hoàn thiện tầng **Frontend** (giao diện và logic người dùng trên trình duyệt). Backend chưa được tích hợp chính thức. Vì vậy, mọi quy trình làm việc đều xoay quanh việc phát triển thư mục `/frontend`.

## Quy tắc Code Frontend

1. **Không sử dụng bundler phức tạp**: Tuân thủ định dạng Vanilla ES6 `<script type="module">`.
2. **Quản lý dữ liệu (Mock DB)**: Mọi tương tác dữ liệu hiện tại đều lưu thông qua `LocalStorage` và `SessionStorage` (được cấu hình trong `shared/utils/storage.js`). **Không gọi `fetch()` đến backend** ở thời điểm hiện tại.
3. **Tailwind CSS**: Cho phép sử dụng Tailwind CSS để dựng giao diện nhanh. Lệnh build tailwind sẽ giám sát và biên dịch file `input.css`.
4. **BroadcastChannel API**: Sử dụng API này để đồng bộ hóa trạng thái giao diện theo thời gian thực (real-time) giữa các tab, đặc biệt trong tính năng khóa ghế (`seat_sync`).

---

## Chạy Local (Frontend)

Mở terminal và trỏ vào thư mục `/frontend`:

```bash
cd frontend

# Cài đặt dependencies (Tailwind CLI, Serve) - Chạy 1 lần duy nhất
npm install

# Khởi chạy server tĩnh (phục vụ frontend/src) ở cổng 3000
npm run dev
# → Mở trình duyệt: http://localhost:3000

# (Tùy chọn) Bật chế độ tự động build Tailwind CSS khi bạn sửa code HTML
npm run tailwind:watch
```

---

## Luồng Git (Git Flow)

```text
main ──────────────────────────────── (stable)
  └── dev2 ──────────────────────── (integration branch)
        └── feature/payment-ui         (feature branches)
        └── fix/button-alignment
```

- **`main`**: Code frontend ổn định, giao diện hoàn thiện.
- **`dev2`**: Branch hội nhập chính.
- **`feature/*`**: Tạo từ `dev2`, merge vào `dev2` sau khi hoàn thành một màn hình/tính năng UI.

### Commit Convention

| Prefix | Dùng khi |
|---|---|
| `feat:` | Thêm tính năng UI mới hoặc logic JS mới |
| `fix:` | Sửa lỗi (bug) hiển thị hoặc lỗi logic JS |
| `refactor:` | Tái cấu trúc code (tách component, tổ chức lại CSS/JS) |
| `docs:` | Chỉ chỉnh sửa file markdown tài liệu |
| `chore:` | Thiết lập cấu hình (package.json, tailwind.config.js...) |
| `style:` | Tinh chỉnh CSS/Tailwind, căn chỉnh lại pixel, đổi màu sắc |

---

## Quy trình làm việc cùng AI (Cursor / Copilot / Antigravity)

1. **Phạm vi làm việc**: Yêu cầu AI chỉ được phép đọc, tạo và chỉnh sửa code bên trong thư mục `/frontend/src`. Không động đến `/backend` ở thời điểm hiện tại.
2. **Không Over-Engineering**: Tuyệt đối không cho AI tự ý cài thêm React, Vue, Webpack, Babel hay Express. Đây là dự án Vanilla JS thuần.
3. **Mô phỏng dữ liệu**: Nhắc nhở AI luôn dùng file `storage.js` để đọc/ghi dữ liệu tạm thời thay vì gọi API.
