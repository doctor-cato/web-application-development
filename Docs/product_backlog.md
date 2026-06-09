# 3HD2Kcinema - Product Feature Identification & Product Backlog

Tài liệu này xác định các tính năng cốt lõi và danh sách công việc (Product Backlog) của dự án ứng dụng đặt vé xem phim trực tuyến **3HD2Kcinema** được phát triển trên nền tảng **HTML, CSS và JavaScript thuần (Vanilla JS)**.

---

## 4. Product Feature Identification (Xác định tính năng sản phẩm)

**Gom nhóm User Stories thành Tính năng (Epic/Feature):**

| Tính năng cốt lõi (Feature) | Giải quyết cho User Story nào? | Công nghệ và Cách tiếp cận Client-Side |
| :--- | :--- | :--- |
| **Giao diện rạp phim điện ảnh (Cinematic UI & Movie Browse)** | **US1** (Khách muốn xem danh sách phim đang/sắp chiếu và thông tin chi tiết phim) | HTML5, CSS3, JavaScript DOM. Dữ liệu phim lưu trong file JSON cục bộ. |
| **Khóa ghế thời gian thực giả lập (Realtime Seat Locking Simulation)** | **US2** (Khách muốn thấy sơ đồ ghế ngồi trực quan và đồng bộ trạng thái ghế đang được chọn) | JavaScript DOM và **BroadcastChannel API** (đồng bộ đa tab) kết hợp **JS Web Timers** giả lập người dùng khác. |
| **Quy trình Checkout & Đặt trước bắp nước (Checkout Flow & Snack Booking)** | **US3** (Thành viên muốn chọn combo bắp nước đi kèm và tiến hành thanh toán nhanh chóng) | Quản lý giỏ hàng tạm thời qua **SessionStorage** và cập nhật tổng tiền bằng JS. |
| **Giả lập cổng thanh toán trực tuyến (Simulated Payment Gateway)** | **US4** (Thành viên muốn thanh toán qua ví điện tử MoMo/VNPAY mô phỏng) | Trang HTML thanh toán giả lập quy trình nhập thông tin và xác nhận giao dịch cục bộ. |
| **Vé điện tử mã QR (QR Ticket Generator & History)** | **US5** (Thành viên muốn nhận vé điện tử có mã QR lưu offline) | Thư viện `qrcode.js` tạo mã QR trực tiếp trên trình duyệt, lưu thông tin vé vào **LocalStorage**. |
| **Bảng điều khiển quản trị giả lập (Simulated Admin Dashboard)** | **US6** (Admin muốn quản lý danh sách phim, suất chiếu và xem doanh thu mô phỏng) | Giao diện Admin quản trị cục bộ, cập nhật trực tiếp danh sách phim và suất chiếu trong **LocalStorage**. |
| **Đánh giá & Bình luận phim (Movie Review & Rating System)** | **US7** (Thành viên muốn để lại đánh giá sao và bình luận nhận xét về bộ phim) | Form bình luận cập nhật DOM và lưu dữ liệu review vào danh sách tương ứng trên **LocalStorage**. |

---

## 5. Product Backlog (Danh sách công việc của sản phẩm)

**Product Backlog của 3HD2Kcinema (Phiên bản Client-Side thuần):**

| Ưu tiên | Hạng mục (Item) | Vai trò (Persona) | Cách triển khai kỹ thuật | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **1 (Cao nhất)** | **Trang chủ & Danh sách phim** | Khách vãng lai & Thành viên | Đọc dữ liệu phim tĩnh qua JS và hiển thị banner, danh sách Đang chiếu / Sắp chiếu | Đang làm |
| **2 (Cao)** | **Trang chi tiết phim & Lịch chiếu** | Khách vãng lai & Thành viên | Hiển thị trailer, thông tin chi tiết phim, lịch chiếu tương ứng lọc qua JS | Đang làm |
| **3 (Cao)** | **Sơ đồ phòng chiếu & Chọn ghế** | Thành viên | Vẽ sơ đồ ghế bằng CSS Grid và quản lý sự kiện click chọn ghế trong JS | Cần làm |
| **4 (Cao)** | **Đồng bộ khóa ghế giả lập** | Thành viên | Tích hợp **BroadcastChannel** truyền tin đa tab và hàm thời gian (`setInterval`) giả chọn ghế | Cần làm |
| **5 (Trung bình)** | **Đăng ký / Đăng nhập (Local Auth)** | Khách vãng lai | Quản lý tài khoản và thông tin phiên đăng nhập qua **LocalStorage / SessionStorage** | Đang làm |
| **6 (Trung bình)** | **Đặt bắp nước & Trang Checkout** | Thành viên | Tính toán combo bắp nước đi kèm và chuyển tiếp giỏ hàng qua SessionStorage | Cần làm |
| **7 (Trung bình)** | **Mô phỏng thanh toán trực tuyến** | Thành viên | Giao diện hiển thị mã QR thanh toán hoặc nhập thẻ giả lập, trả về mã trạng thái thành công | Chờ xử lý |
| **8 (Thấp)** | **Tạo vé QR Code cục bộ** | Thành viên | Dùng thư viện QR JS vẽ mã vé, lưu thông tin giao dịch vào LocalStorage của tài khoản | Chờ xử lý |
| **9 (Thấp)** | **Trang Admin Dashboard giả lập** | Admin | Chỉnh sửa danh sách phim, suất chiếu lưu trong LocalStorage để các trang bán vé đọc dữ liệu mới | Chờ xử lý |
| **10 (Thấp)** | **Đánh giá & Bình luận cục bộ** | Thành viên | Viết và đọc đánh giá phim lưu trực tiếp trong LocalStorage của trình duyệt | Ý tưởng |
| **11 (Thấp)** | **Gợi ý phim AI trên trình duyệt** | Thành viên | Phân tích tag phim và lịch sử xem trong LocalStorage bằng module JS thuật toán đơn giản | Ý tưởng |
