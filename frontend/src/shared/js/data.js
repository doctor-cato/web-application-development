let allMoviesData = [];
let heroMovies = [];
let nowShowingMovies = [];
let comingSoonMovies = [];

function normalizeImagePath(path) {
    if (!path) return '/shared/images/avatar.jpg';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('/shared/') || path.startsWith('../') || path.startsWith('/uploads/')) {
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
    const rawPoster = m.posterUrl || m.poster;
    const rawBg = m.bgUrl || m.backdropUrl || m.bg;
    const posterImg = normalizeImagePath(rawPoster);
    const bgImg = rawBg ? normalizeImagePath(rawBg) : posterImg;
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

async function fetchMovies() {
    try {
        const response = await fetch(`/api/movies`);
        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
            const data = await response.json();
            if (Array.isArray(data)) {
                allMoviesData = data.map(m => mapMovieObj(m));
            } else {
                allMoviesData = [];
            }
        } else {
            allMoviesData = [];
        }
    } catch (e) {
        console.warn("Failed to fetch movies from API:", e);
        allMoviesData = [];
    }

    nowShowingMovies = allMoviesData.filter(m => m.status === 'now-showing');
    comingSoonMovies = allMoviesData.filter(m => m.status === 'coming-soon');
    heroMovies = nowShowingMovies.slice(0, 5);

    window.allMoviesData = allMoviesData;
    window.heroMovies = heroMovies;
    window.nowShowingMovies = nowShowingMovies;
    window.comingSoonMovies = comingSoonMovies;

    return allMoviesData;
}
window.fetchMoviesPromise = fetchMovies();

let cinemas = [];

async function fetchCinemas() {
    try {
        const response = await fetch(`/api/cinemas`);
        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
            const fetched = await response.json();
            if (Array.isArray(fetched)) {
                cinemas = fetched;
                cinemas.forEach(c => {
                    c.lat = c.latitude || c.lat || null;
                    c.lng = c.longitude || c.lng || null;
                    c.screens = c.screens || (c.rooms ? c.rooms.length : 0);
                    c.features = c.features || [];
                });
            }
        }
    } catch (e) {
        console.warn("Failed to fetch cinemas:", e);
        cinemas = [];
    }
    window.cinemas = cinemas;
    return cinemas;
}
window.fetchCinemasPromise = fetchCinemas();

function normalizeShowtime(s) {
    const cId = s.cinemaId || (s.room ? s.room.cinemaId : 'ha-dong');
    const cName = s.cinemaName || (s.room ? s.room.cinemaName : '3HD2K HÀ ĐÔNG');
    const rName = s.roomName || (s.room ? s.room.name : 'Phòng chiếu 1');
    const dStr = s.date || (s.startTime ? s.startTime.split('T')[0] : new Date().toISOString().split('T')[0]);
    const tStr = s.time || (s.startTime ? s.startTime.split('T')[1]?.substring(0,5) : '12:00');
    const isoStart = s.startTime || `${dStr}T${tStr}:00`;

    return {
        ...s,
        id: s.id || ('st_' + Math.random().toString(36).substr(2, 9)),
        movieId: s.movieId ? String(s.movieId) : '',
        movieTitle: s.movieTitle || '',
        cinemaId: cId,
        cinemaName: cName,
        roomName: rName,
        room: { cinemaId: cId, name: rName },
        date: dStr,
        time: tStr,
        startTime: isoStart,
        price: s.price || 80000
    };
}

async function fetchShowtimesByMovie(movieId) {
    try {
        const response = await fetch(`/api/showtimes/movie/${movieId}`);
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) return data.map(normalizeShowtime);
        }
    } catch (e) {
        console.error("Failed to fetch showtimes from API:", e);
    }
    return [];
}
window.fetchShowtimesByMovie = fetchShowtimesByMovie;

window.heroMovies = heroMovies;
window.nowShowingMovies = nowShowingMovies;
window.comingSoonMovies = comingSoonMovies;
window.allMoviesData = allMoviesData;
