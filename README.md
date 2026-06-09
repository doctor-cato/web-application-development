# 3HD2Kcinema - Online Movie Ticket Booking Application

[![GitHub Issues](https://img.shields.io/github/issues/doctor-cato/software-engineering-project)](https://github.com/doctor-cato/software-engineering-project/issues)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20HTML%20CSS%20JS-blue.svg)]()

**3HD2Kcinema** là ứng dụng đặt vé xem phim trực tuyến thế hệ mới, được xây dựng hoàn toàn bằng các công nghệ web cơ bản: **HTML, CSS và JavaScript thuần (Vanilla JS)**. Dự án tập trung vào trải nghiệm đặt vé tối giản, mượt mà và trực quan ngay trên trình duyệt mà không cần cài đặt các framework hay backend phức tạp.

---

##  Tầm nhìn sản phẩm (Product Vision)

*   **Dành cho (FOR):** Học sinh, sinh viên và người đi làm trẻ (15-35 tuổi) có lối sống hiện đại, yêu thích trải nghiệm điện ảnh.
*   **Giải quyết vấn đề (WHO):** Những người mệt mỏi với các ứng dụng đặt vé rườm rà, tải chậm, mất thời gian xếp hàng mua vé/đồ ăn trực tiếp tại quầy vào giờ cao điểm, hoặc gặp sự cố trùng ghế khi đặt online.
*   **Giải pháp (THE 3HD2Kcinema IS A):** Ứng dụng đặt vé xem phim trực tuyến thế hệ mới với quy trình tối giản, chạy trực tiếp trên client bằng HTML/CSS/JS.
*   **Giá trị mang lại (THAT):** Tối ưu hóa thời gian thông qua việc tra cứu lịch chiếu trực quan, chọn vị trí chỗ ngồi chính xác và thanh toán giả lập nhanh chóng chỉ dưới 2 phút.
*   **Điểm khác biệt (UNLIKE):** Hoạt động độc lập hoàn toàn trên trình duyệt client, lưu trữ dữ liệu cục bộ, đảm bảo tốc độ phản hồi tức thì và không bị nghẽn mạng do phụ thuộc vào server trung gian.
*   **Tính năng nổi bật (OUR PRODUCT):** Sở hữu thuật toán giả lập khóa ghế thời gian thực (sử dụng BroadcastChannel API cho nhiều tab và JS Web Timers), tích hợp đặt trước bắp nước chung mã QR, hỗ trợ hiển thị vé ngoại tuyến (Offline QR Code) lưu trữ trong LocalStorage và giả lập đặt vé nhóm tự động chia tiền (Split bill).

---

##  Các tính năng cốt lõi (Key Features)

Dự án được phân rã thành các Epic và User Story (từ US01 đến US06) để phát triển:

###  1. Cinematic UI & Movie Browse (US01)
*   Giao diện rạp phim điện ảnh trực quan sử dụng HTML5 và CSS3 (hoặc Tailwind CSS CDN).
*   Tra cứu thông tin phim, lịch chiếu và giá vé từ file cấu trúc dữ liệu JSON cục bộ.

###  2. Real-time Seat Locking (US02)
*   Sơ đồ phòng chiếu tương tác thời gian thực được xử lý hoàn toàn bằng JavaScript DOM và đồng bộ giữa các tab qua **BroadcastChannel API**.
*   Giả lập ghế người khác đang chọn bằng JS Timer và tạm khóa ghế đang chọn trong 5 phút để tránh trùng ghế.

###  3. Snack Booking & Up-sell (US03)
*   Chọn mua các gói combo bắp nước ưu đãi trực quan ngay trong quy trình thanh toán vé.
*   Lưu thông tin giỏ hàng vào SessionStorage.

###  4. Payment & QR Ticket (US04)
*   Giả lập thanh toán trực tuyến an toàn thông qua màn hình thanh toán mô phỏng (không cần gọi API ngân hàng thật).
*   Xuất vé điện tử QR Code tích hợp (vé + bắp nước) sử dụng thư viện JS tạo QR client-side, hỗ trợ lưu trữ trong LocalStorage để hiển thị ngoại tuyến.

###  5. Authentication & LocalStorage (US05)
*   Đăng ký và Đăng nhập thành viên cục bộ sử dụng **LocalStorage** làm database lưu trữ thông tin tài khoản và lịch sử giao dịch.
*   Duy trì trạng thái đăng nhập qua SessionStorage.

###  6. Booking Nhóm & Chia tiền tự động (US06)
*   Tính năng **Split & Lock** giúp giữ chỗ chung cho cả nhóm bạn và tự động chia đều hóa đơn, mô phỏng quá trình thanh toán riêng lẻ của từng thành viên ngay trên giao diện client.

---

##  Công nghệ sử dụng (Tech Stack)

Dự án sử dụng bộ ba công nghệ Frontend thuần túy để tối ưu hiệu năng và dễ dàng phân phối:
*   **Structure:** HTML5 (semantic tags, form validations)
*   **Styling:** Vanilla CSS3 / Tailwind CSS (tải trực tiếp qua CDN)
*   **Logic & Storage:** JavaScript thuần (ES6 Modules, LocalStorage, SessionStorage, BroadcastChannel API)
*   **Libraries (Client-side):** QRCode.js (tạo mã QR trực tiếp trên client)

---

##  Cấu trúc thư mục tài liệu

Thông tin phân tích và thiết kế chi tiết dự án có thể tham khảo tại thư mục `Docs/`:
*   [Docs/README.md](Docs/README.md): Bản đồ tổng quan của toàn bộ hệ thống tài liệu.
*   [Docs/architecture/](Docs/architecture/): Chi tiết kiến trúc hệ thống Client-Side.
*   [Docs/database/](Docs/database/): Thiết kế cấu trúc dữ liệu lưu trữ trên LocalStorage.
*   [Docs/api/](Docs/api/): Tài liệu về các Module và JavaScript Services giả lập.

---

##  Hướng dẫn đóng góp (Contributing Guide)

Xem chi tiết quy trình Git Workflow, cách đặt tên nhánh (branch), chuẩn commit message và tạo Pull Request (PR) tại tài liệu hướng dẫn:
*   [CONTRIBUTING.md](CONTRIBUTING.md)
