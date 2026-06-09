# Chính sách sử dụng AI (AI Usage Policy)

Tài liệu này quy định cách thức đội ngũ phát triển (Human Developers) và chính các công cụ AI (Cursor, Antigravity, IDE Extensions) được phép hoạt động trong dự án 3HD2Kcinema để đảm bảo chất lượng code và tài liệu.

## 1. Vai trò của AI trong dự án
AI được coi là một "Trợ lý lập trình" (Pair Programmer) thay vì người quyết định kiến trúc chính. AI nên được sử dụng để tăng tốc độ phát triển, duy trì tính nhất quán, không phải để thay thế hoàn toàn sự kiểm duyệt của con người.

## 2. Những điều NÊN làm (DOs)
- **Duy trì tính nhất quán tài liệu (Chuẩn MD):** Dùng AI để đồng bộ hóa thông tin giữa code và các file tài liệu định nghĩa yêu cầu (như User Story US01-US07). AI CHỈ LÀM VIỆC với các file `.md` (Markdown), hoàn toàn bỏ qua các file `.docx`.
- **Tạo Boilerplate:** Dùng AI để sinh ra các cấu trúc thư mục, component cơ bản, hoặc các schema chuẩn.
- **Xử lý code lặp lại:** Giao cho AI các tác vụ nhàm chán như viết mapping data, tạo dummy data, hoặc viết các đoạn CSS lặp lại.
- **Hỗ trợ Debug:** Dùng AI để phân tích log lỗi, giải thích nguyên nhân gốc rễ (root cause) và cung cấp các bước sửa lỗi (step-by-step fixes).
- **Refactor code:** Dùng AI để tách các component lớn thành các module nhỏ hơn theo nguyên tắc Clean Code.
- **Viết Document & Comment:** Dùng AI để tạo docstrings cho các hàm phức tạp hoặc viết tài liệu API.

## 3. Những điều KHÔNG ĐƯỢC làm (DON'Ts)
- **Không tạo toàn bộ App/Feature cùng lúc:** Không yêu cầu AI sinh ra một tính năng quá lớn (vd: "Viết toàn bộ luồng thanh toán") trong một lần prompt. Phải chia nhỏ ra (Thêm UI -> Thêm API -> Ghép nối).
- **Không tin tưởng mù quáng:** Tuyệt đối không commit thẳng code do AI sinh ra mà không đọc hiểu hoặc không có quá trình review thủ công.
- **Không cài đặt Dependencies không cần thiết:** AI thường có xu hướng gợi ý cài thêm các thư viện bên ngoài để giải quyết vấn đề nhanh. Developer phải tự hỏi "Có thể dùng code tự viết (native) hoặc các thư viện đang có sẵn để làm việc này không?".
- **Không phá vỡ Kiến trúc & Document:** Không để AI tự ý thay đổi design pattern hiện tại, cũng không được làm thay đổi cấu trúc tài liệu gốc. **Không được đụng vào các file `.docx` trong dự án**.

## 4. Xử lý lỗi (Debugging Philosophy)
Khi dùng AI để debug, yêu cầu AI giải thích *tại sao* lỗi xảy ra thay vì chỉ cung cấp đoạn code sửa. Các khu vực thường xuyên ưu tiên kiểm tra: Chuỗi kết nối Database (Database Connection URI), CORS, các kết nối Realtime (Socket.io/SSE), và Middleware xác thực (JWT/Session).
