# Sơ đồ Kiến trúc Hệ thống 3HD2Kcinema (Frontend)

Kiến trúc dự án được thiết kế theo mô hình **Feature-Based (hay Domain-Based)** và áp dụng nghiêm ngặt nguyên tắc phân tầng (Layered Architecture).

## 1. Sơ đồ Kiến trúc Phân tầng (Layered Architecture)

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

## 2. Giải thích luồng hoạt động (Dùng khi Thuyết trình / Q&A)

Kiến trúc hệ thống được chia làm 4 tầng riêng biệt để đảm bảo tính **Separation of Concerns** (Phân tách mối quan tâm). Luồng hoạt động đi từ trên xuống dưới như sau:

1. **Tầng Giao diện (Views):** Là các file HTML thuần. Tầng này tuyệt đối không chứa logic JavaScript, nó chỉ làm nhiệm vụ hiển thị cấu trúc trang và giao tiếp với người dùng.
2. **Tầng Controller (Page JS):** Mỗi trang HTML sẽ được gắn với một file Controller JS tương ứng. Tầng này chịu trách nhiệm bắt các sự kiện (click chuột, nhập form) và thay đổi giao diện. Tuy nhiên, tầng này **không được phép** tính toán tiền hay lưu dữ liệu trực tiếp.
3. **Tầng Service (Nghiệp vụ):** Khi Controller cần xử lý một thao tác phức tạp, nó sẽ gọi xuống tầng Service. Tầng này chứa toàn bộ Business Logic cốt lõi của dự án (Ví dụ: kiểm tra ghế trống, tính tổng tiền vé).
4. **Tầng Dữ liệu (Data Layer / Utilities):** Đây là tầng thấp nhất, thay thế cho Database truyền thống. Sử dụng file `storage.js` để bọc lại (wrap) toàn bộ thao tác gọi LocalStorage/SessionStorage, giúp bảo vệ dữ liệu không bị ghi đè. Ngoài ra tích hợp **BroadcastChannel API** để nhận và phát tín hiệu đồng bộ ghế theo thời gian thực giữa các tab.

### Câu hỏi Phản biện (Q&A) liên quan:

**🔴 Câu hỏi:** "Tại sao em phải chia ra Tầng Controller và Tầng Service làm gì cho phức tạp? Gộp chung vào một file JS xử lý cho nhanh không được sao?"
**🟢 Trả lời:** "Nếu dự án nhỏ thì gộp chung sẽ nhanh hơn. Nhưng với dự án mô phỏng đặt vé có nhiều luồng phức tạp, nếu gộp chung thì file JS sẽ lên tới hàng ngàn dòng (Spaghetti code), rất khó debug và tái sử dụng. Việc tách Tầng Service ra giúp tái sử dụng logic ở nhiều trang khác nhau (ví dụ logic tính tiền dùng ở cả trang Đặt ghế và trang Thanh toán) mà không cần viết lại code."

**🔴 Câu hỏi:** "Nếu dữ liệu lưu ở LocalStorage, làm sao quản lý được tên các biến (keys) không bị trùng lặp?"
**🟢 Trả lời:** "Đó chính là lý do sinh ra tầng `storage.js`. Trong file này, định nghĩa sẵn một danh sách các hằng số Keys (như `cinema_users`, `cinema_bookings`). Toàn bộ hệ thống khi cần lưu dữ liệu bắt buộc phải gọi qua file này, nên sẽ không bao giờ xảy ra tình trạng gõ sai tên key hay lưu nhầm dữ liệu."
