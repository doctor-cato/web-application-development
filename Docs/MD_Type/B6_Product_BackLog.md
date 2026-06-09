# **BƯỚC 6: XÁC ĐỊNH TÍNH NĂNG VÀ PRODUCT BACKLOG**

---

### **1. Product Feature Identification (Xác định tính năng sản phẩm)**

> **Khái niệm cho sinh viên:** Sinh viên thường bị nhầm lẫn giữa User Story và Feature. User Story là nhu cầu (ví dụ: tôi muốn đặt vé nhanh). Feature là giải pháp kỹ thuật/tính năng giải quyết nhu cầu đó (ví dụ: Quy trình đặt vé 3 bước siêu tốc).

**Gom nhóm User Stories thành Tính năng (Epic/Feature):**

| Tính năng cốt lõi (Feature) | Giải quyết cho User Story nào? |
| :--- | :--- |
| **Giao diện rạp phim điện ảnh (Cinematic UI & Movie Browse)** | **US01** (Khách muốn tra cứu lịch chiếu và thông tin phim trực quan) |
| **Khóa ghế thời gian thực (Real-time Seat Locking via Socket.io)** | **US02** (Khách muốn thấy sơ đồ ghế ngồi trực quan và trạng thái chọn ghế real-time để tránh đặt trùng) |
| **Đặt trước bắp nước (Snack Booking & Up-sell)** | **US03** (Thành viên muốn chọn combo bắp nước ngay trong quy trình checkout để thanh toán trước) |
| **Tích hợp thanh toán & Vé điện tử QR (Payment & QR Ticket)** | **US04** (Thành viên muốn thanh toán trực tuyến an toàn và nhận vé điện tử QR Code để soát vé nhanh chóng) |
| **Đăng ký & Đăng nhập thành viên (Authentication & JWT)** | **US05** (Khách vãng lai muốn đăng ký/đăng nhập tài khoản để lưu lịch sử giao dịch và tích lũy điểm thưởng) |
| **Booking nhóm & Chia tiền tự động (Split & Lock)** | **US06** (Nhóm bạn muốn giữ ghế chung và tự động chia đều hóa đơn thanh toán riêng lẻ trực tuyến) |
| **Đánh giá phim & Bảng điều khiển quản trị (Reviews & Admin Dashboard)** | **US07** (Thành viên muốn gửi đánh giá sao/bình luận phim; và Admin muốn quản lý suất chiếu/doanh thu) |

---

### **2. Product Backlog (Danh sách công việc của sản phẩm)**

> **Khái niệm cho sinh viên:** Product Backlog là "trái tim" của Agile. Đó là một danh sách chứa tất cả các User Stories, Features cần làm, được sắp xếp theo thứ tự ưu tiên. Cái nào mang lại giá trị sinh tồn cho app sẽ nằm ở trên cùng và phải làm trước (MVP - Minimum Viable Product).

**Product Backlog của 3HD2Kcinema (Phiên bản sơ khai nhất):**

| Ưu tiên | Hạng mục (Item) | Vai trò (Persona) | Trạng thái |
| :--- | :--- | :--- | :--- |
| **1 (Cao nhất)** | **Trang chủ & Danh sách phim**<br>(Hiển thị banner nổi bật, danh sách phim Đang chiếu / Sắp chiếu) | Khách vãng lai & Thành viên | Cần làm (To-do) |
| **2 (Cao)** | **Trang chi tiết phim & Lịch chiếu**<br>(Xem trailer, đạo diễn, diễn viên, thời lượng, lịch chiếu theo rạp) | Khách vãng lai & Thành viên | Cần làm (To-do) |
| **3 (Cao)** | **Sơ đồ phòng chiếu & Chọn ghế**<br>(Hiển thị sơ đồ ghế ngồi trực quan phân loại ghế Thường, VIP, Đôi) | Thành viên | Cần làm (To-do) |
| **4 (Cao)** | **Đồng bộ khóa ghế thời gian thực**<br>(Tích hợp Socket.io hiển thị ghế người khác đang chọn và giữ ghế tạm thời trong 5 phút) | Thành viên | Cần làm (To-do) |
| **5 (Trung bình)** | **Đăng ký / Đăng nhập (JWT)**<br>(Xác thực tài khoản thành viên để lưu lịch sử giao dịch và tích điểm) | Khách vãng lai | Cần làm (To-do) |
| **6 (Trung bình)** | **Đặt bắp nước & Trang Checkout**<br>(Chọn combo bắp nước đi kèm và xác nhận thông tin vé đặt) | Thành viên | Cần làm (To-do) |
| **7 (Trung bình)** | **Tích hợp cổng thanh toán trực tuyến**<br>(Thanh toán qua cổng ví điện tử MoMo/VNPAY giả lập hoặc tích hợp thật) | Thành viên | Cần làm (To-do) |
| **8 (Thấp)** | **Booking nhóm & Tự chia tiền (Split bill)**<br>(Tạm khóa ghế cho nhóm và gửi link tự thanh toán trực tuyến riêng lẻ) | Thành viên | Cần làm (To-do) |
| **9 (Thấp)** | **Xuất vé điện tử QR Code**<br>(Tạo mã QR chứa cả thông tin vé và bắp nước, xem được ngoại tuyến khi không có mạng) | Thành viên | Cần làm (To-do) |
| **10 (Thấp)** | **Trang Admin Dashboard**<br>(Giao diện quản lý phim, rạp, suất chiếu, combo bắp nước và báo cáo doanh thu) | Admin | Cần làm (To-do) |
| **11 (Thấp)** | **Đánh giá & Bình luận phim**<br>(Thành viên gửi review phim và chấm điểm sao sau khi xem) | Thành viên | Ý tưởng (Backlog) |
| **12 (Thấp)** | **Gợi ý phim thông minh bằng AI**<br>(Hệ thống tự động đề xuất phim theo sở thích và lịch sử xem của thành viên) | Thành viên | Ý tưởng (Backlog) |
