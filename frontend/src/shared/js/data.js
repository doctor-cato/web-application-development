// ============================================================
//  3HD2K — DATA STORE
//  Tất cả dữ liệu phim, rạp và suất chiếu mẫu + Đồng bộ Admin
// ============================================================

// ── API & STORAGE INTEGRATION ────────────────────────────────────
let allMoviesData = [];
let heroMovies = [];
let nowShowingMovies = [];
let comingSoonMovies = [];

const mockGallery = [];
const mockCast = [];

function normalizeImagePath(path) {
    if (!path) return '/shared/images/avatar.jpg';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('/shared/') || path.startsWith('../')) {
        return path;
    }
    const filename = path.split('/').pop();
    return `/shared/images/${filename}`;
}

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
    if (mins < 10) mins = mins * 60;
    const hours = Math.floor(mins / 60);
    const remainder = mins % 60;
    if (hours > 0 && remainder > 0) return `${hours}h ${remainder}m`;
    else if (hours > 0) return `${hours}h`;
    else return `${mins}m`;
}

function mapMovieObj(m) {
    const rawPoster = m.posterUrl || m.poster || m.bg || m.backdropUrl;
    const rawBg = m.bgUrl || m.backdropUrl || m.bg || m.posterUrl || m.poster;
    
    const posterImg = normalizeImagePath(rawPoster);
    const bgImg = normalizeImagePath(rawBg);
    const formattedDuration = formatMovieDuration(m.duration);

    let movieStatus = m.status;
    if (movieStatus === 'NOW_SHOWING') movieStatus = 'now-showing';
    if (movieStatus === 'UPCOMING') movieStatus = 'coming-soon';
    if (!movieStatus && m.releaseDate) {
        const relDate = new Date(m.releaseDate);
        const today = new Date();
        movieStatus = relDate > today ? 'coming-soon' : 'now-showing';
    }
    if (!movieStatus) movieStatus = 'now-showing';

    return {
        id: m.id || m.movieId || ('mv_' + Math.random().toString(36).substr(2, 9)),
        title: m.title || 'Phim Chưa Có Tiêu Đề',
        meta: m.meta || `${m.releaseDate ? new Date(m.releaseDate).getFullYear() : '2026'} • ${m.genre || 'Hành Động'} • ${formattedDuration}`,
        desc: m.description || m.desc || "Nội dung phim đang được cập nhật...",
        synopsis: m.description || m.synopsis || m.desc || "Nội dung phim đang được cập nhật...",
        year: m.releaseDate ? new Date(m.releaseDate).getFullYear() : (m.year || '2026'),
        duration: formattedDuration,
        age: m.ageRating || m.age || 'P',
        genre: m.genre || (m.tags ? m.tags.join(', ') : 'Chưa phân loại'),
        status: movieStatus,
        poster: posterImg,
        bg: bgImg,
        backdrop: bgImg,
        language: m.language || "Tiếng Việt / Phụ đề tiếng Anh",
        rating: m.rating || 4.8,
        ratingCount: m.ratingCount || 120,
        director: m.director || "Đang cập nhật",
        cast: m.cast || [],
        gallery: m.gallery || [posterImg, bgImg],
        trailer: m.trailerUrl || m.trailer || "https://www.youtube.com/embed/dQw4w9WgXcQ",
        trailerWatch: m.trailerUrl || m.trailer || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        tags: m.genre ? m.genre.split(',').map(s => s.trim()) : (m.tags || ["2D"]),
        formats: m.formats ? (Array.isArray(m.formats) ? m.formats : m.formats.split(',').map(f=>f.trim())) : ["2D"],
        cinema: m.cinemaId || m.cinema || ""
    };
}

function getFallbackMovies() {
    return [
        {
            id: 'mv_kimi_no_na_wa',
            title: 'Your Name',
            titleEn: 'Kimi no Na wa',
            description: 'Hai người xa lạ tìm thấy nhau qua một phép màu kỳ lạ. Họ hoán đổi cơ thể trong giấc mơ và bắt đầu một hành trình tìm kiếm nhau giữa không gian và thời gian.',
            meta: '2016 • Anime, Tình Cảm • 1h 46m',
            releaseDate: '2016-08-26',
            age: 'T13',
            genre: 'Anime, Tình Cảm, Kỳ Ảo',
            duration: 106,
            status: 'now-showing',
            posterUrl: 'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg',
            backdropUrl: 'https://image.tmdb.org/t/p/original/dIWwZW7dJJtqC6CgWzYkNVKIUm8.jpg',
            rating: 4.9,
            ratingCount: 15420,
            director: 'Makoto Shinkai',
            trailer: 'https://www.youtube.com/embed/xU47nhruN-Q',
            formats: ['2D Lồng tiếng', '2D Phụ đề']
        },
        {
            id: 'mv_avengers_endgame',
            title: 'Avengers: Endgame',
            titleEn: 'Avengers: Endgame',
            description: 'Sau sự kiện tàn khốc của Infinity War, vũ trụ đang chìm trong đống đổ nát. Với sự giúp đỡ của các đồng minh còn lại, Avengers tập hợp một lần nữa để đảo ngược hành động của Thanos.',
            meta: '2019 • Hành Động, Viễn Tưởng • 3h 1m',
            releaseDate: '2019-04-26',
            age: 'T13',
            genre: 'Hành Động, Viễn Tưởng',
            duration: 181,
            status: 'now-showing',
            posterUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
            backdropUrl: 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
            rating: 4.8,
            ratingCount: 23150,
            director: 'Anthony Russo, Joe Russo',
            trailer: 'https://www.youtube.com/embed/TcMBFSGVi1c',
            formats: ['IMAX', '3D', '4DX']
        },
        {
            id: 'mv_dune_part_two',
            title: 'Dune: Hành Tinh Cát - Phần 2',
            titleEn: 'Dune: Part Two',
            description: 'Paul Atreides hợp sức với Chani và người Fremen để trả thù những kẻ đã phá hoại gia đình anh, đồng thời cố gắng ngăn chặn một tương lai khủng khiếp mà chỉ mình anh thấy được.',
            meta: '2024 • Khoa Học Viễn Tưởng • 2h 46m',
            releaseDate: '2024-03-01',
            age: 'T16',
            genre: 'Khoa Học Viễn Tưởng, Hành Động',
            duration: 166,
            status: 'coming-soon',
            posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGvw7po.jpg',
            backdropUrl: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
            rating: 4.7,
            ratingCount: 5240,
            director: 'Denis Villeneuve',
            trailer: 'https://www.youtube.com/embed/Way9Dexny3w',
            formats: ['IMAX', '4DX']
        }
    ];
}

async function fetchMovies() {
    try {
        const response = await fetch(`/api/movies`);
        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                allMoviesData = data.map(m => mapMovieObj(m));
            } else {
                allMoviesData = getFallbackMovies();
            }
        } else {
            allMoviesData = getFallbackMovies();
        }
    } catch (e) {
        console.warn("Failed to fetch movies from API, using default/localStorage fallbacks:", e);
        allMoviesData = getFallbackMovies();
    }

    if (!Array.isArray(allMoviesData) || allMoviesData.length === 0) {
        allMoviesData = getFallbackMovies();
    }

    // Merge movies added by Admin in LocalStorage (3hd2k_movies & cinema_movies)
    try {
        const local1 = JSON.parse(localStorage.getItem('3hd2k_movies') || '[]');
        const local2 = JSON.parse(localStorage.getItem('cinema_movies') || '[]');
        const combined = [...(Array.isArray(local1) ? local1 : []), ...(Array.isArray(local2) ? local2 : [])];
        
        combined.forEach(lm => {
            if (lm && lm.title) {
                const mapped = mapMovieObj(lm);
                const existingIdx = allMoviesData.findIndex(m => m.id === mapped.id || m.title.toLowerCase().trim() === mapped.title.toLowerCase().trim());
                if (existingIdx >= 0) {
                    allMoviesData[existingIdx] = mapped;
                } else {
                    allMoviesData.unshift(mapped);
                }
            }
        });
    } catch (_) {}

    nowShowingMovies = allMoviesData.filter(m => m.status === 'now-showing');
    comingSoonMovies = allMoviesData.filter(m => m.status === 'coming-soon');
    
    // Strict Rule: Hero Banner ONLY displays Now-Showing movies
    heroMovies = nowShowingMovies.slice(0, 5);

    window.allMoviesData = allMoviesData;
    window.heroMovies = heroMovies;
    window.nowShowingMovies = nowShowingMovies;
    window.comingSoonMovies = comingSoonMovies;

    return allMoviesData;
}

window.fetchMoviesPromise = fetchMovies().catch(() => getFallbackMovies());

// ── CINEMAS ──────────────────────────────────────────────────
function getFallbackCinemas() {
    return [
        {
            id: 'c1',
            name: '3HD2K HÀ ĐÔNG',
            address: 'Tầng 5, AEON Mall Hà Đông, Dương Nội, Quận Hà Đông, Hà Nội',
            distance: '0.5 KM',
            screens: 9,
            features: ['IMAX', '4DX', 'Dolby Atmos'],
            lat: 20.9780,
            lng: 105.7580
        },
        {
            id: 'c2',
            name: '3HD2K LÊ TRỌNG TẤN',
            address: 'Tầng 4, Trung tâm TM Hồ Gươm Plaza, 102 Trần Phú, Quận Hà Đông, Hà Nội',
            distance: '2.1 KM',
            screens: 7,
            features: ['Dolby Atmos', 'ScreenX'],
            lat: 20.9850,
            lng: 105.7850
        },
        {
            id: 'c3',
            name: '3HD2K CẦU GIẤY',
            address: 'Tầng 3, 241 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
            distance: '2.0 KM',
            screens: 8,
            features: ['IMAX', 'Dolby Atmos'],
            lat: 21.0360,
            lng: 105.7820
        },
        {
            id: 'c4',
            name: '3HD2K MỸ ĐÌNH',
            address: 'Tầng 2, Keangnam Landmark 72, Phạm Hùng, Nam Từ Liêm, Hà Nội',
            distance: '5.3 KM',
            screens: 6,
            features: ['4DX', 'Dolby Atmos'],
            lat: 21.0168,
            lng: 105.7840
        },
        {
            id: 'c5',
            name: '3HD2K LÁNG HẠ',
            address: '88 Láng Hạ, Đống Đa, Hà Nội',
            distance: '1.7 KM',
            screens: 10,
            features: ['IMAX', 'ScreenX'],
            lat: 21.0150,
            lng: 105.8120
        },
        {
            id: 'c6',
            name: '3HD2K ROYAL CITY',
            address: 'Tầng B2, Vincom Mega Mall Royal City, 72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
            distance: '7.8 KM',
            screens: 12,
            features: ['IMAX', '4DX', 'Dolby Atmos', 'ScreenX'],
            lat: 21.0030,
            lng: 105.8150
        }
    ];
}

let cinemas = [];

async function fetchCinemas() {
    try {
        const response = await fetch(`/api/cinemas`);
        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
            const fetched = await response.json();
            if (Array.isArray(fetched) && fetched.length > 0) {
                cinemas = fetched;
                cinemas.forEach(c => {
                    c.lat = c.latitude || c.lat || null;
                    c.lng = c.longitude || c.lng || null;
                    c.screens = c.screens || (c.rooms ? c.rooms.length : 0);
                    c.features = c.features || [];
                });
            } else {
                cinemas = getFallbackCinemas();
            }
        } else {
            cinemas = getFallbackCinemas();
        }
    } catch (e) {
        console.warn("Failed to fetch cinemas, using default fallbacks:", e);
        cinemas = getFallbackCinemas();
    }
    if (!Array.isArray(cinemas) || cinemas.length === 0) {
        cinemas = getFallbackCinemas();
    }
    window.cinemas = cinemas;
    return cinemas;
}
window.fetchCinemasPromise = fetchCinemas().catch(() => getFallbackCinemas());

// ── SHOWTIMES API ─────────────────────────────────
function getFallbackShowtimes(movieId) {
    const showtimes = [];
    const now = new Date();
    const currentCinemas = (typeof cinemas !== 'undefined' && cinemas.length > 0) ? cinemas : getFallbackCinemas();
    
    for (let i = 0; i < 7; i++) {
        const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
        currentCinemas.forEach(cinema => {
            // Include some late hours and a guaranteed future hour for today
            const hours = [10, 14, 18, 20, 22];
            if (i === 0) {
                hours.push((now.getHours() + 1) % 24); // Guaranteed future time for today
            }
            
            // Remove duplicates
            const uniqueHours = [...new Set(hours)].sort((a,b) => a-b);
            
            uniqueHours.forEach(hour => {
                const st = new Date(targetDate);
                st.setHours(hour, (Math.floor(Math.random() * 3) * 15), 0, 0);
                
                // If it's the guaranteed future time, make sure it's strictly in the future
                if (i === 0 && hour === (now.getHours() + 1) % 24) {
                    st.setHours(now.getHours() + 1, 30, 0, 0);
                }

                showtimes.push({
                    id: Math.random().toString(36).substr(2,9),
                    movieId: movieId,
                    room: { cinemaId: cinema.id },
                    startTime: st.toISOString()
                });
            });
        });
    }
    return showtimes;
}

async function fetchShowtimesByMovie(movieId) {
    try {
        const response = await fetch(`/api/showtimes/movie/${movieId}`);
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) return data;
        }
    } catch (e) {
        console.error("Failed to fetch showtimes:", e);
    }
    return getFallbackShowtimes(movieId);
}
window.fetchShowtimesByMovie = fetchShowtimesByMovie;

// Export to window
window.heroMovies = heroMovies;
window.nowShowingMovies = nowShowingMovies;
window.comingSoonMovies = comingSoonMovies;
window.allMoviesData = allMoviesData;
