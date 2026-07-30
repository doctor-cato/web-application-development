# Kế hoạch Kiểm thử (TEST_PLAN.md)

Tài liệu này xác định chiến lược, phạm vi và công cụ kiểm thử áp dụng cho hệ thống Web Application Development (ASP.NET Core 8 & HTML/JS Frontend).

## 1. Phạm vi Kiểm thử (Testing Scope)

- **Unit Testing (Backend .NET 8)**:
  - Kiểm thử logic xử lý đặt vé, tính tổng tiền vé, giá combo và áp dụng mã giảm giá.
  - Kiểm thử logic mã hóa mật khẩu (`PasswordHasher` / `BCrypt`) và khởi tạo mã OTP an toàn.
- **End-to-End Testing (Frontend Playwright)**:
  - Kiểm thử luồng đặt vé người dùng (`tests/e2e/booking-flow.spec.js`).
  - Kiểm thử khả năng truy cập Accessibility (`tests/e2e/accessibility.spec.js`).
  - Kiểm thử so sánh giao diện Visual Regression (`tests/e2e/visual-comparison.spec.js`).

## 2. Công cụ Sử dụng

| Loại Kiểm thử | Công cụ / Framework | Vị trí Mã nguồn |
| :--- | :--- | :--- |
| **Backend Unit Test** | xUnit, Moq, FluentAssertions | `tests/backend.tests/` |
| **Frontend E2E Test** | Playwright | `tests/e2e/` |

## 3. Lệnh Chạy Kiểm thử (Test Commands)

### Chạy Backend Unit Tests
```bash
dotnet test tests/backend.tests/appweb.Tests.csproj
```

### Chạy Frontend E2E Tests
```bash
npx playwright test
```
