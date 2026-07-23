# 3HD2Kcinema — Hệ thống Đặt Vé Rạp Chiếu Phim

Ứng dụng web mô phỏng toàn bộ luồng đặt vé rạp chiếu phim, từ xem phim, chọn ghế real-time, thanh toán đến hóa đơn QR code và quản lý tài khoản.

![3HD2Kcinema Banner](https://img.shields.io/badge/3HD2Kcinema-v2.7.7-red?style=for-the-badge)
![Git Commits](https://img.shields.io/badge/Commits-277-blue?style=for-the-badge)
![Vercel Deployment](https://img.shields.io/badge/Vercel-32dk--web--app--project.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)
![MkDocs](https://img.shields.io/badge/Docs-MkDocs--Material-009688?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-blue?style=for-the-badge)

---

## 🌐 Trải nghiệm Trực tuyến (Live Demo)

Ứng dụng Frontend đã được triển khai trực tiếp trên Vercel:

👉 **Link Web App**: [https://32dk-web-app-project.vercel.app](https://32dk-web-app-project.vercel.app)

---

## 🚀 Trạng thái Hiện tại của Dự án

Dự án được cấu trúc theo mô hình song song:

1. **Frontend (Thư mục `/frontend`) - Nhánh chạy chính thức**: Ứng dụng client-side hoàn chỉnh được phát triển bằng HTML5, CSS3, Vanilla JS và Tailwind CSS. Để phục vụ việc chạy độc lập không phụ thuộc môi trường mạng, toàn bộ luồng dữ liệu (users, bookings, seat locks, rewards, notifications) được **giả lập qua LocalStorage và SessionStorage** cùng **BroadcastChannel API** để đồng bộ trạng thái khóa ghế thời gian thực giữa các tab.
---

## 📌 Phiên bản & Lịch sử Commit (Version Info)

- **Tổng số commits**: **277 commits** (được kiểm tra tự động qua Git history).
- **Phiên bản hiện tại**: **`v2.7.7`** (Chuyển đổi từ 277 commits theo chuẩn Semantic Versioning: `v2.7.7` ứng với Major 2, Minor 7, Patch 7 đại diện cho 277 bước hoàn thiện và cải tiến mã nguồn hệ thống).

---

## 🛠️ Stack Công nghệ Tài liệu (Documentation Stack)

Trang tài liệu của hệ thống được xây dựng và xuất bản tự động theo stack tiêu chuẩn chuyên nghiệp:

- **MkDocs**: Framework tạo website tài liệu tĩnh từ định dạng Markdown.
- **Material for MkDocs**: Giao diện hiện đại (Cinematic Noir / Light Mode toggle), hỗ trợ tìm kiếm, tabs, code highlight và admonition.
- **GitHub Pages & Actions**: Tự động kiểm tra định dạng và xuất bản website tài liệu ngay trên GitHub qua tệp workflow `.github/workflows/docs.yml`.
- **Markdownlint**: Tự động kiểm tra cú pháp và định dạng Markdown (`.markdownlint.yml`).

### Xem Trước Website Tài liệu tại Local

```bash
# Cài đặt MkDocs Material
pip install mkdocs-material

# Khởi chạy server xem trước
mkdocs serve
```

> Truy cập tài liệu tại: `http://127.0.0.1:8000`

---

## 💻 Cách Chạy Ứng Dụng (Local)

Hiện tại bạn có thể trải nghiệm trực tiếp qua link Vercel ở trên hoặc khởi chạy thủ công thư mục Frontend:

### Khởi chạy Frontend (Giao diện Client)

Mở terminal, chuyển vào thư mục `frontend` và chạy server tĩnh:

```bash
cd frontend

# Sử dụng Python để chạy web tĩnh (khuyên dùng):
python -m http.server 3000 -d src
# Hoặc nếu dùng python3:
python3 -m http.server 3000 -d src
```

> Truy cập trình duyệt tại: `http://localhost:3000`.

---

## 📁 Cấu trúc Thư mục Hệ thống

```text
3HD2Kcinema/
├── README.md                  # Tổng quan dự án & Hướng dẫn khởi chạy
├── LICENSE                    # Giấy phép bản quyền MIT
├── .gitignore                 # Các tệp/thư mục bỏ qua khi commit git
├── mkdocs.yml                 # Cấu hình website tài liệu MkDocs Material
├── .markdownlint.yml          # Cấu hình quy tắc kiểm tra cú pháp Markdown
├── .github/
│   └── workflows/
│       └── docs.yml           # GitHub Actions workflow tự động build & deploy docs
├── docs/                      # Thư mục chứa toàn bộ trang tài liệu chuyên nghiệp
│   ├── index.md               # Tổng quan dự án & lộ trình
│   ├── getting-started.md     # Hướng dẫn thiết lập môi trường & khởi chạy
│   ├── architecture.md        # Kiến trúc Client-side Mock Engine & ASP.NET Core
│   ├── frontend.md            # Chi tiết mã nguồn Frontend, ES6 Modules & UI/UX
│   ├── backend.md             # Chi tiết mã nguồn Backend ASP.NET Core & EF Core
│   ├── api.md                 # Tài liệu RESTful API Endpoints & Client Mock Services
│   ├── database.md            # Cấu trúc Storage trình duyệt & CSDL SQL Server
│   ├── deployment.md          # Hướng dẫn triển khai GitHub Pages, Vercel & Docker
│   ├── testing.md             # Kịch bản kiểm thử tự động Playwright & Thủ công
│   ├── contributing.md        # Quy trình đóng góp & Quy ước Commit
│   ├── ai-contribution.md     # Hướng dẫn & Quy định dành cho AI Agent
│   └── ai-skills-config.md    # Chi tiết sàng lọc & Cấu hình Skills AI Cục bộ
├── frontend/                  # Mã nguồn ứng dụng Frontend (Client-side)
│   ├── src/                   # Thư mục giao diện & logic (auth, booking, explore, user,...)
│   └── package.json           # Các npm scripts (tailwind watch, serve)
└── backend/                   # Khung mã nguồn Backend (ASP.NET Core C#)
    ├── Controllers/           # Controllers MVC & Web API
    ├── Models/                # Entity Framework Models
    └── Services/              # Lớp Business Logic Services
```

---

## 📚 Hệ thống Tài liệu Chi tiết (Docs Directory)

Tham khảo thư mục [`docs/`](./docs/) hoặc website MkDocs để xem nội dung đầy đủ:

- [🔗 Tổng quan (`docs/index.md`)](./docs/index.md)
- [🔗 Bắt đầu (`docs/getting-started.md`)](./docs/getting-started.md)
- [🔗 Kiến trúc (`docs/architecture.md`)](./docs/architecture.md)
- [🔗 Frontend (`docs/frontend.md`)](./docs/frontend.md)
- [🔗 Backend (`docs/backend.md`)](./docs/backend.md)
- [🔗 API (`docs/api.md`)](./docs/api.md)
- [🔗 Cơ sở Dữ liệu (`docs/database.md`)](./docs/database.md)
- [🔗 Triển khai (`docs/deployment.md`)](./docs/deployment.md)
- [🔗 Kiểm thử (`docs/testing.md`)](./docs/testing.md)
- [🔗 Quy trình Đóng góp (`docs/contributing.md`)](./docs/contributing.md)
- [🔗 Hướng dẫn AI Agent (`docs/ai-contribution.md`)](./docs/ai-contribution.md)
- [🔗 Cấu hình Skills AI (`docs/ai-skills-config.md`)](./docs/ai-skills-config.md)
