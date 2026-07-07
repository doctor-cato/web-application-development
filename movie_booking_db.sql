-- 1. Đảm bảo bạn đang sử dụng đúng database
USE movie_booking_db;
GO

----------------------------------------------------------------------
-- PHẦN 0: DỌN DẸP DATABASE CŨ (NẾU CÓ) ĐỂ TRÁNH LỖI TRÙNG LẶP
----------------------------------------------------------------------
PRINT N'Đang dọn dẹp các bảng cũ...';

DROP TABLE IF EXISTS cine_match_registrations;
DROP TABLE IF EXISTS booking_details;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS showtimes;
DROP TABLE IF EXISTS seats;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS cinemas;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS users;
GO

PRINT N'Dọn dẹp hoàn tất. Bắt đầu tạo bảng mới...';

----------------------------------------------------------------------
-- PHẦN 1: PHÂN HỆ NGƯỜI DÙNG & THÀNH VIÊN
----------------------------------------------------------------------
CREATE TABLE users (
    user_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    full_name NVARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone_number VARCHAR(15) UNIQUE,
    password_hash VARCHAR(255),
    social_provider VARCHAR(20), -- 'GOOGLE', 'FACEBOOK', 'APPLE'
    social_id VARCHAR(255),
    role VARCHAR(20) DEFAULT 'CUSTOMER', -- 'CUSTOMER', 'STAFF', 'ADMIN'
    is_verified_otp BIT DEFAULT 0,
    otp_code NVARCHAR(10) NULL,
    otp_expiry_time DATETIME NULL,
    avatar_url VARCHAR(255),
    vip_plan VARCHAR(20) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

----------------------------------------------------------------------
-- PHẦN 2: PHÂN HỆ PHIM & RẠP CHIẾU
----------------------------------------------------------------------
CREATE TABLE movies (
    movie_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    trailer_url VARCHAR(255),
    poster_url VARCHAR(255),
    director NVARCHAR(100),
    cast_members NVARCHAR(MAX),
    duration_minutes INT NOT NULL,
    age_rating VARCHAR(10) NOT NULL, -- 'P', 'T13', 'T16', 'T18', 'K'
    genres NVARCHAR(255), -- Dạng chuỗi: 'Hành động, Viễn tưởng'
    release_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'UPCOMING', -- 'NOW_SHOWING', 'UPCOMING', 'ENDED'
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE cinemas (
    cinema_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL,
    address NVARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8), -- Vĩ độ Google Maps
    longitude DECIMAL(11, 8), -- Kinh độ Google Maps
    city NVARCHAR(50),
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE rooms (
    room_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    cinema_id UNIQUEIDENTIFIER REFERENCES cinemas(cinema_id) ON DELETE CASCADE,
    name NVARCHAR(50) NOT NULL, -- Ví dụ: 'Phòng 1', 'Phòng IMAX'
    screen_type VARCHAR(20) DEFAULT '2D', -- '2D', '3D', 'IMAX'
    total_seats INT NOT NULL
);

CREATE TABLE seats (
    seat_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    room_id UNIQUEIDENTIFIER REFERENCES rooms(room_id) ON DELETE CASCADE,
    seat_number VARCHAR(10) NOT NULL, -- 'A1', 'H12'
    row_name VARCHAR(5) NOT NULL, -- 'A', 'H'
    seat_type VARCHAR(20) DEFAULT 'STANDARD', -- 'STANDARD', 'VIP', 'SWEETBOX', 'SOCIAL_ZONE'
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE showtimes (
    showtime_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    movie_id UNIQUEIDENTIFIER REFERENCES movies(movie_id) ON DELETE CASCADE,
    room_id UNIQUEIDENTIFIER REFERENCES rooms(room_id) ON DELETE CASCADE,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO

----------------------------------------------------------------------
-- PHẦN 3: PHÂN HỆ ĐẶT VÉ
----------------------------------------------------------------------
CREATE TABLE bookings (
    booking_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER REFERENCES users(user_id) ON DELETE SET NULL,
    showtime_id UNIQUEIDENTIFIER REFERENCES showtimes(showtime_id),
    total_amount DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    final_amount DECIMAL(12, 2) NOT NULL,
    booking_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'CANCELLED'
    qr_code_url VARCHAR(255),
    is_split_payment BIT DEFAULT 0, -- Có chia tiền nhóm không?
    lock_expires_at DATETIME, -- Thời gian giữ ghế
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE booking_details (
    booking_detail_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    booking_id UNIQUEIDENTIFIER REFERENCES bookings(booking_id) ON DELETE CASCADE,
    seat_id UNIQUEIDENTIFIER REFERENCES seats(seat_id),
    actual_price DECIMAL(10, 2) NOT NULL, -- Giá ghế (đã tính phụ thu VIP/Sweetbox)
    seat_status VARCHAR(20) DEFAULT 'SELECTED',
    assigned_user_id UNIQUEIDENTIFIER REFERENCES users(user_id) -- Dành cho người được chia ghế trả tiền
);
GO

----------------------------------------------------------------------
-- PHẦN 4: CINE-MATCH
----------------------------------------------------------------------
CREATE TABLE cine_match_registrations (
    match_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER REFERENCES users(user_id),
    showtime_id UNIQUEIDENTIFIER REFERENCES showtimes(showtime_id),
    gender_preference VARCHAR(10), -- 'MALE', 'FEMALE', 'ANY'
    matched_with_user_id UNIQUEIDENTIFIER REFERENCES users(user_id),
    is_revealed BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE()
);
GO

----------------------------------------------------------------------
-- PHẦN 5: TẠO CHỈ MỤC (INDEX) GIÚP TĂNG TỐC ĐỘ TRUY VẤN
----------------------------------------------------------------------
PRINT N'Đang tạo Indexes để tối ưu hiệu suất...';

CREATE INDEX idx_movies_status ON movies(status);
CREATE INDEX idx_showtimes_start ON showtimes(start_time);
CREATE INDEX idx_seats_room ON seats(room_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
GO

----------------------------------------------------------------------
-- PHẦN 6: CHÈN DỮ LIỆU MẪU (MOCK DATA)
----------------------------------------------------------------------
PRINT N'Đang chèn dữ liệu mẫu...';

-- Insert Default Users
INSERT INTO users (user_id, full_name, email, phone_number, password_hash, role) VALUES 
(NEWID(), 'Admin', 'admin@gmail.com', '0123456789', '123456', 'ADMIN'),
(NEWID(), 'Staff Member', 'staff@gmail.com', '0987654321', '123456', 'STAFF'),
(NEWID(), N'Nguyễn Văn A', 'a@gmail.com', '0111222333', '123456', 'CUSTOMER');
GO

PRINT N'✅ THÀNH CÔNG! Database đã được dọn dẹp thành công.';