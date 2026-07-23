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

        [HttpPost]
        public async Task<IActionResult> CreateCinema([FromBody] Cinema cinema)
        {
            if (cinema.Id == Guid.Empty)
            {
                cinema.Id = Guid.NewGuid();
            }
            await _cinemaRepository.AddCinemaAsync(cinema);
            return Ok(cinema);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCinema(Guid id, [FromBody] Cinema cinema)
        {
            var existing = await _cinemaRepository.GetCinemaByIdAsync(id);
            if (existing == null) return NotFound();

            existing.Name = cinema.Name;
            existing.Address = cinema.Address;

            await _cinemaRepository.UpdateCinemaAsync(existing);
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCinema(Guid id)
        {
            var existing = await _cinemaRepository.GetCinemaByIdAsync(id);
            if (existing == null) return NotFound();

            await _cinemaRepository.DeleteCinemaAsync(id);
            return Ok(new { message = "Cinema deleted successfully" });
        }
    }
}
