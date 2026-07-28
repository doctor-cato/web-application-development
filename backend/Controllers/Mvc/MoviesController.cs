using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using appweb.Models;
using appweb.Repositories;

namespace appweb.Controllers
{
    [Authorize(Roles = "Admin")]
    public class MovieController : Controller
    {
        private readonly MovieRepository _movieRepository;

        public MovieController(MovieRepository movieRepository)
        {
            _movieRepository = movieRepository;
        }

        public async Task<IActionResult> Index()
        {
            var movies = await _movieRepository.GetAllAsync();
            return View(movies);
        }

        public async Task<IActionResult> Details(Guid id)
        {
            var movie = await _movieRepository.GetByIdAsync(id);
            if (movie == null) return NotFound();
            return View(movie);
        }

        [HttpGet]
        public IActionResult Create() => View();

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Movie movie)
        {
            if (!ModelState.IsValid) return View(movie);

            await _movieRepository.AddAsync(movie);
            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public async Task<IActionResult> Edit(Guid id)
        {
            var movie = await _movieRepository.GetByIdAsync(id);
            if (movie == null) return NotFound();
            return View(movie);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Guid id, Movie movie)
        {

            if (id != movie.Id) return BadRequest();

            if (!ModelState.IsValid) return View(movie);

            await _movieRepository.UpdateAsync(movie);
            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public async Task<IActionResult> Delete(Guid id)
        {
            var movie = await _movieRepository.GetByIdAsync(id);
            if (movie == null) return NotFound();
            return View(movie);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(Guid id)
        {
            await _movieRepository.DeleteAsync(id);
            return RedirectToAction(nameof(Index));
        }
    }
}

