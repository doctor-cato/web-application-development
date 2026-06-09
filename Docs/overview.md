Overview

Mục tiêu: Tài liệu này mô tả mục đích, cách chạy và cấu trúc mã nguồn của dự án front-end.

1) Mục đích
Ứng dụng mô phỏng hệ thống đặt vé rạp chiếu, dùng để học tập và demo các pattern JS thuần.

2) Chạy local
- Mở trực tiếp `src/index.html` hoặc chạy server tĩnh như Python:
  `cd C:\Users\Admin\Documents\CODE_WORKSPACE\web-application-development`
  `python -m http.server 8000`
  Truy cập: http://localhost:8000/src/index.html

3) Kiến trúc mã
- Components: các thành phần UI tái sử dụng (src/js/components)
- Pages: logic riêng cho từng trang (src/js/pages)
- Services: lớp truy cập dữ liệu/logic nghiệp vụ (src/js/services)

4) Ghi chú
- Nếu thêm API backend, cập nhật hướng dẫn cấu hình endpoint trong services.
- Lưu trữ tạm (localStorage) được xử lý trong src/js/services/storage.js

