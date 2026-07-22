# Hướng dẫn Khởi chạy (Getting Started)

Tài liệu này hướng dẫn bạn cách thiết lập môi trường phát triển và khởi chạy ứng dụng 3HD2Kcinema trên máy cục bộ (Local Machine).

---

## 🛠️ Yêu cầu Môi trường (Prerequisites)

Tùy thuộc vào phần bạn muốn chạy, bạn cần cài đặt các công cụ sau:

### Cho phần Frontend (Ứng dụng chạy chính thức)

- **Python 3.x** (Khuyên dùng cho HTTP static server đơn giản).
- **Node.js** (Phiên bản 18+ trở lên, dùng để theo dõi & biên dịch lại Tailwind CSS hoặc chạy Playwright test).

### Cho phần Backend (Khung mô hình mẫu ASP.NET Core)

- **.NET SDK 8.0** trở lên.
- **SQL Server / SQL Express** hoặc **LocalDB**.
- **Visual Studio 2022** hoặc **VS Code** (kèm C# Extension).

---

## 💻 1. Khởi chạy Frontend (Giao diện Client-side)

Hiện tại, bạn **chỉ cần khởi chạy thư mục Frontend** để kiểm thử toàn bộ luồng trải nghiệm người dùng từ Đăng nhập, Chọn phim, Giữ ghế real-time, Đặt bắp nước, Thanh toán đến Hóa đơn QR.

!!! note "Độc lập Môi trường"
    Frontend không yêu cầu kết nối cơ sở dữ liệu bên ngoài. Tất cả dữ liệu chạy dựa trên `LocalStorage` và `SessionStorage`.

### Bước 1: Mở Terminal và chuyển đến thư mục `frontend`

```bash
cd frontend
```

### Bước 2: Khởi chạy HTTP Web Server

**Sử dụng Python Web Server (Đơn giản nhất):**

```bash
python -m http.server 3000 -d src
# Hoặc nếu trên Linux/macOS sử dụng python3:
python3 -m http.server 3000 -d src
```

**Hoặc sử dụng Node `serve` / `npx`:**

```bash
npx serve src -l 3000
```

### Bước 3: Truy cập trình duyệt

Mở trình duyệt web và truy cập địa chỉ: [http://localhost:3000](http://localhost:3000)

---

## 🎨 Biên dịch lại Tailwind CSS (Dành cho Dev)

Nếu bạn thay đổi cấu trúc HTML hoặc các lớp CSS tùy chỉnh, bạn có thể khởi chạy bộ theo dõi biên dịch tự động của Tailwind CSS:

```bash
cd frontend
npm install
npm run tailwind:watch
```

Nguồn cấu hình Tailwind nằm tại `frontend/tailwind.config.js`.

---

## ⚙️ 2. Khởi chạy Backend (ASP.NET Core Scaffold)

Phần Backend dành cho việc thử nghiệm khung API và kết nối CSDL SQL Server.

### Bước 1: Cấu hình Chuỗi kết nối Database

Mở tệp `backend/appsettings.json` và điều chỉnh `ConnectionStrings` phù hợp với máy của bạn:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=movie_booking_db;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  }
}
```

### Bước 2: Chạy ứng dụng .NET

Mở terminal tại thư mục root hoặc `backend/`:

```bash
cd backend
dotnet restore
dotnet run
```

!!! info "Tự động Nạp dữ liệu (Data Seeding)"
    Khi khởi chạy lần đầu tiên, phương thức `DbInitializer` sẽ tự động tạo database `movie_booking_db` (nếu chưa có) và nạp dữ liệu phim mẫu từ file `backend/DataSeeding/movies.json`.

---

## 📖 3. Khởi chạy Website Tài liệu (MkDocs Local Preview)

Để xem website tài liệu này dưới dạng giao diện xem trước (Live Preview):

### Bước 1: Cài đặt MkDocs Material

```bash
pip install mkdocs-material
```

### Bước 2: Chạy server tài liệu

Tại thư mục gốc dự án:

```bash
mkdocs serve
```

Truy cập địa chỉ: [http://127.0.0.1:8000](http://127.0.0.1:8000)
Tài liệu sẽ tự động reload khi bạn thay đổi các tệp `.md` trong thư mục `docs/`.
