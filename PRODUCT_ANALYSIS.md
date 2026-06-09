# Phân tích Sản phẩm (Product Analysis)

**Dự án:** 3HD2Kcinema - Ứng dụng đặt vé xem phim

## 1. Phân tích người dùng (User Analysis)
- **Đối tượng mục tiêu:** Sinh viên đại học, những người đam mê điện ảnh, thường xuyên đi xem phim cùng bạn bè hoặc gia đình.
- **Thói quen:** Thích xem trước review phim, đặt vé trực tuyến qua điện thoại di động, mua combo đồ ăn uống kèm vé để tiết kiệm thời gian.
- **Nhu cầu cốt lõi:** Một hệ thống đặt vé mượt mà, thao tác trực quan, thanh toán nhanh, và đặc biệt là có khả năng hỗ trợ đặt chỗ cho nhiều người cùng lúc mà không bị mất chỗ.

## 2. Xác định vấn đề (Problem Identification)
- **Vấn đề 1 (Đặt vé nhóm):** Khi một nhóm bạn đi xem phim, việc giữ nhiều ghế liền kề nhau và chia sẻ thanh toán (split bill) thường rất khó khăn trên các app hiện tại.
- **Vấn đề 2 (Đồng bộ ghế ngồi):** Hệ thống thường gặp lỗi "ghế ma" (ghost seats) hoặc bị trùng lặp đặt ghế khi nhiều người cùng chọn một ghế tại cùng một thời điểm.
- **Vấn đề 3 (Thiếu tương tác):** Thiếu đi phần review thực tế từ người dùng khác ngay trên ứng dụng, khiến người xem khó ra quyết định chọn phim.

## 3. Chọn MVP (Minimum Viable Product)
Để giải quyết các vấn đề trên, phiên bản MVP của 3HD2Kcinema sẽ tập trung vào các tính năng cơ bản và giải quyết pain point chính bằng công nghệ client-side thuần:
- **Khám phá phim (US01):** Xem danh sách phim đang chiếu, sắp chiếu và xem thông tin/lịch chiếu phim từ file JSON cục bộ.
- **Đặt vé & Khóa ghế thời gian thực (US02):** Chức năng cốt lõi giúp chọn suất chiếu và khóa ghế ngay lập tức bằng cơ chế đồng bộ đa tab trình duyệt (**BroadcastChannel API**) kết hợp giả lập người dùng khác qua **JS Web Timers**. Đặc biệt là tính năng giả lập "Split & Lock" cho nhóm (US06).
- **Thanh toán & Hóa đơn (US04):** Giả lập thanh toán trực tuyến client-side và xuất vé QR điện tử ngoại tuyến lưu trong LocalStorage.
- **Quản lý tài khoản (US05):** Đăng nhập/Đăng ký thành viên cơ bản lưu thông tin cục bộ trong LocalStorage.
