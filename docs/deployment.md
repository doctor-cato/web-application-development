# Triển khai Hệ thống (Deployment Guide)

Tài liệu này hướng dẫn quy trình triển khai tự động tài liệu (MkDocs Material trên GitHub Pages) cũng như quy trình triển khai ứng dụng Frontend và Backend lên các môi trường Cloud.

---

## 📚 1. Triển khai Tài liệu (MkDocs Material + GitHub Pages)

Dự án được cấu hình tự động triển khai trang web tài liệu khi có commit mới đẩy lên nhánh `main` hoặc `dev2`.

### Cơ chế Tự động hóa qua GitHub Actions Workflow

File cấu hình workflow đặt tại: `.github/workflows/docs.yml`

```mermaid
graph LR
    A[Git Push / PR -> main/dev2] --> B[Job 1: Linting Markdown]
    B --> C{Thành công?}
    C -- Yes --> D[Job 2: Build MkDocs Site]
    D --> E[Deploy to gh-pages Branch]
    E --> F[Public Live Website]
    C -- No --> G[Fail Pipeline & Alert]
    A --> H[Job 3: Auto Update Commit Badge]
    H --> I[Đếm tổng số commits]
    I --> J[Cập nhật badge README & docs/index.md]
    J --> K[Commit & Push tự động]
```

### Các bước thực hiện thủ công (Manual Deploy)

Nếu bạn muốn deploy tài liệu thủ công từ máy cá nhân lên GitHub Pages:

```bash
# 1. Cài đặt các công cụ phụ thuộc
pip install mkdocs-material

# 2. Chạy lệnh deploy tự động tạo nhánh gh-pages
mkdocs gh-deploy --force
```

---

## 🔢 Auto Update Commit Badge (`.github/workflows/update-commit-badge.yml`)

Workflow **`update-commit-badge.yml`** tự động cập nhật badge số commit trong `README.md` và `docs/index.md` mỗi khi có push lên nhánh `main` hoặc `dev2`.

### Cơ chế hoạt động

```bash
# Đếm tổng số commits bằng git
git rev-list --count HEAD

# Cập nhật badge bằng sed (Linux/ubuntu-latest)
sed -i "s|Commits-[0-9]*-blue|Commits-${COUNT}-blue|g" README.md
```

### Kết quả tự động

Mỗi khi push code lên `main`/`dev2`, bot `github-actions[bot]` sẽ:
1. Đếm tổng số commits hiện tại.
2. Cập nhật badge `Commits-NNN-blue` trong `README.md` và `docs/index.md`.
3. Tự động commit và push với message: `chore(badge): auto-update commit count badge to NNN [skip ci]`.

> **Lưu ý**: Tag `[skip ci]` trong commit message ngăn workflow chạy vòng lặp vô tận.

---

## 🌐 2. Triển khai Frontend (Client-side Web App)

Vì Frontend của 3HD2Kcinema là một Static Web Application (HTML, CSS, Vanilla JS), ứng dụng đã được triển khai chính thức trên nền tảng **Vercel**:

👉 **Trực tuyến tại**: [https://32dk-web-app-project.vercel.app](https://32dk-web-app-project.vercel.app)

### Dịch vụ khuyên dùng

- **Vercel**: Tích hợp liên tục với GitHub Repo. Cấu hình root directory thành `frontend/src`.
- **Netlify**: Đặt Build Command là rỗng (`none`) và Publish Directory là `frontend/src`.
- **GitHub Pages**: Đặt thư mục nguồn là `/frontend/src`.

#### File Cấu hình `vercel.json` mẫu

```json
{
  "version": 2,
  "public": true,
  "builds": [
    { "src": "frontend/src/**", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/frontend/src/$1" }
  ]
}
```

---

## ⚙️ 3. Triển khai Backend (ASP.NET Core Scaffold)

Đối với phần máy chủ ASP.NET Core và SQL Server:

### Môi trường Docker Container

Bạn có thể đóng gói Backend bằng `Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
COPY backend/*.csproj ./backend/
RUN dotnet restore backend/*.csproj
COPY backend/ ./backend/
RUN dotnet publish backend/*.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /out .
EXPOSE 80
ENTRYPOINT ["dotnet", "backend.dll"]
```

### Lệnh chạy Docker

```bash
docker build -t 3hd2kcinema-backend .
docker run -d -p 5000:80 --name cinema-backend 3hd2kcinema-backend
```
