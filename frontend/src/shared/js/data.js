
let allMoviesData = [];
let heroMovies = [];
let nowShowingMovies = [];
let comingSoonMovies = [];

const mockGallery = [];
const mockCast = [];

function normalizeImagePath(path) {
    if (!path) return '/shared/images/avatar.jpg';
    if (typeof path === 'string') {
        path = path.trim().replace(/^["'\[\s]+|["'\]\s]+$/g, '');
    }
    if (!path) return '/shared/images/avatar.jpg';
    if (path.includes('3hd2k-api.somee.com')) {
        path = path.replace(/^https?:\/\/3hd2k-api\.somee\.com/, '');
    }
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        return path;
    }
    if (path.startsWith('/shared/') || path.startsWith('../') || path.startsWith('assets/')) {
        return path;
    }
    if (path.startsWith('/')) {
        return path;
    }
    return `/${path}`;
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
    // Tách biệt hoàn toàn: poster (ảnh dọc cho card) và backdrop (ảnh ngang cho hero banner)
    const rawPoster = m.posterUrl || m.poster;
    const rawBg = m.bgUrl || m.backdropUrl || m.bg || m.backdrop;

    let posterImg = rawPoster ? normalizeImagePath(rawPoster) : '';
    let bgImg = rawBg ? normalizeImagePath(rawBg) : '';

    if (!posterImg || posterImg.includes('avatar.jpg')) {
        posterImg = rawBg ? normalizeImagePath(rawBg) : '/shared/images/avatar.jpg';
    }
    if (!bgImg || bgImg.includes('avatar.jpg')) {
        bgImg = (posterImg && !posterImg.includes('avatar.jpg')) ? posterImg : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80';
    }

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

    let releaseDateVal = m.releaseDate;
    if (releaseDateVal && typeof releaseDateVal === 'string' && releaseDateVal.includes('T')) {
        releaseDateVal = releaseDateVal.split('T')[0];
    }
    if (!releaseDateVal && m.year) {
        releaseDateVal = `${m.year}-01-01`;
    }

    let parsedCast = [];
    if (Array.isArray(m.cast)) {
        parsedCast = m.cast.map(c => {
            if (typeof c === 'string') return { name: c, avatar: '/shared/images/avatar.jpg' };
            return { name: c.name || 'Diễn viên', avatar: normalizeImagePath(c.avatar || '/shared/images/avatar.jpg') };
        });
    } else if (typeof m.cast === 'string' && m.cast.trim() && m.cast !== 'Đang cập nhật') {
        const trimmed = m.cast.trim();
        if (trimmed.startsWith('[')) {
            try {
                const jsonCast = JSON.parse(trimmed);
                if (Array.isArray(jsonCast)) {
                    parsedCast = jsonCast.map(c => {
                        if (typeof c === 'string') return { name: c, avatar: '/shared/images/avatar.jpg' };
                        return { name: c.name || 'Diễn viên', avatar: normalizeImagePath(c.avatar || '/shared/images/avatar.jpg') };
                    });
                }
            } catch (e) {}
        }
        if (parsedCast.length === 0) {
            parsedCast = trimmed.split(',').map(name => ({ name: name.trim(), avatar: '/shared/images/avatar.jpg' }));
        }
    }

    let parsedGallery = [];
    if (Array.isArray(m.gallery) && m.gallery.length > 0) {
        parsedGallery = m.gallery.map(img => normalizeImagePath(img)).filter(Boolean);
    } else if (typeof m.gallery === 'string' && m.gallery.trim()) {
        const trimmedG = m.gallery.trim();
        if (trimmedG.startsWith('[')) {
            try {
                const jsonG = JSON.parse(trimmedG);
                if (Array.isArray(jsonG) && jsonG.length > 0) {
                    parsedGallery = jsonG.map(img => normalizeImagePath(img)).filter(Boolean);
                }
            } catch (e) {}
        }
        if (parsedGallery.length === 0) {
            parsedGallery = trimmedG.split(/[\n,]+/).map(img => normalizeImagePath(img.trim())).filter(Boolean);
        }
    }

    return {
        id: m.id || m.movieId || ('mv_' + Math.random().toString(36).slice(2, 11)),
        title: m.title || 'Phim Chưa Có Tiêu Đề',
        meta: m.meta || `${releaseDateVal ? new Date(releaseDateVal).getFullYear() : '2026'} • ${m.genre || 'Hành Động'} • ${formattedDuration}`,
        desc: m.description || m.desc || "Nội dung phim đang được cập nhật...",
        synopsis: m.description || m.synopsis || m.desc || "Nội dung phim đang được cập nhật...",
        releaseDate: releaseDateVal || "Đang cập nhật",
        year: releaseDateVal ? new Date(releaseDateVal).getFullYear() : (m.year || '2026'),
        duration: formattedDuration,
        age: m.ageRating || m.age || 'P',
        genre: m.genre || (m.tags ? m.tags.join(', ') : 'Chưa phân loại'),
        status: (movieStatus || 'coming-soon').toString().toLowerCase().trim(),
        poster: posterImg,
        bg: bgImg,
        backdrop: bgImg,
        language: m.language || "Tiếng Việt / Phụ đề tiếng Anh",
        rating: typeof m.rating === 'number' ? m.rating : 0,
        ratingCount: typeof m.ratingCount === 'number' ? m.ratingCount : 0,
        director: m.director || "Đang cập nhật",
        cast: parsedCast,
        gallery: parsedGallery,
        trailer: m.trailerUrl || m.trailer || "",
        trailerWatch: m.trailerUrl || m.trailer || "",
        tags: m.genre ? m.genre.split(',').map(s => s.trim()) : (m.tags || ["2D"]),
        formats: m.formats ? (Array.isArray(m.formats) ? m.formats : m.formats.split(',').map(f=>f.trim())) : ["2D"],
        cinema: m.cinemaId || m.cinema || ""
    };
}

async function fetchMovies() {
    let deletedList = [];
    try {
        deletedList = JSON.parse(localStorage.getItem('3hd2k_deleted_movies') || '[]').map(x => String(x).toLowerCase().trim());
    } catch (_) {}

    let apiMovies = [];
    try {
        const response = await fetch(`/api/movies`);
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                apiMovies = data;
            }
        }
    } catch (e) {
        console.warn("Failed to fetch movies from API:", e);
    }

    let localMovies = [];
    try {
        localMovies = JSON.parse(localStorage.getItem('3hd2k_movies') || '[]');
    } catch (_) {}

    const combinedMap = new Map();

    if (Array.isArray(apiMovies)) {
        apiMovies.forEach(m => {
            const key = String(m.id || m.movieId || m.title || '').toLowerCase().trim();
            if (key) combinedMap.set(key, m);
        });
    }

    if (Array.isArray(localMovies)) {
        localMovies.forEach(lm => {
            const key = String(lm.id || lm.movieId || lm.title || '').toLowerCase().trim();
            if (key) {
                const existing = combinedMap.get(key) || {};
                combinedMap.set(key, { ...existing, ...lm });
            }
        });
    }

    const rawList = Array.from(combinedMap.values());
    allMoviesData = rawList.map(m => mapMovieObj(m));

    allMoviesData = allMoviesData.filter(m => {
        const mId = String(m.id || '').toLowerCase().trim();
        const mTitle = String(m.title || '').toLowerCase().trim();
        return !deletedList.includes(mId) && !deletedList.includes(mTitle);
    });

    nowShowingMovies = allMoviesData.filter(m => m.status === 'now-showing' || m.status === 'now_showing');
    comingSoonMovies = allMoviesData.filter(m => m.status === 'coming-soon' || m.status === 'upcoming');

    heroMovies = nowShowingMovies.length > 0 ? nowShowingMovies.slice(0, 5) : allMoviesData.slice(0, 5);

    window.allMoviesData = allMoviesData;
    window.heroMovies = heroMovies;
    window.nowShowingMovies = nowShowingMovies;
    window.comingSoonMovies = comingSoonMovies;

    return allMoviesData;
}

window.fetchMoviesPromise = fetchMovies().catch(err => {
    console.warn("Error fetching movies:", err);
    return [];
});

function getFallbackCinemas() {
    return [
        {
            id: 'ha-dong',
            name: '3HD2K HÀ ĐÔNG',
            address: 'Tầng 5, AEON Mall Hà Đông, Dương Nội, Quận Hà Đông, Hà Nội',
            distance: '0.5 KM',
            screens: 9,
            features: ['IMAX', '4DX', 'Dolby Atmos'],
            lat: 20.9780,
            lng: 105.7580
        },
        {
            id: 'le-trong-tan',
            name: '3HD2K LÊ TRỌNG TẤN',
            address: 'Tầng 4, Trung tâm TM Hồ Gươm Plaza, 102 Trần Phú, Quận Hà Đông, Hà Nội',
            distance: '2.1 KM',
            screens: 7,
            features: ['Dolby Atmos', 'ScreenX'],
            lat: 20.9850,
            lng: 105.7850
        },
        {
            id: 'cau-giay',
            name: '3HD2K CẦU GIẤY',
            address: 'Tầng 3, 241 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
            distance: '2.0 KM',
            screens: 8,
            features: ['IMAX', 'Dolby Atmos'],
            lat: 21.0360,
            lng: 105.7820
        },
        {
            id: 'my-dinh',
            name: '3HD2K MỸ ĐÌNH',
            address: 'Tầng 2, Keangnam Landmark 72, Phạm Hùng, Nam Từ Liêm, Hà Nội',
            distance: '5.3 KM',
            screens: 6,
            features: ['4DX', 'Dolby Atmos'],
            lat: 21.0168,
            lng: 105.7840
        },
        {
            id: 'lang-ha',
            name: '3HD2K LÁNG HẠ',
            address: '88 Láng Hạ, Đống Đa, Hà Nội',
            distance: '1.7 KM',
            screens: 10,
            features: ['IMAX', 'ScreenX'],
            lat: 21.0150,
            lng: 105.8120
        },
        {
            id: 'royal-city',
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

function getInitialSeedShowtimes() {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    return [
        {
            id: "st_seed_odyssey_1",
            movieId: "6dba413d-5eb9-498c-8797-89f64d920032",
            movieTitle: "The Odyssey",
            cinemaId: "ha-dong",
            cinemaName: "3HD2K HÀ ĐÔNG",
            roomName: "Phòng IMAX",
            date: todayStr,
            time: "08:00",
            price: 100000
        },
        {
            id: "st_seed_yourname_1",
            movieId: "your-name",
            movieTitle: "YOUR NAME - TÊN CẬU LÀ GÌ",
            cinemaId: "ha-dong",
            cinemaName: "3HD2K HÀ ĐÔNG",
            roomName: "Phòng chiếu 1",
            date: todayStr,
            time: "10:00",
            price: 80000
        },
        {
            id: "st_seed_backrooms_1",
            movieId: "backrooms",
            movieTitle: "BACKROOMS - Thực Thể Quỷ Quyết",
            cinemaId: "ha-dong",
            cinemaName: "3HD2K HÀ ĐÔNG",
            roomName: "Phòng chiếu 2",
            date: todayStr,
            time: "14:00",
            price: 80000
        }
    ];
}

function normalizeShowtime(s) {
    const cId = s.cinemaId || (s.room ? s.room.cinemaId : 'ha-dong');
    const cName = s.cinemaName || (s.room ? s.room.cinemaName : '3HD2K HÀ ĐÔNG');
    const rName = s.roomName || (s.room ? s.room.name : 'Phòng chiếu 1');
    const dStr = s.date || (s.startTime ? s.startTime.split('T')[0] : new Date().toISOString().split('T')[0]);
    const tStr = s.time || (s.startTime ? s.startTime.split('T')[1]?.substring(0,5) : '12:00');
    const isoStart = s.startTime || `${dStr}T${tStr}:00`;

    return {
        ...s,
        id: s.id || ('st_' + Math.random().toString(36).slice(2, 11)),
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

function getFallbackShowtimes(movieId) {
    const showtimes = [];
    const now = new Date();
    const currentCinemas = (typeof cinemas !== 'undefined' && cinemas.length > 0) ? cinemas : getFallbackCinemas();

    for (let i = 0; i < 7; i++) {
        const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
        currentCinemas.forEach(cinema => {

            const hours = [10, 14, 18, 20, 22];
            if (i === 0) {
                hours.push((now.getHours() + 1) % 24);
            }

            const uniqueHours = [...new Set(hours)].sort((a,b) => a-b);

            uniqueHours.forEach(hour => {
                const st = new Date(targetDate);
                st.setHours(hour, (Math.floor(Math.random() * 3) * 15), 0, 0);

                if (i === 0 && hour === (now.getHours() + 1) % 24) {
                    st.setHours(now.getHours() + 1, 30, 0, 0);
                }

                showtimes.push({
                    id: Math.random().toString(36).slice(2, 11),
                    movieId: movieId,
                    cinemaId: cinema.id,
                    cinemaName: cinema.name,
                    roomName: 'Phòng chiếu 1',
                    room: { cinemaId: cinema.id, name: 'Phòng chiếu 1' },
                    date: st.toISOString().split('T')[0],
                    time: st.toTimeString().substring(0,5),
                    startTime: st.toISOString(),
                    price: 80000
                });
            });
        });
    }
    return showtimes;
}

async function fetchShowtimesByMovie(movieId) {
    const targetIdStr = String(movieId || '').toLowerCase().trim();
    let allShowtimes = [];

    // 1. Fetch from Backend API
    try {
        const apiUrl = typeof getApiUrl === 'function' ? getApiUrl('/showtimes') : '/api/showtimes';
        const response = await fetch(apiUrl, {
            headers: typeof getApiHeaders === 'function' ? getApiHeaders() : {}
        });
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
                allShowtimes.push(...data);
            }
        }
    } catch (e) {
        console.error("Failed to fetch showtimes from API:", e);
    }

    // 2. Read from LocalStorage cache ('3hd2k_showtimes') created in Admin
    try {
        const localStr = localStorage.getItem('3hd2k_showtimes');
        if (localStr) {
            const localList = JSON.parse(localStr);
            if (Array.isArray(localList)) {
                allShowtimes.push(...localList);
            }
        }
    } catch (e) {
        console.error("Failed to read local showtimes cache:", e);
    }

    // 3. Deduplicate showtimes by ID & normalize
    const showtimeMap = new Map();
    allShowtimes.forEach(s => {
        const norm = normalizeShowtime(s);
        if (norm && norm.id) {
            showtimeMap.set(norm.id, norm);
        }
    });

    const uniqueList = Array.from(showtimeMap.values());

    // 4. Filter for target movie ID or title
    const movieShowtimes = uniqueList.filter(s => {
        const stMovieId = String(s.movieId || '').toLowerCase().trim();
        if (stMovieId && stMovieId === targetIdStr) return true;

        if (window.currentMovie) {
            const curTitle = String(window.currentMovie.title || '').toLowerCase().trim();
            const stTitle = String(s.movieTitle || '').toLowerCase().trim();
            if (curTitle && stTitle && (curTitle === stTitle || curTitle.includes(stTitle) || stTitle.includes(curTitle))) {
                return true;
            }
        }
        return false;
    });

    if (movieShowtimes.length > 0) {
        return movieShowtimes;
    }

    return generateMockShowtimesForMovie(movieId).map(normalizeShowtime);
}
window.fetchShowtimesByMovie = fetchShowtimesByMovie;

window.heroMovies = heroMovies;
window.nowShowingMovies = nowShowingMovies;
window.comingSoonMovies = comingSoonMovies;
window.allMoviesData = allMoviesData;
window.normalizeImagePath = normalizeImagePath;

// --- Global SignalR Real-time Notifications for User/Staff pages ---
(function initGlobalSignalR() {
    if (typeof signalR === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/7.0.5/signalr.min.js';
        script.onload = connectSignalR;
        document.head.appendChild(script);
    } else {
        connectSignalR();
    }

    function connectSignalR() {
        try {
            const connection = new signalR.HubConnectionBuilder()
                .withUrl("/notificationHub", {
                    accessTokenFactory: () => localStorage.getItem('jwt_token') || ''
                })
                .withAutomaticReconnect()
                .build();

            connection.on("DataUpdated", (type) => {
                if (type === "Movies") {
                    if (typeof window.fetchMovies === 'function') {
                        window.fetchMovies().then(() => {
                            window.dispatchEvent(new Event('moviesUpdated'));
                            console.log("Movies data updated via SignalR");
                        });
                    }
                } else if (type === "Combos") {
                    window.dispatchEvent(new Event('combosUpdated'));
                    console.log("Combos data updated via SignalR");
                    // If on booking-food page, force a reload to get new combos (simple approach)
                    if (window.location.pathname.includes('booking-food') || window.location.pathname.includes('checkout')) {
                        // Optional: a toast notification could be shown before reloading
                        setTimeout(() => window.location.reload(), 1500);
                    }
                } else if (type === "Showtimes") {
                    window.dispatchEvent(new Event('showtimesUpdated'));
                    console.log("Showtimes data updated via SignalR");
                    if (typeof window.fetchShowtimes === 'function') {
                        window.fetchShowtimes();
                    }
                } else if (type === "Vouchers") {
                    window.dispatchEvent(new Event('vouchersUpdated'));
                    console.log("Vouchers data updated via SignalR");
                }
            });

            connection.start()
                .then(() => console.log("Global SignalR connected for DataUpdated"))
                .catch(e => console.warn(e));
        } catch(e) {
            console.warn("Global SignalR init failed", e);
        }
    }
})();
