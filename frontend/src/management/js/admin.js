
const isHTTPS = typeof window !== 'undefined' && window.location.protocol === 'https:';
const isVercelHost = typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('vercel'));

const API_BASE_URL = (typeof window !== 'undefined' && window.API_BASE_URL) || 
    (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null' && !window.location.protocol.startsWith('file')
        ? `${window.location.origin}/api`
        : 'http://127.0.0.1:5111/api');

function getApiUrl(path) {
    const base = API_BASE_URL.replace(/\/+$/, '');
    const p = path.startsWith('/') ? path : '/' + path;
    return base + p;
}

function getApiHeaders() {
    const headers = {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true'
    };
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('auth_token') || localStorage.getItem('3hd2k_token') || sessionStorage.getItem('jwt_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

let db = {
    movies: [],
    cinemas: [],
    showtimes: [],
    bookings: [],
    combos: [],
    users: [],
    inventory: [],
    roomLayouts: {},
    vouchers: []
};

let activeTab = 'dashboard';
let activeSeatType = 'standard';
let revenueChartInstance = null;
let moviePieChartInstance = null;

let matrixPollingInterval = null;
const adminSyncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('3hd2k_admin_sync') : null;

if (adminSyncChannel) {
    adminSyncChannel.onmessage = (event) => {
        if (event.data && (event.data.type === 'SHOWTIMES_UPDATED' || event.data.type === 'REFETCH_ALL')) {
            fetchShowtimes().then(() => {
                if (activeTab === 'showtimes') {
                    renderShowtimesTable();
                    renderAvailabilityMatrix();
                }
            });
        }
    };
}

if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
        if (e.key === '3hd2k_showtimes') {
            fetchShowtimes().then(() => {
                if (activeTab === 'showtimes') {
                    renderShowtimesTable();
                    renderAvailabilityMatrix();
                }
            });
        }
    });

    window.addEventListener('focus', () => {
        if (activeTab === 'showtimes') {
            fetchShowtimes().then(() => {
                renderShowtimesTable();
                renderAvailabilityMatrix();
            });
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && activeTab === 'showtimes') {
            fetchShowtimes().then(() => {
                renderShowtimesTable();
                renderAvailabilityMatrix();
            });
        }
    });
}

let currentRoomRows = 8;
let currentRoomCols = 12;
let currentVipRows = [4, 5];
let currentDoubleRows = [7];
let currentBrokenSeats = [];

const formatVND = (amount) => (amount || 0).toLocaleString("vi-VN") + "đ";
const formatMoney = formatVND;
const formatCompactVND = (amount) => {
    const val = Number(amount) || 0;
    if (val >= 1e9) return (val / 1e9).toFixed(2).replace(/\.00$/, '') + " tỷ đ";
    if (val >= 1e6) return (val / 1e6).toFixed(2).replace(/\.00$/, '') + " tr đ";
    return val.toLocaleString("vi-VN") + "đ";
};

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

// --- Notifications Logic (Ponytail minimal implementation) ---
function getAdminNotifications() {
    let notifs = JSON.parse(localStorage.getItem("admin_notifications"));
    if (!notifs) {
        // Init with mock data for UI visual parity
        notifs = [
            { id: "1", type: "info", title: "Có 5 đơn đặt vé mới đang chờ xử lý", time: "5 phút trước", unread: true },
            { id: "2", type: "warning", title: "Kho hàng bắp rang bơ sắp hết", time: "1 giờ trước", unread: true },
            { id: "3", type: "error", title: "Phát hiện lỗi thanh toán giao dịch #4892", time: "2 giờ trước", unread: true }
        ];
        localStorage.setItem("admin_notifications", JSON.stringify(notifs));
    }
    return notifs;
}

function renderAdminNotifications() {
    const notifs = getAdminNotifications();
    const unreadCount = notifs.filter(n => n.unread).length;
    const badgeEl = document.getElementById("notification-badge");
    if (badgeEl) {
        badgeEl.textContent = unreadCount;
        badgeEl.style.display = unreadCount > 0 ? "flex" : "none";
    }

    const listContainer = document.getElementById("admin-notif-list-container");
    if (!listContainer) return;

    if (notifs.length === 0) {
        listContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.8rem; font-style: italic;">Chưa có thông báo mới</div>`;
        return;
    }

    listContainer.innerHTML = notifs.map(n => {
        let iconClass = n.type === 'warning' ? 'fas fa-box-open' : (n.type === 'error' ? 'fas fa-exclamation-triangle' : 'fas fa-ticket-alt');
        let colorClass = n.type === 'warning' ? 'warning' : (n.type === 'error' ? 'error' : '');
        let bgStyle = n.unread ? 'background: rgba(255, 255, 255, 0.05);' : '';
        return `
            <div class="notification-item" style="${bgStyle}">
                <div class="notification-icon ${colorClass}">
                    <i class="${iconClass}"></i>
                </div>
                <div class="notification-content">
                    <span class="notification-title" style="${n.unread ? 'font-weight: 700;' : 'font-weight: 500;'}">${n.title}</span>
                    <span class="notification-time">${n.time}</span>
                </div>
            </div>
        `;
    }).join("");
}

function toggleNotificationDropdown(event) {
    if (event) {
        event.stopPropagation();
    }
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown) {
        const isHidden = !dropdown.classList.contains('active');
        dropdown.classList.toggle('active');
        if (isHidden) {
            renderAdminNotifications();
        }
    }
}

function markAllRead(event) {
    if (event) {
        event.stopPropagation();
    }
    const notifs = getAdminNotifications();
    notifs.forEach(n => n.unread = false);
    localStorage.setItem("admin_notifications", JSON.stringify(notifs));
    renderAdminNotifications();
    showToast('Đã đánh dấu tất cả là đã đọc', 'success');
}

document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('notificationDropdown');
    const notificationPill = document.querySelector('.notification-pill');
    
    if (dropdown && dropdown.classList.contains('active')) {
        if (!notificationPill.contains(event.target)) {
            dropdown.classList.remove('active');
        }
    }
});

async function fetchMovies() {
    try {
        const res = await fetch(getApiUrl('/movies'), { headers: getApiHeaders() });
        if (res.ok) {
            const data = await res.json();
            db.movies = (Array.isArray(data) ? data : []).map(m => {
                let d = parseInt(m.duration || m.durationMinutes, 10);
                if (isNaN(d) || d <= 0) d = 120;
                else if (d < 10) d = d * 60;

                const posterVal = m.posterUrl || m.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1';
                const trailerVal = m.trailerUrl || m.trailer || '';
                const backdropVal = m.backdropUrl || m.backdrop || m.bg || '';

                return {
                    id: m.id ? m.id.toString() : (m.movieId ? m.movieId.toString() : ''),
                    title: m.title || '',
                    genre: m.genre || 'Phim',
                    duration: d,
                    age: m.ageRating || 'T13',
                    status: m.status || 'now-showing',
                    poster: posterVal,
                    posterUrl: posterVal,
                    trailer: trailerVal,
                    trailerUrl: trailerVal,
                    desc: m.description || m.desc || '',
                    releaseDate: m.releaseDate || '',
                    director: m.director || '',
                    language: m.language || '',
                    cast: m.cast || '',
                    backdrop: backdropVal,
                    backdropUrl: backdropVal,
                    bg: backdropVal,
                    gallery: m.gallery || ''
                };
            });
        } else {
            console.warn('Fetch movies API returned status:', res.status);
            if (typeof showToast === 'function') {
                showToast(`Lỗi máy chủ (${res.status}): Không thể kết nối cơ sở dữ liệu trên Somee`, 'error');
            }
        }
    } catch (e) {
        console.error('Fetch movies API error:', e);
    }
}

async function fetchShowtimes() {
    try {
        const res = await fetch(getApiUrl('/showtimes'), { headers: getApiHeaders() });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                db.showtimes = data.map(s => {
                    const movie = db.movies.find(m => m.id === (s.movieId ? s.movieId.toString() : '')) || {};
                    const rawStart = s.startTime || s.date || '';
                    let datePart = '';
                    let timePart = '19:00';
                    if (rawStart.includes('T')) {
                        const parts = rawStart.split('T');
                        datePart = parts[0];
                        timePart = parts[1].substring(0, 5);
                    } else if (rawStart) {
                        datePart = rawStart.substring(0, 10);
                    }
                    return {
                        id: s.id ? s.id.toString() : '',
                        movieId: s.movieId ? s.movieId.toString() : '',
                        movieTitle: s.movieTitle || (s.movie ? s.movie.title : null) || movie.title || 'Phim #' + (s.movieId || ''),
                        cinemaId: s.cinemaId || (s.room && s.room.cinema ? s.room.cinema.id : 'ha-dong'),
                        cinemaName: s.cinemaName || (s.room && s.room.cinema ? s.room.cinema.name : '3HD2K HÀ ĐÔNG'),
                        roomName: s.roomName || (s.room ? s.room.name : 'Phòng chiếu 1'),
                        date: datePart,
                        time: s.time || timePart,
                        price: s.ticketPrice || s.price || 80000
                    };
                });
                localStorage.setItem('3hd2k_showtimes', JSON.stringify(db.showtimes));
                return;
            }
        }
    } catch (e) {
        console.error('Fetch showtimes API error:', e);
    }
    const local = JSON.parse(localStorage.getItem('3hd2k_showtimes') || '[]');
    if (local.length > 0) {
        db.showtimes = local;
    }
}

async function fetchCinemas() {
    try {
        const res = await fetch(getApiUrl('/cinemas'), { headers: getApiHeaders() });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                db.cinemas = data;
                return;
            }
        }
    } catch (e) {
        console.error('Fetch cinemas API error:', e);
    }
    if (!db.cinemas || db.cinemas.length === 0) {
        db.cinemas = [
            { id: "ha-dong", name: "3HD2K HÀ ĐÔNG", address: "Tầng 5, AEON Mall Hà Đông, Hà Nội", screens: 9 },
            { id: "le-trong-tan", name: "3HD2K LÊ TRỌNG TẤN", address: "Tầng 3, Artemis Lê Trọng Tấn, Hà Nội", screens: 6 },
            { id: "cau-giay", name: "3HD2K CẦU GIẤY", address: "Tầng 6, Discovery Complex Cầu Giấy, Hà Nội", screens: 7 },
            { id: "my-dinh", name: "3HD2K MỸ ĐÌNH", address: "Tầng 6, The Garden Shopping Center, Mỹ Đình, Hà Nội", screens: 8 },
            { id: "lang-ha", name: "3HD2K LÁNG HẠ", address: "87 Láng Hạ, Đống Đa, Hà Nội", screens: 5 },
            { id: "royal-city", name: "3HD2K ROYAL CITY", address: "B2-R3, Vincom Mega Mall Royal City, Hà Nội", screens: 10 }
        ];
    }
}

async function fetchVouchers() {
    try {
        const res = await fetch(getApiUrl('/vouchers'), { headers: getApiHeaders() });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                db.vouchers = data;
                return;
            }
        }
    } catch (e) {
        console.error('Fetch vouchers API error:', e);
    }
    db.vouchers = db.vouchers || [];
}


async function fetchBookings() {
    try {
        const res = await fetch(getApiUrl('/bookings'), { headers: getApiHeaders() });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                db.bookings = data.map(b => ({
                    id: b.id ? b.id.toString() : 'BK-' + Math.floor(Math.random()*90000),
                    username: b.userEmail || b.customerEmail || 'khach',
                    customerName: b.customerName || b.userEmail || 'Khách hàng',
                    movieTitle: b.movieTitle || 'Vé xem phim',
                    showtime: b.showtime || (b.createdAt ? new Date(b.createdAt).toLocaleString('vi-VN') : '19:00'),
                    seats: Array.isArray(b.seats) ? b.seats : (b.seats ? b.seats.split(',') : ['A01']),
                    totalAmount: b.totalPrice || b.totalAmount || 80000,
                    status: b.status || 'paid',
                    dateCreated: b.createdAt || new Date().toISOString(),
                    cinemaId: b.cinemaId || 'ha-dong',
                    roomName: b.roomName || b.room || 'Phòng chiếu 1',
                    showtimeId: b.showtimeId || ''
                }));
                return;
            }
        }
    } catch (e) {
        console.error('Fetch bookings API error:', e);
    }
    const allB = [];
    const local1 = JSON.parse(localStorage.getItem('3hd2k_bookings') || '[]');
    const local2 = JSON.parse(localStorage.getItem('cinema_bookings') || '[]');
    if (Array.isArray(local1)) allB.push(...local1);
    if (Array.isArray(local2)) allB.push(...local2);

    const last1 = JSON.parse(localStorage.getItem('3hd2k_last_booking') || 'null');
    const last2 = JSON.parse(localStorage.getItem('cinema_last_booking') || 'null');

    [last1, last2].forEach(lb => {
        if (lb && lb.id) {
            allB.push({
                id: lb.id,
                username: lb.userEmail || lb.username || 'Khách hàng',
                customerName: lb.customerName || lb.userEmail || 'Khách hàng',
                movieTitle: lb.movieTitle || 'Vé xem phim',
                showtime: lb.showtimeText || lb.showtime || '19:00',
                seats: Array.isArray(lb.seats) ? lb.seats : (lb.seats ? lb.seats.split(',') : ['A01']),
                totalAmount: lb.total || lb.totalPrice || 80000,
                status: 'paid',
                dateCreated: lb.createdAt || new Date().toISOString(),
                cinemaId: lb.cinemaId || 'ha-dong',
                roomName: lb.room || 'Phòng chiếu 1',
                showtimeId: lb.showtimeId || ''
            });
        }
    });

    const uniqueB = [];
    const seenIds = new Set();
    allB.forEach(b => {
        if (b.id && !seenIds.has(b.id)) {
            seenIds.add(b.id);
            uniqueB.push(b);
        }
    });
    db.bookings = uniqueB;
}

async function fetchUsers() {
    let usersList = [];
    try {
        const res = await fetch(getApiUrl('/users'), { headers: getApiHeaders() });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                usersList = data.map(u => ({
                    id: u.id || u.email,
                    username: u.email || u.phone || u.id,
                    name: u.fullname || u.name || (u.email ? u.email.split('@')[0] : 'Thành viên'),
                    email: u.email || '',
                    phone: u.phone || '',
                    role: (u.role || 'CUSTOMER').toLowerCase(),
                    status: u.isLocked ? 'banned' : 'active',
                    points: u.points || 0,
                    createdAt: u.createdAt || new Date().toISOString()
                }));
            }
        } else {
            console.warn('Fetch users API returned status:', res.status);
        }
    } catch (e) {
        console.warn('Fetch users API error/offline fallback:', e);
    }

    try {
        const localUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const existingEmails = new Set(usersList.map(u => (u.email || '').toLowerCase()));

        localUsers.forEach((u, idx) => {
            const email = (u.email || '').toLowerCase();
            if (email && !existingEmails.has(email)) {
                existingEmails.add(email);
                usersList.push({
                    id: u.id || `local_${idx}_${Date.now()}`,
                    username: u.email || u.phone || u.id,
                    name: u.fullname || u.name || (u.email ? u.email.split('@')[0] : 'Thành viên'),
                    email: u.email || '',
                    phone: u.phone || '',
                    role: (u.role || (email.includes('admin') ? 'admin' : (email.includes('staff') ? 'staff' : 'customer'))).toLowerCase(),
                    status: u.isLocked ? 'banned' : 'active',
                    points: u.points || 0,
                    createdAt: u.createdAt || new Date().toISOString()
                });
            }
        });

        const curUserRaw = sessionStorage.getItem('cinema_current_user') || localStorage.getItem('3hd2k_user') || localStorage.getItem('currentUser');
        if (curUserRaw) {
            try {
                const curUser = typeof curUserRaw === 'string' ? JSON.parse(curUserRaw) : curUserRaw;
                const email = (curUser.email || curUser.Email || '').toLowerCase();
                if (email && !existingEmails.has(email)) {
                    usersList.push({
                        id: curUser.id || `cur_${Date.now()}`,
                        username: curUser.email || curUser.name || 'Admin',
                        name: curUser.fullname || curUser.Fullname || curUser.name || 'Admin',
                        email: curUser.email || '',
                        phone: curUser.phone || '',
                        role: (curUser.role || 'ADMIN').toLowerCase(),
                        status: 'active',
                        points: curUser.points || 0,
                        createdAt: new Date().toISOString()
                    });
                }
            } catch(_) {}
        }
    } catch(e) {
        console.error('Error combining local users:', e);
    }

    db.users = usersList;
}

async function fetchCombos() {
    try {
        const res = await fetch(getApiUrl('/combos'), { headers: getApiHeaders() });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                db.combos = data.map(c => ({
                    id: c.id ? c.id.toString() : '',
                    name: c.name || '',
                    desc: c.desc || c.description || '',
                    price: c.price || 0,
                    stock: c.stock || 100,
                    category: (c.category || 'Combo').replace(/^Bắp$/, "Đồ ăn").replace(/^Nước$/, "Nước uống"),
                    image: c.image || c.imageUrl || '../assets/combos/combo_solo.jpg'
                }));
                return;
            }
        }
    } catch (e) {
        console.error('Fetch combos API error:', e);
    }
    const local = JSON.parse(localStorage.getItem('cinema_combos') || '[]');
    if (local.length > 0) {
        db.combos = local.map(c => ({
            ...c,
            category: (c.category || 'Combo').replace(/^Bắp$/, "Đồ ăn").replace(/^Nước$/, "Nước uống")
        }));
    } else {
        db.combos = [
            { id: "cb_solo", name: "Combo Solo", desc: "1 Bắp Ngọt (L) + 1 Nước Ngọt (L)", price: 89000, stock: 150, image: "../assets/combos/combo_solo.jpg", category: "Combo" },
            { id: "cb_couple", name: "Combo Couple", desc: "1 Bắp Ngọt (XL) + 2 Nước Ngọt (L)", price: 129000, stock: 120, image: "../assets/combos/combo_couple.jpg", category: "Combo" },
            { id: "cb_family", name: "Combo Family", desc: "2 Bắp Ngọt (XL) + 4 Nước Ngọt (L) + 1 Snack", price: 219000, stock: 80, image: "../assets/combos/combo_family.jpg", category: "Combo" },
            { id: "f_popcorn", name: "Bắp Phô Mai", desc: "Bắp rang bơ phô mai", price: 55000, stock: 100, image: "../assets/combos/combo_solo.jpg", category: "Đồ ăn" },
            { id: "f_pepsi", name: "Pepsi Lon", desc: "Pepsi lon 330ml", price: 25000, stock: 200, image: "../assets/combos/combo_couple.jpg", category: "Nước uống" }
        ];
    }
}

function loadLocalDatabaseCache() {
    let deletedList = [];
    try {
        deletedList = JSON.parse(localStorage.getItem('3hd2k_deleted_movies') || '[]').map(x => String(x).toLowerCase().trim());
    } catch (_) {}

    const localMovies = JSON.parse(localStorage.getItem('3hd2k_movies') || '[]');
    if (Array.isArray(localMovies) && localMovies.length > 0) {
        db.movies = localMovies.filter(m => {
            const mId = String(m.id || '').toLowerCase().trim();
            const mTitle = String(m.title || '').toLowerCase().trim();
            return !deletedList.includes(mId) && !deletedList.includes(mTitle);
        });
    }

    const localShowtimes = JSON.parse(localStorage.getItem('3hd2k_showtimes') || '[]');
    if (Array.isArray(localShowtimes) && localShowtimes.length > 0) {
        db.showtimes = localShowtimes;
    }

    const allB = [];
    const local1 = JSON.parse(localStorage.getItem('3hd2k_bookings') || '[]');
    const local2 = JSON.parse(localStorage.getItem('cinema_bookings') || '[]');
    if (Array.isArray(local1)) allB.push(...local1);
    if (Array.isArray(local2)) allB.push(...local2);

    const last1 = JSON.parse(localStorage.getItem('3hd2k_last_booking') || 'null');
    const last2 = JSON.parse(localStorage.getItem('cinema_last_booking') || 'null');

    [last1, last2].forEach(lb => {
        if (lb && lb.id) {
            allB.push({
                id: lb.id,
                username: lb.userEmail || lb.username || 'Khách hàng',
                customerName: lb.customerName || lb.userEmail || 'Khách hàng',
                movieTitle: lb.movieTitle || 'Vé xem phim',
                showtime: lb.showtimeText || lb.showtime || '19:00',
                seats: Array.isArray(lb.seats) ? lb.seats : (lb.seats ? lb.seats.split(',') : ['A01']),
                totalAmount: lb.total || lb.totalPrice || 80000,
                status: 'paid',
                dateCreated: lb.createdAt || new Date().toISOString(),
                cinemaId: lb.cinemaId || 'ha-dong',
                roomName: lb.room || 'Phòng chiếu 1',
                showtimeId: lb.showtimeId || ''
            });
        }
    });

    const uniqueB = [];
    const seenIds = new Set();
    allB.forEach(b => {
        if (b.id && !seenIds.has(b.id)) {
            seenIds.add(b.id);
            uniqueB.push(b);
        }
    });
    if (uniqueB.length > 0) {
        db.bookings = uniqueB;
    }


    const localCombos = JSON.parse(localStorage.getItem('cinema_combos') || '[]');
    if (Array.isArray(localCombos) && localCombos.length > 0) {
        db.combos = localCombos;
    } else if (!db.combos || db.combos.length === 0) {
        db.combos = [
            { id: "cb_solo", name: "Combo Solo", desc: "1 Bắp Ngọt (L) + 1 Nước Ngọt (L)", price: 89000, stock: 150, image: "../assets/combos/combo_solo.jpg" },
            { id: "cb_couple", name: "Combo Couple", desc: "1 Bắp Ngọt (XL) + 2 Nước Ngọt (L)", price: 129000, stock: 120, image: "../assets/combos/combo_couple.jpg" },
            { id: "cb_family", name: "Combo Family", desc: "2 Bắp Ngọt (XL) + 4 Nước Ngọt (L) + 1 Snack", price: 219000, stock: 80, image: "../assets/combos/combo_family.jpg" }
        ];
    }
}

async function reloadDatabase() {
    loadLocalDatabaseCache();

    db.roomLayouts = JSON.parse(localStorage.getItem('3hd2k_rooms_layouts')) || {
        "ha-dong_Phòng chiếu 1": { rows: 8, cols: 12, vipRows: [4,5], doubleRows: [7], brokenSeats: ["A01", "H12"] },
        "my-dinh_Phòng chiếu IMAX": { rows: 10, cols: 14, vipRows: [5,6,7], doubleRows: [9], brokenSeats: [] }
    };
    db.inventory = JSON.parse(localStorage.getItem('cinema_inventory')) || [];

    triggerTabRenders(activeTab);

    await Promise.all([
        fetchMovies(),
        fetchCinemas(),
        fetchShowtimes(),
        fetchBookings(),
        fetchUsers(),
        fetchCombos(),
        fetchVouchers()
    ]);

    triggerTabRenders(activeTab);
}

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
    if (matrixPollingInterval) {
        clearInterval(matrixPollingInterval);
        matrixPollingInterval = null;
    }

    switch (tabId) {
        case 'dashboard': renderDashboard(); break;
        case 'movies': renderMoviesTable(); break;
        case 'showtimes':
            renderShowtimesTable();
            renderAvailabilityMatrix();
            matrixPollingInterval = setInterval(async () => {
                await fetchShowtimes();
                if (activeTab === 'showtimes') {
                    renderShowtimesTable();
                    renderAvailabilityMatrix();
                }
            }, 10000);
            break;
        case 'rooms': populateRoomDropdown(); loadBrokenSeats(); break;
        case 'bookings': renderBookingsTable(); break;
        case 'combos': renderCombosTable(); break;
        case 'vouchers': renderVouchersTable(); break;
        case 'users': renderUsersTable(); break;
        case 'inventory': renderAdminInventory(); break;
        case 'stats': renderStatsDashboard(); break;
    }
}

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
    if (elRevenue) {
        elRevenue.textContent = formatCompactVND(totalCombinedRevenue);
        elRevenue.title = formatVND(totalCombinedRevenue);
    }
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
                const seatStr = bk.seats ? (Array.isArray(bk.seats) ? bk.seats.join(', ') : bk.seats) : '-';
                recentTbody.innerHTML += `
                    <tr>
                        <td style="white-space: nowrap;"><strong>#${bk.id}</strong></td>
                        <td style="max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${bk.customerName}">${bk.customerName}</td>
                        <td style="max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${bk.movieTitle}">${bk.movieTitle}</td>
                        <td style="white-space: nowrap;">${bk.showtime}</td>
                        <td style="max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${seatStr}">${seatStr}</td>
                        <td style="white-space: nowrap;">${formatMoney(bk.totalAmount)}</td>
                        <td style="white-space: nowrap; text-align: right;">${statusBadge}</td>
                    </tr>
                `;
            });
        }
    }

    const movieSalesMap = {};
    paidBookings.forEach(b => {
        const title = b.movieTitle;
        if (title) {
            let seatCount = 1;
            if (Array.isArray(b.seats)) {
                seatCount = b.seats.length;
            } else if (typeof b.seats === 'string' && b.seats.trim()) {
                seatCount = b.seats.split(',').filter(Boolean).length;
            }
            movieSalesMap[title] = (movieSalesMap[title] || 0) + seatCount;
        }
    });

    let topMovieTitle = '';
    let maxTickets = -1;
    for (const title in movieSalesMap) {
        if (movieSalesMap[title] > maxTickets) {
            maxTickets = movieSalesMap[title];
            topMovieTitle = title;
        }
    }

    let topMovieObj = null;
    if (topMovieTitle) {
        topMovieObj = db.movies.find(m => m.title.toLowerCase().trim() === topMovieTitle.toLowerCase().trim());
    }

    if (!topMovieObj && db.movies.length > 0) {
        topMovieObj = db.movies[0];
        topMovieTitle = topMovieObj.title;
        maxTickets = movieSalesMap[topMovieObj.title] || 0;
    }

    const topMovieTitleEl = document.getElementById('top-movie-title');
    const topMovieStatsEl = document.getElementById('top-movie-stats');
    const topMovieBgEl = document.getElementById('top-movie-bg') || document.querySelector('#dashboard-top-movie .top-movie-bg');

    if (topMovieTitleEl) {
        topMovieTitleEl.textContent = topMovieObj ? topMovieObj.title : (topMovieTitle || 'Chưa có phim');
    }
    if (topMovieStatsEl) {
        const tickets = maxTickets > 0 ? maxTickets : 0;
        topMovieStatsEl.innerHTML = `<i class="fas fa-ticket-alt"></i> ${tickets} vé đã bán`;
    }
    if (topMovieBgEl && topMovieObj) {
        const posterUrl = topMovieObj.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1';
        topMovieBgEl.style.backgroundImage = `url('${posterUrl}')`;
    }
}

function getYouTubeEmbedUrl(url) {
    if (!url) return '';
    let cleanUrl = url.trim();
    let videoId = '';

    if (cleanUrl.includes('embed/')) {
        videoId = cleanUrl.split('embed/')[1]?.split('?')[0]?.split('&')[0];
    } else if (cleanUrl.includes('v=')) {
        videoId = cleanUrl.split('v=')[1]?.split('&')[0];
    } else if (cleanUrl.includes('youtu.be/')) {
        videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0];
    } else if (cleanUrl.match(/^[a-zA-Z0-9_-]{11}$/)) {
        videoId = cleanUrl;
    }

    if (videoId) {
        const origin = (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null')
            ? encodeURIComponent(window.location.origin)
            : '';
        const originParam = origin ? `&origin=${origin}` : '';
        return `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=1&rel=0${originParam}`;
    }
    return cleanUrl;
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
                <td class="poster-td"><img src="${m.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1'}" alt="${safeTitle}"></td>
                <td><strong>${m.title}</strong></td>
                <td>${m.genre}</td>
                <td>${m.duration} phút</td>
                <td style="text-align: center;">${badge}</td>
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

let currentCastList = [];
let currentGalleryList = [];

function switchMovieModalTab(tabName) {
    const infoTabBtn = document.getElementById('tab-btn-info');
    const mediaTabBtn = document.getElementById('tab-btn-media');
    const infoContent = document.getElementById('movie-tab-info');
    const mediaContent = document.getElementById('movie-tab-media');

    if (!infoTabBtn || !mediaTabBtn || !infoContent || !mediaContent) return;

    if (tabName === 'media') {
        infoTabBtn.classList.remove('active');
        mediaTabBtn.classList.add('active');
        infoContent.classList.remove('active');
        mediaContent.classList.add('active');
    } else {
        mediaTabBtn.classList.remove('active');
        infoTabBtn.classList.add('active');
        mediaContent.classList.remove('active');
        infoContent.classList.add('active');
    }
}

// Dynamic Cast Management
function addCastMember() {
    const nameInput = document.getElementById('cast-name-input');
    const avatarInput = document.getElementById('cast-avatar-input');
    if (!nameInput) return;

    const name = nameInput.value.trim();
    const avatar = avatarInput ? avatarInput.value.trim() : '';

    if (!name) {
        showToast('Vui lòng nhập tên diễn viên!');
        return;
    }

    currentCastList.push({
        name: name,
        avatar: avatar || '/shared/images/avatar.jpg'
    });

    nameInput.value = '';
    if (avatarInput) avatarInput.value = '';

    renderCastList();
}

function removeCastMember(idx) {
    currentCastList.splice(idx, 1);
    renderCastList();
}

function renderCastList() {
    const container = document.getElementById('cast-items-list');
    if (!container) return;

    if (currentCastList.length === 0) {
        container.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">Chưa có diễn viên nào. Nhập tên và bấm "+ Thêm".</span>`;
        return;
    }

    container.innerHTML = currentCastList.map((item, idx) => `
        <div class="cast-chip">
            <img src="${item.avatar || '/shared/images/avatar.jpg'}" alt="${item.name}" onerror="this.src='/shared/images/avatar.jpg'">
            <span>${item.name}</span>
            <span class="remove-cast-btn" onclick="removeCastMember(${idx})" title="Xóa">&times;</span>
        </div>
    `).join('');
}

// Dynamic Gallery Management
function addGalleryImage() {
    const urlInput = document.getElementById('gallery-url-input');
    if (!urlInput) return;

    const url = urlInput.value.trim();
    if (!url) {
        showToast('Vui lòng nhập URL ảnh thường!');
        return;
    }

    currentGalleryList.push(url);
    urlInput.value = '';
    renderGalleryList();
}

function removeGalleryImage(idx) {
    currentGalleryList.splice(idx, 1);
    renderGalleryList();
}

function renderGalleryList() {
    const container = document.getElementById('gallery-items-list');
    if (!container) return;

    if (currentGalleryList.length === 0) {
        container.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">Chưa có ảnh gallery nào. Nhập URL và bấm "+ Thêm ảnh".</span>`;
        return;
    }

    container.innerHTML = currentGalleryList.map((url, idx) => `
        <div class="gallery-thumb-card">
            <img src="${url}" alt="Gallery photo ${idx + 1}" onerror="this.src='/shared/images/avatar.jpg'">
            <span class="remove-gallery-btn" onclick="removeGalleryImage(${idx})" title="Xóa ảnh">&times;</span>
        </div>
    `).join('');
}

function openAddMovieModal() {
    document.getElementById('movie-id').value = '';
    document.getElementById('movie-form').reset();
    document.getElementById('movie-duration-input').value = 120;
    document.getElementById('movie-release-date-input').value = new Date().toISOString().split('T')[0];
    document.getElementById('movie-language-input').value = "Tiếng Việt / Phụ đề tiếng Anh";
    document.getElementById('movie-director-input').value = "";
    document.getElementById('movie-modal-title').textContent = "Thêm phim mới";
    
    currentCastList = [];
    currentGalleryList = [];
    renderCastList();
    renderGalleryList();
    
    switchMovieModalTab('info');
    document.getElementById('movie-img-preview').style.display = 'none';
    document.getElementById('movie-modal').style.display = 'flex';
}

function openEditMovieModal(id) {
    const m = db.movies.find(item => item.id === id) || (function(){
        const stored = JSON.parse(localStorage.getItem('3hd2k_movies') || '[]');
        return stored.find(item => item.id === id);
    })();

    if (m) {
        document.getElementById('movie-id').value = m.id;
        document.getElementById('movie-title-input').value = m.title || '';
        document.getElementById('movie-genre-input').value = m.genre || '';
        document.getElementById('movie-duration-input').value = parseDurationMinutes(m.duration) || 120;
        document.getElementById('movie-age-input').value = m.age || 'T13';
        document.getElementById('movie-status-input').value = m.status || 'now-showing';
        
        let rDate = m.releaseDate;
        if (rDate && rDate.includes('T')) rDate = rDate.split('T')[0];
        if (!rDate && m.year) rDate = `${m.year}-01-01`;
        document.getElementById('movie-release-date-input').value = rDate || new Date().toISOString().split('T')[0];
        
        document.getElementById('movie-language-input').value = m.language || "Tiếng Việt / Phụ đề tiếng Anh";
        document.getElementById('movie-director-input').value = m.director || "";
        document.getElementById('movie-poster-input').value = m.poster || m.posterUrl || '';
        document.getElementById('movie-backdrop-input').value = m.backdrop || m.backdropUrl || m.bg || '';
        document.getElementById('movie-trailer-input').value = m.trailer || m.trailerUrl || '';
        document.getElementById('movie-desc-input').value = m.desc || m.synopsis || m.description || '';

        // Load Cast List
        currentCastList = [];
        if (Array.isArray(m.cast)) {
            currentCastList = m.cast.map(c => typeof c === 'string' ? { name: c, avatar: '/shared/images/avatar.jpg' } : c);
        } else if (typeof m.cast === 'string' && m.cast.trim()) {
            try {
                const parsed = JSON.parse(m.cast);
                if (Array.isArray(parsed)) {
                    currentCastList = parsed.map(c => typeof c === 'string' ? { name: c, avatar: '/shared/images/avatar.jpg' } : c);
                } else {
                    currentCastList = m.cast.split(',').map(name => ({ name: name.trim(), avatar: '/shared/images/avatar.jpg' }));
                }
            } catch(_) {
                currentCastList = m.cast.split(',').map(name => ({ name: name.trim(), avatar: '/shared/images/avatar.jpg' }));
            }
        }
        renderCastList();

        // Load Gallery List
        currentGalleryList = [];
        if (Array.isArray(m.gallery)) {
            currentGalleryList = [...m.gallery];
        } else if (typeof m.gallery === 'string' && m.gallery.trim()) {
            try {
                const parsed = JSON.parse(m.gallery);
                if (Array.isArray(parsed)) {
                    currentGalleryList = parsed;
                } else {
                    currentGalleryList = m.gallery.split(',').map(u => u.trim());
                }
            } catch(_) {
                currentGalleryList = m.gallery.split(',').map(u => u.trim());
            }
        }
        renderGalleryList();

        document.getElementById('movie-modal-title').textContent = "Sửa thông tin phim";
        switchMovieModalTab('info');
        updateImgPreview();
        document.getElementById('movie-modal').style.display = 'flex';
    }
}

function closeMovieModal() {
    document.getElementById('movie-modal').style.display = 'none';
}

function updateImgPreview() {
    const posterUrl = document.getElementById('movie-poster-input')?.value || '';
    const backdropUrl = document.getElementById('movie-backdrop-input')?.value || '';
    const previewDiv = document.getElementById('movie-img-preview');
    const previewPoster = document.getElementById('preview-poster');
    const previewBackdrop = document.getElementById('preview-backdrop');

    if (!previewDiv) return;

    const hasPoster = posterUrl.trim() !== '';
    const hasBackdrop = backdropUrl.trim() !== '';

    if (hasPoster || hasBackdrop) {
        previewDiv.style.display = 'flex';
        if (hasPoster) { previewPoster.src = posterUrl; previewPoster.style.display = 'block'; }
        else previewPoster.style.display = 'none';
        if (hasBackdrop) { previewBackdrop.src = backdropUrl; previewBackdrop.style.display = 'block'; }
        else previewBackdrop.style.display = 'none';
    } else {
        previewDiv.style.display = 'none';
    }
}

async function handleMovieSubmit(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('movie-id').value;
    const durationRaw = document.getElementById('movie-duration-input').value;
    let durationNum = parseDurationMinutes(durationRaw);
    if (durationNum > 0 && durationNum < 10) {
        durationNum = durationNum * 60;
    }

    const title = document.getElementById('movie-title-input').value;
    const genre = document.getElementById('movie-genre-input').value;
    const releaseDate = document.getElementById('movie-release-date-input').value;
    const language = document.getElementById('movie-language-input').value || "Tiếng Việt / Phụ đề tiếng Anh";
    const age = document.getElementById('movie-age-input').value;
    const status = document.getElementById('movie-status-input').value;
    const director = document.getElementById('movie-director-input').value || "Đang cập nhật";
    const poster = document.getElementById('movie-poster-input').value;
    const backdrop = document.getElementById('movie-backdrop-input').value;
    const trailer = document.getElementById('movie-trailer-input').value;
    const desc = document.getElementById('movie-desc-input').value;

    if (!title || !title.trim()) {
        showToast("Vui lòng nhập tên phim!", "warning");
        return;
    }

    const castString = JSON.stringify(currentCastList);

    const apiData = {
        title: title,
        description: desc,
        duration: durationNum,
        releaseDate: releaseDate ? new Date(releaseDate).toISOString() : new Date().toISOString(),
        genre: genre,
        director: director,
        cast: castString,
        language: language,
        posterUrl: poster,
        backdropUrl: backdrop || null,
        trailerUrl: trailer,
        ageRating: age,
        status: status,
        gallery: JSON.stringify(currentGalleryList)
    };

    const token = localStorage.getItem('jwt_token') || localStorage.getItem('auth_token');
    const authHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
    try {
        let res;
        if (id) {
            apiData.id = id;
            res = await fetch(getApiUrl(`/movies/${id}`), {
                method: 'PUT',
                headers: getApiHeaders(),
                body: JSON.stringify(apiData)
            });
        } else {
            res = await fetch(getApiUrl('/movies'), {
                method: 'POST',
                headers: getApiHeaders(),
                body: JSON.stringify(apiData)
            });
        }
        if (!res.ok) {
            const errText = await res.text().catch(() => '');
            console.error(`Movie API error (${res.status}):`, errText);
            if (res.status === 401 || res.status === 403) {
                showToast("Phiên đăng nhập hết hạn hoặc không có quyền Admin!", "error");
            } else {
                showToast(`Lỗi từ máy chủ (${res.status}): Không thể lưu thông tin phim`, "error");
            }
            return;
        }
        
        await fetchMovies();
        renderMoviesTable();
        closeMovieModal();
        showToast(id ? "Đã cập nhật thông tin phim thành công!" : "Đã thêm phim mới thành công!", "success");
    } catch (err) {
        console.error("API movie update error:", err);
        showToast("Lỗi kết nối khi cập nhật phim!", "error");
    }
}

async function deleteMovie(id) {
    if (confirm("Bạn có chắc chắn muốn xóa phim này khỏi hệ thống API?")) {
        try {
            const res = await fetch(getApiUrl(`/movies/${id}`), { method: 'DELETE', headers: getApiHeaders() });
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    showToast("Phiên đăng nhập hết hạn hoặc không có quyền Admin!", "error");
                } else {
                    showToast(`Lỗi khi xóa phim (${res.status})`, "error");
                }
                return;
            }
            showToast('Đã xóa phim thành công!', 'success');
        } catch (err) {
            console.error("API delete error", err);
            showToast('Lỗi kết nối khi xóa phim', 'error');
        }
        await fetchMovies();
        renderMoviesTable();
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
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px;" class="text-muted">Chưa có lịch chiếu nào</td></tr>`;
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
        const defaultCinemas = [
            { id: "ha-dong", name: "3HD2K HÀ ĐÔNG" },
            { id: "le-trong-tan", name: "3HD2K LÊ TRỌNG TẤN" },
            { id: "cau-giay", name: "3HD2K CẦU GIẤY" },
            { id: "my-dinh", name: "3HD2K MỸ ĐÌNH" },
            { id: "lang-ha", name: "3HD2K LÁNG HẠ" },
            { id: "royal-city", name: "3HD2K ROYAL CITY" }
        ];
        const list = db.cinemas && db.cinemas.length > 0 ? db.cinemas : defaultCinemas;

        selectFilter.innerHTML = `<option value="all">Tất cả rạp (6 Cụm Rạp)</option>` + list.map(c => `
            <option value="${c.id}">${c.name}</option>
        `).join('');
    }
}

// --- MA TRẬN RẠP & PHÒNG CHIẾU TRỐNG (AVAILABILITY MATRIX) ---
function renderAvailabilityMatrix() {
    const container = document.getElementById('availability-matrix-container');
    if (!container) return;

    const datePicker = document.getElementById('matrix-date-picker');
    if (datePicker && !datePicker.value) {
        datePicker.value = new Date().toISOString().split('T')[0];
    }
    const selectedDate = datePicker ? datePicker.value : new Date().toISOString().split('T')[0];
    const filterCinemaId = document.getElementById('showtime-filter-cinema')?.value || 'all';

    const defaultCinemas = [
        { id: "ha-dong", name: "3HD2K HÀ ĐÔNG", rooms: ["Phòng chiếu 1", "Phòng chiếu 2", "Phòng IMAX"] },
        { id: "le-trong-tan", name: "3HD2K LÊ TRỌNG TẤN", rooms: ["Phòng chiếu 1", "Phòng chiếu 2"] },
        { id: "cau-giay", name: "3HD2K CẦU GIẤY", rooms: ["Phòng chiếu 1", "Phòng IMAX"] },
        { id: "my-dinh", name: "3HD2K MỸ ĐÌNH", rooms: ["Phòng chiếu 1", "Phòng 4DX"] },
        { id: "lang-ha", name: "3HD2K LÁNG HẠ", rooms: ["Phòng chiếu 1", "Phòng ScreenX"] },
        { id: "royal-city", name: "3HD2K ROYAL CITY", rooms: ["Phòng chiếu 1", "Phòng IMAX", "Phòng 4DX"] }
    ];

    const timeSlots = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];

    let matrixCinemas = defaultCinemas;
    if (filterCinemaId !== 'all') {
        matrixCinemas = defaultCinemas.filter(c => c.id === filterCinemaId);
    }

    let html = `
        <table class="admin-table" style="font-size: 0.8125rem;">
            <thead>
                <tr>
                    <th style="min-width: 140px;">Cụm Rạp</th>
                    <th style="min-width: 120px;">Phòng chiếu</th>
                    ${timeSlots.map(t => `<th style="text-align:center; min-width: 100px;">${t}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
    `;

    matrixCinemas.forEach(cinema => {
        cinema.rooms.forEach((room, roomIdx) => {
            html += `<tr>`;
            if (roomIdx === 0) {
                html += `<td rowspan="${cinema.rooms.length}" style="vertical-align: middle; font-weight: bold; color: var(--primary-red); background: rgba(229, 9, 20, 0.05);">${cinema.name}</td>`;
            }
            html += `<td><strong>${room}</strong></td>`;

            timeSlots.forEach(slot => {
                // Check if any showtime falls near this time slot
                const [slotH, slotM] = slot.split(':').map(Number);
                const slotMinutes = slotH * 60 + slotM;

                const occupied = db.showtimes.find(st => {
                    const stCinemaName = st.cinemaName || '';
                    const matchesCinema = st.cinemaId === cinema.id || stCinemaName.includes(cinema.name);
                    const matchesRoom = st.roomName === room;
                    const matchesDate = st.date === selectedDate;
                    if (!matchesCinema || !matchesRoom || !matchesDate) return false;

                    if (!st.time) return false;
                    const [stH, stM] = st.time.split(':').map(Number);
                    const stMinutes = stH * 60 + stM;
                    return Math.abs(stMinutes - slotMinutes) < 90; // Overlaps slot window
                });

                if (occupied) {
                    html += `
                        <td style="text-align:center; background: rgba(229,9,20,0.1); border: 1px solid rgba(229,9,20,0.3); border-radius: 4px; padding: 6px 4px;">
                            <span style="color: #ff4444; font-weight: bold; font-size: 0.75rem; display: block;" title="${occupied.movieTitle}">
                                🎬 ${occupied.movieTitle.length > 12 ? occupied.movieTitle.substring(0,10)+'...' : occupied.movieTitle}
                            </span>
                            <span style="font-size: 0.7rem; color: #bbb;">(${occupied.time})</span>
                        </td>
                    `;
                } else {
                    html += `
                        <td style="text-align:center; padding: 4px;">
                            <button class="btn-mini" style="background: rgba(13, 242, 134, 0.12); color: #0df286; border: 1px solid rgba(13, 242, 134, 0.3); width: 100%; border-radius: 4px; font-weight: bold; cursor: pointer; padding: 6px 2px;"
                                onclick="openQuickShowtimeModal('${cinema.id}', '${room}', '${slot}', '${selectedDate}')">
                                + Trống
                            </button>
                        </td>
                    `;
                }
            });

            html += `</tr>`;
        });
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

async function changeMatrixDate(offset) {
    const datePicker = document.getElementById('matrix-date-picker');
    if (datePicker) {
        let currentDate = new Date(datePicker.value || new Date());
        currentDate.setDate(currentDate.getDate() + offset);
        datePicker.value = currentDate.toISOString().split('T')[0];
        await fetchShowtimes();
        renderAvailabilityMatrix();
    }
}

async function onMatrixFilterChange() {
    await fetchShowtimes();
    renderAvailabilityMatrix();
}

function openQuickShowtimeModal(cinemaId, roomName, timeSlot, dateStr) {
    openAddShowtimeModal();
    setTimeout(() => {
        const cSelect = document.getElementById('st-cinema-select');
        const rSelect = document.getElementById('st-room-select');
        const dateInput = document.getElementById('st-date-input');
        const timeInput = document.getElementById('st-time-input');

        if (cSelect) cSelect.value = cinemaId;
        populateModalRooms();
        if (rSelect) rSelect.value = roomName;
        if (dateInput && dateStr) dateInput.value = dateStr;
        if (timeInput && timeSlot) timeInput.value = timeSlot;
    }, 100);
}

function openAddShowtimeModal() {
    const mSelect = document.getElementById('st-movie-select');
    const cSelect = document.getElementById('st-cinema-select');

    if (mSelect && cSelect) {
        mSelect.innerHTML = db.movies.map(m => `<option value="${m.id}">${m.title} (${m.status === 'now-showing' ? 'Đang chiếu' : 'Sắp chiếu'})</option>`).join('');

        const defaultCinemas = [
            { id: "ha-dong", name: "3HD2K HÀ ĐÔNG" },
            { id: "le-trong-tan", name: "3HD2K LÊ TRỌNG TẤN" },
            { id: "cau-giay", name: "3HD2K CẦU GIẤY" },
            { id: "my-dinh", name: "3HD2K MỸ ĐÌNH" },
            { id: "lang-ha", name: "3HD2K LÁNG HẠ" },
            { id: "royal-city", name: "3HD2K ROYAL CITY" }
        ];
        const list = db.cinemas && db.cinemas.length > 0 ? db.cinemas : defaultCinemas;
        cSelect.innerHTML = list.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
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
        const roomMap = {
            "ha-dong": ["Phòng chiếu 1", "Phòng chiếu 2", "Phòng IMAX"],
            "le-trong-tan": ["Phòng chiếu 1", "Phòng chiếu 2"],
            "cau-giay": ["Phòng chiếu 1", "Phòng IMAX"],
            "my-dinh": ["Phòng chiếu 1", "Phòng 4DX"],
            "lang-ha": ["Phòng chiếu 1", "Phòng ScreenX"],
            "royal-city": ["Phòng chiếu 1", "Phòng IMAX", "Phòng 4DX"]
        };
        const rooms = roomMap[cId] || ["Phòng chiếu 1", "Phòng chiếu 2"];
        rSelect.innerHTML = rooms.map(r => `<option value="${r}">${r}</option>`).join('');
    }
}

function closeShowtimeModal() {
    document.getElementById('showtime-modal').style.display = 'none';
}

// --- OVERLAP CHECK ---
function checkShowtimeConflict(cinemaId, roomName, dateStr, startTimeStr, durationMinutes) {
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const newStartMin = startH * 60 + startM;
    const newEndMin = newStartMin + durationMinutes + 15; // 15 mins room cleaning buffer

    for (let st of db.showtimes) {
        if (st.cinemaId === cinemaId && st.roomName === roomName && st.date === dateStr) {
            const [exH, exM] = st.time.split(':').map(Number);
            const exStartMin = exH * 60 + exM;
            const exMovie = db.movies.find(m => m.id === st.movieId);
            const exDuration = exMovie ? exMovie.duration : 120;
            const exEndMin = exStartMin + exDuration + 15;

            if (newStartMin < exEndMin && newEndMin > exStartMin) {
                return { conflict: true, existingShowtime: st, existingMovieTitle: st.movieTitle };
            }
        }
    }
    return { conflict: false };
}

async function handleShowtimeSubmit(e) {
    if (e) e.preventDefault();
    const movieId = document.getElementById('st-movie-select').value;
    const cinemaId = document.getElementById('st-cinema-select').value;
    const roomName = document.getElementById('st-room-select').value;
    const date = document.getElementById('st-date-input').value;
    const time = document.getElementById('st-time-input').value;
    const price = parseFloat(document.getElementById('st-price-input').value || 80000);

    const movie = db.movies.find(m => m.id === movieId);
    const cinema = db.cinemas.find(c => c.id === cinemaId) || { name: cinemaId };
    const movieDuration = movie ? movie.duration : 120;

    // Strict Overlap Check
    const overlapResult = checkShowtimeConflict(cinemaId, roomName, date, time, movieDuration);
    if (overlapResult.conflict) {
        showToast(`Xung đột lịch chiếu! Phòng ${roomName} đã có phim "${overlapResult.existingMovieTitle}" chiếu lúc ${overlapResult.existingShowtime.time}. Vui lòng chọn khung giờ khác.`, 'error');
        return;
    }

    const newShowtime = {
        id: 'st_' + Math.random().toString(36).slice(2, 11),
        movieId: movieId,
        movieTitle: movie ? movie.title : 'Phim #' + movieId,
        cinemaId: cinemaId,
        cinemaName: cinema ? cinema.name : cinemaId,
        roomName: roomName,
        date: date,
        time: time,
        price: price
    };

    const isGuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(movieId);

    const payload = {
        movieId: isGuid ? movieId : null,
        movieTitle: movie ? movie.title : 'Phim #' + movieId,
        cinemaId: cinemaId,
        cinemaName: cinema ? cinema.name : cinemaId,
        roomName: roomName,
        startTime: `${date}T${time}:00`,
        endTime: `${date}T${time}:00`,
        ticketPrice: price,
        price: price
    };

    try {
        const res = await fetch(getApiUrl('/showtimes'), {
            method: 'POST',
            headers: getApiHeaders(),
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const saved = await res.json();
            if (saved && saved.id) {
                newShowtime.id = saved.id.toString();
                if (saved.movieId) {
                    newShowtime.movieId = saved.movieId.toString();
                }
            }
            showToast('Tạo suất chiếu mới thành công và đã lưu vào Database!', 'success');
            
            // Only add to local state if the API was successful
            db.showtimes.push(newShowtime);
            localStorage.setItem('3hd2k_showtimes', JSON.stringify(db.showtimes));

            if (typeof adminSyncChannel !== 'undefined' && adminSyncChannel) {
                adminSyncChannel.postMessage({ type: 'SHOWTIMES_UPDATED' });
            }

            closeShowtimeModal();
            renderShowtimesTable();
            renderAvailabilityMatrix();

            // Refresh matrix polling to avoid immediate override and allow time to sync
            if (matrixPollingInterval) {
                clearInterval(matrixPollingInterval);
                matrixPollingInterval = setInterval(async () => {
                    await fetchShowtimes();
                    if (activeTab === 'showtimes') {
                        renderShowtimesTable();
                        renderAvailabilityMatrix();
                    }
                }, 10000);
            }
            
            // Refetch immediately to ensure sync with backend
            setTimeout(async () => {
                await fetchShowtimes();
                if (activeTab === 'showtimes') {
                    renderShowtimesTable();
                    renderAvailabilityMatrix();
                }
            }, 1000);

        } else {
            const errText = await res.text();
            console.warn('API create showtime status:', res.status, errText);
            showToast(`Lỗi tạo lịch chiếu: ${res.status} - Không thể lưu vào hệ thống.`, 'error');
        }
    } catch (err) {
        console.error('API create showtime error:', err);
        showToast('Lỗi mạng: Không thể kết nối tới máy chủ!', 'error');
    }
}

async function deleteShowtime(id) {
    if (confirm("Xóa lịch chiếu này khỏi hệ thống?")) {
        db.showtimes = db.showtimes.filter(s => s.id !== id);
        localStorage.setItem('3hd2k_showtimes', JSON.stringify(db.showtimes));

        try {
            await fetch(getApiUrl(`/showtimes/${id}`), {
                method: 'DELETE',
                headers: getApiHeaders()
            });
        } catch (_) {}

        if (typeof adminSyncChannel !== 'undefined' && adminSyncChannel) {
            adminSyncChannel.postMessage({ type: 'SHOWTIMES_UPDATED' });
        }

        showToast('Đã xóa suất chiếu!', 'success');
        renderShowtimesTable();
        renderAvailabilityMatrix();
    }
}

// --- PURGE ALL MOVIE DATA ---
async function purgeAllMovieData() {
    if (confirm("⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ dữ liệu phim, suất chiếu và đơn vé cũ khỏi hệ thống?")) {
        try {
            await fetch(getApiUrl('/movies/purge-all'), { method: 'DELETE', headers: getApiHeaders() });
        } catch (_) {}

        localStorage.removeItem('3hd2k_movies');
        localStorage.removeItem('cinema_movies');
        localStorage.removeItem('3hd2k_showtimes');
        localStorage.removeItem('3hd2k_bookings');
        localStorage.removeItem('3hd2k_last_booking');
        localStorage.removeItem('cinema_bookings');
        localStorage.removeItem('cinema_last_booking');
        localStorage.removeItem('cinema_activity_log');

        db.movies = [];
        db.showtimes = [];
        db.bookings = [];

        showToast('Đã xóa toàn bộ dữ liệu phim & lịch chiếu cũ thành công!', 'success');
        await reloadDatabase();
        renderAvailabilityMatrix();
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

function loadBrokenSeats() {
    const roomKey = document.getElementById('room-select')?.value;
    const tbody = document.getElementById('broken-seats-table-body');
    if (!roomKey || !tbody) return;

    // Load from db.roomLayouts or just display empty if no layout config exists yet
    const layout = db.roomLayouts[roomKey] || { brokenSeats: [] };
    const brokenSeats = layout.brokenSeats || [];

    tbody.innerHTML = '';

    if (brokenSeats.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 20px;">Phòng này không có ghế nào đang bảo trì</td></tr>`;
        return;
    }

    const parts = roomKey.split('_');
    const cinemaName = db.cinemas.find(c => c.id === parts[0])?.name || parts[0];
    const roomName = parts[1] || '';

    brokenSeats.forEach(seatCode => {
        tbody.innerHTML += `
            <tr>
                <td>${cinemaName} - ${roomName}</td>
                <td><strong>${seatCode}</strong></td>
                <td><span class="badge badge-red">Đang bảo trì</span></td>
                <td>
                    <button class="btn-mini" style="border-color: var(--btn-cyan-color); color: var(--btn-cyan-color);" onclick="removeBrokenSeat('${roomKey}', '${seatCode}')" title="Mở khóa ghế này"><i class="fas fa-unlock"></i></button>
                </td>
            </tr>
        `;
    });
}

function updateSeatStatus() {
    const roomKey = document.getElementById('room-select')?.value;
    const seatIdInput = document.getElementById('maintenance-seat-id');
    const statusSelect = document.getElementById('maintenance-seat-status');
    
    if (!roomKey || !seatIdInput || !statusSelect) return;

    const seatCode = seatIdInput.value.trim().toUpperCase();
    const status = statusSelect.value;

    if (!seatCode) {
        showToast('Vui lòng nhập mã ghế!', 'error');
        return;
    }

    // Initialize layout if missing
    if (!db.roomLayouts[roomKey]) {
        db.roomLayouts[roomKey] = { rows: 8, cols: 12, vipRows: [4,5], doubleRows: [7], brokenSeats: [] };
    }
    
    let brokenSeats = db.roomLayouts[roomKey].brokenSeats || [];

    if (status === 'broken') {
        if (!brokenSeats.includes(seatCode)) {
            brokenSeats.push(seatCode);
        }
    } else {
        brokenSeats = brokenSeats.filter(s => s !== seatCode);
    }

    db.roomLayouts[roomKey].brokenSeats = brokenSeats;
    localStorage.setItem('3hd2k_rooms_layouts', JSON.stringify(db.roomLayouts));
    
    seatIdInput.value = '';
    showToast(`Đã cập nhật trạng thái ghế ${seatCode} thành công!`, 'success');
    loadBrokenSeats();
}

function removeBrokenSeat(roomKey, seatCode) {
    if (confirm(`Bạn có chắc muốn mở khóa ghế ${seatCode}?`)) {
        if (db.roomLayouts[roomKey] && db.roomLayouts[roomKey].brokenSeats) {
            db.roomLayouts[roomKey].brokenSeats = db.roomLayouts[roomKey].brokenSeats.filter(s => s !== seatCode);
            localStorage.setItem('3hd2k_rooms_layouts', JSON.stringify(db.roomLayouts));
            showToast(`Đã mở khóa ghế ${seatCode}`, 'success');
            loadBrokenSeats();
        }
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
    const categoryFilterEl = document.getElementById('fnb-filter-category');
    const categoryFilter = categoryFilterEl ? categoryFilterEl.value : 'all';
    
    const tbody = document.getElementById('combos-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const filtered = db.combos.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search);
        const matchCategory = categoryFilter === 'all' || (c.category || 'Combo') === categoryFilter;
        return matchSearch && matchCategory;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 30px;" class="text-muted">Chưa có mặt hàng nào</td></tr>`;
        return;
    }

    filtered.forEach(c => {
        const cat = c.category || 'Combo';
        const badgeClass = cat === 'Combo' ? 'badge-yellow' : 'badge-green';
        
        tbody.innerHTML += `
            <tr>
                <td class="poster-td"><img src="${c.image || 'https://via.placeholder.com/150'}" alt="img" style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px;"></td>
                <td><strong>${c.name}</strong></td>
                <td><span class="badge ${badgeClass}">${cat}</span></td>
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
    document.getElementById('combo-category-input').value = 'Combo';
    document.getElementById('combo-modal-title').textContent = "Thêm Mặt Hàng F&B";
    document.getElementById('combo-modal').style.display = 'flex';
}

function openEditComboModal(id) {
    const c = db.combos.find(item => item.id === id);
    if (c) {
        document.getElementById('combo-id').value = c.id;
        document.getElementById('combo-name-input').value = c.name;
        document.getElementById('combo-category-input').value = c.category || 'Combo';
        document.getElementById('combo-price-input').value = c.price;
        document.getElementById('combo-stock-input').value = c.stock;
        document.getElementById('combo-image-input').value = c.image || '';
        document.getElementById('combo-desc-input').value = c.desc || '';
        document.getElementById('combo-modal-title').textContent = "Sửa thông tin F&B";
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
        category: document.getElementById('combo-category-input').value,
        price: parseFloat(document.getElementById('combo-price-input').value),
        stock: parseInt(document.getElementById('combo-stock-input').value || 100),
        image: document.getElementById('combo-image-input').value,
        desc: document.getElementById('combo-desc-input').value
    };

    const token = localStorage.getItem('jwt_token') || localStorage.getItem('3hd2k_token');
    const authHeaders = {
        'Content-Type': 'application/json'
    };
    if (token) authHeaders['Authorization'] = `Bearer ${token}`;

    try {
        let res;
        if (id) {
            res = await fetch(getApiUrl(`/combos/${id}`), {
                method: 'PUT',
                headers: getApiHeaders(),
                body: JSON.stringify(data)
            });
        } else {
            res = await fetch(getApiUrl('/combos'), {
                method: 'POST',
                headers: getApiHeaders(),
                body: JSON.stringify(data)
            });
        }
        
        if (res && res.ok) {
            showToast(id ? 'Đã cập nhật Combo!' : 'Thêm Combo thành công!', 'success');
        } else {
            showToast('Lỗi lưu F&B, bạn đã đăng nhập tài khoản ADMIN chưa?', 'error');
            console.error('Lưu F&B thất bại:', await res.text());
        }
    } catch (err) {
        console.error('API combo error:', err);
        showToast('Lỗi mạng khi lưu F&B', 'error');
    }

    closeComboModal();
    await reloadDatabase();
}

async function deleteCombo(id) {
    if (confirm("Xóa Combo này khỏi hệ thống API?")) {
        try {
            const res = await fetch(getApiUrl(`/combos/${id}`), { 
                method: 'DELETE',
                headers: getApiHeaders() 
            });
            if (res.ok) {
                showToast('Đã xóa Combo thành công!', 'success');
            } else {
                showToast('Không thể xóa, có thể do chưa đăng nhập ADMIN', 'error');
            }
        } catch (err) {
            console.error('API delete combo error:', err);
            showToast('Lỗi mạng khi xóa', 'error');
        }
        await reloadDatabase();
    }
}


// ==========================================
// VOUCHER MANAGEMENT
// ==========================================
function renderVouchersTable(vouchers = null) {
    const tbody = document.getElementById('vouchers-tbody');
    if (!tbody) return;

    const data = vouchers || db.vouchers || [];
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 20px; color: var(--text-muted);">Không tìm thấy voucher nào.</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(v => {
        const typeStr = v.discountType === 'PERCENTAGE' ? 'Giảm %' : 'Giảm tiền';
        const valStr = v.discountType === 'PERCENTAGE' ? (v.discountValue + '%') : formatMoney(v.discountValue);
        const dateStr = v.expiryDate ? new Date(v.expiryDate).toLocaleDateString('vi-VN') : '';
        const statusClass = v.isActive ? 'badge-success' : 'badge-danger';
        const statusText = v.isActive ? 'Đang hoạt động' : 'Tạm dừng';

        return `
            <tr>
                <td style="font-weight: bold; color: var(--btn-cyan-color);">${v.code}</td>
                <td>${v.description || ''}</td>
                <td><span class="badge" style="background: rgba(255,255,255,0.1);">${typeStr}</span></td>
                <td style="color: var(--primary-red); font-weight: bold;">${valStr}</td>
                <td>${dateStr}</td>
                <td><span style="color: var(--accent); font-weight: bold;">${v.pointsRequired || 0} PTS</span></td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-icon btn-outline" style="color: var(--btn-cyan-color); border-color: var(--btn-cyan-color);" onclick="openEditVoucherModal('${v.id}')" title="Sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-icon btn-outline" style="color: var(--primary-red); border-color: var(--primary-red);" onclick="deleteVoucher('${v.id}')" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterVouchersTable() {
    const q = document.getElementById('voucher-search').value.toLowerCase();
    const status = document.getElementById('voucher-filter-status').value;
    
    let filtered = (db.vouchers || []).filter(v => {
        const matchQ = v.code.toLowerCase().includes(q) || (v.description || '').toLowerCase().includes(q);
        let matchStatus = true;
        if (status === 'active') matchStatus = v.isActive === true;
        if (status === 'inactive') matchStatus = v.isActive === false;
        
        return matchQ && matchStatus;
    });
    
    renderVouchersTable(filtered);
}

function openAddVoucherModal() {
    document.getElementById('voucher-form').reset();
    document.getElementById('voucher-id').value = '';
    document.getElementById('voucher-modal-title').textContent = 'Thêm Voucher Mới';
    document.getElementById('voucher-status-input').value = 'true';
    document.getElementById('voucher-type-input').value = 'PERCENTAGE';
    document.getElementById('voucher-points-input').value = 0;
    document.getElementById('voucher-modal').style.display = 'flex';
}

function openEditVoucherModal(id) {
    const v = (db.vouchers || []).find(x => x.id === id);
    if (!v) return;

    document.getElementById('voucher-modal-title').textContent = 'Chỉnh sửa Voucher';
    document.getElementById('voucher-id').value = v.id;
    document.getElementById('voucher-code-input').value = v.code;
    document.getElementById('voucher-status-input').value = v.isActive ? 'true' : 'false';
    document.getElementById('voucher-type-input').value = v.discountType;
    document.getElementById('voucher-value-input').value = v.discountValue;
    document.getElementById('voucher-min-order-input').value = v.minOrderAmount || 0;
    document.getElementById('voucher-max-discount-input').value = v.maxDiscountAmount || '';
    document.getElementById('voucher-points-input').value = v.pointsRequired || 0;
    
    let expiry = '';
    if (v.expiryDate) {
        expiry = new Date(v.expiryDate).toISOString().split('T')[0];
    }
    document.getElementById('voucher-expiry-input').value = expiry;
    document.getElementById('voucher-desc-input').value = v.description || '';

    document.getElementById('voucher-modal').style.display = 'flex';
}

function closeVoucherModal() {
    document.getElementById('voucher-modal').style.display = 'none';
}

async function handleVoucherSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('voucher-id').value;
    const isEdit = !!id;

    const vData = {
        code: document.getElementById('voucher-code-input').value.trim().toUpperCase(),
        description: document.getElementById('voucher-desc-input').value.trim(),
        discountType: document.getElementById('voucher-type-input').value,
        discountValue: parseFloat(document.getElementById('voucher-value-input').value) || 0,
        minOrderAmount: parseFloat(document.getElementById('voucher-min-order-input').value) || 0,
        maxDiscountAmount: parseFloat(document.getElementById('voucher-max-discount-input').value) || null,
        expiryDate: document.getElementById('voucher-expiry-input').value,
        pointsRequired: parseInt(document.getElementById('voucher-points-input').value) || 0,
        isActive: document.getElementById('voucher-status-input').value === 'true'
    };

    if (id) vData.id = id;
    if (vData.maxDiscountAmount === 0 || isNaN(vData.maxDiscountAmount)) {
        vData.maxDiscountAmount = null;
    }

    try {
        const url = isEdit ? getApiUrl(`/vouchers/${id}`) : getApiUrl('/vouchers');
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: getApiHeaders(),
            body: JSON.stringify(vData)
        });

        if (res.ok) {
            showToast(isEdit ? 'Đã cập nhật voucher' : 'Đã thêm voucher', 'success');
            closeVoucherModal();
            await fetchVouchers();
            renderVouchersTable();
        } else {
            showToast('Lỗi khi lưu voucher', 'error');
        }
    } catch (err) {
        console.error('Error saving voucher:', err);
        showToast('Lỗi kết nối API', 'error');
    }
}

async function openPointSettingsModal() {
    try {
        const res = await fetch(getApiUrl('/settings'), { headers: getApiHeaders() });
        if (res.ok) {
            const data = await res.json();
            document.getElementById('setting-ticket-rate').value = data['TicketPointRate'] || 0.001;
            document.getElementById('setting-fnb-rate').value = data['FnBPointRate'] || 0.0015;
            document.getElementById('setting-group-rate').value = data['GroupBookingPointRate'] || 1.5;
        }
    } catch (e) {
        console.error('Error fetching settings:', e);
    }
    document.getElementById('point-settings-modal').style.display = 'flex';
}

function closePointSettingsModal() {
    document.getElementById('point-settings-modal').style.display = 'none';
}

async function handlePointSettingsSubmit(e) {
    e.preventDefault();
    const settingsData = {
        'TicketPointRate': document.getElementById('setting-ticket-rate').value,
        'FnBPointRate': document.getElementById('setting-fnb-rate').value,
        'GroupBookingPointRate': document.getElementById('setting-group-rate').value
    };

    try {
        const res = await fetch(getApiUrl('/settings'), {
            method: 'POST',
            headers: getApiHeaders(),
            body: JSON.stringify(settingsData)
        });

        if (res.ok) {
            showToast('Cài đặt tích điểm đã được lưu', 'success');
            closePointSettingsModal();
        } else {
            showToast('Lỗi khi lưu cài đặt', 'error');
        }
    } catch (e) {
        console.error('Error saving settings:', e);
        showToast('Lỗi kết nối API', 'error');
    }
}

async function deleteVoucher(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa voucher này?')) return;
    try {
        const res = await fetch(getApiUrl(`/vouchers/${id}`), {
            method: 'DELETE',
            headers: getApiHeaders()
        });
        if (res.ok) {
            showToast('Đã xóa voucher', 'success');
            await fetchVouchers();
            renderVouchersTable();
        } else {
            showToast('Lỗi khi xóa voucher', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Lỗi kết nối API', 'error');
    }
}


// ================= 7. TAB: USERS =================
function renderUsersTable() {
    const searchEl = document.getElementById('user-search');
    const roleFilterEl = document.getElementById('user-filter-role');
    const statusFilterEl = document.getElementById('user-filter-status');
    const search = searchEl ? searchEl.value.toLowerCase().trim() : '';
    const roleFilter = roleFilterEl ? roleFilterEl.value.toLowerCase() : 'all';
    const statusFilter = statusFilterEl ? statusFilterEl.value.toLowerCase() : 'all';
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const filtered = (db.users || []).filter(u => {
        const matchesSearch = (u.name || '').toLowerCase().includes(search) || 
                              (u.email || '').toLowerCase().includes(search) ||
                              (u.phone || '').toLowerCase().includes(search);
        const matchesRole = roleFilter === 'all' || (u.role || '').toLowerCase() === roleFilter;
        const matchesStatus = statusFilter === 'all' || (u.status || '').toLowerCase() === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px;" class="text-muted">Không tìm thấy người dùng phù hợp.</td></tr>`;
        return;
    }

    filtered.forEach(u => {
        const avatar = (u.name || u.email || 'U').charAt(0).toUpperCase();
        let roleBadge = `<span class="badge badge-green">Khách hàng</span>`;
        if (u.role === 'admin') roleBadge = `<span class="badge badge-red">Admin</span>`;
        else if (u.role === 'staff') roleBadge = `<span class="badge badge-yellow">Nhân viên</span>`;

        const contactInfo = `<strong>${u.email || '-'}</strong>` + (u.phone ? `<br><small class="text-muted"><i class="fas fa-phone"></i> ${u.phone}</small>` : '');
        const isBanned = u.status === 'banned';
        const statusBadge = `<span class="badge ${isBanned ? 'badge-red' : 'badge-green'}">${isBanned ? 'Bị khóa' : 'Hoạt động'}</span>`;

        tbody.innerHTML += `
            <tr>
                <td class="poster-td"><div class="admin-avatar" style="width:34px;height:34px;font-size:0.9rem; display:flex; justify-content:center; align-items:center; background:rgba(229,9,20,0.2); color:#fff; border-radius:50%; font-weight:bold;">${avatar}</div></td>
                <td><strong>${u.name}</strong></td>
                <td>${contactInfo}</td>
                <td>${roleBadge}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn-mini" onclick="toggleUserStatus('${u.id || u.username}')" title="${isBanned ? 'Mở khóa' : 'Khóa tài khoản'}"><i class="fas ${isBanned ? 'fa-unlock' : 'fa-lock'}" style="color:${isBanned ? '#0df286' : '#ff4757'};"></i></button>
                    <button class="btn-mini" onclick="changeUserRolePrompt('${u.id || u.username}')" title="Đổi vai trò"><i class="fas fa-user-tag"></i></button>
                    <button class="btn-mini" onclick="viewUserHistory('${u.username || u.email}')" title="Lịch sử giao dịch"><i class="fas fa-history"></i></button>
                    <button class="btn-mini" onclick="deleteUserConfirm('${u.id || u.username}')" title="Xóa tài khoản" style="color:#ff4757;"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function filterUsersTable() {
    renderUsersTable();
}

async function toggleUserStatus(idOrUsername) {
    const u = db.users.find(user => user.id === idOrUsername || user.username === idOrUsername);
    if (!u || !u.id) {
        showToast('Không tìm thấy ID người dùng hợp lệ để cập nhật', 'warning');
        return;
    }

    try {
        const res = await fetch(getApiUrl(`/users/${u.id}/toggle-lock`), { method: 'PUT', headers: getApiHeaders() });
        if (res.ok) {
            const resData = await res.json();
            u.status = resData.isLocked ? 'banned' : 'active';
            showToast(resData.message || 'Cập nhật trạng thái thành công', 'success');
            renderUsersTable();
        } else {
            const errData = await res.json().catch(() => ({}));
            showToast(errData.message || 'Không thể cập nhật trạng thái người dùng', 'error');
        }
    } catch (e) {
        console.error('Toggle status error:', e);
        showToast('Lỗi kết nối khi cập nhật trạng thái người dùng', 'error');
    }
}

async function changeUserRolePrompt(idOrUsername) {
    const u = db.users.find(user => user.id === idOrUsername || user.username === idOrUsername);
    if (!u || !u.id) {
        showToast('Không tìm thấy ID người dùng hợp lệ để đổi vai trò', 'warning');
        return;
    }

    const currentRoleUpper = (u.role || 'CUSTOMER').toUpperCase();
    const newRole = prompt(`Chọn vai trò mới cho ${u.name}:\n(ADMIN, STAFF, CUSTOMER, VIP)`, currentRoleUpper);
    if (!newRole) return;

    const formattedRole = newRole.trim().toUpperCase();
    if (!['ADMIN', 'STAFF', 'CUSTOMER', 'VIP'].includes(formattedRole)) {
        showToast('Vai trò không hợp lệ. Vui lòng chọn ADMIN, STAFF, CUSTOMER hoặc VIP.', 'warning');
        return;
    }

    try {
        const res = await fetch(getApiUrl(`/users/${u.id}/role`), {
            method: 'PUT',
            headers: getApiHeaders(),
            body: JSON.stringify({ role: formattedRole })
        });

        if (res.ok) {
            u.role = formattedRole.toLowerCase();
            showToast(`Cập nhật vai trò thành ${formattedRole}`, 'success');
            renderUsersTable();
        } else {
            const errData = await res.json().catch(() => ({}));
            showToast(errData.message || 'Không thể thay đổi vai trò người dùng', 'error');
        }
    } catch (e) {
        console.error('Change role error:', e);
        showToast('Lỗi kết nối khi đổi vai trò người dùng', 'error');
    }
}

async function deleteUserConfirm(idOrUsername) {
    const u = db.users.find(user => user.id === idOrUsername || user.username === idOrUsername);
    if (!u || !u.id) {
        showToast('Không tìm thấy ID người dùng hợp lệ để xóa', 'warning');
        return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản ${u.name} (${u.email})?`)) return;

    try {
        const res = await fetch(getApiUrl(`/users/${u.id}`), { method: 'DELETE', headers: getApiHeaders() });
        if (res.ok) {
            db.users = db.users.filter(x => x.id !== u.id);
            showToast('Xóa người dùng thành công!', 'success');
            renderUsersTable();
        } else {
            const errData = await res.json().catch(() => ({}));
            showToast(errData.message || 'Không thể xóa người dùng', 'error');
        }
    } catch (e) {
        console.error('Delete user API error:', e);
        showToast('Lỗi kết nối khi xóa người dùng', 'error');
    }
}

function openAddUserModal() {
    document.getElementById('user-modal-title').innerHTML = '<i class="fas fa-user-plus"></i> Thêm người dùng mới';
    document.getElementById('user-modal-id').value = '';
    document.getElementById('user-modal-fullname').value = '';
    document.getElementById('user-modal-email').value = '';
    document.getElementById('user-modal-phone').value = '';
    document.getElementById('user-modal-password').value = '';
    document.getElementById('user-modal-role').value = 'CUSTOMER';
    document.getElementById('user-modal').style.display = 'flex';
}

function closeUserModal() {
    document.getElementById('user-modal').style.display = 'none';
}

async function saveUserForm(e) {
    e.preventDefault();
    const fullname = document.getElementById('user-modal-fullname').value.trim();
    const email = document.getElementById('user-modal-email').value.trim();
    const phone = document.getElementById('user-modal-phone').value.trim();
    const password = document.getElementById('user-modal-password').value.trim();
    const role = document.getElementById('user-modal-role').value;

    try {
        const res = await fetch(getApiUrl('/users'), {
            method: 'POST',
            headers: getApiHeaders(),
            body: JSON.stringify({ fullname, email, phone, password, role })
        });

        if (res.ok) {
            showToast('Tạo người dùng thành công!', 'success');
            closeUserModal();
            await fetchUsers();
            renderUsersTable();
        } else {
            const errData = await res.json().catch(() => ({}));
            showToast(errData.message || 'Không thể tạo người dùng qua API', 'error');
        }
    } catch (err) {
        console.error('Save user error:', err);
        showToast('Lỗi kết nối khi tạo người dùng', 'error');
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
        if (db.combos.length === 0) {
            listEl.innerHTML = '<div style="text-align: center; padding: 15px;" class="text-muted">Chưa có dữ liệu combo</div>';
        } else {
            const comboSalesMap = {};
            const logs = JSON.parse(localStorage.getItem("cinema_activity_log")) || [];
            logs.forEach(log => {
                if (log.text) {
                    db.combos.forEach(c => {
                        if (log.text.includes(c.name)) {
                            const reg = new RegExp(`(\\d+)x\\s*${c.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'i');
                            const match = log.text.match(reg);
                            const qty = match ? parseInt(match[1], 10) : 1;
                            comboSalesMap[c.id] = (comboSalesMap[c.id] || 0) + qty;
                        }
                    });
                }
            });

            const sortedCombos = [...db.combos].sort((a, b) => {
                const salesA = comboSalesMap[a.id] || 0;
                const salesB = comboSalesMap[b.id] || 0;
                if (salesB !== salesA) return salesB - salesA;
                return b.stock - a.stock;
            });

            sortedCombos.slice(0, 4).forEach(c => {
                const soldQty = comboSalesMap[c.id] || 0;
                const revenue = soldQty * c.price;
                const revText = soldQty > 0 ? formatVND(revenue) : formatVND(c.price);
                listEl.innerHTML += `
                    <div class="stat-item">
                        <div>
                            <span class="stat-item-name">${c.name}</span>
                            <span class="stat-item-qty">${soldQty > 0 ? `Đã bán ${soldQty} cái` : `Tồn kho ${c.stock} cái`}</span>
                        </div>
                        <span class="stat-item-revenue">${revText}</span>
                    </div>
                `;
            });
        }
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
    renderAdminNotifications(); // Initialize dynamic notifications

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
        const voucherModal = document.getElementById('voucher-modal');
        const adminRestockModal = document.getElementById('admin-restock-modal');

        const trailerModal = document.getElementById('trailer-modal');

        if (e.target === movieModal) closeMovieModal();
        if (e.target === trailerModal) closeTrailerModal();
        if (e.target === showtimeModal) closeShowtimeModal();
        if (e.target === comboModal) closeComboModal();
        if (e.target === voucherModal) closeVoucherModal();
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
window.switchMovieModalTab = switchMovieModalTab;
window.addCastMember = addCastMember;
window.removeCastMember = removeCastMember;
window.addGalleryImage = addGalleryImage;
window.removeGalleryImage = removeGalleryImage;

window.filterShowtimesTable = filterShowtimesTable;
window.openAddShowtimeModal = openAddShowtimeModal;
window.closeShowtimeModal = closeShowtimeModal;
window.populateModalRooms = populateModalRooms;
window.handleShowtimeSubmit = handleShowtimeSubmit;
window.deleteShowtime = deleteShowtime;

// window.loadRoomSeatMap = loadRoomSeatMap;
// window.renderSeatingGrid = renderSeatingGrid;
// window.updateRoomGridSize = updateRoomGridSize;
// window.saveCurrentRoomLayout = saveCurrentRoomLayout;

window.filterBookingsTable = filterBookingsTable;
window.approveBooking = approveBooking;
window.cancelBooking = cancelBooking;

window.filterCombosTable = filterCombosTable;
window.openAddComboModal = openAddComboModal;
window.openEditComboModal = openEditComboModal;
window.closeComboModal = closeComboModal;
window.handleComboSubmit = handleComboSubmit;
window.deleteCombo = deleteCombo;

window.filterVouchersTable = filterVouchersTable;
window.openAddVoucherModal = openAddVoucherModal;
window.openEditVoucherModal = openEditVoucherModal;
window.closeVoucherModal = closeVoucherModal;
window.handleVoucherSubmit = handleVoucherSubmit;
window.deleteVoucher = deleteVoucher;

window.openPointSettingsModal = openPointSettingsModal;
window.closePointSettingsModal = closePointSettingsModal;
window.handlePointSettingsSubmit = handlePointSettingsSubmit;


window.filterUsersTable = filterUsersTable;
window.toggleUserStatus = toggleUserStatus;
window.changeUserRolePrompt = changeUserRolePrompt;
window.deleteUserConfirm = deleteUserConfirm;
window.openAddUserModal = openAddUserModal;
window.closeUserModal = closeUserModal;
window.saveUserForm = saveUserForm;
window.viewUserHistory = viewUserHistory;
window.closeUserHistoryModal = closeUserHistoryModal;

window.purgeAllMovieData = purgeAllMovieData;
window.openQuickShowtimeModal = openQuickShowtimeModal;
window.changeMatrixDate = changeMatrixDate;
window.onMatrixFilterChange = onMatrixFilterChange;
window.filterAdminInventoryTable = filterAdminInventoryTable;
window.openAdminRestockModal = openAdminRestockModal;
window.closeAdminRestockModal = closeAdminRestockModal;
window.submitAdminRestock = submitAdminRestock;
window.toggleAdminOnlineStatus = toggleAdminOnlineStatus;
window.updateRevenueChart = updateRevenueChart;
