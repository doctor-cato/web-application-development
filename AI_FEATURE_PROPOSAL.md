# Đề xuất Tính năng AI (AI Feature Proposal)

Dự án `3HD2Kcinema` dự kiến tích hợp các tính năng AI chạy trực tiếp trên client hoặc thông qua các API gọn nhẹ để nâng cao trải nghiệm người dùng trong môi trường thuần **HTML, CSS và JavaScript**.

## 1. Gợi ý phim thông minh (AI Movie Recommendation)
- **Mô tả:** Sử dụng thuật toán chạy trực tiếp bằng JavaScript trên trình duyệt (phân tích lịch sử xem phim và thể loại được lưu trong `LocalStorage`) để đề xuất các bộ phim sắp chiếu phù hợp.
- **Cách triển khai:** Viết module `js/services/aiRecommendation.js` thực hiện so khớp sở thích (Content-based filtering) dựa trên dữ liệu tag của phim và lịch sử đặt vé của người dùng trong trình duyệt.
- **Giá trị mang lại:** Phản hồi đề xuất tức thì mà không cần server-side processing, tăng tính riêng tư vì toàn bộ dữ liệu lịch sử không rời khỏi trình duyệt của người dùng.

## 2. Trợ lý ảo hỗ trợ đặt vé (AI Booking Assistant Chatbot)
- **Mô tả:** Tích hợp một Chatbot mô phỏng trí tuệ nhân tạo ngay trên giao diện. Người dùng có thể nhập các câu lệnh tự nhiên (ví dụ: "Đặt 2 vé phim hành động tối nay") và chatbot sẽ tự động phân tích cú pháp để điều hướng đến đúng phim và suất chiếu thích hợp.
- **Cách triển khai:** Sử dụng một bộ phân tích cú pháp và so khớp từ khóa (Rule-based NLP) viết bằng JavaScript thuần để nhận diện phim, số lượng vé, và thời gian từ câu chat, sau đó cập nhật DOM để hiển thị kết quả. Hoặc tích hợp một API gọi trực tiếp đến mô hình Gemini/OpenAI client-side (yêu cầu cấu hình key bảo mật của người dùng).
- **Giá trị mang lại:** Tạo ra phương thức tương tác nhanh chóng, thân thiện và chứng minh khả năng xử lý ngôn ngữ tự nhiên cơ bản ngay trên Client.

## 3. Tự động tóm tắt đánh giá phim (Sentiment & Review Summary)
- **Mô tả:** Tự động phân tích các bình luận của người dùng đối với mỗi phim để tổng hợp lại thành một thang điểm "Cảm xúc chung" (ví dụ: 85% Tích cực, 15% Tiêu cực) và hiển thị tóm tắt ngắn.
- **Cách triển khai:** Sử dụng một từ điển phân tích cảm xúc (Sentiment lexicon) bằng tiếng Việt dạng JSON tải cục bộ, chạy một đoạn code JS nhỏ để chấm điểm tích cực/tiêu cực cho các review phim lưu trong `LocalStorage`.
- **Giá trị mang lại:** Giúp người dùng có cái nhìn tổng quan về bộ phim ngay lập tức mà không cần đọc thủ công toàn bộ bình luận.
