using appweb.Models;
using System.IO;

namespace appweb.Infrastructure
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            if (!context.Movies.Any())
            {
                var movies = new List<Movie>
                {
                    new Movie { MovieId = Guid.Parse("a1111111-1111-1111-1111-111111111111"), Title = "Moon Fall - Trăng Rơi", Description = "Mặt Trăng bất ngờ bị đẩy khỏi quỹ đạo và lao thẳng về phía Trái Đất. Chỉ còn vài tuần trước khi va chạm...", Duration = 130, AgeRating = "T13", Genre = "Hành Động, Viễn Tưởng", PosterUrl = "", TrailerUrl = "https://www.youtube.com/embed/ivIwdQBlS10", ReleaseDate = new DateTime(2022, 2, 4), Status = "now-showing" },
                    new Movie { MovieId = Guid.Parse("a2222222-2222-2222-2222-222222222222"), Title = "KẺ KIẾN TẠO", Description = "Trong tương lai khi trí tuệ nhân tạo vươn lên nắm quyền lực, Joshua phải xâm nhập vào sào huyệt của AI để tiêu diệt Người Kiến Tạo.", Duration = 133, AgeRating = "T16", Genre = "Hành Động, Viễn Tưởng", PosterUrl = "", TrailerUrl = "https://www.youtube.com/embed/ex3C1-5Dhb8", ReleaseDate = new DateTime(2023, 9, 29), Status = "now-showing" },
                    new Movie { MovieId = Guid.Parse("a3333333-3333-3333-3333-333333333333"), Title = "World War Z - Thế Chiến Z", Description = "Khi đại dịch zombie bùng phát, cựu điều tra viên Liên Hợp Quốc Gerry Lane phải tìm ra nguồn gốc của dịch bệnh.", Duration = 116, AgeRating = "T16", Genre = "Hành Động, Kinh Dị", PosterUrl = "", TrailerUrl = "https://www.youtube.com/embed/HcwTxRuq-uk", ReleaseDate = new DateTime(2013, 6, 21), Status = "now-showing" },
                    new Movie { MovieId = Guid.Parse("a4444444-4444-4444-4444-444444444444"), Title = "Iron Man 2", Description = "Tony Stark đối mặt với áp lực từ chính phủ đòi giao nộp công nghệ Iron Man, trong khi một kẻ thù mới Ivan Vanko xuất hiện.", Duration = 124, AgeRating = "T13", Genre = "Hành Động, Viễn Tưởng", PosterUrl = "", TrailerUrl = "https://www.youtube.com/embed/BoohRoVA9WQ", ReleaseDate = new DateTime(2010, 5, 7), Status = "now-showing" },
                    new Movie { MovieId = Guid.Parse("a5555555-5555-5555-5555-555555555555"), Title = "READY PLAYER ONE", Description = "Lấy bối cảnh năm 2045, thế giới thực đang trên đà sụp đổ, con người tìm thấy sự cứu rỗi trong OASIS - một vũ trụ ảo khổng lồ.", Duration = 140, AgeRating = "T13", Genre = "Hành Động, Viễn Tưởng", PosterUrl = "", TrailerUrl = "https://www.youtube.com/embed/cSp1dM2Vj48", ReleaseDate = new DateTime(2018, 3, 29), Status = "now-showing" },
                    new Movie { MovieId = Guid.Parse("a6666666-6666-6666-6666-666666666666"), Title = "Gran Turismo - Tay Đua Cự Phách", Description = "Dựa trên câu chuyện có thật về Jann Mardenborough, một game thủ thiếu niên giành chiến thắng trong cuộc thi của Nissan.", Duration = 134, AgeRating = "T13", Genre = "Hành Động, Thể Thao", PosterUrl = "", TrailerUrl = "https://www.youtube.com/embed/GkXeVIfbGOw", ReleaseDate = new DateTime(2023, 8, 25), Status = "now-showing" },
                    new Movie { MovieId = Guid.Parse("a7777777-7777-7777-7777-777777777777"), Title = "Battle: Los Angeles", Description = "Khi những thiên thạch bí ẩn rơi xuống, quân đội nhận ra đây thực chất là cuộc xâm lăng của người ngoài hành tinh.", Duration = 116, AgeRating = "T16", Genre = "Hành Động, Viễn Tưởng", PosterUrl = "", TrailerUrl = "https://www.youtube.com/embed/1-HGCzB9Dtk", ReleaseDate = new DateTime(2011, 3, 11), Status = "now-showing" },
                    new Movie { MovieId = Guid.Parse("a8888888-8888-8888-8888-888888888888"), Title = "BATTLESHIP - CHIẾN HẠM", Description = "Cuộc chiến khốc liệt trên biển khơi nổ ra khi hạm đội hải quân quốc tế bất ngờ chạm trán với người ngoài hành tinh.", Duration = 131, AgeRating = "T13", Genre = "Hành Động, Viễn Tưởng", PosterUrl = "", TrailerUrl = "https://www.youtube.com/embed/cp3646Z1H6U", ReleaseDate = new DateTime(2012, 5, 18), Status = "now-showing" },
                    new Movie { MovieId = Guid.Parse("a9999999-9999-9999-9999-999999999999"), Title = "Your Name - Tên Cậu Là Gì?", Description = "Hai cô cậu học sinh trung học bất ngờ bị hoán đổi cơ thể cho nhau trong giấc mơ.", Duration = 106, AgeRating = "T13", Genre = "Anime, Tình Cảm", PosterUrl = "", TrailerUrl = "https://www.youtube.com/embed/xU47nhruN-Q", ReleaseDate = new DateTime(2016, 8, 26), Status = "now-showing" },
                    new Movie { MovieId = Guid.Parse("b1111111-1111-1111-1111-111111111111"), Title = "F1: The Movie", Description = "Một cựu tay đua bất ngờ quay trở lại đường đua Công thức 1 sau nhiều năm vắng bóng.", Duration = 130, AgeRating = "T16", Genre = "Hành Động, Thể Thao", PosterUrl = "", TrailerUrl = "https://www.youtube.com/embed/a8gEGuE_7_o", ReleaseDate = new DateTime(2026, 10, 15), Status = "coming-soon" },
                    new Movie { MovieId = Guid.Parse("b3333333-3333-3333-3333-333333333333"), Title = "War Machine", Description = "Câu chuyện châm biếm về một vị tướng Mỹ đầy tham vọng được giao chỉ huy cuộc chiến ở Afghanistan.", Duration = 122, AgeRating = "T18", Genre = "Hành Động, Chính Trị", PosterUrl = "", TrailerUrl = "https://www.youtube.com/embed/B6cWGUJebkM", ReleaseDate = new DateTime(2026, 11, 20), Status = "coming-soon" }
                };


                context.Movies.AddRange(movies);
                context.SaveChanges();
            }

            if (!context.Users.Any())
            {
                var users = new List<User>
                {
                    new User { UserId = Guid.NewGuid(), Fullname = "Admin", Email = "admin@gmail.com", Phone = "0123456789", Password = "123456", Role = "ADMIN", IsVerifiedOtp = true, IsTwoFactorEnabled = false },
                    new User { UserId = Guid.NewGuid(), Fullname = "Staff Member", Email = "staff@gmail.com", Phone = "0987654321", Password = "123456", Role = "STAFF", IsVerifiedOtp = true, IsTwoFactorEnabled = false },
                    new User { UserId = Guid.NewGuid(), Fullname = "Nguyễn Văn A", Email = "a@gmail.com", Phone = "0111222333", Password = "123456", Role = "CUSTOMER", IsVerifiedOtp = true, IsTwoFactorEnabled = false }
                };

                context.Users.AddRange(users);
                context.SaveChanges();
            }

            if (!context.Combos.Any())
            {
                var combos = new List<Combo>
                {
                    new Combo { Id = "cb_1", Name = "Combo Solo", Desc = "1 Bắp ngọt lớn + 1 Nước ngọt 22oz tự chọn", Price = 75000, Stock = 120, Image = "/images/F&B/combo_single.png", Category = "Combo" },
                    new Combo { Id = "cb_2", Name = "Combo Couple", Desc = "1 Bắp ngọt khổng lồ + 2 Nước ngọt 22oz", Price = 99000, Stock = 85, Image = "/images/F&B/combo_couple.png", Category = "Combo" },
                    new Combo { Id = "cb_3", Name = "Combo Gia Đình (Party)", Desc = "2 Bắp lớn + 3 Nước ngọt tùy chọn + 1 Snack", Price = 155000, Stock = 40, Image = "/images/F&B/combo_family.png", Category = "Combo" },
                    new Combo { Id = "fb_1", Name = "Bắp Ngọt (Lớn)", Desc = "Bắp rang bơ vị ngọt thơm nức", Price = 45000, Stock = 200, Image = "/shared/images/food_popcorn.png", Category = "Đồ ăn" },
                    new Combo { Id = "fb_2", Name = "Pepsi Lon 330ml", Desc = "Nước ngọt có ga sảng khoái", Price = 25000, Stock = 150, Image = "/shared/images/food_pepsi.png", Category = "Nước uống" },
                    new Combo { Id = "fb_3", Name = "Coca-Cola Chai 390ml", Desc = "Nước ngọt có ga ướp lạnh", Price = 25000, Stock = 150, Image = "/shared/images/food_coca.png", Category = "Nước uống" }
                };
                context.Combos.AddRange(combos);
                context.SaveChanges();
            }

            if (!context.Cinemas.Any())
            {
                var cinema1 = new Cinema
                {
                    Id = Guid.Parse("c1111111-1111-1111-1111-111111111111"),
                    Name = "3HD2K HÀ ĐÔNG",
                    Address = "Tầng 4, MAC Plaza, 10 Trần Phú, Hà Đông, Hà Nội",
                    City = "Hà Nội"
                };
                var cinema2 = new Cinema
                {
                    Id = Guid.Parse("c2222222-2222-2222-2222-222222222222"),
                    Name = "3HD2K CẦU GIẤY",
                    Address = "241 Xuân Thủy, Cầu Giấy, Hà Nội",
                    City = "Hà Nội"
                };
                context.Cinemas.AddRange(cinema1, cinema2);
                context.SaveChanges();

                if (!context.Rooms.Any())
                {
                    var room1 = new Room
                    {
                        Id = Guid.Parse("01111111-1111-1111-1111-111111111111"),
                        CinemaId = cinema1.Id,
                        Name = "Phòng chiếu 1",
                        TotalSeats = 96
                    };
                    var room2 = new Room
                    {
                        Id = Guid.Parse("02222222-2222-2222-2222-222222222222"),
                        CinemaId = cinema1.Id,
                        Name = "Phòng chiếu 2 (IMAX)",
                        TotalSeats = 120
                    };
                    context.Rooms.AddRange(room1, room2);
                    context.SaveChanges();
                }
            }

            if (!context.Showtimes.Any())
            {
                var movies = context.Movies.ToList();
                var room = context.Rooms.FirstOrDefault();
                var cinema = context.Cinemas.FirstOrDefault();

                if (movies.Any())
                {
                    var showtimes = new List<Showtime>();
                    var now = DateTime.Today;

                    foreach (var movie in movies.Where(m => m.Status == "now-showing"))
                    {
                        showtimes.Add(new Showtime
                        {
                            Id = Guid.NewGuid(),
                            MovieId = movie.MovieId,
                            RoomId = room?.Id,
                            CinemaId = cinema != null ? cinema.Id.ToString() : "c1111111-1111-1111-1111-111111111111",
                            CinemaName = cinema != null ? cinema.Name : "3HD2K HÀ ĐÔNG",
                            RoomName = room != null ? room.Name : "Phòng chiếu 1",
                            MovieTitle = movie.Title,
                            StartTime = now.AddHours(14),
                            EndTime = now.AddHours(16),
                            TicketPrice = 85000
                        });
                        showtimes.Add(new Showtime
                        {
                            Id = Guid.NewGuid(),
                            MovieId = movie.MovieId,
                            RoomId = room?.Id,
                            CinemaId = cinema != null ? cinema.Id.ToString() : "c1111111-1111-1111-1111-111111111111",
                            CinemaName = cinema != null ? cinema.Name : "3HD2K HÀ ĐÔNG",
                            RoomName = room != null ? room.Name : "Phòng chiếu 1",
                            MovieTitle = movie.Title,
                            StartTime = now.AddHours(19),
                            EndTime = now.AddHours(21),
                            TicketPrice = 95000
                        });
                    }
                    context.Showtimes.AddRange(showtimes);
                    context.SaveChanges();
                }
            }

            if (!context.Vouchers.Any())
            {
                var vouchers = new List<Voucher>
                {
                    new Voucher { Id = Guid.NewGuid(), Code = "GIAM10K", Description = "Giảm 10.000đ trực tiếp cho đơn đặt vé", DiscountType = "FIXED_AMOUNT", DiscountValue = 10000, MinOrderAmount = 0, ExpiryDate = DateTime.Now.AddDays(180), IsActive = true },
                    new Voucher { Id = Guid.NewGuid(), Code = "GIAM20K", Description = "Giảm 20.000đ cho đơn hàng từ 100.000đ", DiscountType = "FIXED_AMOUNT", DiscountValue = 20000, MinOrderAmount = 100000, ExpiryDate = DateTime.Now.AddDays(180), IsActive = true },
                    new Voucher { Id = Guid.NewGuid(), Code = "VIP3HD2K", Description = "Giảm 15% cho thành viên VIP", DiscountType = "PERCENTAGE", DiscountValue = 15, MinOrderAmount = 50000, MaxDiscountAmount = 50000, ExpiryDate = DateTime.Now.AddDays(180), IsActive = true }
                };
                context.Vouchers.AddRange(vouchers);
                context.SaveChanges();
            }
        }
    }
}