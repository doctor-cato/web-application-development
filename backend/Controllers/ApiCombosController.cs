using appweb.Models;
using appweb.Repositories;
using appweb.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace appweb.Controllers
{
    [ApiController]
    [Route("api/combos")]
    public class ApiCombosController : ControllerBase
    {
        private readonly ComboRepository _comboRepository;
        private readonly IHubContext<NotificationHub> _hubContext;

        public ApiCombosController(ComboRepository comboRepository, IHubContext<NotificationHub> hubContext)
        {
            _comboRepository = comboRepository;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetCombos()
        {
            var combos = await _comboRepository.GetAllAsync();
            return Ok(combos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCombo(string id)
        {
            var item = await _comboRepository.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [Authorize(Roles = "ADMIN")]
        [HttpPost]
        public async Task<IActionResult> CreateCombo([FromBody] Combo dto)
        {
            if (string.IsNullOrEmpty(dto.Id))
            {
                dto.Id = "cb_" + Guid.NewGuid().ToString("N").Substring(0, 8);
            }
            await _comboRepository.AddAsync(dto);
            await _hubContext.Clients.All.SendAsync("DataUpdated", "Combos");
            return Ok(dto);
        }

        [Authorize(Roles = "ADMIN")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCombo(string id, [FromBody] Combo dto)
        {
            var item = await _comboRepository.GetByIdAsync(id);
            if (item == null) return NotFound();

            item.Name = dto.Name;
            item.Desc = dto.Desc;
            item.Price = dto.Price;
            item.Stock = dto.Stock;
            item.Image = dto.Image;
            item.Category = dto.Category;

            await _comboRepository.UpdateAsync(item);
            await _hubContext.Clients.All.SendAsync("DataUpdated", "Combos");

            return Ok(item);
        }

        [Authorize(Roles = "ADMIN")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCombo(string id)
        {
            var item = await _comboRepository.GetByIdAsync(id);
            if (item == null) return NotFound();

            await _comboRepository.DeleteAsync(id);
            await _hubContext.Clients.All.SendAsync("DataUpdated", "Combos");

            return Ok(new { message = "Combo deleted successfully" });
        }
    }
}
