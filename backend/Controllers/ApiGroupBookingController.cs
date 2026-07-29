using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;
using System.Text.Json;

namespace appweb.Controllers
{
    [Route("api/groupbooking")]
    [ApiController]
    public class ApiGroupBookingController : ControllerBase
    {

        private static ConcurrentDictionary<string, string> _groupOrders = new ConcurrentDictionary<string, string>();

        [Authorize]
        [HttpPost("{orderId}")]
        public IActionResult SaveOrder(string orderId, [FromBody] JsonElement orderData)
        {
            if (string.IsNullOrEmpty(orderId)) return BadRequest("Order ID is required.");

            _groupOrders[orderId] = orderData.GetRawText();
            return Ok(new { success = true, message = "Group order saved to server." });
        }

        [HttpGet("{orderId}")]
        public IActionResult GetOrder(string orderId)
        {
            if (_groupOrders.TryGetValue(orderId, out var orderData))
            {
                return Content(orderData, "application/json");
            }
            return NotFound(new { success = false, message = "Group order not found or expired." });
        }
    }
}
