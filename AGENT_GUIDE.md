# Hướng dẫn dành cho AI Agent (Agent Guide)

Tài liệu này định nghĩa các quy tắc cốt lõi để các AI Agent (Cursor, Antigravity, GitHub Copilot) tuân thủ khi thao tác với codebase và tài liệu của 3HD2Kcinema.

## 1. Triết lý phát triển (Development Philosophy)
- Code cần: Hiện đại, Sạch sẽ, Dạng module (ES6 Modules), Dễ đọc, Dễ mở rộng.
- TRÁNH (Avoid): Overengineering, trừu tượng hóa không cần thiết, quản lý state quá phức tạp, tối ưu hóa sớm (premature optimization), và tạo ra các file quá lớn.
- **Code dễ đọc quan trọng hơn code thông minh/rườm rà.**

## 2. Quy tắc Frontend (HTML / CSS / JS)
- Sử dụng mã nguồn thuần (Vanilla HTML5, CSS3, ES6+ JavaScript).
- Phân định rõ công nghệ theo nhánh (branch):
  - **Nhánh `main`**: Sử dụng Vanilla CSS với phong cách Cinematic Noir, Glassmorphism. Tuyệt đối không dùng thư viện ngoài hay Tailwind CSS CDN.
  - **Nhánh `dev` (không phải dev2)**: Cho phép sử dụng Tailwind CSS.
- Sử dụng cấu trúc module JavaScript (`<script type="module">`) để chia nhỏ file logic thay vì viết code gộp trong một file lớn.
- Sử dụng CSS Custom Properties (Variables) để thiết lập design tokens nhất quán (màu sắc, khoảng cách, font chữ).
- Tất cả các tương tác UI (DOM manipulation) phải nhẹ nhàng, tối ưu hiệu năng và có hiệu ứng chuyển cảnh mượt mà.

## 3. Quy tắc Dữ liệu & Storage (Không Backend)
- **Database:** Sử dụng `LocalStorage` cho các dữ liệu cần lưu trữ lâu dài (tài khoản người dùng, danh sách phim mặc định, lịch sử đặt vé).
- **Session:** Sử dụng `SessionStorage` để quản lý trạng thái phiên đăng nhập của người dùng và thông tin giỏ hàng tạm thời.
- Viết các service quản lý dữ liệu (ví dụ: `shared/utils/storage.js`) làm lớp trung gian (Wrapper) để thao tác với `LocalStorage`/`SessionStorage` nhằm tránh gọi trực tiếp khắp nơi trong code.
- **Storage keys thực tế:** `cinema_users`, `cinema_bookings`, `cinema_seat_locks`, `cinema_checkout`, `cinema_current_user` — xem chi tiết tại `Docs/data-storage.md`.

## 4. Quy tắc cho Realtime Seat Booking (Tính năng giả lập)
- Đây là tính năng sống còn. Cần ngăn chặn trùng lặp ghế (double booking) và đồng bộ trạng thái.
- **Đồng bộ đa tab (Multi-tab Sync):** Sử dụng **BroadcastChannel API** (channel: `seat_sync`) để truyền tin nhắn đồng bộ trạng thái chọn ghế giữa các tab/cửa sổ trình duyệt khác nhau đang mở ứng dụng.
- **Giả lập người dùng khác (Simulation):** Sử dụng `setInterval` (mỗi 10 giây) trong `booking.js` để giả lập các sự kiện người dùng khác đang đặt/nhả ghế ngẫu nhiên.
- **Tự động nhả (unlock) ghế:** Ghế tự động được giải phóng sau **15 phút** (`LOCK_DURATION_MS = 15 * 60 * 1000` trong `bookingService.js`).

## 5. Quy trình làm việc & Tài liệu (Workflow & Docs)
- **Đồng bộ tài liệu:** Khi có bất kỳ thay đổi nào về tính năng, AI phải tự động nhắc nhở hoặc thực hiện việc cập nhật các file tài liệu chuẩn. **LƯU Ý:** Chỉ đọc và chỉnh sửa các file `.md` trong thư mục `Docs/`.
- Các nhánh chính: `main`, `develop`.
- Quy ước Commit: Dùng các tiền tố `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `style:`.

## 6. Quy trình bắt buộc TRƯỚC KHI bắt đầu làm việc (Pre-Work Checklist)

> **AI PHẢI thực hiện đầy đủ các bước này trước khi chỉnh sửa bất kỳ file nào.**
> Mục đích: tránh conflict, hiểu đúng trạng thái hiện tại của codebase.

### Bước 1 — Đồng bộ với remote
```bash
git fetch origin
git status
```
- `git fetch` tải trạng thái mới nhất từ remote về local (không merge).
- `git status` cho biết branch hiện tại và file nào đang thay đổi.

### Bước 2 — Đọc lịch sử commit gần nhất
```bash
git log origin/main --oneline -10
```
Đọc kỹ **toàn bộ 10 commit gần nhất**. Mỗi commit message cho biết:
- AI/người nào vừa làm gì (`feat:`, `fix:`, `docs:`, ...)
- File nào đã thay đổi (đọc thêm bằng `git show <hash>`)

### Bước 3 — Kiểm tra xem local có bị lỗi thời không
```bash
git log HEAD..origin/main --oneline
```
- Nếu có output → remote đang **đi trước** local → cần pull trước khi code.
- Nếu trống → local đang đồng bộ, an toàn để làm việc.

### Bước 4 — Pull nếu cần
```bash
git pull origin main
```

### Bước 5 — Đọc docs liên quan
Trước khi sửa code, đọc file docs tương ứng:
- Sửa tính năng → đọc `Docs/features.md`
- Sửa storage → đọc `Docs/data-storage.md`
- Sửa kiến trúc → đọc `Docs/architecture.md`

---

## 7. Quy trình COMMIT & PUSH (Post-Work Checklist)

> Commit message phải đủ rõ để AI khác đọc và hiểu ngay **không cần xem code**.

### Format commit message chuẩn
```
<prefix>(<scope>): <mô tả ngắn gọn bằng tiếng Anh hoặc Việt>

[body — tùy chọn, giải thích tại sao, không phải cái gì]
[CHANGED: danh sách file đã thay đổi]
[NOTE: thông tin quan trọng cho AI đọc sau]
```

### Ví dụ commit message tốt cho AI
```
docs(all): sync all Docs + README with actual codebase state

CHANGED: README.md, Docs/overview.md, Docs/architecture.md,
         Docs/features.md, Docs/data-storage.md, Docs/workflows.md
NOTE: storage keys are cinema_* (not users_db). Lock timeout is 15min not 5min.
      authService.js is a skeleton (TODO only). npm run dev now uses `serve src -l 3000`.
```

```
feat(booking): add seat lock auto-release on tab close

CHANGED: src/booking/seat-booking/bookingService.js
NOTE: uses beforeunload event. Lock duration stays 15min.
```

```
fix(checkout): fix SessionStorage key mismatch cinema_checkout vs pending_checkout

CHANGED: src/booking/checkout/checkout.js, src/shared/utils/storage.js
NOTE: old key `pending_checkout` removed, now uses KEYS.CHECKOUT = `cinema_checkout`
```

### Lệnh push sau khi commit
```bash
git add .
git commit -m "your message"
git push origin main
```

### Nếu push bị rejected (conflict)
```bash
git fetch origin
git log HEAD..origin/main --oneline        # xem commit của người khác
git show <commit-hash>                     # đọc chi tiết thay đổi
git pull --rebase origin main              # rebase thay vì merge để giữ history sạch
# Giải quyết conflict → git add . → git rebase --continue
git push origin main
```
