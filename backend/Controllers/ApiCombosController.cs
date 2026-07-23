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
        // In-memory / DB representation for Snack/Food combos
        private static readonly List<ComboDto> _combos = new List<ComboDto>
        {
            new ComboDto { Id = "cb_1", Name = "Combo Solo", Desc = "1 Bắp ngọt lớn + 1 Nước ngọt 22oz tự chọn", Price = 75000, Stock = 120, Image = "/shared/images/combo_solo.jpg" },
            new ComboDto { Id = "cb_2", Name = "Combo Couple", Desc = "1 Bắp ngọt khổng lồ + 2 Nước ngọt 22oz", Price = 99000, Stock = 85, Image = "/shared/images/combo_couple.jpg" },
            new ComboDto { Id = "cb_3", Name = "Combo Gia Đình (Party)", Desc = "2 Bắp lớn + 3 Nước ngọt tùy chọn + 1 Snack", Price = 155000, Stock = 40, Image = "/shared/images/combo_party.jpg" }
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

            return Ok(item);
        }

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
    }
}
