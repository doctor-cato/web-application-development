using appweb.Infrastructure;
using appweb.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace appweb.Controllers
{
    [ApiController]
    [Route("api/settings")]
    public class ApiSettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ApiSettingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _context.Settings.ToDictionaryAsync(s => s.Key, s => s.Value);
            return Ok(settings);
        }

        [Authorize(Roles = "ADMIN")]
        [HttpPost]
        public async Task<IActionResult> UpdateSettings([FromBody] Dictionary<string, string> settingsData)
        {
            foreach (var kvp in settingsData)
            {
                var setting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == kvp.Key);
                if (setting != null)
                {
                    setting.Value = kvp.Value;
                    _context.Settings.Update(setting);
                }
                else
                {
                    _context.Settings.Add(new Setting { Key = kvp.Key, Value = kvp.Value });
                }
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "C?p nh?t c?u hình thành công" });
        }
    }
}

