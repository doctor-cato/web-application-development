# Kiểm thử Hệ thống & Chất lượng Mã nguồn (Testing & QA Guide)

Tài liệu này hướng dẫn đầy đủ bộ công cụ kiểm thử tự động, đánh giá hiệu năng, truy cập (accessibility), so sánh giao diện và kiểm thử E2E cho ứng dụng **3HD2Kcinema**.

---

## 🛠️ Bộ Công cụ Kiểm thử & CI/CD (QA Stack)

Hệ thống được trang bị 4 công cụ tiêu chuẩn hàng đầu:

| Công cụ | Mục đích | Tập tin cấu hình / Kịch bản | Workflow CI/CD |
|---|---|---|---|
| **Lighthouse CI** | Kiểm tra Performance, Accessibility, Best Practices và SEO tự động | `.lighthouserc.js` | `.github/workflows/lighthouse-ci.yml` |
| **axe-core** | Kiểm tra chi tiết khả năng truy cập (Accessibility: contrast, label, keyboard, ARIA) | `tests/e2e/accessibility.spec.js` | `.github/workflows/playwright.yml` |
| **Storybook + Chromatic** | Khởi chạy & kiểm thử visual UI component, phát hiện lỗi giao diện khi code thay đổi | `.storybook/`, `tests/stories/` | `.github/workflows/chromatic.yml` |
| **Playwright** | Kiểm thử E2E và chụp screenshot so sánh giao diện tự động | `playwright.config.js`, `tests/e2e/` | `.github/workflows/playwright.yml` |

---

## ⚡ 1. Lighthouse CI (`@lhci/cli`)

Kiểm tra tự động hiệu năng (performance), truy cập, chuẩn code và SEO mỗi khi push code lên GitHub.

### Chạy tại Local

```bash
# Đảm bảo frontend server đang chạy ở port 3000
npm run test:lighthouse
```

---

## ♿ 2. axe-core Accessibility Audit (`@axe-core/playwright`)

Sử dụng engine `axe-core` kết hợp Playwright để quét lỗi vi phạm chuẩn WCAG 2.1 AA (độ tương phản màu, nhãn aria-label, hỗ trợ điều hướng bàn phím).

### Chạy tại Local

```bash
npm run test:a11y
```

---

## 🎨 3. Storybook + Chromatic Visual UI Testing (`@chromaui/chromatic-cli`)

Quản lý component cô lập bằng Storybook và tự động so sánh điểm khác biệt UI (visual regression) bằng Chromatic.

### Khởi chạy Storybook Local

```bash
npm run storybook
```

### Build & Đẩy lên Chromatic

```bash
npm run chromatic
```

---

## 🎭 4. Playwright E2E & Visual Snapshot Testing

Thực hiện kiểm thử luồng người dùng (User Flow) và so sánh ảnh chụp màn hình tự động (`toHaveScreenshot`).

### Chạy Playwright E2E & Visual Snapshot

```bash
# Chạy toàn bộ kịch bản E2E + Snapshot
npm run test:e2e

# Chạy với giao diện hiển thị (Headed mode)
npx playwright test --headed

# Xem báo cáo HTML chi tiết
npx playwright show-report
```

---

## 🔍 5. Quy trình Kiểm thử Thủ công (Manual Test Checklist)

Khi thực hiện cập nhật mã nguồn UI/UX, hãy kiểm tra danh sách checklist sau:

| STT | Luồng kiểm thử | Thao tác | Kết quả mong đợi |
|---|---|---|---|
| 1 | Multi-tab Seat Lock | Mở 2 tab trình duyệt cùng trang `booking.html?id=1`. Nhấn chọn ghế `B3` ở Tab 1. | Nút ghế `B3` ở Tab 2 lập tức đổi sang trạng thái màu xám (Đã bị khóa). |
| 2 | Auto-Release Lock | Khóa ghế `B3` ở Tab 1, sau đó đóng Tab 1. | Ghế `B3` trên Tab 2 lập tức được giải phóng trở lại màu bình thường. |
| 3 | Mobile Responsive | Mở DevTools chuyển chế độ Viewport iPhone SE (375px). Truy cập chọn Bắp nước. | Danh mục bắp nước cuộn ngang mượt mà, nút chọn không bị tràn khung. |
| 4 | Partial Cancellation | Vào trang Hồ sơ cá nhân -> Xem chi tiết đơn hàng 2 ghế -> Bấm Hủy 1 ghế. | Ghế bị hủy chuyển trạng thái, điểm thưởng trừ tương ứng, hiện Toast báo thành công. |
| 5 | Geolocation Map | Truy cập `cinema-map/cinemas.html` -> Cho phép vị trí. | Hiển thị vị trí thực của người dùng và sắp xếp các cụm rạp từ gần nhất đến xa nhất. |
