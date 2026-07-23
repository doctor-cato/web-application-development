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

function formatMovieDuration(rawDuration) {
    if (rawDuration === undefined || rawDuration === null || rawDuration === '') return 'N/A';
    let mins = 0;
    if (typeof rawDuration === 'number') {
        mins = rawDuration;
    } else {
        const str = rawDuration.toString().trim();
        const hMatch = str.match(/(\d+)\s*h/i);
        const mMatch = str.match(/(\d+)\s*m/i);
        if (hMatch || mMatch) {
            mins = (hMatch ? parseInt(hMatch[1], 10) * 60 : 0) + (mMatch ? parseInt(mMatch[1], 10) : 0);
        } else {
            mins = parseInt(str, 10) || 0;
        }
    }
    if (mins <= 0) return 'N/A';
    
    // If duration stored as hours (< 10), convert to minutes (e.g. 2 -> 120)
    if (mins < 10) {
        mins = mins * 60;
    }

    const hours = Math.floor(mins / 60);
    const remainder = mins % 60;

    if (hours > 0 && remainder > 0) {
        return `${hours}h ${remainder}m`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else {
        return `${mins}m`;
    }
}

async function fetchMovies() {
    try {
        const response = await fetch(`/api/movies`);
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                allMoviesData = data.map(m => {
                    const imgUrl = m.posterUrl
                        ? `/shared/images/${m.posterUrl.split('/').pop()}`
                        : `https://via.placeholder.com/800x1200/222/aaa?text=${encodeURIComponent(m.title)}`;

                    const durationFormatted = formatMovieDuration(m.duration);
                    let durationMins = parseInt(m.duration, 10);
                    if (isNaN(durationMins) || durationMins <= 0) durationMins = 120;
                    else if (durationMins < 10) durationMins = durationMins * 60;

                    const metaParts = [];
                    if (m.releaseDate) {
                        const yr = new Date(m.releaseDate).getFullYear();
                        if (!isNaN(yr)) metaParts.push(yr);
                    }
                    if (m.genre) metaParts.push(m.genre);
                    if (durationFormatted && durationFormatted !== 'N/A') metaParts.push(durationFormatted);

                    return {
                        id: m.id,
                        title: m.title || 'Phim Chưa Có Tiêu Đề',
                        meta: metaParts.join(' • '),
                        desc: m.description || "Nội dung phim đang được cập nhật...",
                        synopsis: m.description || "Nội dung phim đang được cập nhật...",
                        year: m.releaseDate ? new Date(m.releaseDate).getFullYear() : 'N/A',
                        duration: durationFormatted,
                        durationMinutes: durationMins,
                        age: m.ageRating || 'P',
                        genre: m.genre || 'Chưa phân loại',
                        status: m.status || 'now-showing',
                        poster: imgUrl,
                        bg: imgUrl,
                        backdrop: imgUrl,
                        language: m.language || "Chưa cập nhật",
                        rating: m.rating || 0,
                        ratingCount: m.ratingCount || 0,
                        director: m.director || "Chưa cập nhật",
                        cast: m.cast || [],
                        gallery: m.gallery || [],
                        trailer: m.trailerUrl || "",
                        trailerWatch: m.trailerUrl || "",
                        tags: m.genre ? m.genre.split(',').map(s => s.trim()) : [],
                        formats: m.formats ? (Array.isArray(m.formats) ? m.formats : m.formats.split(',').map(f=>f.trim())) : ["2D"],
                        cinema: m.cinemaId || m.cinema || ""
                    };
                });
            }
        }
    } catch (e) {
        console.error("Failed to fetch movies from API, using fallback data:", e);
    }

    if (!allMoviesData || allMoviesData.length === 0) {
        allMoviesData = [
            {
                id: 1,
                title: "DUNE: HÀNH TINH CÁT - PHẦN 2",
                meta: "2024 • Hành Động, Sci-Fi • 2h 46m",
                desc: "Paul Atreides hợp lực cùng Chani và người Fremen để trả thù những kẻ đã hủy hoại gia đình mình.",
                synopsis: "Paul Atreides hợp lực cùng Chani và người Fremen để trả thù những kẻ đã hủy hoại gia đình mình.",
                year: 2024,
                duration: "2h 46m",
                durationMinutes: 166,
                age: "T16",
                genre: "Hành Động, Sci-Fi",
                status: "now-showing",
                poster: "/shared/images/avatar.jpg",
                bg: "/shared/images/avatar.jpg",
                backdrop: "/shared/images/avatar.jpg",
                language: "Tiếng Anh - Phụ đề Tiếng Việt",
                rating: 8.8,
                ratingCount: 1250,
                director: "Denis Villeneuve",
                cast: ["Timothée Chalamet", "Zendaya"],
                gallery: [],
                trailer: "https://www.youtube.com/watch?v=Way9Dexny3w",
                trailerWatch: "https://www.youtube.com/watch?v=Way9Dexny3w",
                tags: ["Hành Động", "Sci-Fi"],
                formats: ["2D", "IMAX"],
                cinema: "3hd2k-hung-vuong"
            },
            {
                id: 2,
                title: "KUNG FU PANDA 4",
                meta: "2024 • Hoạt Hình, Hài • 1h 34m",
                desc: "Po phải tìm kiếm và huấn luyện Thần Long Đại Hiệp tiếp theo.",
                synopsis: "Po phải tìm kiếm và huấn luyện Thần Long Đại Hiệp tiếp theo.",
                year: 2024,
                duration: "1h 34m",
                durationMinutes: 94,
                age: "P",
                genre: "Hoạt Hình, Hài",
                status: "now-showing",
                poster: "/shared/images/avatar.jpg",
                bg: "/shared/images/avatar.jpg",
                backdrop: "/shared/images/avatar.jpg",
                language: "Tiếng Anh - Lồng tiếng",
                rating: 7.5,
                ratingCount: 840,
                director: "Mike Mitchell",
                cast: ["Jack Black", "Awkwafina"],
                gallery: [],
                trailer: "",
                trailerWatch: "",
                tags: ["Hoạt Hình", "Hài"],
                formats: ["2D", "3D"],
                cinema: "3hd2k-hung-vuong"
            }
        ];
    }

    nowShowingMovies = allMoviesData.filter(m => m.status === 'now-showing');
    comingSoonMovies = allMoviesData.filter(m => m.status === 'coming-soon');
    
    heroMovies = nowShowingMovies.slice(0, 4);
    if (heroMovies.length === 0) heroMovies = allMoviesData.slice(0, 3);

    window.allMoviesData = allMoviesData;
    window.heroMovies = heroMovies;
    window.nowShowingMovies = nowShowingMovies;
    window.comingSoonMovies = comingSoonMovies;
}

window.fetchMoviesPromise = fetchMovies();

// ── CINEMAS ──────────────────────────────────────────────────
let cinemas = [];

async function fetchCinemas() {
    try {
        const response = await fetch(`/api/cinemas`);
        if (response.ok) {
            cinemas = await response.json();
            cinemas.forEach(c => {
                c.lat = c.latitude || c.lat || null;
                c.lng = c.longitude || c.lng || null;
                c.screens = c.screens || (c.rooms ? c.rooms.length : 0);
                c.features = c.features || [];
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
