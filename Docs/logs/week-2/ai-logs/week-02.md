# Nhật ký Phát triển - Tuần 2 (Week 02)
**Ngày:** 27/05/2026
**Môn học / Giai đoạn:** Phân tích sản phẩm và Đề xuất tính năng AI

## 1. Mục tiêu tuần
- Ngừng việc nhảy trực tiếp vào code để ưu tiên giai đoạn phân tích nghiệp vụ và kiến trúc phần mềm.
- Đánh giá hiện trạng ứng dụng 3HD2Kcinema dựa trên tài liệu (FEATURES.md, README.md, AGENTS.md).
- Xác định điểm mạnh, điểm yếu và các module phức tạp của hệ thống.
- Đề xuất các tính năng AI có tính khả thi, phù hợp để áp dụng cho phiên bản tiếp theo (MVP + AI).

## 2. Các hoạt động đã thực hiện
- Đọc và review toàn bộ kiến trúc tài liệu trong project `3hd2kcinema`.
- Lập tài liệu **PRODUCT_ANALYSIS.md**: Phân tích luồng hoạt động chính, đánh giá sự phức tạp của cơ chế Realtime seat locking bằng Socket.io, và chốt phiên bản MVP.
- Lập tài liệu **AI_FEATURE_PROPOSAL.md**: Nghiên cứu và đề xuất 2 tính năng trí tuệ nhân tạo:
  1. AI Ticketing Assistant (Chatbot tư vấn & đặt vé)
  2. AI Personalized Movie Recommendations (Gợi ý phim cá nhân hóa)

## 3. Kết quả đạt được
- Đã xuất bản thành công 2 file báo cáo vào thư mục `docs/logs/`.
- Xác định được trọng tâm cho các Sprint tiếp theo: Sẽ tập trung vào việc nghiên cứu API của OpenAI / Gemini và xây dựng Backend route để tích hợp tính năng **AI Ticketing Assistant**.

## 4. Các vấn đề / Khó khăn (Blockers)
- Hiện tại chưa gặp khó khăn kỹ thuật nào do tuần này tập trung hoàn toàn vào phân tích và thiết kế ý tưởng trên giấy.
- Cần lên kế hoạch chi tiết về cách quản lý chi phí API (API cost) khi tích hợp LLM vào thực tế ở các tuần sau.

## 5. Kế hoạch tuần tiếp theo (Week 03)
- Bắt đầu setup môi trường Backend để làm việc với API của LLM.
- Xây dựng bản Prototype cho tính năng AI Chatbot.
- Cập nhật tài liệu API (Swagger/Postman) cho phần AI.
