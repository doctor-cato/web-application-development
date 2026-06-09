# Movie Reviews & Ratings

## Tổng quan (Overview)
Tính năng cho phép người dùng đánh giá (Rating từ 1-5 sao) và để lại bình luận (Comment) cho các bộ phim. Tính năng này giúp tăng sự tương tác của người dùng và mang lại thông tin tham khảo cho những người xem sau.

## Quy tắc nghiệp vụ (Business Logic)
Để tránh spam và đảm bảo tính chân thực (giống các nền tảng lớn):
- **Verified Purchase (Đã mua vé):** Chỉ những User **đã mua vé** của bộ phim đó VÀ **suất chiếu đã kết thúc** mới được phép để lại đánh giá.
- **Giới hạn:** Mỗi user chỉ được đánh giá 1 lần cho 1 bộ phim (có thể sửa lại đánh giá cũ).
- **Tính toán:** Điểm trung bình (Average Rating) của bộ phim sẽ được tính toán lại mỗi khi có review mới và lưu thẳng vào Model `Movie` để tối ưu truy vấn (tránh phải aggregate mỗi lần load danh sách phim).

## Kiến trúc Dữ liệu (Database Schema)

### Collection: `Review`
- `_id`
- `user` (ref: User)
- `movie` (ref: Movie)
- `rating` (Number, min: 1, max: 5)
- `comment` (String, max: 500 ký tự)
- `timestamps` (createdAt, updatedAt)

### Bổ sung vào Collection `Movie`
- `averageRating` (Number, default: 0)
- `totalReviews` (Number, default: 0)

## API & Backend Logic
- `POST /api/movies/:id/reviews`: Tạo đánh giá mới (Kèm Middleware check điều kiện vé đã mua).
- `PUT /api/movies/:id/reviews`: Sửa đánh giá.
- `GET /api/movies/:id/reviews`: Lấy danh sách đánh giá của 1 phim (có phân trang).

## Frontend UI
- **MovieDetail Page:** Thêm mục "Đánh giá từ khán giả" (Customer Reviews). Hiển thị số sao trung bình bằng icon.
- **Review Modal:** Một Popup/Modal cho phép user chọn số sao và nhập bình luận.
