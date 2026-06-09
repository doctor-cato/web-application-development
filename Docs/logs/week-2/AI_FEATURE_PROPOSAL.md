# Đề xuất Tính năng AI (AI Feature Proposal)

Dựa trên phân tích từ `PRODUCT_ANALYSIS.md`, dưới đây là các đề xuất chi tiết về việc tích hợp tính năng Trí tuệ Nhân tạo (AI) vào ứng dụng 3HD2Kcinema nhằm nâng cao trải nghiệm người dùng và tăng hiệu quả bán hàng.

## 1. Tính năng AI Đề xuất 1: AI Ticketing Assistant (Chatbot tư vấn & Đặt vé thông minh)

### 1.1 Mục đích và Vấn đề giải quyết
**Vấn đề:** Khách hàng mới truy cập thường mất nhiều thao tác để tìm kiếm suất chiếu phù hợp hoặc tìm hiểu thông tin về phim, giá vé, khuyến mãi. Đôi khi họ cần giải đáp nhanh thay vì tự điều hướng qua nhiều trang.
**Giải pháp:** Chatbot AI tự nhiên, hiểu ngữ cảnh và có khả năng truy xuất dữ liệu từ cơ sở dữ liệu để tư vấn trực tiếp như một nhân viên phòng vé.

### 1.2 Mô tả hoạt động
- Tích hợp một Widget Chat nhỏ ở góc phải màn hình trang chủ và trang đặt vé.
- Người dùng có thể nhập câu hỏi bằng ngôn ngữ tự nhiên:
  - *"Cuối tuần này rạp có phim hành động nào không?"*
  - *"Giá vé xem phim Avatar suất 20:00 ngày mai là bao nhiêu?"*
  - *"Tôi muốn đặt 2 ghế cho phim Spider-Man tối nay."*
- Hệ thống AI sẽ phân tích ý định (Intent), trích xuất thực thể (Entities - Tên phim, thời gian) và gọi API vào hệ thống Backend (MongoDB) để trả về thông tin chính xác. Có thể gửi link trực tiếp để người dùng click vào trang chọn ghế.

### 1.3 Đề xuất Công nghệ
- **Mô hình NLP:** OpenAI API (GPT-3.5/GPT-4) hoặc Gemini API để xử lý ngôn ngữ tự nhiên.
- **Framework:** Langchain hoặc LlamaIndex để thiết lập các AI Agents có khả năng giao tiếp với Database (RAG - Retrieval-Augmented Generation) thông qua vector search hoặc SQL/NoSQL query generation.
- **Tích hợp:** Tạo một endpoint `/api/ai/chat` ở Node.js Backend xử lý request và trả response về React Frontend.

---

## 2. Tính năng AI Đề xuất 2: Personalized Movie Recommendations (Gợi ý phim cá nhân hóa)

### 2.1 Mục đích và Vấn đề giải quyết
**Vấn đề:** Với số lượng phim lớn, người dùng không biết nên xem phim gì. Danh sách hiển thị theo chuẩn (Mới nhất / Phổ biến nhất) thường không đáp ứng đúng "gu" của từng khách hàng.
**Giải pháp:** Tự động đề xuất các bộ phim phù hợp nhất với sở thích của người dùng dựa trên lịch sử dữ liệu của họ.

### 2.2 Mô tả hoạt động
- Thêm một section *"Dành riêng cho bạn"* (Recommended for You) trên trang chủ, hiển thị sau khi người dùng đăng nhập.
- Thu thập dữ liệu ngầm (implicit data): Các phim người dùng đã click xem chi tiết, phim đã đặt vé.
- Thu thập dữ liệu trực tiếp (explicit data): Số sao người dùng đánh giá cho các phim đã xem.
- Khi người dùng ở trang chủ, Backend sẽ tính toán điểm tương đồng và trả về top 5-10 phim phù hợp nhất.
- Tại trang chi tiết phim, cung cấp thêm phần *"Phim tương tự"* (Similar Movies).

### 2.3 Đề xuất Công nghệ
- **Thuật toán:** Collaborative Filtering (Lọc cộng tác dựa trên người dùng hoặc item) và Content-based Filtering (dựa trên thể loại, đạo diễn, diễn viên).
- **Công cụ/Thư viện:** 
  - Đơn giản nhất: Sử dụng MongoDB Aggregation pipeline kết hợp tính toán đơn giản trên Node.js.
  - Phức tạp (AI/ML): Xây dựng một microservice Python bằng thư viện `scikit-learn` hoặc `TensorFlow Recommenders` để train mô hình định kỳ, hoặc sử dụng hệ thống có sẵn của các Cloud Provider (AWS Personalize, GCP Recommendations AI).

---

## Kết luận chọn lựa
Trong khuôn khổ MVP tiếp theo, **AI Ticketing Assistant** là tính năng được ưu tiên phát triển trước vì nó mang lại sự tương tác trực quan ("Wow factor"), dễ dàng demo và cải thiện trực tiếp phễu bán hàng so với Recommendation cần nhiều dữ liệu lịch sử để hoạt động tốt.
