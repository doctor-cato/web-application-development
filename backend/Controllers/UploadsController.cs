using appweb.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace appweb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadsController : ControllerBase
    {
        private readonly IFileService _fileService;

        public UploadsController(IFileService fileService)
        {
            _fileService = fileService;
        }

        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            try
            {
                var filePath = await _fileService.UploadImageAsync(file);
                // Return absolute URL or relative URL based on requirements
                // It's returning relative URL like /uploads/images/filename.jpg
                return Ok(new { url = filePath, message = "Upload successful" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An unexpected error occurred during upload.", details = ex.Message });
            }
        }
    }
}
