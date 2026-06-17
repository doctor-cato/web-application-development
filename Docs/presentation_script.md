# Kịch bản Thuyết trình Dự án 3HD2Kcinema (Dành cho Frontend Developer)

## Phần 1: Giới thiệu bản thân và tổng quan dự án
"Chào mọi người, hôm nay mình xin đại diện nhóm trình bày về dự án **3HD2Kcinema**. Đây là một ứng dụng web mô phỏng toàn bộ luồng đặt vé rạp chiếu phim. 

Điểm đặc biệt nhất của dự án này là nó được xây dựng **100% toàn Client-side (chỉ có Frontend)**, không hề có Backend Server. Với vai trò là Frontend Developer, mục tiêu của mình là chứng minh rằng: Bằng cách sử dụng các công nghệ Web cốt lõi (HTML, CSS, JS thuần), chúng ta hoàn toàn có thể xây dựng một hệ thống có kiến trúc phức tạp, xử lý dữ liệu mượt mà và mang lại trải nghiệm giống như một ứng dụng thực tế."

## Phần 2: Kiến trúc hệ thống (Architecture)
"Thay vì viết code lộn xộn vào một vài file lớn, mình đã thiết kế dự án theo mô hình **Feature-Based (hay Domain-Based)**. Kiến trúc này khá giống với cách các framework hiện đại như Next.js hay Angular hoạt động, nhưng ở đây mình hoàn toàn dùng **Vanilla JS (ES6 Modules)**.

Hệ thống được chia thành các Domain rõ ràng như: `auth` (xác thực), `booking` (đặt vé), `user` (hồ sơ), `explore` (khám phá). Trong mỗi Domain, mình áp dụng nghiêm ngặt nguyên tắc phân tầng (MVC-like):
- **Tầng View (HTML/CSS):** Chỉ chịu trách nhiệm hiển thị.
- **Tầng Controller (Page JS):** Xử lý DOM Events và render UI.
- **Tầng Service:** Chứa Business Logic (ví dụ: tính tiền, logic đặt ghế).
- **Tầng Utils/Shared:** Các component dùng chung (Navbar, Footer, SeatGrid) và Data Layer."

### Sơ đồ Kiến trúc Phân tầng (Layered Architecture)

```text
┌─────────────────────────────────────────────────────────────┐
│                     TẦNG GIAO DIỆN (Views / HTML Pages)     │
│  (Trang Đăng nhập, Trang Chủ, Trang Đặt vé, Hồ sơ user...)  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Lắng nghe DOM Events / Render UI
┌──────────────────────────▼──────────────────────────────────┐
│                  TẦNG CONTROLLER (Page JS)                  │
│  (booking.js, checkout.js, home.js, cancel-booking.js...)   │
└──────────────────────────┬──────────────────────────────────┘
                           │ Gọi hàm xử lý nghiệp vụ
┌──────────────────────────▼──────────────────────────────────┐
│               TẦNG SERVICE (Domain Logic)                   │
│  (bookingService.js, authService.js, paymentService.js...)  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Đọc/Ghi dữ liệu & Đồng bộ
┌──────────────────────────▼──────────────────────────────────┐
│               TẦNG DỮ LIỆU & TIỆN ÍCH (Utilities)           │
│  ┌───────────────────┐     ┌──────────────────────────┐     │
│  │  storage.js       │     │  BroadcastChannel API    │     │
│  │ (Wrapper cho Local/     │ (Đồng bộ khóa ghế real-  │     │
│  │  Session Storage) │     │  time giữa các Tab)      │     │
│  └───────────────────┘     └──────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

**Cách giải thích Sơ đồ khi Thầy/Cô hỏi:**
"Dạ thưa thầy/cô, kiến trúc hệ thống của dự án được em chia làm 4 tầng riêng biệt để đảm bảo tính **Separation of Concerns** (Phân tách mối quan tâm). Luồng hoạt động đi từ trên xuống dưới như sau:
1. **Tầng Giao diện (Views):** Là các file HTML thuần. Tầng này tuyệt đối không chứa logic JavaScript, nó chỉ làm nhiệm vụ hiển thị cấu trúc trang và giao tiếp với người dùng.
2. **Tầng Controller (Page JS):** Mỗi trang HTML sẽ được gắn với một file Controller JS tương ứng. Tầng này chịu trách nhiệm bắt các sự kiện (click chuột, nhập form) và thay đổi giao diện. Tuy nhiên, tầng này **không được phép** tính toán tiền hay lưu dữ liệu trực tiếp.
3. **Tầng Service (Nghiệp vụ):** Khi Controller cần xử lý một thao tác phức tạp, nó sẽ gọi xuống tầng Service. Tầng này chứa toàn bộ Business Logic cốt lõi của dự án.
4. **Tầng Dữ liệu (Data Layer / Utilities):** Đây là tầng thấp nhất, thay thế cho Database truyền thống. Em sử dụng file `storage.js` để bọc lại toàn bộ thao tác gọi Storage, giúp bảo vệ dữ liệu. Ngoài ra em tích hợp **BroadcastChannel API** để nhận và phát tín hiệu đồng bộ ghế theo thời gian thực."

## Phần 3: Điểm nhấn Kỹ thuật (Technical Highlights) 🌟

**Điểm nhấn 1: Quản lý Database giả lập (State Management)**
"Vì không có Backend, thách thức lớn nhất là làm sao lưu trữ và quản lý dữ liệu xuyên suốt các trang. Mình đã giải quyết bằng cách xây dựng một **Data Layer** (file `storage.js`) bọc lại (wrapper) toàn bộ `LocalStorage` và `SessionStorage`.
- `LocalStorage`: Dùng để đóng vai trò như một Database thực sự, lưu trữ lâu dài thông tin Users, Phim, Lịch sử Booking và Trạng thái Khóa ghế.
- `SessionStorage`: Dùng để quản lý phiên đăng nhập hiện tại và Giỏ hàng (Cart) khi người dùng đang ở bước thanh toán."

**Điểm nhấn 2: Đồng bộ ghế ngồi Thời gian thực (Real-time Sync)**
"Một tính năng rất khó ở Frontend thuần là làm sao để nếu User A đang chọn ghế, thì User B mở tab khác cũng phải thấy ghế đó đang bị khóa. Mình đã ứng dụng **BroadcastChannel API** của trình duyệt. Nó cho phép các tab trình duyệt giao tiếp với nhau theo thời gian thực (Real-time). Khi một người bấm chọn ghế, nó bắn event 'seat_locked' qua channel, và tất cả các tab khác sẽ ngay lập tức vô hiệu hóa ghế đó trên màn hình."

## Phần 4: UI/UX và Trải nghiệm người dùng
"Về phần nhìn, dự án được thiết kế theo phong cách **Cinematic Noir** kết hợp với hiệu ứng **Glassmorphism** (kính mờ), mang lại cảm giác cực kỳ điện ảnh và cao cấp (Premium). 
Mình không phụ thuộc vào framework UI có sẵn mà tự tay thiết kế CSS Custom Properties để kiểm soát hệ thống màu sắc. Ngoài ra, để làm cho ứng dụng có cảm giác 'sống động', mình có viết thêm một đoạn script 'Bot Simulation', tự động giả lập có người dùng khác đang giành ghế mỗi 10 giây trên màn hình đặt vé, tạo hiệu ứng fomo và chân thực nhất cho người dùng trải nghiệm."

## Phần 5: Kết luận & Mời xem Demo
"Tóm lại, thông qua dự án 3HD2Kcinema, mình đã có cơ hội đào sâu vào sức mạnh thực sự của Vanilla JavaScript và HTML5 APIs mà không bị phụ thuộc vào các thư viện bên thứ 3. Từ việc quản lý DOM, xử lý Storage phức tạp cho đến Real-time Sync.
Bây giờ, xin mời thầy/cô và các bạn cùng xem trực tiếp bản Demo để thấy luồng đặt vé và tính năng đồng bộ ghế hoạt động thực tế như thế nào."

---

## Các Câu Hỏi Phản Biện (Q&A) Thường Gặp

**🔴 Thầy hỏi:** "Tại sao em phải chia ra Tầng Controller và Tầng Service làm gì cho phức tạp? Gộp chung vào một file JS xử lý cho nhanh không được sao?"
**🟢 Trả lời:** "Dạ, nếu dự án nhỏ thì gộp chung sẽ nhanh hơn. Nhưng với dự án mô phỏng đặt vé có nhiều luồng phức tạp, nếu gộp chung thì file JS sẽ lên tới hàng ngàn dòng (Spaghetti code), rất khó debug và tái sử dụng. Việc tách Tầng Service ra giúp em tái sử dụng logic ở nhiều trang khác nhau (ví dụ logic tính tiền dùng ở cả trang Đặt ghế và trang Thanh toán) mà không cần viết lại code."

**🔴 Thầy hỏi:** "Nếu dữ liệu lưu ở LocalStorage, làm sao em quản lý được tên các biến (keys) không bị trùng lặp?"
**🟢 Trả lời:** "Dạ đó chính là lý do em sinh ra tầng `storage.js`. Trong file này, em định nghĩa sẵn một danh sách các hằng số Keys (như `cinema_users`, `cinema_bookings`). Toàn bộ hệ thống khi cần lưu dữ liệu bắt buộc phải gọi qua file này, nên sẽ không bao giờ xảy ra tình trạng gõ sai tên key hay lưu nhầm dữ liệu ạ."
