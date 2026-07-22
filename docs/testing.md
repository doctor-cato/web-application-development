# Kiểm thử Hệ thống (Testing Guide)

Tài liệu này hướng dẫn các phương pháp kiểm thử tự động (Automated E2E Testing với Playwright) và các quy trình kiểm thử thủ công (Manual Testing Procedures) cho ứng dụng 3HD2Kcinema.

---

## 🎭 1. Kiểm thử Tự động E2E (Playwright)

Dự án tích hợp bộ công cụ **Playwright** (`@playwright/test`) để thực hiện kiểm thử tự động trên giao diện trình duyệt Chromium.

### Cấu hình Playwright

Cấu hình kiểm thử nằm tại tệp `playwright.config.js` ở thư mục gốc:

- **Base URL**: `http://localhost:3000` (Có thể thay đổi qua biến môi trường `PLAYWRIGHT_TEST_BASE_URL`).
- **Test Directory**: `./tests/e2e`.

### Các bước chạy E2E Tests

#### Bước 1: Mở Web Server Frontend (Terminal 1)

```bash
cd frontend
python -m http.server 3000 -d src
```

#### Bước 2: Chạy Playwright Tests (Terminal 2)

```bash
# Cài đặt dependencies nếu chưa có
npm install

# Chạy toàn bộ kịch bản test E2E
npx playwright test

# Chạy test có giao diện UI hiển thị (Headed mode)
npx playwright test --headed

# Xem báo cáo kiểm thử chi tiết dạng HTML Report
npx playwright show-report
```

---

## 📝 2. Các Kịch bản Test E2E Mẫu (Test Cases)

Các tệp test nằm trong thư mục `tests/e2e/`:

### `tests/e2e/home.spec.js` (Kiểm thử Trang chủ)

- Kiểm tra thanh tiêu đề trang chủ 3HD2Kcinema.
- Kiểm tra khả năng hiển thị danh sách phim nổi bật và các thẻ phim.
- Kiểm tra tính năng chuyển tab thể loại phim.

### `tests/e2e/somme.spec.js` (Kiểm thử Luồng Đặt vé)

- Tự động click vào phim bất kỳ.
- Chọn suất chiếu và kiểm tra chuyển sang trang đặt ghế.
- Chọn ghế `A5`, kiểm tra giá tiền tổng cộng nhảy đúng.
- Chuyển sang bước chọn bắp nước và hóa đơn QR code.

---

## 🔍 3. Quy trình Kiểm thử Thủ công (Manual Test Checklist)

Khi thực hiện cập nhật mã nguồn UI/UX, hãy kiểm tra danh sách checklist sau:

| STT | Luồng kiểm thử | Thao tác | Kết quả mong đợi |
|---|---|---|---|
| 1 | Multi-tab Seat Lock | Mở 2 tab trình duyệt cùng trang `booking.html?id=1`. Nhấn chọn ghế `B3` ở Tab 1. | Nút ghế `B3` ở Tab 2 lập tức đổi sang trạng thái màu xám (Đã bị khóa). |
| 2 | Auto-Release Lock | Khóa ghế `B3` ở Tab 1, sau đó đóng Tab 1. | Ghế `B3` trên Tab 2 lập tức được giải phóng trở lại màu bình thường. |
| 3 | Mobile Responsive | Mở DevTools chuyển chế độ Viewport iPhone SE (375px). Truy cập chọn Bắp nước. | Danh mục bắp nước cuộn ngang mượt mà, nút chọn không bị tràn khung. |
| 4 | Partial Cancellation | Vào trang Hồ sơ cá nhân -> Xem chi tiết đơn hàng 2 ghế -> Bấm Hủy 1 ghế. | Ghế bị hủy chuyển trạng thái, điểm thưởng trừ tương ứng, hiện Toast báo thành công. |
| 5 | Geolocation Map | Truy cập `cinema-map/cinemas.html` -> Cho phép vị trí. | Hiển thị vị trí thực của người dùng và sắp xếp các cụm rạp từ gần nhất đến xa nhất. |
