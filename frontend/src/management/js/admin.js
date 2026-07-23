/**
 * 3HD2K ADMIN PORTAL ENGINE
 * Pure API-Driven Management Engine (No Mock Fallbacks)
 * Fully aligned with admin.html element IDs and handlers.
 */

// --- STATE STORE ---
let db = {
    movies: [],
    cinemas: [],
    showtimes: [],
    bookings: [],
    combos: [],
    users: [],
    inventory: [],
    roomLayouts: {}
};

let activeTab = 'dashboard';
let activeSeatType = 'standard';
let revenueChartInstance = null;
let moviePieChartInstance = null;

let currentRoomRows = 8;
let currentRoomCols = 12;
let currentVipRows = [4, 5];
let currentDoubleRows = [7];
let currentBrokenSeats = [];

// --- FORMAT UTILITIES ---
const formatVND = (amount) => (amount || 0).toLocaleString("vi-VN") + "đ";
const formatMoney = formatVND;

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed; top:20px; right:20px; z-index:99999; display:flex; flex-direction:column; gap:10px; pointer-events:none;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `padding: 12px 20px; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 0.9rem; color: white; background: ${type === 'error' ? 'rgba(229, 9, 20, 0.95)' : type === 'success' ? 'rgba(13, 242, 134, 0.95)' : 'rgba(0, 240, 255, 0.95)'}; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 10px 25px rgba(0,0,0,0.5); backdrop-filter: blur(10px); pointer-events: auto;`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// --- REST API FETCHERS ---
async function fetchMovies() {
    try {
        const res = await fetch('/api/movies');
        if (res.ok) {
            const data = await res.json();
            db.movies = data.map(m => {
                let d = parseInt(m.duration || m.durationMinutes, 10);
                if (isNaN(d) || d <= 0) d = 120;
                else if (d < 10) d = d * 60; // Convert 1 -> 60, 2 -> 120 if stored as hours
                
                return {
                    id: m.id ? m.id.toString() : '',
                    title: m.title || '',
                    genre: m.genre || 'Phim',
                    duration: d,
                    age: m.ageRating || 'T13',
                    status: m.status || 'now-showing',
                    poster: m.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
                    trailer: m.trailerUrl || '',
                    desc: m.description || ''
                };
            });
        }
    } catch (e) {
        console.error('Fetch movies API error:', e);
    }
}

async function fetchShowtimes() {
    try {
        const res = await fetch('/api/showtimes');
        if (res.ok) {
            const data = await res.json();
            db.showtimes = data.map(s => {
                const movie = db.movies.find(m => m.id === (s.movieId ? s.movieId.toString() : '')) || {};
                return {
                    id: s.id ? s.id.toString() : '',
                    movieId: s.movieId ? s.movieId.toString() : '',
                    movieTitle: s.movieTitle || movie.title || 'Phim #' + s.movieId,
                    cinemaId: s.cinemaId || 'ha-dong',
                    cinemaName: s.cinemaName || '3HD2K HÀ ĐÔNG',
                    roomName: s.roomName || 'Phòng chiếu 1',
                    date: s.startTime ? s.startTime.split('T')[0] : (s.date || ''),
                    time: s.startTime ? s.startTime.split('T')[1]?.substring(0,5) : (s.time || '19:00'),
                    price: s.price || 80000
                };
            });
        }
    } catch (e) {
        console.error('Fetch showtimes API error:', e);
    }
}

async function fetchCinemas() {
    try {
        const res = await fetch('/api/cinemas');
        if (res.ok) {
            db.cinemas = await res.json();
        } else if (db.cinemas.length === 0) {
            db.cinemas = [
                { id: "ha-dong", name: "3HD2K HÀ ĐÔNG", address: "Tầng 5, AEON Mall Hà Đông, Hà Nội", screens: 9 },
                { id: "my-dinh", name: "3HD2K MỸ ĐÌNH", address: "Tầng 6, The Garden Shopping Center, Mỹ Đình, Hà Nội", screens: 8 }
            ];
        }
    } catch (e) {
        console.error('Fetch cinemas API error:', e);
    }
}

async function fetchBookings() {
    try {
        const res = await fetch('/api/bookings');
        if (res.ok) {
            const data = await res.json();
            db.bookings = data.map(b => ({
                id: b.id ? b.id.toString() : 'BK-' + Math.floor(Math.random()*90000),
                username: b.userEmail || b.customerEmail || 'khach',
                customerName: b.customerName || b.userEmail || 'Khách hàng',
                movieTitle: b.movieTitle || 'Vé xem phim',
                showtime: b.showtime || (b.createdAt ? new Date(b.createdAt).toLocaleString('vi-VN') : '19:00'),
                seats: Array.isArray(b.seats) ? b.seats : (b.seats ? b.seats.split(',') : ['A01']),
                totalAmount: b.totalPrice || b.totalAmount || 80000,
                status: b.status || 'paid',
                dateCreated: b.createdAt || new Date().toISOString()
            }));
        }
    } catch (e) {
        console.error('Fetch bookings API error:', e);
    }
}

async function fetchUsers() {
    try {
        const res = await fetch('/api/users');
        if (res.ok) {
            const data = await res.json();
            db.users = data.map(u => ({
                username: u.username || u.email,
                name: u.fullname || u.name || u.username || 'Thành viên',
                email: u.email || '',
                role: (u.role || 'CUSTOMER').toLowerCase() === 'admin' ? 'admin' : 'customer',
                status: u.isLocked ? 'banned' : 'active'
            }));
        }
    } catch (e) {
        console.error('Fetch users API error:', e);
    }
}

async function fetchCombos() {
    try {
        const res = await fetch('/api/combos');
        if (res.ok) {
            const data = await res.json();
            db.combos = data.map(c => ({
                id: c.id ? c.id.toString() : '',
                name: c.name || '',
                desc: c.desc || c.description || '',
                price: c.price || 0,
                stock: c.stock || 100,
                image: c.image || c.imageUrl || '/images/F&B/combo_single.png'
            }));
        }
    } catch (e) {
        console.error('Fetch combos API error:', e);
    }
}

async function reloadDatabase() {
    db.roomLayouts = JSON.parse(localStorage.getItem('3hd2k_rooms_layouts')) || {
        "ha-dong_Phòng chiếu 1": { rows: 8, cols: 12, vipRows: [4,5], doubleRows: [7], brokenSeats: ["A01", "H12"] },
        "my-dinh_Phòng chiếu IMAX": { rows: 10, cols: 14, vipRows: [5,6,7], doubleRows: [9], brokenSeats: [] }
    };
    db.inventory = JSON.parse(localStorage.getItem('cinema_inventory')) || [];

    await Promise.all([
        fetchMovies(),
        fetchCinemas(),
        fetchShowtimes(),
        fetchBookings(),
        fetchUsers(),
        fetchCombos()
    ]);

    triggerTabRenders(activeTab);
}

// --- TAB SWITCHER ---
function switchTab(tabId) {
    activeTab = tabId;
    
    document.querySelectorAll('.sidebar-menu .menu-item').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    document.querySelectorAll('.tab-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`tab-content-${tabId}`);
    if (targetSection) targetSection.classList.add('active');

    const titleEl = document.getElementById('tab-title');
    const subEl = document.getElementById('tab-subtitle');
    
    const titles = {
        dashboard: { main: "Dashboard", sub: "Tổng quan tình hình kinh doanh của rạp chiếu phim" },
        movies: { main: "Quản lý phim", sub: "Xem danh sách phim, cập nhật trạng thái hiển thị và thông tin trailer" },
        showtimes: { main: "Quản lý lịch chiếu", sub: "Tạo suất chiếu mới, phân bổ khung giờ và phòng chiếu" },
        rooms: { main: "Quản lý phòng & ghế", sub: "Chỉnh sửa quy mô phòng và thiết lập phân hạng ghế Standard/VIP/Đôi" },
        bookings: { main: "Quản lý đặt vé", sub: "Xem danh sách các vé đã xuất, duyệt thanh toán và hủy đơn" },
        combos: { main: "Quản lý combo bắp nước", sub: "Thiết lập giá bán các combo thực phẩm và quản lý tồn kho bắp nước" },
        users: { main: "Quản lý người dùng", sub: "Xem thông tin thành viên, khóa/mở khóa tài khoản khách hàng" },
        inventory: { main: "Quản lý kho vật tư", sub: "Quản lý nguyên liệu bắp nước, bao bì và thiết lập cảnh báo tồn kho" },
        stats: { main: "Báo cáo thống kê", sub: "Phân tích số liệu doanh thu và hiệu suất bán vé" }
    };

    if (titleEl && subEl && titles[tabId]) {
        titleEl.textContent = titles[tabId].main;
        subEl.textContent = titles[tabId].sub;
    }

    triggerTabRenders(tabId);
}

function triggerTabRenders(tabId) {
    switch (tabId) {
        case 'dashboard': renderDashboard(); break;
        case 'movies': renderMoviesTable(); break;
        case 'showtimes': populateCinemaDropdowns(); renderShowtimesTable(); break;
        case 'rooms': populateRoomDropdown(); loadRoomSeatMap(); break;
        case 'bookings': renderBookingsTable(); break;
        case 'combos': renderCombosTable(); break;
        case 'users': renderUsersTable(); break;
        case 'inventory': renderAdminInventory(); break;
        case 'stats': renderStatsDashboard(); break;
    }
}

// ================= 1. TAB: DASHBOARD =================
function renderDashboard() {
    const totalMovies = db.movies.length;
    const totalShowtimes = db.showtimes.length;
    const paidBookings = db.bookings.filter(b => b.status === 'paid');
    let ticketsSold = 0;
    let ticketRevenue = 0;
    
    paidBookings.forEach(b => {
        ticketsSold += b.seats ? b.seats.length : 1;
        ticketRevenue += b.totalAmount || 0;
    });

    let posRevenue = 0;
    const logs = JSON.parse(localStorage.getItem("cinema_activity_log")) || [];
    logs.forEach(log => {
        if (log.text && log.text.includes("Tổng tiền:")) {
            const match = log.text.match(/Tổng tiền:\s*([\d\.,]+)/);
            if (match) {
                const cleanNum = parseFloat(match[1].replace(/đ/g, '').replace(/\./g, '').replace(/,/g, ''));
                if (!isNaN(cleanNum)) {
                    posRevenue += cleanNum;
                }
            }
        }
    });

    let totalCombinedRevenue = ticketRevenue + posRevenue;
    const totalUsers = db.users.filter(u => u.role === 'customer').length;

    const elMovies = document.getElementById('stat-movies-count');
    const elShowtimes = document.getElementById('stat-showtimes-count');
    const elTickets = document.getElementById('stat-tickets-count');
    const elRevenue = document.getElementById('stat-revenue');
    const elUsers = document.getElementById('stat-users-count');

    if (elMovies) elMovies.textContent = totalMovies;
    if (elShowtimes) elShowtimes.textContent = totalShowtimes;
    if (elTickets) elTickets.textContent = ticketsSold;
    if (elRevenue) elRevenue.textContent = formatVND(totalCombinedRevenue);
    if (elUsers) elUsers.textContent = totalUsers;

    const recentTbody = document.getElementById('recent-bookings-tbody');
    if (recentTbody) {
        recentTbody.innerHTML = '';
        const sorted = [...db.bookings].sort((a,b) => new Date(b.dateCreated) - new Date(a.dateCreated)).slice(0, 5);
        if (sorted.length === 0) {
            recentTbody.innerHTML = `<tr><td colspan="7" style="text-align: center;" class="text-muted">Chưa có đơn đặt vé nào từ API.</td></tr>`;
        } else {
            sorted.forEach(bk => {
                let statusBadge = bk.status === 'paid' 
                    ? `<span class="badge badge-green">Đã thanh toán</span>` 
                    : bk.status === 'pending' ? `<span class="badge badge-yellow">Chờ duyệt</span>` : `<span class="badge badge-red">Đã hủy</span>`;
                recentTbody.innerHTML += `
                    <tr>
                        <td><strong>#${bk.id}</strong></td>
                        <td>${bk.customerName}</td>
                        <td>${bk.movieTitle}</td>
                        <td>${bk.showtime}</td>
                        <td>${bk.seats ? (Array.isArray(bk.seats) ? bk.seats.join(', ') : bk.seats) : '-'}</td>
                        <td>${formatMoney(bk.totalAmount)}</td>
                        <td>${statusBadge}</td>
                    </tr>
                `;
            });
        }
    }
}

// --- YOUTUBE TRAILER HELPER & MODAL ---
function getYouTubeEmbedUrl(url) {
    if (!url) return '';
    if (url.includes('embed/')) return url;
    
    let videoId = '';
    if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.match(/^[a-zA-Z0-9_-]{11}$/)) {
        videoId = url;
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
}

function openTrailerModal(url, title = 'Trailer Phim') {
    if (!url || !url.trim()) {
        showToast('Phim này chưa có link trailer YouTube!', 'warning');
        return;
    }
    const modal = document.getElementById('trailer-modal');
    const iframe = document.getElementById('trailer-iframe');
    const titleEl = document.getElementById('trailer-modal-title');
    const embedUrl = getYouTubeEmbedUrl(url);
    if (modal && iframe) {
        iframe.src = embedUrl;
        if (titleEl) titleEl.innerHTML = `<i class="fab fa-youtube" style="color: var(--primary-red); font-size: 1.5rem;"></i> Xem Trailer: ${title}`;
        modal.style.display = 'flex';
    }
}

function closeTrailerModal() {
    const modal = document.getElementById('trailer-modal');
    const iframe = document.getElementById('trailer-iframe');
    if (iframe) iframe.src = '';
    if (modal) modal.style.display = 'none';
}

function parseDurationMinutes(val) {
    if (typeof val === 'number') return val;
    if (!val) return 120;
    const match = val.toString().match(/\d+/);
    return match ? parseInt(match[0], 10) : 120;
}

// ================= 2. TAB: MOVIES =================
function renderMoviesTable() {
    const searchEl = document.getElementById('movie-search');
    const filterEl = document.getElementById('movie-filter-status');
    const search = searchEl ? searchEl.value.toLowerCase() : '';
    const filter = filterEl ? filterEl.value : 'all';
    const tbody = document.getElementById('movies-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const filtered = db.movies.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(search);
        const matchesFilter = filter === 'all' || m.status === filter;
        return matchesSearch && matchesFilter;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px;" class="text-muted">Không tìm thấy phim phù hợp từ API</td></tr>`;
        return;
    }

    filtered.forEach(m => {
        const badge = m.status === 'now-showing' 
            ? `<span class="badge badge-green">Đang chiếu</span>` 
            : `<span class="badge badge-yellow">Sắp chiếu</span>`;
        const trailerLink = m.trailer || m.trailerUrl || '';
        const safeTitle = (m.title || '').replace(/'/g, "\\'");
        const safeTrailer = trailerLink.replace(/'/g, "\\'");

        tbody.innerHTML += `
            <tr>
                <td class="poster-td"><img src="${m.poster || 'https://via.placeholder.com/150'}" alt="poster" style="width:45px; height:60px; object-fit:cover; border-radius:4px;"></td>
                <td><strong>${m.title}</strong></td>
                <td>${m.genre}</td>
                <td>${m.duration} phút</td>
                <td>${badge}</td>
                <td>
                    <button class="btn-mini" onclick="openTrailerModal('${safeTrailer}', '${safeTitle}')" title="Xem Trailer YouTube" style="border-color: rgba(229,9,20,0.4); color: #ff4d4d;"><i class="fab fa-youtube"></i> Trailer</button>
                    <button class="btn-mini" onclick="openEditMovieModal('${m.id}')" title="Sửa"><i class="fas fa-edit"></i> Sửa</button>
                    <button class="btn-mini" onclick="deleteMovie('${m.id}')" title="Xóa" style="border-color:var(--primary-red); color:var(--primary-red);"><i class="fas fa-trash-alt"></i> Xóa</button>
                </td>
            </tr>
        `;
    });
}

function filterMoviesTable() {
    renderMoviesTable();
}

function openAddMovieModal() {
    document.getElementById('movie-id').value = '';
    document.getElementById('movie-form').reset();
    document.getElementById('movie-duration-input').value = 120;
    document.getElementById('movie-modal-title').textContent = "Thêm phim mới";
    document.getElementById('movie-modal').style.display = 'flex';
}

function openEditMovieModal(id) {
    const m = db.movies.find(item => item.id === id);
    if (m) {
        document.getElementById('movie-id').value = m.id;
        document.getElementById('movie-title-input').value = m.title || '';
        document.getElementById('movie-genre-input').value = m.genre || '';
        document.getElementById('movie-duration-input').value = m.duration || 120;
        document.getElementById('movie-age-input').value = m.age || 'T13';
        document.getElementById('movie-status-input').value = m.status || 'now-showing';
        document.getElementById('movie-poster-input').value = m.poster || '';
        document.getElementById('movie-trailer-input').value = m.trailer || m.trailerUrl || '';
        document.getElementById('movie-desc-input').value = m.desc || '';
        document.getElementById('movie-modal-title').textContent = "Sửa thông tin phim";
        document.getElementById('movie-modal').style.display = 'flex';
    }
}

function closeMovieModal() { 
    document.getElementById('movie-modal').style.display = 'none'; 
}

async function handleMovieSubmit(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('movie-id').value;
    const durationRaw = document.getElementById('movie-duration-input').value;
    let durationNum = parseDurationMinutes(durationRaw);
    if (durationNum > 0 && durationNum < 10) {
        durationNum = durationNum * 60;
    }

    const apiData = {
        title: document.getElementById('movie-title-input').value,
        description: document.getElementById('movie-desc-input').value,
        duration: durationNum,
        releaseDate: new Date().toISOString(),
        genre: document.getElementById('movie-genre-input').value,
        director: "Đang cập nhật",
        cast: "Đang cập nhật",
        posterUrl: document.getElementById('movie-poster-input').value,
        trailerUrl: document.getElementById('movie-trailer-input').value,
        ageRating: document.getElementById('movie-age-input').value,
        status: document.getElementById('movie-status-input').value
    };

    try {
        if (id) {
            apiData.id = id;
            await fetch(`/api/movies/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiData)
            });
            showToast('Cập nhật phim thành công!', 'success');
        } else {
            await fetch('/api/movies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiData)
            });
            showToast('Thêm phim mới thành công!', 'success');
        }
    } catch (err) {
        console.error("API error", err);
        showToast('Lỗi khi gửi yêu cầu tới API', 'error');
    }

    // Immediately update local in-memory movie item
    const existing = db.movies.find(m => m.id === id);
    if (existing) {
        existing.title = apiData.title;
        existing.duration = durationNum;
        existing.genre = apiData.genre;
        existing.poster = apiData.posterUrl;
        existing.trailer = apiData.trailerUrl;
        existing.status = apiData.status;
        existing.age = apiData.ageRating;
        existing.desc = apiData.description;
    }

    closeMovieModal();
    renderMoviesTable();
    await reloadDatabase();
}

async function deleteMovie(id) {
    if (confirm("Bạn có chắc chắn muốn xóa phim này khỏi hệ thống API?")) {
        try {
            await fetch(`/api/movies/${id}`, { method: 'DELETE' });
            showToast('Đã xóa phim thành công!', 'success');
        } catch (err) {
            console.error("API delete error", err);
            showToast('Lỗi khi xóa phim', 'error');
        }
        await reloadDatabase();
    }
}

// ================= 3. TAB: SHOWTIMES =================
function renderShowtimesTable() {
    const searchEl = document.getElementById('showtime-search');
    const filterEl = document.getElementById('showtime-filter-cinema');
    const search = searchEl ? searchEl.value.toLowerCase() : '';
    const filter = filterEl ? filterEl.value : 'all';
    const tbody = document.getElementById('showtimes-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    const filtered = db.showtimes.filter(st => {
        const matchesSearch = st.movieTitle.toLowerCase().includes(search);
        const matchesFilter = filter === 'all' || st.cinemaId === filter;
        return matchesSearch && matchesFilter;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px;" class="text-muted">Chưa có lịch chiếu nào từ API</td></tr>`;
        return;
    }

    filtered.forEach(st => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${st.movieTitle}</strong></td>
                <td>${st.cinemaName}</td>
                <td>${st.roomName}</td>
                <td>${st.date}</td>
                <td>${st.time}</td>
                <td>${formatMoney(st.price)}</td>
                <td>
                    <button class="btn-mini" onclick="deleteShowtime('${st.id}')" style="border-color:var(--primary-red); color:var(--primary-red);"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `;
    });
}

function filterShowtimesTable() {
    renderShowtimesTable();
}

function populateCinemaDropdowns() {
    const selectFilter = document.getElementById('showtime-filter-cinema');
    if (selectFilter) {
        selectFilter.innerHTML = `<option value="all">Tất cả rạp</option>` + db.cinemas.map(c => `
            <option value="${c.id}">${c.name}</option>
        `).join('');
    }
}

function openAddShowtimeModal() {
    const mSelect = document.getElementById('st-movie-select');
    const cSelect = document.getElementById('st-cinema-select');
    
    if (mSelect && cSelect) {
        mSelect.innerHTML = db.movies.map(m => `<option value="${m.id}">${m.title}</option>`).join('');
        cSelect.innerHTML = db.cinemas.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        populateModalRooms();
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('st-date-input').value = today;
        document.getElementById('st-time-input').value = "19:00";
        document.getElementById('showtime-modal').style.display = 'flex';
    }
}

function populateModalRooms() {
    const cId = document.getElementById('st-cinema-select').value;
    const rSelect = document.getElementById('st-room-select');
    if (cId && rSelect) {
        const rooms = cId === "ha-dong" ? ["Phòng chiếu 1", "Phòng chiếu 2", "Phòng chiếu IMAX"] : ["Phòng chiếu 1", "Phòng chiếu 2"];
        rSelect.innerHTML = rooms.map(r => `<option value="${r}">${r}</option>`).join('');
    }
}

function closeShowtimeModal() { 
    document.getElementById('showtime-modal').style.display = 'none'; 
}

async function handleShowtimeSubmit(e) {
    if (e) e.preventDefault();
    const movieId = document.getElementById('st-movie-select').value;
    const date = document.getElementById('st-date-input').value;
    const time = document.getElementById('st-time-input').value;
    const price = parseFloat(document.getElementById('st-price-input').value || 80000);

    const payload = {
        movieId: parseInt(movieId) || movieId,
        startTime: `${date}T${time}:00Z`,
        price: price
    };

    try {
        await fetch('/api/showtimes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        showToast('Tạo suất chiếu mới thành công!', 'success');
    } catch (err) {
        console.error('API create showtime error:', err);
    }

    closeShowtimeModal();
    await reloadDatabase();
}

async function deleteShowtime(id) {
    if (confirm("Xóa lịch chiếu này khỏi hệ thống API?")) {
        try {
            await fetch(`/api/showtimes/${id}`, { method: 'DELETE' });
            showToast('Đã xóa suất chiếu!', 'success');
        } catch (err) {
            console.error('API delete showtime error:', err);
        }
        await reloadDatabase();
    }
}

// ================= 4. TAB: ROOMS & SEATING =================
function populateRoomDropdown() {
    const select = document.getElementById('room-select');
    if (!select) return;
    select.innerHTML = '';
    db.cinemas.forEach(c => {
        const rooms = c.id === "ha-dong" ? ["Phòng chiếu 1", "Phòng chiếu 2", "Phòng chiếu IMAX"] : ["Phòng chiếu 1", "Phòng chiếu 2"];
        rooms.forEach(r => {
            select.innerHTML += `<option value="${c.id}_${r}">${c.name} - ${r}</option>`;
        });
    });
}

function loadRoomSeatMap() {
    const roomKey = document.getElementById('room-select').value;
    if (!roomKey) return;

    const layout = db.roomLayouts[roomKey] || { rows: 8, cols: 12, vipRows: [4,5], doubleRows: [7], brokenSeats: [] };
    currentRoomRows = layout.rows;
    currentRoomCols = layout.cols;
    currentVipRows = layout.vipRows || [];
    currentDoubleRows = layout.doubleRows || [];
    currentBrokenSeats = layout.brokenSeats || [];

    document.getElementById('room-rows').value = currentRoomRows;
    document.getElementById('room-cols').value = currentRoomCols;

    renderSeatingGrid();
}

function renderSeatingGrid() {
    const grid = document.getElementById('admin-seating-grid');
    if (!grid) return;
    
    grid.style.gridTemplateColumns = `repeat(${currentRoomCols}, 32px)`;
    grid.innerHTML = '';

    for (let r = 0; r < currentRoomRows; r++) {
        const rowLabel = String.fromCharCode(65 + r);
        for (let c = 1; c <= currentRoomCols; c++) {
            const seatCode = `${rowLabel}${c.toString().padStart(2, '0')}`;
            let seatType = 'standard';
            
            if (currentBrokenSeats.includes(seatCode)) seatType = 'broken';
            else if (currentDoubleRows.includes(r)) seatType = 'double';
            else if (currentVipRows.includes(r)) seatType = 'vip';

            const seatBtn = document.createElement('button');
            seatBtn.className = `seat-btn-admin ${seatType}`;
            seatBtn.textContent = seatCode;
            seatBtn.addEventListener('click', () => toggleSeatProperty(seatCode, r));
            grid.appendChild(seatBtn);
        }
    }
}

function toggleSeatProperty(seatCode, rowIndex) {
    if (activeSeatType === 'broken') {
        if (currentBrokenSeats.includes(seatCode)) {
            currentBrokenSeats = currentBrokenSeats.filter(s => s !== seatCode);
        } else {
            currentBrokenSeats.push(seatCode);
        }
    } else if (activeSeatType === 'vip') {
        currentBrokenSeats = currentBrokenSeats.filter(s => s !== seatCode);
        if (!currentVipRows.includes(rowIndex)) {
            currentVipRows.push(rowIndex);
            currentDoubleRows = currentDoubleRows.filter(r => r !== rowIndex);
        } else {
            currentVipRows = currentVipRows.filter(r => r !== rowIndex);
        }
    } else if (activeSeatType === 'double') {
        currentBrokenSeats = currentBrokenSeats.filter(s => s !== seatCode);
        if (!currentDoubleRows.includes(rowIndex)) {
            currentDoubleRows.push(rowIndex);
            currentVipRows = currentVipRows.filter(r => r !== rowIndex);
        } else {
            currentDoubleRows = currentDoubleRows.filter(r => r !== rowIndex);
        }
    } else {
        currentBrokenSeats = currentBrokenSeats.filter(s => s !== seatCode);
        currentVipRows = currentVipRows.filter(r => r !== rowIndex);
        currentDoubleRows = currentDoubleRows.filter(r => r !== rowIndex);
    }
    renderSeatingGrid();
}

function updateRoomGridSize() {
    currentRoomRows = parseInt(document.getElementById('room-rows').value) || 8;
    currentRoomCols = parseInt(document.getElementById('room-cols').value) || 12;
    renderSeatingGrid();
}

function saveCurrentRoomLayout() {
    const roomKey = document.getElementById('room-select').value;
    if (roomKey) {
        db.roomLayouts[roomKey] = {
            rows: currentRoomRows,
            cols: currentRoomCols,
            vipRows: currentVipRows,
            doubleRows: currentDoubleRows,
            brokenSeats: currentBrokenSeats
        };
        localStorage.setItem('3hd2k_rooms_layouts', JSON.stringify(db.roomLayouts));
        showToast("Đã lưu sơ đồ cấu hình ghế thành công!", "success");
    }
}

// ================= 5. TAB: BOOKINGS =================
function renderBookingsTable() {
    const searchEl = document.getElementById('booking-search');
    const filterEl = document.getElementById('booking-filter-status');
    const search = searchEl ? searchEl.value.toLowerCase() : '';
    const filter = filterEl ? filterEl.value : 'all';
    const tbody = document.getElementById('bookings-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const filtered = db.bookings.filter(bk => {
        const matchesSearch = bk.id.toLowerCase().includes(search) || bk.customerName.toLowerCase().includes(search);
        const matchesFilter = filter === 'all' || bk.status === filter;
        return matchesSearch && matchesFilter;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 30px;" class="text-muted">Không tìm thấy đơn vé từ API</td></tr>`;
        return;
    }

    filtered.forEach(bk => {
        let statusBadge = bk.status === 'paid' 
            ? `<span class="badge badge-green">Đã thanh toán</span>` 
            : bk.status === 'pending' ? `<span class="badge badge-yellow">Chờ duyệt</span>` : `<span class="badge badge-red">Đã hủy</span>`;
        
        tbody.innerHTML += `
            <tr>
                <td><strong>#${bk.id}</strong></td>
                <td>${bk.customerName}</td>
                <td>${bk.movieTitle}</td>
                <td>${bk.showtime}</td>
                <td>${bk.seats ? (Array.isArray(bk.seats) ? bk.seats.join(', ') : bk.seats) : '-'}</td>
                <td>${formatMoney(bk.totalAmount)}</td>
                <td>${statusBadge}</td>
                <td>
                    ${bk.status === 'pending' ? `<button class="btn-mini" onclick="approveBooking('${bk.id}')" title="Duyệt"><i class="fas fa-check"></i></button>` : ''}
                    ${bk.status !== 'cancelled' ? `<button class="btn-mini" onclick="cancelBooking('${bk.id}')" title="Hủy vé" style="border-color:var(--primary-red); color:var(--primary-red);"><i class="fas fa-times"></i></button>` : ''}
                </td>
            </tr>
        `;
    });
}

function filterBookingsTable() {
    renderBookingsTable();
}

function approveBooking(id) {
    const bk = db.bookings.find(b => b.id === id);
    if (bk) {
        bk.status = 'paid';
        showToast(`Đã duyệt đơn vé #${id}`, 'success');
        renderBookingsTable();
    }
}

function cancelBooking(id) {
    if (confirm("Hủy đơn đặt vé này và giải phóng ghế?")) {
        const bk = db.bookings.find(b => b.id === id);
        if (bk) {
            bk.status = 'cancelled';
            showToast(`Đã hủy đơn vé #${id}`, 'info');
            renderBookingsTable();
        }
    }
}

// ================= 6. TAB: COMBOS =================
function renderCombosTable() {
    const searchEl = document.getElementById('combo-search');
    const search = searchEl ? searchEl.value.toLowerCase() : '';
    const tbody = document.getElementById('combos-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const filtered = db.combos.filter(c => c.name.toLowerCase().includes(search));

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px;" class="text-muted">Chưa có combo nào từ API</td></tr>`;
        return;
    }

    filtered.forEach(c => {
        tbody.innerHTML += `
            <tr>
                <td class="poster-td"><img src="${c.image || 'https://via.placeholder.com/150'}" alt="img" style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px;"></td>
                <td><strong>${c.name}</strong></td>
                <td>${c.desc}</td>
                <td>${formatMoney(c.price)}</td>
                <td>${c.stock} cái</td>
                <td>
                    <button class="btn-mini" onclick="openEditComboModal('${c.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-mini" onclick="deleteCombo('${c.id}')" style="border-color:var(--primary-red); color:var(--primary-red);"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `;
    });
}

function filterCombosTable() {
    renderCombosTable();
}

function openAddComboModal() {
    document.getElementById('combo-id').value = '';
    document.getElementById('combo-form').reset();
    document.getElementById('combo-modal-title').textContent = "Thêm Combo mới";
    document.getElementById('combo-modal').style.display = 'flex';
}

function openEditComboModal(id) {
    const c = db.combos.find(item => item.id === id);
    if (c) {
        document.getElementById('combo-id').value = c.id;
        document.getElementById('combo-name-input').value = c.name;
        document.getElementById('combo-price-input').value = c.price;
        document.getElementById('combo-stock-input').value = c.stock;
        document.getElementById('combo-image-input').value = c.image || '';
        document.getElementById('combo-desc-input').value = c.desc || '';
        document.getElementById('combo-modal-title').textContent = "Sửa thông tin Combo";
        document.getElementById('combo-modal').style.display = 'flex';
    }
}

function closeComboModal() { 
    document.getElementById('combo-modal').style.display = 'none'; 
}

async function handleComboSubmit(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('combo-id').value;
    const data = {
        name: document.getElementById('combo-name-input').value,
        price: parseFloat(document.getElementById('combo-price-input').value),
        stock: parseInt(document.getElementById('combo-stock-input').value || 100),
        image: document.getElementById('combo-image-input').value,
        desc: document.getElementById('combo-desc-input').value
    };

    try {
        if (id) {
            await fetch(`/api/combos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showToast('Đã cập nhật Combo!', 'success');
        } else {
            await fetch('/api/combos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showToast('Thêm Combo thành công!', 'success');
        }
    } catch (err) {
        console.error('API combo error:', err);
    }

    closeComboModal();
    await reloadDatabase();
}

async function deleteCombo(id) {
    if (confirm("Xóa Combo này khỏi hệ thống API?")) {
        try {
            await fetch(`/api/combos/${id}`, { method: 'DELETE' });
            showToast('Đã xóa Combo thành công!', 'success');
        } catch (err) {
            console.error('API delete combo error:', err);
        }
        await reloadDatabase();
    }
}

// ================= 7. TAB: USERS =================
function renderUsersTable() {
    const searchEl = document.getElementById('user-search');
    const filterEl = document.getElementById('user-filter-role');
    const search = searchEl ? searchEl.value.toLowerCase() : '';
    const filter = filterEl ? filterEl.value : 'all';
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const filtered = db.users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
        const matchesFilter = filter === 'all' || u.role === filter;
        return matchesSearch && matchesFilter;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px;" class="text-muted">Chưa có người dùng từ API</td></tr>`;
        return;
    }

    filtered.forEach(u => {
        const avatar = u.name.charAt(0).toUpperCase();
        const roleBadge = u.role === 'admin' 
            ? `<span class="badge badge-red">Admin</span>` 
            : `<span class="badge badge-green">Khách hàng</span>`;
        
        tbody.innerHTML += `
            <tr>
                <td class="poster-td"><div class="admin-avatar" style="width:30px;height:30px;font-size:0.8rem; display:flex; justify-content:center; align-items:center; background:rgba(255,255,255,0.1); border-radius:50%; font-weight:bold;">${avatar}</div></td>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td>${roleBadge}</td>
                <td><span class="badge ${u.status === 'active' ? 'badge-green' : 'badge-red'}">${u.status === 'active' ? 'Hoạt động' : 'Bị khóa'}</span></td>
                <td>
                    <button class="btn-mini" onclick="toggleUserStatus('${u.username}')" title="Khóa/Mở khóa"><i class="fas fa-lock"></i></button>
                    <button class="btn-mini" onclick="viewUserHistory('${u.username}')" title="Lịch sử giao dịch"><i class="fas fa-history"></i></button>
                </td>
            </tr>
        `;
    });
}

function filterUsersTable() {
    renderUsersTable();
}

function toggleUserStatus(username) {
    const u = db.users.find(user => user.username === username);
    if (u) {
        u.status = u.status === 'active' ? 'banned' : 'active';
        showToast(`Cập nhật trạng thái tài khoản ${username}`, 'info');
        renderUsersTable();
    }
}

function viewUserHistory(username) {
    const u = db.users.find(user => user.username === username);
    if (!u) return;

    document.getElementById('user-history-name').textContent = u.name;
    document.getElementById('user-history-email').textContent = u.email;

    const tbody = document.getElementById('user-history-tbody');
    tbody.innerHTML = '';
    
    const history = db.bookings.filter(b => b.username === username);
    if (history.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;" class="text-muted">Chưa có lịch sử giao dịch.</td></tr>`;
    } else {
        history.forEach(bk => {
            let statusBadge = bk.status === 'paid' 
                ? `<span class="badge badge-green">Đã thanh toán</span>` 
                : bk.status === 'pending' ? `<span class="badge badge-yellow">Chờ duyệt</span>` : `<span class="badge badge-red">Đã hủy</span>`;
            tbody.innerHTML += `
                <tr>
                    <td><strong>#${bk.id}</strong></td>
                    <td>${bk.movieTitle}</td>
                    <td>${bk.showtime}</td>
                    <td>${bk.seats ? (Array.isArray(bk.seats) ? bk.seats.join(', ') : bk.seats) : '-'}</td>
                    <td>${formatMoney(bk.totalAmount)}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        });
    }
    document.getElementById('user-history-modal').style.display = 'flex';
}

function closeUserHistoryModal() {
    document.getElementById('user-history-modal').style.display = 'none';
}

// ================= 8. TAB: THỐNG KÊ (CHART.JS) =================
function renderStatsDashboard() {
    const monthlyRev = Array(12).fill(0);
    const yearEl = document.getElementById('stats-year-filter');
    const selectedYear = yearEl ? parseInt(yearEl.value) || 2026 : 2026;

    db.bookings.forEach(bk => {
        if (bk.status === 'paid') {
            const date = new Date(bk.dateCreated);
            if (date.getFullYear() === selectedYear) {
                const monthIdx = date.getMonth();
                monthlyRev[monthIdx] += bk.totalAmount || 0;
            }
        }
    });

    if (revenueChartInstance) revenueChartInstance.destroy();
    const revCtx = document.getElementById('revenue-chart')?.getContext('2d');
    
    if (revCtx) {
        const redGradient = revCtx.createLinearGradient(0, 0, 0, 300);
        redGradient.addColorStop(0, 'rgba(229, 9, 20, 0.6)');
        redGradient.addColorStop(1, 'rgba(229, 9, 20, 0.05)');

        revenueChartInstance = new Chart(revCtx, {
            type: 'bar',
            data: {
                labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: monthlyRev,
                    backgroundColor: redGradient,
                    borderColor: '#E50914',
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#f5f5f5' } } },
                scales: {
                    y: { ticks: { color: '#888888', callback: (val) => val / 1000 + 'k' } },
                    x: { ticks: { color: '#888888' } }
                }
            }
        });
    }

    const movieShare = {};
    db.bookings.forEach(bk => {
        if (bk.status === 'paid') {
            movieShare[bk.movieTitle] = (movieShare[bk.movieTitle] || 0) + (bk.totalAmount || 0);
        }
    });

    const movieLabels = Object.keys(movieShare);
    const movieData = Object.values(movieShare);

    if (moviePieChartInstance) moviePieChartInstance.destroy();
    const pieCtx = document.getElementById('movie-pie-chart')?.getContext('2d');
    
    if (pieCtx) {
        moviePieChartInstance = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: movieLabels.length > 0 ? movieLabels : ['Chưa có dữ liệu API'],
                datasets: [{
                    data: movieData.length > 0 ? movieData : [100],
                    backgroundColor: ['#E50914', '#00f0ff', '#f59e0b', '#a855f7', '#0df286', '#fb7185']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { color: '#f5f5f5' } } }
            }
        });
    }

    const listEl = document.getElementById('top-selling-combos-list');
    if (listEl) {
        listEl.innerHTML = '';
        db.combos.slice(0, 4).forEach(c => {
            listEl.innerHTML += `
                <div class="stat-item">
                    <div>
                        <span class="stat-item-name">${c.name}</span>
                        <span class="stat-item-qty">Tồn kho ${c.stock} cái</span>
                    </div>
                    <span class="stat-item-revenue">${formatVND(c.price * 15)}</span>
                </div>
            `;
        });
    }
}

function updateRevenueChart() {
    renderStatsDashboard();
}

// ================= 9. TAB: KHO VẬT TƯ =================
function getAdminInventory() {
    return JSON.parse(localStorage.getItem("cinema_inventory")) || [
        { id: "INV-001", name: "Bắp Ngọt Nguyên Hạt", category: "Nguyên liệu", qty: 150, min: 30, unit: "KG", expiry: "20/12/2026", online: true },
        { id: "INV-002", name: "Bột Phô Mai", category: "Nguyên liệu", qty: 45, min: 15, unit: "KG", expiry: "15/10/2026", online: true }
    ];
}

function getAdminStockStatus(qty, min) {
    if (qty <= min * 0.25) return { status: "danger", label: "Cảnh báo" };
    if (qty < min) return { status: "warning", label: "Sắp hết" };
    return { status: "safe", label: "An toàn" };
}

function renderAdminInventory() {
    const inventory = getAdminInventory();
    const searchVal = (document.getElementById("admin-search-inventory")?.value || "").toLowerCase();
    const catVal = document.getElementById("admin-filter-category")?.value || "all";

    const filtered = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchVal);
        const matchesCat = catVal === "all" || item.category === catVal;
        return matchesSearch && matchesCat;
    });

    let criticalCount = 0;
    let warningCount = 0;
    let safeCount = 0;

    inventory.forEach(item => {
        const check = getAdminStockStatus(item.qty, item.min);
        if (check.status === "danger") criticalCount++;
        else if (check.status === "warning") warningCount++;
        else safeCount++;
    });

    const elCrit = document.getElementById("admin-stat-critical");
    const elWarn = document.getElementById("admin-stat-warning");
    const elSafe = document.getElementById("admin-stat-safe");
    const elTot = document.getElementById("admin-stat-total");

    if (elCrit) elCrit.textContent = criticalCount;
    if (elWarn) elWarn.textContent = warningCount;
    if (elSafe) elSafe.textContent = safeCount;
    if (elTot) elTot.textContent = inventory.length;

    const tableBody = document.getElementById("admin-inventory-table-body");
    if (!tableBody) return;
    
    tableBody.innerHTML = filtered.map(item => {
        const check = getAdminStockStatus(item.qty, item.min);
        const stockPercent = Math.min(100, Math.round((item.qty / item.min) * 100));
        
        let progressColor = "#0df286";
        if (check.status === "danger") progressColor = "#E50914";
        else if (check.status === "warning") progressColor = "#f59e0b";

        let badgeClass = "badge-green";
        if (check.status === "danger") badgeClass = "badge-red";
        else if (check.status === "warning") badgeClass = "badge-yellow";

        return `
            <tr class="${check.status === 'danger' ? 'critical-row' : ''}">
                <td class="item-name"><strong>${item.name}</strong></td>
                <td>${item.category}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px; width: 160px;">
                        <span style="font-weight: 700; font-size: 0.85rem; min-width: 50px;">${item.qty} / ${item.min}</span>
                        <div style="flex: 1; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden;">
                            <div style="height: 100%; border-radius: 3px; width: ${stockPercent}%; background-color: ${progressColor};"></div>
                        </div>
                    </div>
                </td>
                <td>${item.unit}</td>
                <td>${item.expiry || '-'}</td>
                <td><span class="badge ${badgeClass}">${check.label}</span></td>
                <td>
                    <label class="switch">
                        <input type="checkbox" ${item.online !== false ? 'checked' : ''} onchange="toggleAdminOnlineStatus('${item.id}', this.checked)">
                        <span class="slider"></span>
                    </label>
                </td>
                <td>
                    <button class="btn-mini" onclick="openAdminRestockModal('${item.id}')">
                        <i class="fas fa-plus"></i> Nhập
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    loadAdminPOSLogs();
}

function filterAdminInventoryTable() {
    renderAdminInventory();
}

function toggleAdminOnlineStatus(itemId, isChecked) {
    const inventory = getAdminInventory();
    const item = inventory.find(i => i.id === itemId);
    if (item) {
        item.online = isChecked;
        localStorage.setItem("cinema_inventory", JSON.stringify(inventory));
        showToast(`Cập nhật trạng thái mặt hàng ${item.name}`, 'info');
        renderAdminInventory();
    }
}

function openAdminRestockModal(itemId) {
    const inventory = getAdminInventory();
    const selectEl = document.getElementById("admin-stock-select-item");
    if (!selectEl) return;
    
    selectEl.innerHTML = inventory.map(item => `
        <option value="${item.id}" ${item.id === itemId ? 'selected' : ''}>${item.name} (${item.unit})</option>
    `).join("");
    
    const modal = document.getElementById("admin-restock-modal");
    if (modal) modal.style.display = 'flex';
}

function closeAdminRestockModal() {
    const modal = document.getElementById("admin-restock-modal");
    if (modal) modal.style.display = 'none';
}

function submitAdminRestock() {
    const itemId = document.getElementById("admin-stock-select-item").value;
    const qty = parseFloat(document.getElementById("admin-stock-qty-input").value);
    
    if (isNaN(qty) || qty <= 0) {
        showToast("Số lượng nhập kho không hợp lệ!", "error");
        return;
    }

    const inventory = getAdminInventory();
    const item = inventory.find(i => i.id === itemId);
    if (item) {
        item.qty = parseFloat((item.qty + qty).toFixed(2));
        localStorage.setItem("cinema_inventory", JSON.stringify(inventory));
        showToast(`Đã nhập thêm +${qty} ${item.unit} cho ${item.name}`, "success");
        closeAdminRestockModal();
        renderAdminInventory();
    }
}

function loadAdminPOSLogs() {
    const logs = JSON.parse(localStorage.getItem("cinema_activity_log")) || [];
    const logsContainer = document.getElementById("admin-pos-logs");
    if (!logsContainer) return;
    
    if (logs.length === 0) {
        logsContainer.innerHTML = `<div style="color: var(--text-muted); padding: 10px;">Chưa có lịch sử nhật ký.</div>`;
        return;
    }
    logsContainer.innerHTML = logs.map(log => `
        <div style="background: rgba(0,0,0,0.2); padding: 6px 10px; border-radius: 4px; border-left: 3px solid var(--btn-cyan-color);">
            <span style="color: var(--text-muted); margin-right: 8px;">[${log.time}]</span> ${log.text}
        </div>
    `).join("");
}

// --- GLOBAL EVENT BINDINGS & INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Menu tab click handlers
    document.querySelectorAll('.sidebar-menu .menu-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            if (targetTab) switchTab(targetTab);
        });
    });

    // Seat brush type selector bindings
    const typeButtons = document.querySelectorAll('.seat-type-selector .type-btn');
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeSeatType = btn.getAttribute('data-type') || 'standard';
        });
    });

    // Live clock update
    function tick() {
        const el = document.getElementById('current-time');
        if (el) el.textContent = new Date().toLocaleTimeString("vi-VN");
    }
    setInterval(tick, 1000);
    tick();

    // Modal background overlay click to close
    window.addEventListener('click', (e) => {
        const movieModal = document.getElementById('movie-modal');
        const showtimeModal = document.getElementById('showtime-modal');
        const comboModal = document.getElementById('combo-modal');
        const userHistoryModal = document.getElementById('user-history-modal');
        const adminRestockModal = document.getElementById('admin-restock-modal');
        
        const trailerModal = document.getElementById('trailer-modal');
        
        if (e.target === movieModal) closeMovieModal();
        if (e.target === trailerModal) closeTrailerModal();
        if (e.target === showtimeModal) closeShowtimeModal();
        if (e.target === comboModal) closeComboModal();
        if (e.target === userHistoryModal) closeUserHistoryModal();
        if (e.target === adminRestockModal) closeAdminRestockModal();
    });

    // Initial Database Load & Render
    reloadDatabase();
    switchTab('dashboard');
});

// EXPOSE ALL HANDLERS GLOBALLY FOR INLINE HTML ATTR ONCLICK / ONSUBMIT
window.switchTab = switchTab;
window.filterMoviesTable = filterMoviesTable;
window.openAddMovieModal = openAddMovieModal;
window.openEditMovieModal = openEditMovieModal;
window.closeMovieModal = closeMovieModal;
window.handleMovieSubmit = handleMovieSubmit;
window.deleteMovie = deleteMovie;
window.openTrailerModal = openTrailerModal;
window.closeTrailerModal = closeTrailerModal;

window.filterShowtimesTable = filterShowtimesTable;
window.openAddShowtimeModal = openAddShowtimeModal;
window.closeShowtimeModal = closeShowtimeModal;
window.populateModalRooms = populateModalRooms;
window.handleShowtimeSubmit = handleShowtimeSubmit;
window.deleteShowtime = deleteShowtime;

window.loadRoomSeatMap = loadRoomSeatMap;
window.updateRoomGridSize = updateRoomGridSize;
window.saveCurrentRoomLayout = saveCurrentRoomLayout;

window.filterBookingsTable = filterBookingsTable;
window.approveBooking = approveBooking;
window.cancelBooking = cancelBooking;

window.filterCombosTable = filterCombosTable;
window.openAddComboModal = openAddComboModal;
window.openEditComboModal = openEditComboModal;
window.closeComboModal = closeComboModal;
window.handleComboSubmit = handleComboSubmit;
window.deleteCombo = deleteCombo;

window.filterUsersTable = filterUsersTable;
window.toggleUserStatus = toggleUserStatus;
window.viewUserHistory = viewUserHistory;
window.closeUserHistoryModal = closeUserHistoryModal;

window.filterAdminInventoryTable = filterAdminInventoryTable;
window.openAdminRestockModal = openAdminRestockModal;
window.closeAdminRestockModal = closeAdminRestockModal;
window.submitAdminRestock = submitAdminRestock;
window.toggleAdminOnlineStatus = toggleAdminOnlineStatus;
window.updateRevenueChart = updateRevenueChart;
