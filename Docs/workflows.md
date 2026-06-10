# Quy trình Phát triển & Git

## Quy tắc Code

Khi làm việc với codebase này:
1. **Không bao giờ** import các module Node bên ngoài hoặc sử dụng các gói bundler trừ khi hoàn toàn bắt buộc. Luôn phải bám sát theo chuẩn Vanilla ES6 `<script type="module">`.
2. **Không bao giờ** viết các logic thao tác với DOM bên trong các thư mục dịch vụ (ví dụ: `auth-services/`).
3. **Không bao giờ** viết các lệnh `setItem`/`getItem` của `LocalStorage` trực tiếp bên trong các trang. Mọi thứ phải luôn đi qua file `storage.js`.

---

## Luồng Git (Git Flow)

Dự án dựa trên một chiến lược phân nhánh cô lập và gọn gàng:

* **`main`**: Nhánh ổn định. Code tại nhánh này bắt buộc phải chạy mượt mà thông qua một máy chủ HTTP tĩnh.
* **`develop`**: Nhánh để hội nhập (integration branch).
* **`feature/*`**: Tạo các nhánh tính năng (feature branches) tách ra từ `develop` (Ví dụ: `feature/payment-gateway`).

### Commits
Sử dụng các tiền tố commit theo chuẩn ngữ nghĩa (semantic):
* `feat:` dành cho UI/logic mới.
* `fix:` dành cho việc sửa lỗi (bug fixes).
* `docs:` dành cho các thay đổi về file markdown tài liệu.
* `refactor:` dành cho các thay đổi tái cấu trúc (ví dụ: di chuyển các file ra khỏi `assets/`).

---

## Quy trình làm việc cùng AI (Cursor / Copilot / Antigravity)

Khi sử dụng các agent AI trên repository này:
1. **Giới hạn Ngữ cảnh (Context Limit)**: Chỉ hướng AI đến việc đọc các tệp markdown trong thư mục `Docs/`. Tuyệt đối ngăn cấm AI đọc hoặc ghi các tệp `.docx`.
2. **Không Thiết kế quá mức (No Over-Engineering)**: Nếu một AI cố gắng tạo ra các component React (`.jsx`) hoặc các route Express, hãy lập tức dừng quá trình khởi tạo đó lại. Nhắc nhở AI đọc file `Docs/architecture.md` để tuân thủ nghiêm ngặt các ràng buộc chỉ sử dụng Vanilla HTML/CSS/JS.
3. **Sửa đổi gọn gàng (Clean Diffs)**: Hãy chỉ thị cho AI cập nhật code theo dạng module (từng phần nhỏ) thay vì bắt AI viết lại toàn bộ một tệp HTML dài 500 dòng từ đầu.
