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

    return {
        id: m.id || ('mv_' + Math.random().toString(36).substr(2, 9)),
        title: m.title || 'Phim Chưa Có Tiêu Đề',
        meta: m.meta || `${m.releaseDate ? new Date(m.releaseDate).getFullYear() : '2026'} • ${m.genre || 'Hành Động'} • ${formattedDuration}`,
        desc: m.description || m.desc || "Nội dung phim đang được cập nhật...",
        synopsis: m.description || m.synopsis || m.desc || "Nội dung phim đang được cập nhật...",
        year: m.releaseDate ? new Date(m.releaseDate).getFullYear() : (m.year || '2026'),
        duration: formattedDuration,
        age: m.ageRating || m.age || 'P',
        genre: m.genre || (m.tags ? m.tags.join(', ') : 'Chưa phân loại'),
        status: m.status || 'now-showing',
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
            id: 'mv_ironman2',
            title: 'IRON MAN 2',
            meta: '2026 • Hành động, Viễn tưởng • 2h 4m',
            desc: 'Iron Man là bộ phim hay được sản xuất bởi Marvel. Tony Stark đối mặt với áp lực từ chính phủ đòi giao nộp công nghệ Iron Man, trong khi một kẻ thù mới Ivan Vanko xuất hiện.',
            synopsis: 'Tony Stark đối mặt với áp lực từ chính phủ đòi giao nộp công nghệ Iron Man...',
            year: '2026',
            duration: '2h 4m',
            age: 'T18',
            genre: 'Hành động, Viễn tưởng',
            status: 'now-showing',
            poster: '/shared/images/iron_man2.jpg',
            bg: '/shared/images/iron_man2.jpg',
            backdrop: '/shared/images/iron_man2.jpg',
            trailer: 'https://www.youtube.com/embed/BoohRoVA9WQ',
            trailerWatch: 'https://www.youtube.com/watch?v=BoohRoVA9WQ',
            tags: ['Hành động', 'Viễn tưởng'],
            formats: ['2D', 'IMAX']
        },
        {
            id: 'mv_obsession',
            title: 'OBSESSION',
            meta: '2026 • Kinh dị, Lãng mạn • 1h 0m',
            desc: 'Be careful who you wish for... Hãy cẩn thận với những gì bạn ước mơ. Một câu chuyện giật gân, đầy ám ảnh và kịch tính đến từng giây phút.',
            synopsis: 'Be careful who you wish for... Một câu chuyện giật gân, đầy ám ảnh...',
            year: '2026',
            duration: '1h 0m',
            age: 'T18',
            genre: 'Kinh dị, Lãng mạn',
            status: 'coming-soon',
            poster: '/shared/images/obsession.jpg',
            bg: '/shared/images/obsession.jpg',
            backdrop: '/shared/images/obsession.jpg',
            trailer: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            trailerWatch: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            tags: ['Kinh dị/Lãng mạn'],
            formats: ['2D']
        },
        {
            id: 'mv_readyplayerone',
            title: 'READY PLAYER ONE',
            meta: '2018 • Hành Động, Viễn Tưởng • 2h 20m',
            desc: 'Lấy bối cảnh năm 2045, thế giới thực đang trên đà sụp đổ, con người tìm thấy sự cứu rỗi trong OASIS - một vũ trụ ảo khổng lồ.',
            duration: '2h 20m',
            age: 'T13',
            genre: 'Hành Động, Viễn Tưởng',
            status: 'now-showing',
            poster: '/shared/images/Ready_Player_One.jpg',
            bg: '/shared/images/Ready_Player_One.jpg',
            trailer: 'https://www.youtube.com/embed/cSp1dM2Vj48',
            tags: ['Hành Động', 'Viễn Tưởng'],
            formats: ['2D', 'IMAX']
        },
        {
            id: 'mv_granturismo',
            title: 'Gran Turismo - Tay Đua Cự Phách',
            meta: '2023 • Hành Động, Thể Thao • 2h 14m',
            desc: 'Dựa trên câu chuyện có thật về Jann Mardenborough, một game thủ thiếu niên giành chiến thắng trong cuộc thi của Nissan.',
            duration: '2h 14m',
            age: 'T13',
            genre: 'Hành Động, Thể Thao',
            status: 'now-showing',
            poster: '/shared/images/Gran_Turismo.jpg',
            bg: '/shared/images/Gran_Turismo.jpg',
            trailer: 'https://www.youtube.com/embed/GkXeVIfbGOw',
            tags: ['Hành Động', 'Thể Thao'],
            formats: ['2D']
        },
        {
            id: 'mv_kekientao',
            title: 'KẺ KIẾN TẠO',
            meta: '2023 • Hành Động, Viễn Tưởng • 2h 13m',
            desc: 'Trong tương lai khi trí tuệ nhân tạo vươn lên nắm quyền lực, Joshua phải xâm nhập vào sào huyệt của AI.',
            duration: '2h 13m',
            age: 'T16',
            genre: 'Hành Động, Viễn Tưởng',
            status: 'now-showing',
            poster: '/shared/images/Ke_Kien_Tao_2.jpg',
            bg: '/shared/images/Ke_Kien_Tao_2.jpg',
            trailer: 'https://www.youtube.com/embed/ex3C1-5Dhb8',
            tags: ['Hành Động', 'Viễn Tưởng'],
            formats: ['2D', '4DX']
        }
    ];
}

async function fetchMovies() {
    try {
        const response = await fetch(`/api/movies`);
        if (response.ok) {
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

    // Merge movies added by Admin in LocalStorage
    try {
        const localMovies = JSON.parse(localStorage.getItem('3hd2k_movies') || '[]');
        if (Array.isArray(localMovies)) {
            localMovies.forEach(lm => {
                if (lm && lm.title) {
                    const mapped = mapMovieObj(lm);
                    const existingIdx = allMoviesData.findIndex(m => m.id === mapped.id || m.title.toLowerCase() === mapped.title.toLowerCase());
                    if (existingIdx >= 0) {
                        allMoviesData[existingIdx] = mapped;
                    } else {
                        allMoviesData.unshift(mapped);
                    }
                }
            });
        }
    } catch (_) {}

    nowShowingMovies = allMoviesData.filter(m => m.status === 'now-showing');
    comingSoonMovies = allMoviesData.filter(m => m.status === 'coming-soon');
    
    heroMovies = nowShowingMovies.slice(0, 5);
    if (heroMovies.length === 0) heroMovies = allMoviesData.slice(0, 4);

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

// Export to window
window.heroMovies = heroMovies;
window.nowShowingMovies = nowShowingMovies;
window.comingSoonMovies = comingSoonMovies;
window.allMoviesData = allMoviesData;
