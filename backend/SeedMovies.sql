-- ============================================
-- CLEAN SEED: Xóa toàn bộ phim cũ và thêm lại 11 phim có ảnh thật và trailer chuẩn
-- ============================================
DELETE FROM booking_details;
DELETE FROM bookings;
DELETE FROM showtimes;
DELETE FROM movies;

INSERT INTO movies (title, description, duration_minutes, age_rating, genres, poster_url, trailer_url, release_date) VALUES 
(N'READY PLAYER ONE', N'Lấy bối cảnh năm 2045, thế giới thực đang trên đà sụp đổ, con người tìm thấy sự cứu rỗi trong OASIS - một vũ trụ ảo khổng lồ. Khi người sáng lập OASIS qua đời, anh ta để lại một Trứng Phục Sinh trong trò chơi.', 140, N'T13', N'Hành Động, Viễn Tưởng', N'/images/movies/Ready_Player_One.jpg', N'https://www.youtube.com/embed/cSp1dM2Vj48', N'2018-03-29');

INSERT INTO movies (title, description, duration_minutes, age_rating, genres, poster_url, trailer_url, release_date) VALUES 
(N'Gran Turismo - Tay Đua Cự Phách', N'Dựa trên câu chuyện có thật về Jann Mardenborough, một game thủ thiếu niên giành chiến thắng trong cuộc thi của Nissan, biến ước mơ trở thành tay đua chuyên nghiệp thành hiện thực trên đường đua thật sự.', 134, N'T13', N'Hành Động, Thể Thao', N'/images/movies/Gran_Turismo.jpg', N'https://www.youtube.com/embed/GkXeVIfbGOw', N'2023-08-25');

INSERT INTO movies (title, description, duration_minutes, age_rating, genres, poster_url, trailer_url, release_date) VALUES 
(N'Iron Man 2', N'Tony Stark đối mặt với áp lực từ chính phủ đòi giao nộp công nghệ Iron Man, trong khi một kẻ thù mới Ivan Vanko xuất hiện với vũ khí khủng khiếp.', 124, N'T13', N'Hành Động, Khoa Học Viễn Tưởng', N'/images/movies/iron_man2.jpg', N'https://www.youtube.com/embed/BoohRoVA9WQ', N'2010-05-07');

INSERT INTO movies (title, description, duration_minutes, age_rating, genres, poster_url, trailer_url, release_date) VALUES 
(N'F1: The Movie', N'Một cựu tay đua bất ngờ quay trở lại đường đua Công thức 1 sau nhiều năm vắng bóng, đồng đội với một tài năng trẻ đầy triển vọng tại đội đua cuối bảng.', 130, N'T16', N'Hành Động, Thể Thao', N'/images/movies/f1_movie.jpg', N'https://www.youtube.com/embed/a8gEGuE_7_o', N'2025-06-27');

INSERT INTO movies (title, description, duration_minutes, age_rating, genres, poster_url, trailer_url, release_date) VALUES 
(N'KẺ KIẾN TẠO', N'Trong tương lai khi trí tuệ nhân tạo vươn lên nắm quyền lực, Joshua phải xâm nhập vào sào huyệt của AI để tiêu diệt "Người Kiến Tạo".', 133, N'T16', N'Hành Động, Viễn Tưởng', N'/images/movies/Ke_Kien_Tao_2.jpg', N'https://www.youtube.com/embed/ex3C1-5Dhb8', N'2023-09-29');

INSERT INTO movies (title, description, duration_minutes, age_rating, genres, poster_url, trailer_url, release_date) VALUES 
(N'Battle: Los Angeles', N'Khi những thiên thạch bí ẩn rơi xuống, quân đội nhận ra đây thực chất là cuộc xâm lăng của người ngoài hành tinh.', 116, N'T16', N'Hành Động, Viễn Tưởng', N'/images/movies/battle_la.jpg', N'https://www.youtube.com/embed/1-HGCzB9Dtk', N'2011-03-11');

INSERT INTO movies (title, description, duration_minutes, age_rating, genres, poster_url, trailer_url, release_date) VALUES 
(N'War Machine', N'Câu chuyện châm biếm về một vị tướng Mỹ đầy tham vọng được giao chỉ huy cuộc chiến ở Afghanistan.', 122, N'T18', N'Hành Động, Chính Trị', N'/images/movies/war_machine.jpg', N'https://www.youtube.com/embed/B6cWGUJebkM', N'2017-05-26');

INSERT INTO movies (title, description, duration_minutes, age_rating, genres, poster_url, trailer_url, release_date) VALUES 
(N'World War Z - Thế Chiến Z', N'Khi đại dịch zombie bùng phát, cựu điều tra viên Liên Hợp Quốc Gerry Lane phải tìm ra nguồn gốc của dịch bệnh.', 116, N'T16', N'Hành Động, Kinh Dị', N'/images/movies/World_war_Z.jpg', N'https://www.youtube.com/embed/HcwTxRuq-uk', N'2013-06-21');

INSERT INTO movies (title, description, duration_minutes, age_rating, genres, poster_url, trailer_url, release_date) VALUES 
(N'Moon Fall - Trăng Rơi', N'Mặt Trăng bất ngờ bị đẩy khỏi quỹ đạo và lao thẳng về phía Trái Đất. Chỉ còn vài tuần trước khi va chạm...', 130, N'T13', N'Hành Động, Viễn Tưởng', N'/images/movies/Moon_Fall.jpg', N'https://www.youtube.com/embed/ivIwdQBlS10', N'2022-02-04');

INSERT INTO movies (title, description, duration_minutes, age_rating, genres, poster_url, trailer_url, release_date) VALUES 
(N'Your Name - Tên Cậu Là Gì?', N'Hai cô cậu học sinh trung học bất ngờ bị hoán đổi cơ thể cho nhau trong giấc mơ.', 106, N'T13', N'Anime, Tình Cảm', N'/images/movies/Kimi-no-Na-wa.-Visual.jpg', N'https://www.youtube.com/embed/xU47nhruN-Q', N'2016-08-26');

INSERT INTO movies (title, description, duration_minutes, age_rating, genres, poster_url, trailer_url, release_date) VALUES 
(N'BATTLESHIP - CHIẾN HẠM', N'Cuộc chiến khốc liệt trên biển khơi nổ ra khi hạm đội hải quân quốc tế bất ngờ chạm trán với một hạm đội tàu chiến của người ngoài hành tinh.', 131, N'T13', N'Hành Động, Viễn Tưởng', N'/images/movies/battle_la.jpg', N'https://www.youtube.com/embed/cp3646Z1H6U', N'2012-05-18');