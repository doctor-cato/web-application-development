# Quy định & Hướng dẫn dành cho AI Agent (AI Agent Guide)

Tài liệu này định nghĩa các quy tắc cốt lõi, quy trình làm việc và các điều khoản bắt buộc để các AI Agent (Cursor, Antigravity, GitHub Copilot) tuân thủ khi thao tác với codebase và tài liệu của dự án **3HD2Kcinema**.

---

## 🎯 1. Triết lý Phát triển cho AI (AI Core Philosophy)

- **Code Đơn giản & Dạng Module**: Viết mã nguồn sạch sẽ, sử dụng Vanilla ES6 Modules (`import`/`export`), dễ đọc và dễ mở rộng.
- **TUYỆT ĐỐI TRÁNH Over-Engineering**: Không tự ý cài đặt thêm các framework hay bundler phức tạp (như React, Vue, Angular, Webpack, Vite, Babel) vào phân hệ Frontend Vanilla JS trừ khi có chỉ thị trực tiếp từ người dùng.
- **Code dễ đọc quan trọng hơn code rườm rà**: Ưu tiên sự rõ ràng, giữ nguyên các comment hiện có trong dự án.

---

## 🛡️ 2. Quy tắc Thao tác Codebase

1. **Phạm vi Hoạt động**: AI Agent chỉ được chỉnh sửa các tệp tin trong thư mục `/frontend/src/` cho các công việc giao diện Client-side. Không tự ý chỉnh sửa tệp tin bên trong `/backend/` ngoại trừ trường hợp người dùng yêu cầu nâng cấp API/EF Core Backend.
2. **Quản lý Storage qua Single Source of Truth**:
    - Không gọi trực tiếp `localStorage.getItem()` hay `localStorage.setItem()` rải rác.
    - Mọi thao tác lưu trữ phải gọi qua wrapper `frontend/src/shared/utils/storage.js`.
3. **Bảo tồn và Cập nhật Tài liệu**: Khi thực hiện bất kỳ thay đổi nào về logic nghiệp vụ hoặc cấu trúc dữ liệu, AI Agent **phải chủ động cập nhật các file tài liệu `.md` tương ứng trong thư mục `docs/`**.

---

## 📋 3. Quy trình Bắt buộc TRƯỚC KHI Bắt đầu Làm việc (Pre-Work Checklist)

!!! danger "Yêu cầu Bắt buộc"
    AI Agent PHẢI thực hiện kiểm tra trạng thái Git và đọc lịch sử commit trước khi chỉnh sửa bất kỳ tệp tin nào để tránh gây xung đột (conflict).

### Bước 1: Kiểm tra trạng thái Git
```bash
git fetch origin
git status
```

### Bước 2: Đọc 10 commit gần nhất
```bash
git log origin/main --oneline -10
```
Giúp AI thấu hiểu các thay đổi vừa được thực hiện bởi người dùng hoặc Agent khác.

### Bước 3: Kiểm tra tính đồng bộ
```bash
git log HEAD..origin/main --oneline
```
Nếu có kết quả trả về, remote đang đi trước local -> AI cần thực hiện `git pull origin main` (hoặc `dev2`) trước khi viết code.

---

## 📝 4. Quy trình Bắt buộc SAU KHI Hoàn thành (Post-Work Checklist)

Sau khi hoàn thành công việc và kiểm thử thành công, AI Agent phải thực hiện tạo commit message có định dạng chi tiết:

### Định dạng Commit Message chuẩn dành cho AI Agent
```text
<prefix>(<scope>): <mô tả ngắn gọn bằng tiếng Anh hoặc tiếng Việt>

CHANGED: <danh sách các file đã thay đổi>
NOTE: <thông tin kỹ thuật quan trọng để AI khác đọc sau>
```

#### Ví dụ commit của AI Agent
```text
fix(checkout): resolve SessionStorage key mismatch for checkout flow

CHANGED: frontend/src/booking/checkout/checkout.js, frontend/src/shared/utils/storage.js
NOTE: replaced legacy key `pending_checkout` with unified `cinema_checkout`.
```

---

## ⚖️ 5. Chính sách Sử dụng AI & An toàn Mã nguồn

- **Không tạo dữ liệu giả lập không nhất quán**: Sử dụng đúng các mock key đã được quy định tại [Cơ sở Dữ liệu](database.md).
- **Không phá vỡ API Contract**: Giữ nguyên signature của các hàm tiện ích dùng chung.
- **Không tự ý bỏ qua các bài test lỗi**: Không fix bug bằng cách comment out các bài test Playwright đang báo đỏ.
