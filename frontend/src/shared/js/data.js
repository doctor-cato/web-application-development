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
            id: 'a1111111-1111-1111-1111-111111111111',
            title: 'Moon Fall - Trăng Rơi',
            meta: '2022 • Hành Động, Viễn Tưởng • 2h 10m',
            desc: 'Mặt Trăng bất ngờ bị đẩy khỏi quỹ đạo và lao thẳng về phía Trái Đất. Chỉ còn vài tuần trước khi va chạm...',
            synopsis: 'Mặt Trăng bất ngờ bị đẩy khỏi quỹ đạo và lao thẳng về phía Trái Đất...',
            year: '2022',
            duration: '2h 10m',
            age: 'T13',
            genre: 'Hành Động, Viễn Tưởng',
            status: 'now-showing',
            poster: '/images/movies/Moon_Fall.jpg',
            bg: '/images/movies/Moon_Fall.jpg',
            backdrop: '/images/movies/Moon_Fall.jpg',
            trailer: 'https://www.youtube.com/embed/ivIwdQBlS10',
            trailerWatch: 'https://www.youtube.com/watch?v=ivIwdQBlS10',
            tags: ['Hành Động', 'Viễn Tưởng'],
            formats: ['2D', 'IMAX']
        },
        {
            id: 'a2222222-2222-2222-2222-222222222222',
            title: 'KẺ KIẾN TẠO',
            meta: '2023 • Hành Động, Viễn Tưởng • 2h 13m',
            desc: 'Trong tương lai khi trí tuệ nhân tạo vươn lên nắm quyền lực, Joshua phải xâm nhập vào sào huyệt của AI để tiêu diệt Người Kiến Tạo.',
            synopsis: 'Trong tương lai khi trí tuệ nhân tạo vươn lên nắm quyền lực...',
            year: '2023',
            duration: '2h 13m',
            age: 'T16',
            genre: 'Hành Động, Viễn Tưởng',
            status: 'now-showing',
            poster: '/images/movies/Ke_Kien_Tao_2.jpg',
            bg: '/images/movies/Ke_Kien_Tao_2.jpg',
            backdrop: '/images/movies/Ke_Kien_Tao_2.jpg',
            trailer: 'https://www.youtube.com/embed/ex3C1-5Dhb8',
            trailerWatch: 'https://www.youtube.com/watch?v=ex3C1-5Dhb8',
            tags: ['Hành Động', 'Viễn Tưởng'],
            formats: ['2D', '4DX']
        },
        {
            id: 'a3333333-3333-3333-3333-333333333333',
            title: 'World War Z - Thế Chiến Z',
            meta: '2013 • Hành Động, Kinh Dị • 1h 56m',
            desc: 'Khi đại dịch zombie bùng phát, cựu điều tra viên Liên Hợp Quốc Gerry Lane phải tìm ra nguồn gốc của dịch bệnh.',
            synopsis: 'Khi đại dịch zombie bùng phát, cựu điều tra viên Liên Hợp Quốc...',
            year: '2013',
            duration: '1h 56m',
            age: 'T16',
            genre: 'Hành Động, Kinh Dị',
            status: 'now-showing',
            poster: '/images/movies/World_war_Z.jpg',
            bg: '/images/movies/World_war_Z.jpg',
            backdrop: '/images/movies/World_war_Z.jpg',
            trailer: 'https://www.youtube.com/embed/HcwTxRuq-uk',
            trailerWatch: 'https://www.youtube.com/watch?v=HcwTxRuq-uk',
            tags: ['Hành Động', 'Kinh Dị'],
            formats: ['2D', '3D']
        },
        {
            id: 'a4444444-4444-4444-4444-444444444444',
            title: 'Iron Man 2',
            meta: '2010 • Hành Động, Viễn Tưởng • 2h 4m',
            desc: 'Tony Stark đối mặt với áp lực từ chính phủ đòi giao nộp công nghệ Iron Man, trong khi một kẻ thù mới Ivan Vanko xuất hiện.',
            synopsis: 'Tony Stark đối mặt với áp lực từ chính phủ đòi giao nộp công nghệ Iron Man...',
            year: '2010',
            duration: '2h 4m',
            age: 'T13',
            genre: 'Hành Động, Viễn Tưởng',
            status: 'now-showing',
            poster: '/images/movies/iron_man2.jpg',
            bg: '/images/movies/iron_man2.jpg',
            backdrop: '/images/movies/iron_man2.jpg',
            trailer: 'https://www.youtube.com/embed/BoohRoVA9WQ',
            trailerWatch: 'https://www.youtube.com/watch?v=BoohRoVA9WQ',
            tags: ['Hành Động', 'Viễn Tưởng'],
            formats: ['2D', 'IMAX']
        },
        {
            id: 'a5555555-5555-5555-5555-555555555555',
            title: 'READY PLAYER ONE',
            meta: '2018 • Hành Động, Viễn Tưởng • 2h 20m',
            desc: 'Lấy bối cảnh năm 2045, thế giới thực đang trên đà sụp đổ, con người tìm thấy sự cứu rỗi trong OASIS - một vũ trụ ảo khổng lồ.',
            synopsis: 'Lấy bối cảnh năm 2045, thế giới thực đang trên đà sụp đổ...',
            year: '2018',
            duration: '2h 20m',
            age: 'T13',
            genre: 'Hành Động, Viễn Tưởng',
            status: 'now-showing',
            poster: '/images/movies/Ready_Player_One.jpg',
            bg: '/images/movies/Ready_Player_One.jpg',
            backdrop: '/images/movies/Ready_Player_One.jpg',
            trailer: 'https://www.youtube.com/embed/cSp1dM2Vj48',
            trailerWatch: 'https://www.youtube.com/watch?v=cSp1dM2Vj48',
            tags: ['Hành Động', 'Viễn Tưởng'],
            formats: ['2D', 'IMAX']
        },
        {
            id: 'a6666666-6666-6666-6666-666666666666',
            title: 'Gran Turismo - Tay Đua Cự Phách',
            meta: '2023 • Hành Động, Thể Thao • 2h 14m',
            desc: 'Dựa trên câu chuyện có thật về Jann Mardenborough, một game thủ thiếu niên giành chiến thắng trong cuộc thi của Nissan.',
            synopsis: 'Dựa trên câu chuyện có thật về Jann Mardenborough...',
            year: '2023',
            duration: '2h 14m',
            age: 'T13',
            genre: 'Hành Động, Thể Thao',
            status: 'now-showing',
            poster: '/images/movies/Gran_Turismo.jpg',
            bg: '/images/movies/Gran_Turismo.jpg',
            backdrop: '/images/movies/Gran_Turismo.jpg',
            trailer: 'https://www.youtube.com/embed/GkXeVIfbGOw',
            trailerWatch: 'https://www.youtube.com/watch?v=GkXeVIfbGOw',
            tags: ['Hành Động', 'Thể Thao'],
            formats: ['2D']
        },
        {
            id: 'a7777777-7777-7777-7777-777777777777',
            title: 'Battle: Los Angeles',
            meta: '2011 • Hành Động, Viễn Tưởng • 1h 56m',
            desc: 'Khi những thiên thạch bí ẩn rơi xuống, quân đội nhận ra đây thực chất là cuộc xâm lăng của người ngoài hành tinh.',
            synopsis: 'Khi những thiên thạch bí ẩn rơi xuống...',
            year: '2011',
            duration: '1h 56m',
            age: 'T16',
            genre: 'Hành Động, Viễn Tưởng',
            status: 'now-showing',
            poster: '/images/movies/battle_la.jpg',
            bg: '/images/movies/battle_la.jpg',
            backdrop: '/images/movies/battle_la.jpg',
            trailer: 'https://www.youtube.com/embed/1-HGCzB9Dtk',
            trailerWatch: 'https://www.youtube.com/watch?v=1-HGCzB9Dtk',
            tags: ['Hành Động', 'Viễn Tưởng'],
            formats: ['2D']
        },
        {
            id: 'a8888888-8888-8888-8888-888888888888',
            title: 'BATTLESHIP - CHIẾN HẠM',
            meta: '2012 • Hành Động, Viễn Tưởng • 2h 11m',
            desc: 'Cuộc chiến khốc liệt trên biển khơi nổ ra khi hạm đội hải quân quốc tế bất ngờ chạm trán với người ngoài hành tinh.',
            synopsis: 'Cuộc chiến khốc liệt trên biển khơi nổ ra...',
            year: '2012',
            duration: '2h 11m',
            age: 'T13',
            genre: 'Hành Động, Viễn Tưởng',
            status: 'now-showing',
            poster: '/images/movies/battle_la.jpg',
            bg: '/images/movies/battle_la.jpg',
            backdrop: '/images/movies/battle_la.jpg',
            trailer: 'https://www.youtube.com/embed/cp3646Z1H6U',
            trailerWatch: 'https://www.youtube.com/watch?v=cp3646Z1H6U',
            tags: ['Hành Động', 'Viễn Tưởng'],
            formats: ['2D']
        },
        {
            id: 'a9999999-9999-9999-9999-999999999999',
            title: 'Your Name - Tên Cậu Là Gì?',
            meta: '2016 • Anime, Tình Cảm • 1h 46m',
            desc: 'Hai cô cậu học sinh trung học bất ngờ bị hoán đổi cơ thể cho nhau trong giấc mơ.',
            synopsis: 'Hai cô cậu học sinh trung học bất ngờ bị hoán đổi cơ thể...',
            year: '2016',
            duration: '1h 46m',
            age: 'T13',
            genre: 'Anime, Tình Cảm',
            status: 'now-showing',
            poster: '/images/movies/Kimi-no-Na-wa.-Visual.jpg',
            bg: '/images/movies/Kimi-no-Na-wa.-Visual.jpg',
            backdrop: '/images/movies/Kimi-no-Na-wa.-Visual.jpg',
            trailer: 'https://www.youtube.com/embed/xU47nhruN-Q',
            trailerWatch: 'https://www.youtube.com/watch?v=xU47nhruN-Q',
            tags: ['Anime', 'Tình Cảm'],
            formats: ['2D']
        },
        {
            id: 'b1111111-1111-1111-1111-111111111111',
            title: 'F1: The Movie',
            meta: '2026 • Hành Động, Thể Thao • 2h 10m',
            desc: 'Một cựu tay đua bất ngờ quay trở lại đường đua Công thức 1 sau nhiều năm vắng bóng.',
            synopsis: 'Một cựu tay đua bất ngờ quay trở lại đường đua Công thức 1...',
            year: '2026',
            duration: '2h 10m',
            age: 'T16',
            genre: 'Hành Động, Thể Thao',
            status: 'coming-soon',
            poster: '/images/movies/f1_movie.jpg',
            bg: '/images/movies/f1_movie.jpg',
            backdrop: '/images/movies/f1_movie.jpg',
            trailer: 'https://www.youtube.com/embed/a8gEGuE_7_o',
            trailerWatch: 'https://www.youtube.com/watch?v=a8gEGuE_7_o',
            tags: ['Hành Động', 'Thể Thao'],
            formats: ['2D', 'IMAX']
        },
        {
            id: 'b2222222-2222-2222-2222-222222222222',
            title: 'OBSESSION',
            meta: '2026 • Kinh Dị, Lãng Mạn • 1h 0m',
            desc: 'Be careful who you wish for... Hãy cẩn thận với những gì bạn ước mơ.',
            synopsis: 'Be careful who you wish for...',
            year: '2026',
            duration: '1h 0m',
            age: 'T18',
            genre: 'Kinh Dị, Lãng Mạn',
            status: 'coming-soon',
            poster: '/images/movies/obsession.jpg',
            bg: '/images/movies/obsession.jpg',
            backdrop: '/images/movies/obsession.jpg',
            trailer: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            trailerWatch: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            tags: ['Kinh Dị', 'Lãng Mạn'],
            formats: ['2D']
        },
        {
            id: 'b3333333-3333-3333-3333-333333333333',
            title: 'War Machine',
            meta: '2026 • Hành Động, Chính Trị • 2h 2m',
            desc: 'Câu chuyện châm biếm về một vị tướng Mỹ đầy tham vọng được giao chỉ huy cuộc chiến ở Afghanistan.',
            synopsis: 'Câu chuyện châm biếm về một vị tướng Mỹ...',
            year: '2026',
            duration: '2h 2m',
            age: 'T18',
            genre: 'Hành Động, Chính Trị',
            status: 'coming-soon',
            poster: '/images/movies/war_machine.jpg',
            bg: '/images/movies/war_machine.jpg',
            backdrop: '/images/movies/war_machine.jpg',
            trailer: 'https://www.youtube.com/embed/B6cWGUJebkM',
            trailerWatch: 'https://www.youtube.com/watch?v=B6cWGUJebkM',
            tags: ['Hành Động', 'Chính Trị'],
            formats: ['2D']
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
