// ============================================================
//  3HD2K — DATA STORE
//  Tất cả dữ liệu phim, rạp và suất chiếu mẫu
// ============================================================

// ── API INTEGRATION ─────────────────────────────────────────────
let allMoviesData = [];
let heroMovies = [];
let nowShowingMovies = [];
let comingSoonMovies = [];

const mockGallery = [];
const mockCast = [];

async function fetchMovies() {
    try {
        const response = await fetch(`/api/movies`);
        const data = await response.json();
        
        allMoviesData = data.map(m => {
            // posterUrl is now always set correctly in DB, e.g. "/images/movies/Ready_Player_One.jpg"
            const imgUrl = m.posterUrl
                ? `/shared/images/${m.posterUrl.split('/').pop()}`
                : `https://via.placeholder.com/800x1200/222/aaa?text=${encodeURIComponent(m.title)}`;

            return {
                id: m.id,
                title: m.title,
                meta: `${new Date(m.releaseDate).getFullYear()} • ${m.genre} • ${m.duration}m`,
                desc: m.description || "Nội dung phim đang cập nhật...",
                synopsis: m.description || "Nội dung phim đang cập nhật...",
                year: new Date(m.releaseDate).getFullYear(),
                duration: m.duration + " phút",
                age: m.ageRating,
                genre: m.genre,
                status: m.status || 'now-showing',
                poster: imgUrl,
                bg: imgUrl,
                backdrop: imgUrl,
                language: "Tiếng Anh - Phụ đề Tiếng Việt",
                rating: 8.5,
                ratingCount: 1500,
                director: "Joseph Kosinski",
                cast: mockCast,
                gallery: mockGallery,
                trailer: m.trailerUrl || "",
                trailerWatch: m.trailerUrl || "",
                bg: imgUrl,
                poster: imgUrl,
                duration: `${Math.floor(m.duration / 60)}h ${m.duration % 60}m`,
                tags: m.genre ? m.genre.split(',').map(s => s.trim()) : ["Phim"],
                formats: ["2D", "IMAX"],
                cinema: "ha-dong"
            };
        });

        const featuredIds = [
            "44abd72e-b280-4888-ad96-cd14248e38ee", // Your Name
            "72c59b71-4fe1-4358-a850-90216c6a62af"  // Kẻ Kiến Tạo
        ];
        
        nowShowingMovies = allMoviesData.filter(m => m.status === 'now-showing');
        comingSoonMovies = allMoviesData.filter(m => m.status === 'coming-soon');
        
        heroMovies = nowShowingMovies.slice(0, 4);
        if (heroMovies.length === 0) heroMovies = allMoviesData.slice(0, 3);

        window.allMoviesData = allMoviesData;
        window.heroMovies = heroMovies;
        window.nowShowingMovies = nowShowingMovies;
        window.comingSoonMovies = comingSoonMovies;

    } catch (e) {
        console.error("Failed to fetch movies from API:", e);
    }
}

window.fetchMoviesPromise = fetchMovies();

// ── CINEMAS ──────────────────────────────────────────────────
let cinemas = [];

async function fetchCinemas() {
    try {
        const response = await fetch(`/api/cinemas`);
        if (response.ok) {
            cinemas = await response.json();
            cinemas.forEach((c, idx) => {
                c.lat = c.lat || (21.005 + (idx * 0.012));
                c.lng = c.lng || (105.790 + (idx * 0.015));
                c.distance = c.distance || "3.5 KM";
                c.screens = c.screens || c.rooms?.length || 5;
                c.features = c.features || ["2D", "3D"];
            });
            window.cinemas = cinemas;
        }
    } catch (e) {
        console.error("Failed to fetch cinemas:", e);
    }
}
window.fetchCinemasPromise = fetchCinemas();

// ── SHOWTIMES API ─────────────────────────────────
async function fetchShowtimesByMovie(movieId) {
    try {
        const response = await fetch(`/api/showtimes/movie/${movieId}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.error("Failed to fetch showtimes:", e);
    }
    return [];
}
window.fetchShowtimesByMovie = fetchShowtimesByMovie;

// ── MOCK REVIEWS ─────────────────────────────────────────────
const mockReviews = [];

// Normalize image paths based on current URL depth
function getSrcPrefix() {
    const pathname = window.location.pathname;
    if (pathname.includes('/user-profile/') || pathname.includes('/user-notifications/') || pathname.includes('/user-login/') || pathname.includes('/user-register/')) {
        return '../../..';
    }
    if (pathname.includes('/home-page/') || pathname.includes('/movie-search/') || pathname.includes('/movie-details/') || pathname.includes('/cinema-map/') || pathname.includes('/aftercredit-lounge/')) {
        return '../..';
    }
    return '.';
}
const _srcPrefix = getSrcPrefix();

const _normalizePath = (path) => {
    if (!path || path.startsWith('http')) return path;
    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    return `/shared/images/${filename}`;
};

if (typeof heroMovies !== 'undefined') heroMovies.forEach(m => { m.bg = _normalizePath(m.bg); m.poster = _normalizePath(m.poster); });
if (typeof nowShowingMovies !== 'undefined') nowShowingMovies.forEach(m => { m.poster = _normalizePath(m.poster); m.bg = _normalizePath(m.bg); });
if (typeof comingSoonMovies !== 'undefined') comingSoonMovies.forEach(m => { m.poster = _normalizePath(m.poster); m.bg = _normalizePath(m.bg); });

// Export to window so ES module scripts can access movie data
if (typeof heroMovies !== 'undefined') window.heroMovies = heroMovies;
if (typeof nowShowingMovies !== 'undefined') window.nowShowingMovies = nowShowingMovies;
if (typeof comingSoonMovies !== 'undefined') window.comingSoonMovies = comingSoonMovies;
if (typeof allMoviesData !== 'undefined') window.allMoviesData = allMoviesData;
