# Hướng Dẫn Tổ Chức Cấu Trúc File (Feature-Based Architecture)

Tài liệu này là cẩm nang để bạn (hoặc bất kỳ ai tham gia vào dự án) có thể dễ dàng hiểu, mở rộng và bảo trì cấu trúc mã nguồn của hệ thống theo đúng quy chuẩn **Feature-Based Architecture** kết hợp **Colocation**.

---

## 1. Triết Lý Cốt Lõi

Thay vì chia file theo *chủng loại* (gom hết HTML vào một chỗ, CSS vào một chỗ), dự án này chia file theo **Tính năng (Feature)**.
> **Nguyên tắc:** *"Những thứ thay đổi cùng nhau thì nên đặt cạnh nhau."*

Mỗi khi bạn cần thêm một màn hình hoặc một tính năng mới, bạn sẽ tạo **một thư mục riêng**, bên trong chứa đầy đủ HTML, CSS và JS phục vụ cho đúng màn hình đó.

---

## 2. Cấu Trúc Tổng Quan (Mô hình cây)

Toàn bộ logic của ứng dụng nằm trong thư mục gốc `src/`. Dưới đây là cách phân chia các Nhóm Tính Năng (Domain):

```text
src/
├── auth/                 # Domain: Xác thực người dùng
│   ├── user-login/       # Tính năng: Đăng nhập
│   └── user-register/    # Tính năng: Đăng ký
│
├── booking/              # Domain: Đặt vé & Thanh toán
│   ├── seat-booking/     # Tính năng: Chọn ghế
│   ├── booking-food/     # Tính năng: Chọn bắp nước
│   └── checkout/         # Tính năng: Thanh toán
│
├── explore/              # Domain: Khám phá phim & rạp
│   ├── home-page/        # Tính năng: Trang chủ
│   ├── movie-search/     # Tính năng: Danh sách phim
│   ├── movie-details/    # Tính năng: Chi tiết phim
│   └── cinema-map/       # Tính năng: Cụm rạp
│
├── user/                 # Domain: Cá nhân hóa
│   ├── user-profile/     # Tính năng: Hồ sơ
│   └── loyalty-points/   # Tính năng: Điểm thưởng
│
├── engagement/           # Domain: Tương tác người dùng
│   ├── aftercredit-...   # Tính năng: Thảo luận phim
│   └── minigame/         # Tính năng: Trò chơi
│
└── shared/               # Domain đặc biệt: Tài nguyên dùng chung toàn cục
    ├── components/       # Các UI dùng lại (Navbar, Footer, Card...)
    ├── css/              # Style chung (main.css, reset.css)
    ├── js/               # Logic chung, Database (data.js)
    └── images/           # Hình ảnh tĩnh
```

---

## 3. Quy Chuẩn Đặt Tên & Chia File Bên Trong 1 Tính Năng

Giả sử bạn cần tạo một trang mới là **"Chi tiết Khuyến Mãi"**. Đây là các bước chuẩn mực:

### Bước 1: Xác định Domain
Khuyến mãi thuộc về "Khám phá" hoặc "Người dùng". Giả sử ta xếp nó vào nhóm `explore/`.

### Bước 2: Tạo thư mục tính năng (Kebab-case)
Tên thư mục luôn dùng chữ thường, phân cách bằng dấu gạch ngang.
👉 Tạo thư mục: `src/explore/promotion-details/`

### Bước 3: Tuân thủ quy tắc Colocation (Cụm 3 file)
Bên trong thư mục `promotion-details`, tạo đúng 3 file này:
1. `index.html`: Chứa khung xương của trang.
2. `promotion.css`: Chứa CSS chỉ dành riêng cho trang này.
3. `promotion.js`: Chứa Logic chỉ chạy trên trang này.

```text
src/explore/promotion-details/
├── index.html
├── promotion.css
└── promotion.js
```

> [!WARNING]
> Tuyệt đối không dùng chung CSS hoặc JS của tính năng này cho tính năng khác để tránh xung đột class (CSS Leak).

---

## 4. Quy Chuẩn Liên Kết File (Linking)

Vì các trang nằm sâu ở nhiều thư mục khác nhau, việc dẫn link tương đối (`../`) rất dễ gây lỗi. Hệ thống này sử dụng **Đường dẫn tuyệt đối từ gốc Server** (Bắt đầu bằng dấu `/`).

### 4.1. Nhúng Style & Logic chung từ `/shared/`
Trong thẻ `<head>` của file `index.html` của tính năng mới, luôn gọi file chung trước, file riêng sau:

```html
<!-- 1. Style dùng chung toàn cục -->
<link rel="stylesheet" href="/shared/css/main.css">

<!-- 2. Style riêng của tính năng này -->
<link rel="stylesheet" href="/explore/promotion-details/promotion.css">
```

Tương tự với JavaScript ở cuối thẻ `<body>`:

```html
<!-- 1. Load các UI Component chung (như Navbar) -->
<script type="module" src="/shared/components/navbar.js"></script>

<!-- 2. Load Dữ liệu chung -->
<script src="/shared/js/data.js"></script>

<!-- 3. Load Logic riêng của trang -->
<script src="/explore/promotion-details/promotion.js"></script>
```

### 4.2. Nhúng Hình ảnh
Mọi hình ảnh dùng chung phải được gọi bằng đường dẫn tuyệt đối:
```html
<!-- ĐÚNG -->
<img src="/shared/images/promo_banner.jpg" alt="Banner">

<!-- SAI (Sẽ bị lỗi gãy ảnh) -->
<img src="../../shared/images/promo_banner.jpg" alt="Banner">
```

### 4.3. Link chuyển trang (href)
Khi bấm một nút để chuyển sang trang khác, luôn bắt đầu bằng `/`:
```html
<a href="/explore/home-page/index.html">Về trang chủ</a>
<a href="/booking/seat-booking/booking.html?id=123">ĐẶT VÉ NGAY</a>
```

---

## 5. Quy Chuẩn Về "Shared Components" (Thành phần dùng lại)

Nếu bạn có một khối giao diện xuất hiện ở nhiều trang (ví dụ: Thanh điều hướng Navbar, Chân trang Footer, hoặc Khối Card hiển thị 1 bộ phim):

1. **Không copy-paste HTML:** Khung HTML của các phần này sẽ được tiêm (inject) bằng Javascript.
2. Tại trang HTML, bạn chỉ cần để sẵn một thẻ "Mỏ neo" (Placeholder):
   ```html
   <div id="navbar-placeholder"></div>
   ```
3. Khối Javascript chung (`/shared/components/navbar.js`) sẽ tự động chèn HTML của Navbar vào thẻ có ID tương ứng khi trang tải lên.

> [!TIP]
> **Checklist trước khi Code tính năng mới:**
> - [ ] Mình đã đặt thư mục đúng Domain chưa?
> - [ ] Trang này có cần dùng Navbar/Footer không? Đã thêm placeholder chưa?
> - [ ] Mình đã dẫn link CSS bằng đường dẫn bắt đầu bằng `/` chưa?
> - [ ] Tên class CSS có đủ đặc trưng để không đụng hàng với trang khác không? (Mẹo: Có thể bọc toàn bộ code trong `<main class="tên-tính-năng-page">`).
