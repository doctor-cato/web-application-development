# Quy trình Phát triển & Git — 3HD2Kcinema

## Quy tắc Code

Khi làm việc với codebase này:

1. **Không bao giờ** import module Node.js bên ngoài hay dùng bundler — tuân thủ Vanilla ES6 `<script type="module">`.
2. **Không bao giờ** viết DOM manipulation trong thư mục service (`auth-services/`, `bookingService.js`, v.v.).
3. **Không bao giờ** gọi `localStorage.setItem()`/`getItem()` trực tiếp trong controller hay HTML — luôn đi qua `shared/utils/storage.js`.
4. **Nhánh `main`**: Tuyệt đối không import Tailwind CSS CDN hoặc thư viện CSS bên ngoài. Chỉ dùng Vanilla CSS.
5. **Nhánh `dev`**: Cho phép Tailwind CSS.

---

## Chạy Local

```bash
# Cài dependencies (1 lần)
npm install

# Khởi chạy dev server (giống Live Server)
npm run dev
# → http://localhost:3000

# (Optional) Build Tailwind CSS cho nhánh dev
npm run tailwind:watch
```

---

## Luồng Git (Git Flow)

```
main ──────────────────────────────── (stable, production-ready)
  └── develop ──────────────────────── (integration branch)
        └── feature/payment-gateway    (feature branches)
        └── feature/forgot-password
        └── fix/seat-lock-timeout
```

- **`main`**: Code ổn định, chạy mượt qua HTTP server tĩnh.
- **`develop`**: Branch hội nhập. Cho phép Tailwind CSS.
- **`feature/*`**: Tạo từ `develop`, merge vào `develop` sau khi done.

### Commit Convention

| Prefix | Dùng khi |
|---|---|
| `feat:` | Thêm tính năng mới (UI + logic) |
| `fix:` | Sửa bug |
| `refactor:` | Tái cấu trúc code không thay đổi behavior |
| `docs:` | Chỉ chỉnh file markdown tài liệu |
| `chore:` | Config, deps, tooling (package.json, .gitignore...) |
| `style:` | Chỉ chỉnh CSS/UI, không đổi logic |

---

## Quy trình làm việc cùng AI (Cursor / Copilot / Antigravity)

1. **Đọc docs trước**: Chỉ hướng AI đến các file `.md` trong `Docs/`. Không đọc `.docx`.
2. **Không Over-Engineering**: Nếu AI đề xuất tạo component React (`.jsx`), route Express, hay config webpack — dừng ngay và nhắc AI đọc `Docs/architecture.md`.
3. **Sửa từng module nhỏ**: Yêu cầu AI cập nhật theo từng phần, không rewrite toàn bộ file HTML 500 dòng từ đầu.
4. **Đồng bộ docs**: Sau mỗi thay đổi tính năng, cập nhật `Docs/features.md` và `README.md`.

---

## Trạng thái Kỹ thuật Nợ (Technical Debt)

| Vấn đề | Mức độ | File |
|---|---|---|
| `authService.js` là skeleton (chỉ TODO) | 🔴 Cao | `src/auth/auth-services/authService.js` |
| `navbar.js` quá lớn (1368 dòng, 49KB) | 🟡 Trung bình | `src/shared/components/navbar.js` |
| `profile.html` inline quá nhiều (53KB) | 🟡 Trung bình | `src/user/user-profile/profile.html` |
| `aftercredit-lounge/index.html` là monolith (35KB) | 🟡 Trung bình | `src/engagement/aftercredit-lounge/index.html` |
| `tailwind-legacy.css` trong nhánh `main` | 🟡 Trung bình | `src/shared/css/tailwind-legacy.css` |
| `group-booking/` không có JS | 🟢 Thấp | `src/booking/group-booking/` |
| `booking-history/` trống (chức năng nằm ở cancel-booking) | 🟢 Thấp | `src/user/booking-history/` |
