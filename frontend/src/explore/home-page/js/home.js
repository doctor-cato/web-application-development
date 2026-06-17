let currentHeroIndex = 0;
const heroSection = document.getElementById('hero-section');
const heroContent = document.getElementById('hero-content');
const titleEl = document.getElementById('hero-title');
const metaEl = document.getElementById('hero-meta');
const descEl = document.getElementById('hero-desc');
const ageEl = document.getElementById('hero-age');

function changeHeroSlide() {
    currentHeroIndex = (currentHeroIndex + 1) % heroMovies.length;
    const movie = heroMovies[currentHeroIndex];

    // Fade out
    heroContent.style.opacity = 0;
    
    setTimeout(() => {
        // Update content
        titleEl.textContent = movie.title;
        metaEl.innerHTML = movie.meta.replace(/•/g, '&bull;');
        descEl.textContent = movie.desc;
        ageEl.textContent = movie.age;

        // Update background
        const gradient = "linear-gradient(to top, var(--bg-color) 0%, rgba(12,12,12,0.3) 35%, rgba(0,0,0,0.6) 100%), linear-gradient(to right, rgba(0,0,0,0.85) 0%, transparent 55%)";
        heroSection.style.backgroundImage = `${gradient}, url('${movie.bg}')`;

        // Fade in
        heroContent.style.opacity = 1;
    }, 500); // Wait for fade out to complete
}

// Auto rotate every 5 seconds
let slideInterval = setInterval(changeHeroSlide, 5000);

// --- TRAILER MODAL LOGIC ---
const modal = document.getElementById('trailer-modal');
const btnWatch = document.getElementById('btn-watch-trailer');
const btnClose = document.getElementById('close-modal');
const iframe = document.getElementById('trailer-video');

if (btnWatch) {
    btnWatch.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
        // Play video by appending autoplay
        const src = iframe.src;
        if(!src.includes('autoplay=1')) {
            iframe.src = src + (src.includes('?') ? '&' : '?') + 'autoplay=1';
        }
        // Pause slider when watching trailer
        clearInterval(slideInterval);
    });
}

function closeModal() {
    modal.style.display = 'none';
    // Stop video
    const src = iframe.src;
    iframe.src = src.replace('&autoplay=1', '').replace('?autoplay=1', '');
    // Resume slider
    slideInterval = setInterval(changeHeroSlide, 5000);
}

if (btnClose) {
    btnClose.addEventListener('click', closeModal);
}

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

const nowShowingGrid = document.getElementById('now-showing-grid');
const filterGenre = document.getElementById('filter-genre');
const filterFormat = document.getElementById('filter-format');
const filterCinema = document.getElementById('filter-cinema');

function renderNowShowing(movies) {
    if (!nowShowingGrid) return;
    
    nowShowingGrid.innerHTML = '';
    
    if (movies.length === 0) {
        nowShowingGrid.innerHTML = `
            <div style="width:100%; padding: 40px; text-align:center; color: var(--text-muted);">
                <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                <h3>Không tìm thấy phim phù hợp</h3>
                <p style="font-size: 0.875rem;">Vui lòng thử thay đổi tiêu chí lọc của bạn.</p>
            </div>
        `;
        return;
    }

    movies.forEach(movie => {
        const tagsHtml = movie.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        const cardHtml = `
            <div class="movie-card">
                <div class="poster" style="background-image: url('${movie.poster}')">
                    <div class="poster-overlay">
                        <span class="overlay-text">Xem thêm</span>
                        <a href="#" class="btn-book">Đặt vé ngay</a>
                    </div>
                </div>
                <div class="info">
                    <h3>${movie.title}</h3>
                    <div class="movie-meta-row">
                        <span class="duration"><i class="far fa-clock"></i> ${movie.duration}</span>
                        <span class="age-badge">${movie.age}</span>
                    </div>
                    <div class="tags">${tagsHtml}</div>
                </div>
            </div>
        `;
        nowShowingGrid.innerHTML += cardHtml;
    });

    // Add empty placeholders to keep grid formatting nicely if needed
    if (movies.length < 4) {
        for (let i = 0; i < 4 - movies.length; i++) {
            nowShowingGrid.innerHTML += `
                <div class="movie-card" style="opacity: 0.3; pointer-events: none;">
                    <div class="poster placeholder"></div>
                </div>
            `;
        }
    }
}

function applyFilters() {
    const genre = filterGenre ? filterGenre.value : 'all';
    const format = filterFormat ? filterFormat.value : 'all';
    const cinema = filterCinema ? filterCinema.value : 'all';

    const filtered = nowShowingMovies.filter(movie => {
        const matchGenre = genre === 'all' || movie.genre === genre;
        const matchFormat = format === 'all' || movie.formats.includes(format);
        const matchCinema = cinema === 'all' || movie.cinema === cinema;
        
        return matchGenre && matchFormat && matchCinema;
    });

    renderNowShowing(filtered);
}

// Attach event listeners to filters
if (filterGenre) filterGenre.addEventListener('change', applyFilters);
if (filterFormat) filterFormat.addEventListener('change', applyFilters);
if (filterCinema) filterCinema.addEventListener('change', applyFilters);

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    renderNowShowing(nowShowingMovies);
});
