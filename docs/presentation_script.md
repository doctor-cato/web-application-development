# BÀI THUYẾT TRÌNH BẢO VỆ DỰ ÁN 3HD2KCINEMA
## Chuyên đề: Cấu trúc Tổng thể | DevOps CI/CD | Kiểm thử Tự động E2E (Playwright)

---

## 🏛️ PHẦN 1: THIẾT KẾ CẤU TRÚC TỔNG THỂ (OVERALL ARCHITECTURE)

### 1. Mô hình Kiến trúc Song song (Hybrid Architecture)
Hệ thống **3HD2Kcinema** (Phiên bản `v3.6.7`) được thiết kế theo nguyên lý **Separation of Concerns (Phân tách trách nhiệm)** và vận hành dựa trên 2 mô hình kiến trúc song song:

```text
┌────────────────────────────────────────────────────────────────────────┐
│               ACTIVE TRACK: CLIENT-SIDE ENGINE (BROWSER)               │
│  - Frontend: HTML5, Vanilla JS (ES6 Modules), Tailwind CSS v4          │
│  - Storage Wrapper: shared/utils/storage.js (LocalStorage/SessionStorage)│
│  - Real-time Multi-tab Sync: BroadcastChannel API ('seat_sync')        │
└────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ (Sẵn sàng kết nối REST API)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│            SCAFFOLD TRACK: FULL-STACK TARGET (ASP.NET CORE 8)          │
│  - Backend Core: ASP.NET Core 8.0 (C# Web API & Controllers MVC)       │
│  - ORM & Database: Entity Framework Core 8.0 & SQL Server              │
│  - Real-time Socket: SignalR Core (Khóa ghế & Thông báo POS)          │
└────────────────────────────────────────────────────────────────────────┘
```

### 2. Phân chia Mã nguồn Frontend (Domain-Based Structure)
Mã nguồn giao diện tại `frontend/src/` được tổ chức theo Domain/Tính năng:
* `explore/`: Trang chủ, Tìm kiếm phim, Chi tiết phim, Bản đồ vị trí rạp chiếu phim.
* `booking/`: Sơ đồ chọn ghế real-time, chọn Combo bắp nước, Checkout, mã QR thanh toán động.
* `engagement/`: Minigame ghép đôi xem phim **CineMatch** và dự đoán **CinePredict**.
* `management/`: Admin Portal (Quản lý Phim, Suất chiếu, User) & Staff POS (Bán vé tại quầy).
* `user/`: Quản lý hồ sơ, thẻ thành viên VIP, Đổi điểm thưởng & Lịch sử đơn hàng.
* `auth/`: Đăng nhập, Đăng ký, Quên mật khẩu & Auth Services.
* `shared/`: Shared components (Navbar, Footer, Toast notifications, `storage.js`).

### 3. Phân chia Mã nguồn Backend (ASP.NET Core Layered Architecture)
Mã nguồn máy chủ tại `backend/`:
* `Controllers/`: Tiếp nhận HTTP Request (Movies, Bookings, Auth, Showtimes, Users).
* `Services/`: Business Logic xử lý quy tắc nghiệp vụ (BookingService, FileService).
* `Repositories/`: Tương tác CSDL SQL Server qua Entity Framework Core 8.0.
* `Hubs/`: SignalR Core phục vụ giao tiếp Socket real-time.
* `Models/`: Các Entities C# và DbContext.

### 4. Nguyên tắc Thiết kế Kỹ thuật Nổi bật
* **Modular ES6 Modules**: Sử dụng `<script type="module">`, cách ly scope.
* **Single Source of Truth cho Storage**: Mọi dữ liệu Client đều đi qua `storage.js`.
* **API-First & Graceful Fallback**: Admin/POS gọi 100% API thực. Khi Backend offline, Frontend tự động fallback về LocalStorage cache.
* **Multi-tab Sync (Đồng bộ đa tab)**: Sử dụng `BroadcastChannel` với tên kênh `'seat_sync'` để đồng bộ trạng thái khóa ghế thời gian thực giữa nhiều tab trình duyệt mở cùng lúc.

---

## 🚀 PHẦN 2: PHỤ TRÁCH DEVOPS & GIÁM SÁT CI/CD (GITHUB ACTIONS)

Dự án thiết lập hệ thống **DevOps CI/CD tự động hóa toàn diện** với **5 workflows GitHub Actions** đặt tại thư mục `.github/workflows/`:

```text
                                    ┌──► 1. playwright.yml (E2E & Accessibility)
                                    ├──► 2. docs.yml (MkDocs -> GitHub Pages)
[Git Push / PR (main, dev2)] ───────┼──► 3. vercel-check.yml (E2E trên Vercel Preview)
                                    ├──► 4. lighthouse-ci.yml (Core Web Vitals Audit)
                                    └──► 5. chromatic.yml (Visual Component UI Test)
```

### Chi tiết 5 Workflows CI/CD:

1. **`playwright.yml` — Automated E2E & Accessibility Pipeline**
   * **Trigger**: Push / Pull Request vào nhánh `main`, `dev2`.
   * **Nhiệm vụ**: Cài đặt Node.js 20, tải Playwright Browsers, khởi chạy toàn bộ 11 bộ test E2E & axe-core.
   * **Artifact**: Tự động lưu trữ và tải lên báo cáo `playwright-report` (Retention: 30 ngày).

2. **`docs.yml` — Technical Documentation Publisher**
   * **Nhiệm vụ**: Kiểm tra lỗi cú pháp Markdown (`markdownlint-cli`), build tài liệu tĩnh bằng **MkDocs Material** (`mkdocs.yml`), tự động deploy lên nhánh `gh-pages` xuất bản **GitHub Pages**.

3. **`vercel-check.yml` — Preview Environment Verification**
   * **Nhiệm vụ**: Lắng hệ Pull Request, chờ Vercel build xong Preview URL (`wait-for-vercel-preview`), sau đó chạy trực tiếp bộ test Playwright E2E lên link Vercel Preview để đảm bảo code PR không làm hỏng trang live.

4. **`lighthouse-ci.yml` — Core Web Vitals & Performance Audit**
   * **Nhiệm vụ**: Chạy `lhci autorun` đánh giá điểm số Performance, SEO, PWA và Accessibility theo cấu hình `.lighthouserc.js`.

5. **`chromatic.yml` — Storybook Visual UI Testing**
   * **Nhiệm vụ**: Build Storybook components và đẩy lên Chromatic Cloud để phát hiện sai lệch thiết kế UI.

---

## 🎭 PHẦN 3: KỊCH BẢN KIỂM THỬ TỰ ĐỘNG E2E (PLAYWRIGHT)

### 1. Cấu hình Playwright (`playwright.config.js`)
* **Framework**: `@playwright/test` v1.61 & `@axe-core/playwright` v4.10.
* **Test Directory**: `./tests/e2e` (tất cả tệp `*.spec.js`).
* **Chạy song song**: `fullyParallel: true`, tự động retry 2 lần trên môi trường CI.
* **Tự động kích hoạt WebServer**: Cấu hình `webServer` tự bật Python static server (`python -m http.server 3000 -d ./frontend/src`) trước khi chạy test.

### 2. Chi tiết 5 Kịch bản Test E2E (11/11 Passed 100%)

| File Spec | Kịch bản Kiểm thử Chi tiết | Phương pháp Xử lý |
| :--- | :--- | :--- |
| **`booking-flow.spec.js`** | **Luồng Đặt vé End-to-End từ Trang chủ** | Giả lập Session User qua `addInitScript` (LocalStorage), Intercept API `/api/movies`, click nút *"Đặt vé ngay"*, kiểm tra chuyển trang thành công sang `booking.html` và hiển thị ma trận ghế `#seat-map`. |
| **`cinematch.spec.js`** | **Tính năng Ghép đôi CineMatch & Responsive** | 1. Thao tác chọn card sở thích -> Chuyển sang Radar tìm kiếm -> Hủy tìm kiếm -> Quay lại trang chọn.<br>2. Set Viewport Mobile (375x667), kiểm tra giao diện không bị cuộn ngang overflow.<br>3. Kiểm tra nút *"Quét Tìm Lại"* khi ở trạng thái Empty State. |
| **`accessibility.spec.js`** | **Audit Tiêu chuẩn Truy cập WCAG (axe-core)** | Quét tự động chuẩn WCAG 2.1 AA (độ tương phản màu, thẻ `aria-label`, phím điều hướng) trên Homepage, Movie Explore và Login Modal. Đảm bảo 0 lỗi `critical`/`serious`. |
| **`visual-comparison.spec.js`** | **Chụp ảnh Snapshots So sánh Giao diện** | Sử dụng `toHaveScreenshot()` để chụp toàn bộ trang Trang chủ, Lưới danh sách phim, và Sơ đồ chọn ghế. Kiểm tra sai lệch điểm ảnh (pixel diff tolerance <= 5%). |
| **`home.spec.js`** | **Khởi chạy & Khớp URL Trang chủ** | Kiểm tra độ phản hồi và khớp URL domain local/Vercel. |

### 3. Lệnh Chạy Kiểm Thử Tại Local
```bash
# Chạy toàn bộ bộ test E2E Playwright
npm run test:e2e

# Chạy test với giao diện trình duyệt thực tế (Headed Mode)
npx playwright test --headed

# Kiểm tra truy cập WCAG (axe-core)
npm run test:a11y

# Mở báo cáo HTML tương tác trực quan
npx playwright show-report
```

---

## 🎤 PHẦN 4: DÀN Ý & KỊCH BẢN NÓI MẪU CHO BUỔI THUYẾT TRÌNH

### 📄 Slide 1: Thiết kế Cấu trúc Hệ thống (Architecture)
> **Lời thoại mẫu**:  
> *"Kính chào thầy/cô và các bạn. Em xin phụ trách trình bày phần Cấu trúc Tổng thể của dự án 3HD2Kcinema. Hệ thống của chúng em được xây dựng theo kiến trúc **Hybrid Architecture** phân tách rõ ràng. Nhánh **Active Track** chạy trực tiếp trên trình duyệt sử dụng HTML5, Vanilla JS ES Modules và Tailwind CSS v4, giúp ứng dụng đạt tốc độ phản hồi tức thì và không phụ thuộc vào server phức tạp khi demo. Đồng thời, chúng em thiết kế bộ wrapper `storage.js` làm Single Source of Truth cho dữ liệu client và tích hợp `BroadcastChannel API` để giải quyết bài toán đồng bộ trạng thái khóa ghế real-time giữa nhiều tab. Song song đó, nhánh **Scaffold Track** dựa trên ASP.NET Core 8 và SQL Server sẵn sàng cho việc mở rộng API doanh nghiệp."*

### 📄 Slide 2: Hạ tầng DevOps & CI/CD Pipeline (GitHub Actions)
> **Lời thoại mẫu**:  
> *"Về mảng DevOps, dự án áp dụng quy trình tự động hóa hoàn toàn qua **5 Workflows GitHub Actions**. Mỗi khi dev push code hoặc mở Pull Request vào nhánh `main` hay `dev2`, hệ thống tự động:  
> 1. Kiểm tra chất lượng mã nguồn và chạy bộ test E2E Playwright.  
> 2. Tự động build và deploy tài liệu MkDocs lên **GitHub Pages**.  
> 3. Lắng nghe Vercel Preview URL và chạy Playwright trực tiếp trên trang Preview trước khi merge code.  
> 4. Đánh giá chỉ số hiệu năng Core Web Vitals qua Lighthouse CI và kiểm thử Visual UI qua Chromatic."*

### 📄 Slide 3: Kịch bản Kiểm thử Tự động E2E (Playwright & axe-core)
> **Lời thoại mẫu**:  
> *"Cuối cùng là phần Kiểm thử tự động E2E. Chúng em xây dựng bộ test Playwright với **11/11 Test Suites đã Pass 100%**. Bộ test tập trung vào 4 nhóm chính:  
> - **Booking Flow Test**: Kiểm tra toàn bộ luồng chọn phim từ trang chủ đến điều hướng sơ đồ chọn ghế.  
> - **Feature & Mobile Responsive Test**: Test toàn bộ các bước minigame CineMatch và đảm bảo giao diện hiển thị chuẩn trên thiết bị di động 375px mà không bị tràn màn hình.  
> - **Accessibility Test**: Tích hợp engine `axe-core` để audit tự động chuẩn truy cập WCAG 2.1 AA.  
> - **Visual Regression Test**: Chụp ảnh màn hình tự động và so sánh sai lệch từng điểm ảnh pixel để đảm bảo giao diện không bị vỡ khi cập nhật code."*

### 📄 Slide 4: Kết luận & Tóm tắt Vai trò
> **Lời thoại mẫu**:  
> *"Tóm lại, việc kết hợp giữa kiến trúc hệ thống linh hoạt, hạ tầng CI/CD tự động hóa chặt chẽ và bộ kịch bản kiểm thử E2E phủ rộng đã giúp dự án 3HD2Kcinema hoạt động ổn định, mượt mà và dễ dàng bảo trì. Em xin cảm ơn thầy cô và các bạn đã chú ý lắng nghe!"*
