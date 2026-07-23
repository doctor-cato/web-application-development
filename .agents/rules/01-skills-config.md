# AI Skills Configuration & Routing (3HD2Kcinema Project)

Tệp này định nghĩa các quy tắc kích hoạt và bộ kỹ năng (Skills) đã qua sàng lọc cho các AI Agent (Google Antigravity, Cursor, Copilot) khi làm việc trong repository `web-application-development`.

---

## 📊 Thống kê Bộ Skills (Skill Matrix Overview)

- **Tổng số skill trong hệ thống**: 37 skills
- **Số skill KÍCH HOẠT (Active Skills)**: 13 skills (Phù hợp với Stack Web HTML/CSS/JS/C#)
- **Số skill LOẠI BỎ (Disabled Skills)**: 24 skills (Phân hệ Mobile/Flutter/Dart/Chrome Extension không liên quan)

---

## 🎯 1. Danh sách Active Skills & Điều kiện Kích hoạt (Skill Routing Table)

| Skill Name | Phân loại | Mục đích & Lợi ích | Điều kiện kích hoạt tự động (Triggers) |
|---|---|---|---|
| **`modern-web-guidance`** | Frontend Web | Tra cứu best practices HTML5, CSS3, ES6 JS, Glassmorphic UI, animations, responsive design. | Khi tạo/chỉnh sửa giao diện UI, tệp HTML, CSS, Tailwind, hoặc JS Modules trong `frontend/`. |
| **`a11y-debugging`** | Web Accessibility | Audit và debug khả năng truy cập (A11y) theo chuẩn WCAG / web.dev qua Playwright & Axe-core. | Khi làm việc với `tests/e2e/accessibility.spec.js`, kiểm tra ARIA labels, focus states, tap targets. |
| **`chrome-devtools`** | Web Inspection | Debug DOM, xem network payloads, kiểm tra console logs và tự động hóa trình duyệt qua MCP. | Khi debug lỗi client-side runtime, kiểm tra API calls, hoặc phân tích DOM elements. |
| **`debug-optimize-lcp`** | Performance | Chẩn đoán & tối ưu chỉ số LCP (Largest Contentful Paint) và Core Web Vitals. | Khi tối ưu tốc độ tải ảnh poster phim, banner cinema, hoặc tối ưu trải nghiệm người dùng. |
| **`memory-leak-debugging`** | Performance | Chẩn đoán leak bộ nhớ JS, event listeners rải rác, BroadcastChannel không cleanup. | Khi làm việc với `BroadcastChannel('seat_sync')`, `storage.js` wrapper, hoặc multi-tab sync. |
| **`troubleshooting`** | Infrastructure | Xử lý sự cố kết nối Chrome DevTools MCP server và target issues. | Khi gặp lỗi ngắt kết nối với DevTools MCP hoặc trình duyệt headless. |
| **`antigravity-guide`** | AI Assistant | Tra cứu tài liệu sitemap, slash commands, cấu hình Antigravity CLI/IDE/SDK. | Khi cần trợ giúp về cách vận hành Antigravity, cấu hình rules/skills/MCP. |
| **`google-antigravity-sdk`** | AI Agent SDK | Hướng dẫn lập trình và điều phối AI Agents / Subagents. | Khi tạo mới hoặc định nghĩa subagent bằng `define_subagent` / `invoke_subagent`. |
| **`ponytail`** | Code Quality | Chuyển đổi mức độ tối ưu Ponytail (lite/full/ultra/off) tránh over-engineering. | Khi thiết lập mức độ kiểm soát độ phức tạp mã nguồn. |
| **`ponytail-audit`** | Code Quality | Rà soát toàn bộ repo để phát hiện code thừa, over-engineering, code trùng lặp. | Khi thực hiện chiến dịch refactor dọn dẹp dự án. |
| **`ponytail-gain`** | Code Quality | Báo cáo lượng token và dòng code đã tiết kiệm được. | Khi đánh giá hiệu quả tối ưu hóa. |
| **`ponytail-help`** | Code Quality | Hướng dẫn tra cứu lệnh và mức độ ponytail. | Khi cần hỗ trợ sử dụng Ponytail. |
| **`ponytail-review`** | Code Quality | Review diff/PR để đảm bảo code gọn nhẹ, không over-engineered. | Khi thực hiện Post-Work Checklist hoặc Code Review. |

---

## ⛔ 2. Danh sách Disabled Skills (Bị loại bỏ khỏi Repo)

Các kỹ năng dưới đây **KHÔNG ĐƯỢC KÍCH HOẠT** trong repository này do không thuộc stack công nghệ của dự án `3HD2Kcinema`:

1. **`android-cli`**: Không có mã nguồn Android Native (Java/Kotlin/Gradle).
2. **`chrome-extensions`**: Dự án là Web Application tĩnh/C#, không phải Browser Extension Manifest V3.
3. **Các skills Dart / Flutter (22 skills)**:
   - `dart-add-unit-test`, `dart-build-cli-app`, `dart-collect-coverage`, `dart-fix-runtime-errors`, `dart-generate-test-mocks`, `dart-migrate-to-checks-package`, `dart-resolve-package-conflicts`, `dart-run-static-analysis`, `dart-setup-ffi-assets`, `dart-use-ffigen`, `dart-use-pattern-matching`, `dart-use-primary-constructors`
   - `flutter-add-integration-test`, `flutter-add-widget-preview`, `flutter-add-widget-test`, `flutter-apply-architecture-best-practices`, `flutter-build-responsive-layout`, `flutter-fix-layout-issues`, `flutter-implement-json-serialization`, `flutter-setup-declarative-routing`, `flutter-setup-localization`, `flutter-use-http-package`

---

## 🛠️ 3. Quy tắc Thực thi dành cho AI Agent

- **Tự động áp dụng**: Khi AI Agent nhận được yêu cầu liên quan đến các tác vụ Web, DevTools, A11y, Performance, hoặc Refactor, AI **phải ưu tiên** kích hoạt các Active Skills tương ứng ở Bảng 1.
- **Không đề xuất các framework/skill thuộc danh sách Disabled**: AI không được gợi ý chuyển đổi dự án sang Flutter hoặc viết plugin Android.
