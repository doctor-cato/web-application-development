using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace appweb.Controllers
{
    [ApiController]
    [Route("api/combos")]
    public class ApiCombosController : ControllerBase
    {

        private static readonly List<ComboDto> _combos = new List<ComboDto>
        {
            new ComboDto { Id = "cb_1", Name = "Combo Solo", Desc = "1 Bắp ngọt lớn + 1 Nước ngọt 22oz tự chọn", Price = 75000, Stock = 120, Image = "/images/F&B/combo_single.png", Category = "Combo" },
            new ComboDto { Id = "cb_2", Name = "Combo Couple", Desc = "1 Bắp ngọt khổng lồ + 2 Nước ngọt 22oz", Price = 99000, Stock = 85, Image = "/images/F&B/combo_double.png", Category = "Combo" },
            new ComboDto { Id = "cb_3", Name = "Combo Gia Đình (Party)", Desc = "2 Bắp lớn + 3 Nước ngọt tùy chọn + 1 Snack", Price = 155000, Stock = 40, Image = "/images/F&B/combo_double.png", Category = "Combo" },
            new ComboDto { Id = "fb_1", Name = "Bắp Ngọt (Lớn)", Desc = "Bắp rang bơ vị ngọt", Price = 45000, Stock = 200, Image = "/images/F&B/food_popcorn.png", Category = "Đồ thường" },
            new ComboDto { Id = "fb_2", Name = "Pepsi Lon 330ml", Desc = "Nước ngọt có ga", Price = 25000, Stock = 150, Image = "/images/F&B/food_pepsi.png", Category = "Đồ thường" },
            new ComboDto { Id = "fb_3", Name = "Coca-Cola Chai 390ml", Desc = "Nước ngọt có ga", Price = 25000, Stock = 150, Image = "/images/F&B/food_coca.png", Category = "Đồ thường" }
        };

        [HttpGet]
        public IActionResult GetCombos()
        {
            return Ok(_combos);
        }

        [HttpGet("{id}")]
        public IActionResult GetCombo(string id)
        {
            var item = _combos.Find(c => c.Id == id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [Authorize(Roles = "ADMIN")]
        [HttpPost]
        public IActionResult CreateCombo([FromBody] ComboDto dto)
        {
            if (string.IsNullOrEmpty(dto.Id))
            {
                dto.Id = "cb_" + Guid.NewGuid().ToString("N").Substring(0, 8);
            }
            _combos.Add(dto);
            return Ok(dto);
        }

        [Authorize(Roles = "ADMIN")]
        [HttpPut("{id}")]
        public IActionResult UpdateCombo(string id, [FromBody] ComboDto dto)
        {
            var item = _combos.Find(c => c.Id == id);
            if (item == null) return NotFound();

            item.Name = dto.Name;
            item.Desc = dto.Desc;
            item.Price = dto.Price;
            item.Stock = dto.Stock;
            item.Image = dto.Image;
            item.Category = dto.Category;

            return Ok(item);
        }

        [Authorize(Roles = "ADMIN")]
        [HttpDelete("{id}")]
        public IActionResult DeleteCombo(string id)
        {
            var item = _combos.Find(c => c.Id == id);
            if (item == null) return NotFound();

            _combos.Remove(item);
            return Ok(new { message = "Combo deleted successfully" });
        }
    }

    public class ComboDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Desc { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string Image { get; set; } = string.Empty;
        public string Category { get; set; } = "Combo";
    }
}
