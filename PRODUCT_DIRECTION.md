# Định hướng Sản phẩm (Product Direction)

**Dự án:** 3HD2Kcinema - Ứng dụng đặt vé xem phim.

## 1. Hướng đi đã chọn (Project Direction)
Dựa trên các tùy chọn của Tuần 1, hướng đi được chọn cho dự án này là: **Làm app mới (Build from scratch).**
Mục tiêu là xây dựng mới hoàn toàn một hệ thống đặt vé xem phim chuyên nghiệp bằng công nghệ Frontend thuần (**HTML, CSS, JS**). Định hướng phát triển luôn xoay quanh nhu cầu của các Persona chung: những người đam mê điện ảnh, thường xuyên đi xem phim theo nhóm, và mong muốn có trải nghiệm đặt vé nhanh chóng, tiện lợi qua thiết bị di động.

## 2. Các tính năng cốt lõi (Chuẩn hóa theo Docs/)
- **US01:** Cinematic UI & Movie Browse (Khám phá phim & lịch chiếu trực quan).
- **US02:** Real-time Seat Locking (Khóa ghế thời gian thực giả lập - dùng BroadcastChannel và JS Timers).
- **US03:** Snack Booking (Đặt trước bắp nước).
- **US04:** Payment & QR Ticket (Thanh toán giả lập & Vé điện tử QR lưu trữ ngoại tuyến).
- **US05:** Authentication & SessionStorage (Đăng ký / Đăng nhập thành viên lưu cục bộ qua LocalStorage).
- **US06:** Split & Lock (Giả lập Booking nhóm & Chia tiền tự động).
- **US07:** Reviews & Admin Dashboard (Đánh giá phim & Bảng điều khiển quản trị mô phỏng - bỏ qua ở phiên bản hiện tại).

## 3. Mục tiêu và Tầm nhìn (Goals & Vision)
- **Kiến trúc:** Giữ vững triết lý phát triển sạch sẽ, dạng module (ES6 Modules), dễ đọc và dễ mở rộng. Tránh tình trạng "overengineering" (thiết kế quá mức cần thiết).
- **Trải nghiệm người dùng (UX):** Xây dựng UI/UX theo hướng "cinematic dark UI", sử dụng CSS transitions/animations thuần mượt mà để tăng tính tương tác.
- **Tính năng trọng tâm:** Đảm bảo hệ thống khóa ghế giả lập hoạt động hoàn hảo không trùng lặp ghế (zero ghost seats, no double bookings) trên môi trường đa tab trình duyệt.
- **Mở rộng (AI & Tương lai):** Chuẩn bị nền tảng để tích hợp các tính năng AI chạy client-side (Gợi ý phim, Trợ lý ảo) và Dashboard thống kê chuyên sâu ở các phase tiếp theo.
