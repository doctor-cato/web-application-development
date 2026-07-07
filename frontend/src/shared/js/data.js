// ============================================================
//  3HD2K — DATA STORE
//  Tất cả dữ liệu phim, rạp và suất chiếu mẫu
// ============================================================

// ── API INTEGRATION ─────────────────────────────────────────────
let allMoviesData = [];
let heroMovies = [];
let nowShowingMovies = [];
let comingSoonMovies = [];

const mockGallery = [
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80"
];

const mockCast = [
    { name: "Brad Pitt", avatar: "https://i.pravatar.cc/80?img=53" },
    { name: "Damson Idris", avatar: "https://i.pravatar.cc/80?img=17" },
    { name: "Kerry Condon", avatar: "https://i.pravatar.cc/80?img=23" },
    { name: "Javier Bardem", avatar: "https://i.pravatar.cc/80?img=60" }
];

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
const cinemas = [
    {
        id: "ha-dong",
        name: "3HD2K HÀ ĐÔNG",
        distance: "0.5 KM",
        address: "Tầng 5, AEON Mall Hà Đông, Dương Nội, Quận Hà Đông, Hà Nội",
        screens: 9,
        features: ["IMAX", "4DX", "Dolby Atmos"],
        lat: 20.9745,
        lng: 105.7455
    },
    {
        id: "le-trong-tan",
        name: "3HD2K LÊ TRỌNG TẤN",
        distance: "2.1 KM",
        address: "Tầng 4, Trung tâm TM Hồ Gươm Plaza, 102 Trần Phú, Quận Hà Đông, Hà Nội",
        screens: 7,
        features: ["Dolby Atmos", "ScreenX"],
        lat: 20.9720,
        lng: 105.7830
    },
    {
        id: "my-dinh",
        name: "3HD2K MỸ ĐÌNH",
        distance: "5.3 KM",
        address: "Tầng 6, The Garden Shopping Center, Mễ Trì, Quận Nam Từ Liêm, Hà Nội",
        screens: 8,
        features: ["IMAX", "4DX"],
        lat: 21.0170,
        lng: 105.7780
    },
    {
        id: "royal-city",
        name: "3HD2K ROYAL CITY",
        distance: "7.8 KM",
        address: "Tầng B2, Vincom Mega Mall Royal City, 72A Nguyễn Trãi, Quận Thanh Xuân, Hà Nội",
        screens: 10,
        features: ["IMAX", "Dolby Atmos", "4DX"],
        lat: 21.0020,
        lng: 105.8148
    },
    {
        id: "cau-giay",
        name: "3HD2K CẦU GIẤY",
        distance: "2.8 KM",
        address: "Tầng 6, Indochina Plaza, 241 Xuân Thủy, Quận Cầu Giấy, Hà Nội",
        screens: 8,
        features: ["IMAX", "Dolby Atmos"],
        lat: 21.0365,
        lng: 105.7980
    },
    {
        id: "lang-ha",
        name: "3HD2K LÁNG HẠ",
        distance: "1.7 KM",
        address: "Tầng 4, M5 Tower, 91 Nguyễn Chí Thanh, Quận Đống Đa, Hà Nội",
        screens: 6,
        features: ["4DX", "Dolby Atmos"],
        lat: 21.0180,
        lng: 105.8080
    }
];

// ── MOCK SHOWTIMES GENERATOR ─────────────────────────────────
// Returns mock showtime data for a given cinemaId and format
function generateShowtimes(cinemaId, format) {
    const allTimes = ["09:00", "10:30", "11:45", "13:15", "14:30", "16:00", "17:20", "18:45", "20:10", "21:30", "22:50"];
    const statuses = ["available", "available", "available", "almost-full", "available", "available", "available", "almost-full", "available", "available", "available"];
    const count = 5 + Math.floor(Math.random() * 4);
    const startIdx = Math.floor(Math.random() * (allTimes.length - count));
    return allTimes.slice(startIdx, startIdx + count).map((time, i) => ({
        time,
        status: statuses[(startIdx + i) % statuses.length]
    }));
}

// ── MOCK REVIEWS ─────────────────────────────────────────────
const mockReviews = [
    {
        user: "Minh Tuấn",
        avatar: "https://i.pravatar.cc/48?img=1",
        rating: 5,
        date: "10/06/2026",
        text: "Phim rất hay! Kỹ xảo đỉnh cao, cốt truyện hấp dẫn từ đầu đến cuối. Xem ở IMAX mới cảm nhận được hết độ hoành tráng.",
        hasSpoiler: false
    },
    {
        user: "Lan Anh",
        avatar: "https://i.pravatar.cc/48?img=20",
        rating: 4,
        date: "09/06/2026",
        text: "Diễn xuất của các diễn viên chính rất tốt. Tuy nhiên phần đầu hơi chậm, phải đến 30 phút sau phim mới thực sự bắt đầu cuốn hút.",
        hasSpoiler: false
    },
    {
        user: "Đức Khải",
        avatar: "https://i.pravatar.cc/48?img=3",
        rating: 3,
        date: "08/06/2026",
        text: "Cẩn thận spoiler! Kết thúc phim khá bất ngờ và cảm xúc. Nếu bạn đã xem phần trước thì sẽ hiểu hơn nhiều.",
        hasSpoiler: true
    },
    {
        user: "Thu Hà",
        avatar: "https://i.pravatar.cc/48?img=44",
        rating: 5,
        date: "07/06/2026",
        text: "Masterpiece! Không có gì để chê. Âm nhạc, hình ảnh, diễn xuất đều xuất sắc. Đây chắc chắn là một trong những bộ phim hay nhất năm nay.",
        hasSpoiler: false
    },
    {
        user: "Hoàng Long",
        avatar: "https://i.pravatar.cc/48?img=11",
        rating: 4,
        date: "06/06/2026",
        text: "Hình ảnh âm thanh làm cực kỳ ấn tượng, đáng đồng tiền bát gạo ra rạp.",
        hasSpoiler: false
    },
    {
        user: "Thảo Trang",
        avatar: "https://i.pravatar.cc/48?img=5",
        rating: 5,
        date: "05/06/2026",
        text: "Tuyệt vời! Ai chưa xem thì khuyên thật lòng nên đi xem ngay, không xem là phí.",
        hasSpoiler: false
    },
    {
        user: "Gia Bảo",
        avatar: "https://i.pravatar.cc/48?img=8",
        rating: 4,
        date: "04/06/2026",
        text: "Cốt truyện ok, diễn xuất tròn vai, kĩ xảo tạm ổn. Một bộ phim giải trí tốt dịp cuối tuần.",
        hasSpoiler: false
    }
];

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
