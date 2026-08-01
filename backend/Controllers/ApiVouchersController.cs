using appweb.Models;
using appweb.Repositories;
using appweb.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace appweb.Controllers
{
    [ApiController]
    [Route("api/vouchers")]
    public class ApiVouchersController : ControllerBase
    {
        private readonly VoucherRepository _voucherRepository;
        private readonly IHubContext<NotificationHub> _hubContext;

        public ApiVouchersController(VoucherRepository voucherRepository, IHubContext<NotificationHub> hubContext)
        {
            _voucherRepository = voucherRepository;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetVouchers()
        {
            var vouchers = await _voucherRepository.GetAllAsync();
            return Ok(vouchers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVoucher(Guid id)
        {
            var item = await _voucherRepository.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpGet("code/{code}")]
        public async Task<IActionResult> GetVoucherByCode(string code)
        {
            var item = await _voucherRepository.GetByCodeAsync(code);
            if (item == null) return NotFound(new { message = "Voucher không tồn tại" });
            return Ok(item);
        }

        [Authorize(Roles = "ADMIN")]
        [HttpPost]
        public async Task<IActionResult> CreateVoucher([FromBody] Voucher dto)
        {
            if (dto.Id == Guid.Empty)
            {
                dto.Id = Guid.NewGuid();
            }
            await _voucherRepository.AddAsync(dto);
            await _hubContext.Clients.All.SendAsync("DataUpdated", "Vouchers");
            return Ok(dto);
        }

        [Authorize(Roles = "ADMIN")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVoucher(Guid id, [FromBody] Voucher dto)
        {
            var item = await _voucherRepository.GetByIdAsync(id);
            if (item == null) return NotFound();

            item.Code = dto.Code;
            item.Description = dto.Description;
            item.DiscountType = dto.DiscountType;
            item.DiscountValue = dto.DiscountValue;
            item.MinOrderAmount = dto.MinOrderAmount;
            item.MaxDiscountAmount = dto.MaxDiscountAmount;
            item.ExpiryDate = dto.ExpiryDate;
            item.IsActive = dto.IsActive;

            await _voucherRepository.UpdateAsync(item);
            await _hubContext.Clients.All.SendAsync("DataUpdated", "Vouchers");

            return Ok(item);
        }

        [Authorize(Roles = "ADMIN")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVoucher(Guid id)
        {
            var item = await _voucherRepository.GetByIdAsync(id);
            if (item == null) return NotFound();

            await _voucherRepository.DeleteAsync(id);
            await _hubContext.Clients.All.SendAsync("DataUpdated", "Vouchers");

            return Ok(new { message = "Voucher deleted successfully" });
        }
    }
}
