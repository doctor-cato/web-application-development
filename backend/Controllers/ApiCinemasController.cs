using appweb.Models;
using appweb.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace appweb.Controllers
{
    [ApiController]
    [Route("api/cinemas")]
    public class ApiCinemasController : ControllerBase
    {
        private readonly CinemaRepository _cinemaRepository;

        public ApiCinemasController(CinemaRepository cinemaRepository)
        {
            _cinemaRepository = cinemaRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetCinemas()
        {
            var cinemas = await _cinemaRepository.GetAllCinemasAsync();
            return Ok(cinemas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCinema(Guid id)
        {
            var cinema = await _cinemaRepository.GetCinemaByIdAsync(id);
            if (cinema == null) return NotFound();
            return Ok(cinema);
        }
    }
}
