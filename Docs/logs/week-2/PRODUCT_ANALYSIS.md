# Phân tích Sản phẩm 3HD2Kcinema (Product Analysis)

Dựa trên yêu cầu của Tuần 2: Phân tích phần mềm gốc hoặc ý tưởng sản phẩm.
Đây là bản phân tích dựa trên phần mềm đã có (ứng dụng web 3HD2Kcinema).

## 1. Mô tả phần mềm gốc
**3HD2Kcinema** là một ứng dụng web fullstack thân thiện với người mới bắt đầu (beginner-friendly), dành cho việc đặt vé xem phim trực tuyến. 
Các tính năng và đặc điểm cốt lõi bao gồm:
- **Giao diện (Frontend):** React, Vite, Tailwind CSS. Giao diện hiện đại, mang phong cách điện ảnh (cinematic dark UI) với các thẻ thành phần tái sử dụng.
- **Hệ thống Backend:** Node.js, Express.js, MongoDB Atlas. Thiết kế theo kiến trúc RESTful API.
- **Tính năng nổi bật:** Xem danh sách phim, chi tiết phim, đặt vé, hồ sơ người dùng, tạo vé bằng mã QR, quản lý rạp và suất chiếu.
- **Tính năng cốt lõi (Core USP):** Khóa ghế theo thời gian thực (Realtime seat locking) sử dụng Socket.io để tránh tình trạng trùng ghế, đi kèm tự động mở khóa ghế khi người dùng không hoạt động (inactive) hoặc ngắt kết nối.

## 2. Xác định điểm yếu hoặc điểm phức tạp
- **Điểm phức tạp:** Tính năng Realtime seat locking đòi hỏi quản lý trạng thái phức tạp (State Management) ở cả Client và Server. Việc duy trì kết nối Socket ổn định và xử lý các trường hợp mạng yếu hoặc lỗi mất kết nối đột ngột dễ dẫn đến tình trạng "kẹt ghế" (ghost seats).
- **Điểm yếu về trải nghiệm người dùng (UX):** Hệ thống hiện tại chủ yếu là luồng một chiều (người dùng tự tìm phim -> chọn suất -> đặt vé). Khi rạp có quá nhiều phim, người dùng dễ bị ngợp và khó chọn được phim đúng sở thích do thiếu công cụ phân tích hoặc gợi ý thông minh. Hỗ trợ khách hàng hoàn toàn thủ công.

## 3. Chọn phiên bản MVP (Minimum Viable Product) đơn giản hơn
Để tối ưu hóa thời gian phát triển và đảm bảo tính ổn định cao nhất, MVP sẽ tập trung vào luồng giá trị chính yếu (Happy Path):
1. **Duyệt danh sách phim:** Xem phim Đang chiếu / Sắp chiếu.
2. **Xem chi tiết và lịch chiếu:** Cấu trúc dữ liệu đơn giản, hiển thị các rạp và suất trong ngày.
3. **Đặt ghế & Khóa ghế (Simplified Realtime):** Giữ lại Socket.io nhưng tối ưu payload, chỉ emit thay đổi ghế khi cần thiết nhất. Bỏ qua các bước thanh toán thật (dùng thanh toán mô phỏng/sandbox).
4. **Vé điện tử cơ bản:** Sau khi đặt, cấp mã QR đơn giản thay vì cần quản lý hệ thống thành viên/ưu đãi phức tạp.

## 4. Đề xuất tính năng AI (Sơ lược)
Để giải quyết điểm yếu trong việc tìm kiếm phim và hỗ trợ người dùng, hệ thống nên bổ sung 2 tính năng AI:
1. **AI Chatbot Assistant:** Tích hợp một chatbot thông minh có khả năng hiểu ngôn ngữ tự nhiên để tư vấn phim, lịch chiếu và hỗ trợ quá trình đặt vé tự động.
2. **AI Movie Recommendation Engine:** Hệ thống gợi ý phim được cá nhân hóa dựa trên lịch sử đặt vé và đánh giá của người dùng.

*(Chi tiết về các tính năng AI sẽ được trình bày trong file AI_FEATURE_PROPOSAL.md)*
