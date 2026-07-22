using Microsoft.AspNetCore.Mvc;

namespace appweb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CinePredictController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetPredictEvents()
        {
            var data = new[]
            {
                new {
                    id = 1,
                    status = "active",
                    badgeText = "IMDb",
                    badgeColor = "#f5c518",
                    textColor = "#000",
                    image = "/shared/images/f1_movie.jpg",
                    title = "ĐIỂM SỐ IMDB",
                    description = "Dự đoán điểm số IMDb của bom tấn 'F1: The Movie' sau tuần công chiếu đầu tiên.",
                    reward = "Voucher Bỏng ngô Lớn",
                    options = new[] { "Trên 8.0 ↑", "Dưới 8.0 ↓" },
                    fee = 50
                },
                new {
                    id = 2,
                    status = "active",
                    badgeText = "Doanh Thu",
                    badgeColor = "#22c55e",
                    textColor = "#fff",
                    image = "/shared/images/Ke_Kien_Tao_2.jpg",
                    title = "DOANH THU MỞ MÀN",
                    description = "Kẻ Kiến Tạo 2 có vượt mốc 50 triệu USD doanh thu phòng vé trong tuần đầu ra mắt?",
                    reward = "Voucher Đồ uống",
                    options = new[] { "Trên 50 Triệu", "Dưới 50 Triệu" },
                    fee = 50
                },
                new {
                    id = 4,
                    status = "active",
                    badgeText = "IMDb",
                    badgeColor = "#f5c518",
                    textColor = "#000",
                    image = "/shared/images/Gran_Turismo.jpg",
                    title = "IMDB: GRAN TURISMO",
                    description = "Đánh giá về Gran Turismo đang cực kỳ khả quan, điểm IMDb có vượt 8.5?",
                    reward = "Voucher Đồ uống",
                    options = new[] { "Trên 8.5 ↑", "Dưới 8.5 ↓" },
                    fee = 50
                },
                new {
                    id = 3,
                    status = "ended",
                    badgeText = "Cà Chua Tươi",
                    badgeColor = "#ef4444",
                    textColor = "#fff",
                    image = "/shared/images/Ready_Player_One.jpg",
                    title = "ROTTEN TOMATOES",
                    description = "Tỷ lệ đánh giá tích cực của Ready Player One đã đạt bao nhiêu % trên Tomatometer?",
                    reward = "Voucher Combo",
                    options = new[] { "Trên 85%", "Dưới 85%" },
                    winnerIndex = 0,
                    fee = 75
                },
                new {
                    id = 5,
                    status = "ended",
                    badgeText = "Doanh Thu",
                    badgeColor = "#22c55e",
                    textColor = "#fff",
                    image = "/shared/images/World_war_Z.jpg",
                    title = "DOANH THU: WORLD WAR Z",
                    description = "Bộ phim World War Z đã thiết lập kỷ lục doanh thu phòng vé hay ở mức bình thường?",
                    reward = "Voucher Combo",
                    options = new[] { "Kỷ lục", "Bình thường" },
                    winnerIndex = 1,
                    fee = 40
                }
            };

            return Ok(data);
        }
    }
}
