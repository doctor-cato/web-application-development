// ================= 3HD2K ADMIN PORTAL ENGINE =================
// Manages LocalStorage data synchronization, CRUD forms, and interactive views.

// --- CONFIG & STATE ---
let db = {
    movies: [],
    cinemas: [],
    showtimes: [],
    bookings: [],
    combos: [],
    users: [],
    roomLayouts: {} // cinemaId_roomName -> { rows, cols, seatTypes }
};

let activeTab = 'dashboard';
let activeSeatType = 'standard'; // standard, vip, double, broken
let revenueChartInstance = null;
let moviePieChartInstance = null;

// --- INITIALIZE DATASETS ---
function seedDatabase() {
    console.log("Initializing local database storage...");

    // 1. Movies seed
    if (!localStorage.getItem('3hd2k_movies')) {
        const defaultMovies = [];
        // Now showing
        if (typeof nowShowingMovies !== 'undefined') {
            nowShowingMovies.forEach(m => {
                defaultMovies.push({
                    id: 'mv_' + Math.random().toString(36).substr(2, 9),
                    title: m.title,
                    genre: m.genre || (m.tags ? m.tags.join(', ') : 'Hành Động'),
                    duration: m.duration,
                    age: m.age,
                    status: 'now-showing',
                    poster: m.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80',
                    trailer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    desc: 'Phim đang chiếu chất lượng cao tại cụm rạp 3HD2K.'
                });
            });
        }
        // Coming soon
        if (typeof comingSoonMovies !== 'undefined') {
            comingSoonMovies.forEach(m => {
                defaultMovies.push({
                    id: 'mv_' + Math.random().toString(36).substr(2, 9),
                    title: m.title,
                    genre: m.genre || (m.tags ? m.tags.join(', ') : 'Phiêu Lưu'),
                    duration: m.duration,
                    age: m.age,
                    status: 'coming-soon',
                    poster: m.poster || 'https://images.unsplash.com/photo-1611419010196-18e3e18f8a4c?auto=format&fit=crop&w=400&q=80',
                    trailer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    desc: 'Bộ phim hấp dẫn sắp sửa cập bến phòng chiếu 3HD2K.'
                });
            });
        }
        localStorage.setItem('3hd2k_movies', JSON.stringify(defaultMovies));
    }

    // 2. Cinemas seed
    if (!localStorage.getItem('3hd2k_cinemas')) {
        const defaultCinemas = (typeof cinemas !== 'undefined') ? cinemas : [
            { id: "ha-dong", name: "3HD2K HÀ ĐÔNG" },
            { id: "le-trong-tan", name: "3HD2K LÊ TRỌNG TẤN" },
            { id: "my-dinh", name: "3HD2K MỸ ĐÌNH" }
        ];
        localStorage.setItem('3hd2k_cinemas', JSON.stringify(defaultCinemas));
    }

    // 3. Combos seed
    if (!localStorage.getItem('3hd2k_combos')) {
        const defaultCombos = [
            {
                id: 'cb_1',
                name: 'Combo Solo',
                desc: '1 Bắp ngọt lớn + 1 Nước ngọt 22oz tự chọn',
                price: 75000,
                stock: 120,
                image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=150&q=80'
            },
            {
                id: 'cb_2',
                name: 'Combo Couple',
                desc: '1 Bắp ngọt khổng lồ + 2 Nước ngọt 22oz',
                price: 99000,
                stock: 85,
                image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=150&q=80'
            },
            {
                id: 'cb_3',
                name: 'Combo Gia Đình (Party)',
                desc: '2 Bắp lớn + 3 Nước ngọt tùy chọn + 1 SnacK',
                price: 155000,
                stock: 40,
                image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=150&q=80'
            }
        ];
        localStorage.setItem('3hd2k_combos', JSON.stringify(defaultCombos));
    }

    // 4. Users seed
    if (!localStorage.getItem('3hd2k_users')) {
        const defaultUsers = [
            { email: 'admin@3hd2k.com', name: 'Admin 3HD2K', role: 'admin', status: 'active' },
            { email: 'nguyenvanan@gmail.com', name: 'Nguyễn Văn An', role: 'customer', status: 'active' },
            { email: 'tranmaiphuong@yahoo.com', name: 'Trần Mai Phương', role: 'customer', status: 'active' },
            { email: 'lehoanglong@outlook.com', name: 'Lê Hoàng Long', role: 'customer', status: 'locked' }
        ];
        localStorage.setItem('3hd2k_users', JSON.stringify(defaultUsers));
    }

    // Load elements to parse IDs correctly
    db.movies = JSON.parse(localStorage.getItem('3hd2k_movies'));
    db.cinemas = JSON.parse(localStorage.getItem('3hd2k_cinemas'));
    db.combos = JSON.parse(localStorage.getItem('3hd2k_combos'));
    db.users = JSON.parse(localStorage.getItem('3hd2k_users'));

    // 5. Showtimes seed
    if (!localStorage.getItem('3hd2k_showtimes')) {
        const defaultShowtimes = [
            {
                id: 'st_1',
                movieId: db.movies[0] ? db.movies[0].id : 'mv_1',
                movieTitle: db.movies[0] ? db.movies[0].title : 'Your Name',
                cinemaId: 'ha-dong',
                cinemaName: '3HD2K HÀ ĐÔNG',
                room: 'Phòng Chiếu 1',
                date: '2026-06-17',
                time: '19:30',
                price: 85000
            },
            {
                id: 'st_2',
                movieId: db.movies[1] ? db.movies[1].id : 'mv_2',
                movieTitle: db.movies[1] ? db.movies[1].title : 'Biệt Đội Đánh Thuê 4',
                cinemaId: 'ha-dong',
                cinemaName: '3HD2K HÀ ĐÔNG',
                room: 'Phòng Chiếu 2',
                date: '2026-06-17',
                time: '21:00',
                price: 90000
            },
            {
                id: 'st_3',
                movieId: db.movies[2] ? db.movies[2].id : 'mv_3',
                movieTitle: db.movies[2] ? db.movies[2].title : 'Ác Quỷ Ma Sơ II',
                cinemaId: 'my-dinh',
                cinemaName: '3HD2K MỸ ĐÌNH',
                room: 'Phòng Chiếu 1',
                date: '2026-06-18',
                time: '18:00',
                price: 80000
            },
            {
                id: 'st_4',
                movieId: db.movies[0] ? db.movies[0].id : 'mv_1',
                movieTitle: db.movies[0] ? db.movies[0].title : 'Your Name',
                cinemaId: 'le-trong-tan',
                cinemaName: '3HD2K LÊ TRỌNG TẤN',
                room: 'Phòng Chiếu 3',
                date: '2026-06-16',
                time: '14:00',
                price: 85000
            }
        ];
        localStorage.setItem('3hd2k_showtimes', JSON.stringify(defaultShowtimes));
    }
    db.showtimes = JSON.parse(localStorage.getItem('3hd2k_showtimes'));

    // 6. Bookings seed (realistic data for reporting & dashboard)
    if (!localStorage.getItem('3hd2k_bookings')) {
        const defaultBookings = [
            {
                id: 'BK' + Math.floor(100000 + Math.random() * 900000),
                customerName: 'Nguyễn Văn An',
                customerEmail: 'nguyenvanan@gmail.com',
                movieTitle: 'Your Name - Tên Cậu Là Gì?',
                showtime: '2026-06-17 19:30',
                seats: ['F5', 'F6'],
                totalAmount: 230000, // Includes popcorn ticket
                status: 'paid',
                dateCreated: '2026-06-16'
            },
            {
                id: 'BK' + Math.floor(100000 + Math.random() * 900000),
                customerName: 'Trần Mai Phương',
                customerEmail: 'tranmaiphuong@yahoo.com',
                movieTitle: 'Biệt Đội Đánh Thuê 4',
                showtime: '2026-06-17 21:00',
                seats: ['D3', 'D4', 'D5'],
                totalAmount: 370000,
                status: 'paid',
                dateCreated: '2026-06-15'
            },
            {
                id: 'BK' + Math.floor(100000 + Math.random() * 900000),
                customerName: 'Lê Hoàng Long',
                customerEmail: 'lehoanglong@outlook.com',
                movieTitle: 'Ác Quỷ Ma Sơ II',
                showtime: '2026-06-18 18:00',
                seats: ['C7'],
                totalAmount: 80000,
                status: 'pending',
                dateCreated: '2026-06-16'
            },
            {
                id: 'BK' + Math.floor(100000 + Math.random() * 900000),
                customerName: 'Vũ Đức Hải',
                customerEmail: 'vuduchai@gmail.com',
                movieTitle: 'Your Name - Tên Cậu Là Gì?',
                showtime: '2026-06-16 14:00',
                seats: ['H1', 'H2'],
                totalAmount: 250000,
                status: 'cancelled',
                dateCreated: '2026-06-14'
            },
            // Extra past entries for Monthly graphs
            {
                id: 'BK' + Math.floor(100000 + Math.random() * 900000),
                customerName: 'Đỗ Tiến Đạt',
                customerEmail: 'dat.dt@gmail.com',
                movieTitle: 'Kẻ Kiến Tạo',
                showtime: '2026-05-12 20:00',
                seats: ['E8', 'E9'],
                totalAmount: 280000,
                status: 'paid',
                dateCreated: '2026-05-12'
            },
            {
                id: 'BK' + Math.floor(100000 + Math.random() * 900000),
                customerName: 'Phạm Hồng Nhung',
                customerEmail: 'nhung.ph@gmail.com',
                movieTitle: 'Biệt Đội Đánh Thuê 4',
                showtime: '2026-05-24 16:30',
                seats: ['A1'],
                totalAmount: 85000,
                status: 'paid',
                dateCreated: '2026-05-24'
            }
        ];
        localStorage.setItem('3hd2k_bookings', JSON.stringify(defaultBookings));
    }
    db.bookings = JSON.parse(localStorage.getItem('3hd2k_bookings'));

    // 7. Room layout config seed
    if (!localStorage.getItem('3hd2k_rooms_layouts')) {
        const defaultLayouts = {
            'ha-dong_Phòng Chiếu 1': { rows: 8, cols: 12, seatTypes: {} },
            'ha-dong_Phòng Chiếu 2': { rows: 8, cols: 12, seatTypes: {} },
            'le-trong-tan_Phòng Chiếu 3': { rows: 8, cols: 12, seatTypes: {} },
            'my-dinh_Phòng Chiếu 1': { rows: 8, cols: 12, seatTypes: {} }
        };
        // Seed default VIP rows (E, F) and double seats (row H)
        for (let key in defaultLayouts) {
            const layout = defaultLayouts[key];
            const types = {};
            // Rows are A (index 0) to H (index 7)
            for (let r = 0; r < layout.rows; r++) {
                const rowLetter = String.fromCharCode(65 + r);
                for (let c = 1; c <= layout.cols; c++) {
                    const seatId = `${rowLetter}${c}`;
                    if (rowLetter === 'E' || rowLetter === 'F') {
                        types[seatId] = 'vip';
                    } else if (rowLetter === 'H') {
                        types[seatId] = 'double';
                    } else if (rowLetter === 'A' && c === 1) {
                        types[seatId] = 'broken';
                    } else {
                        types[seatId] = 'standard';
                    }
                }
            }
            layout.seatTypes = types;
        }
        localStorage.setItem('3hd2k_rooms_layouts', JSON.stringify(defaultLayouts));
    }
    db.roomLayouts = JSON.parse(localStorage.getItem('3hd2k_rooms_layouts'));
}

// Reload from local storage
function reloadDatabase() {
    db.movies = JSON.parse(localStorage.getItem('3hd2k_movies')) || [];
    db.cinemas = JSON.parse(localStorage.getItem('3hd2k_cinemas')) || [];
    db.showtimes = JSON.parse(localStorage.getItem('3hd2k_showtimes')) || [];
    db.bookings = JSON.parse(localStorage.getItem('3hd2k_bookings')) || [];
    db.combos = JSON.parse(localStorage.getItem('3hd2k_combos')) || [];
    db.users = JSON.parse(localStorage.getItem('3hd2k_users')) || [];
    db.roomLayouts = JSON.parse(localStorage.getItem('3hd2k_rooms_layouts')) || {};
}

// Save databases helper
function saveDB(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    reloadDatabase();
}

// --- GENERAL PAGE SETUP ---
document.addEventListener('DOMContentLoaded', () => {
    // Seed
    seedDatabase();
    
    // Set Clock
    setInterval(updateClock, 1000);
    updateClock();

    // Sidebar navigation
    const menuButtons = document.querySelectorAll('.sidebar-menu .menu-item');
    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Seat type selector active class
    const typeButtons = document.querySelectorAll('.seat-type-selector .type-btn');
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeSeatType = btn.getAttribute('data-type');
        });
    });

    // Initial load
    switchTab('dashboard');
});

// Update the real time widget
function updateClock() {
    const timeWidget = document.getElementById('current-time');
    if (timeWidget) {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        timeWidget.textContent = `${hrs}:${mins}:${secs}`;
    }
}

// Navigation Tabs Switcher
function switchTab(tabId) {
    activeTab = tabId;
    
    // Toggle active menu button
    const menuButtons = document.querySelectorAll('.sidebar-menu .menu-item');
    menuButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Toggle active section view
    const sections = document.querySelectorAll('.tab-section');
    sections.forEach(sec => {
        sec.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`tab-content-${tabId}`);
    if (targetSection) targetSection.classList.add('active');

    // Update main header texts
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
        stats: { main: "Báo cáo thống kê", sub: "Phân tích số liệu doanh thu và hiệu suất bán vé" }
    };

    if (titleEl && subEl && titles[tabId]) {
        titleEl.textContent = titles[tabId].main;
        subEl.textContent = titles[tabId].sub;
    }

    // Trigger specific tab renders
    triggerTabRenders(tabId);
}

async function loadMoviesFromAPI() {
    try {
        const response = await fetch('/api/movies');
        const data = await response.json();
        db.movies = data.map(m => ({
            id: m.id,
            title: m.title,
            genre: m.genre || 'Phim',
            duration: m.duration || 120,
            age: m.ageRating || 'P',
            status: m.status || 'now-showing', 
            poster: m.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80',
            trailer: m.trailerUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            desc: m.description || ''
        }));
        renderMoviesTable();
        localStorage.setItem('3hd2k_movies', JSON.stringify(db.movies));
    } catch(e) {
        console.error("Lỗi khi tải phim từ API", e);
        renderMoviesTable(); // fallback render
    }
}

// Triggers rendering when tabs are opened
function triggerTabRenders(tabId) {
    reloadDatabase();
    
    switch (tabId) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'movies':
            loadMoviesFromAPI();
            break;
        case 'showtimes':
            renderShowtimesTable();
            populateCinemaDropdowns();
            break;
        case 'rooms':
            populateRoomDropdown();
            loadRoomSeatMap();
            break;
        case 'bookings':
            renderBookingsTable();
            break;
        case 'combos':
            renderCombosTable();
            break;
        case 'users':
            renderUsersTable();
            break;
        case 'stats':
            renderStatsDashboard();
            break;
    }
}

// Format currency
function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount).replace('₫', 'đ');
}


// ================= 1. TAB: DASHBOARD =================
function renderDashboard() {
    // 1. Calculations
    const totalMovies = db.movies.length;
    const totalShowtimes = db.showtimes.length;
    
    const paidBookings = db.bookings.filter(b => b.status === 'paid');
    let ticketsSold = 0;
    let totalRevenue = 0;
    
    paidBookings.forEach(b => {
        ticketsSold += b.seats ? b.seats.length : 1;
        totalRevenue += b.totalAmount || 0;
    });

    const totalUsers = db.users.filter(u => u.role === 'customer').length;

    // 2. Render cards
    document.getElementById('stat-movies-count').textContent = totalMovies;
    document.getElementById('stat-showtimes-count').textContent = totalShowtimes;
    document.getElementById('stat-tickets-count').textContent = ticketsSold;
    document.getElementById('stat-revenue').textContent = formatVND(totalRevenue);
    document.getElementById('stat-users-count').textContent = totalUsers;

    // 3. Render recent bookings (max 5 rows)
    const recentBookingsTbody = document.getElementById('recent-bookings-tbody');
    if (recentBookingsTbody) {
        recentBookingsTbody.innerHTML = '';
        const sorted = [...db.bookings].sort((a,b) => new Date(b.dateCreated) - new Date(a.dateCreated)).slice(0, 5);
        
        if (sorted.length === 0) {
            recentBookingsTbody.innerHTML = `<tr><td colspan="7" style="text-align: center;" class="text-muted">Chưa có đơn đặt vé nào.</td></tr>`;
        } else {
            sorted.forEach(bk => {
                let statusBadge = '';
                if (bk.status === 'paid') statusBadge = `<span class="badge-admin paid">Đã thanh toán</span>`;
                else if (bk.status === 'pending') statusBadge = `<span class="badge-admin pending">Chờ duyệt</span>`;
                else statusBadge = `<span class="badge-admin cancelled">Đã hủy</span>`;

                recentBookingsTbody.innerHTML += `
                    <tr>
                        <td style="font-weight: 700; color: var(--primary-red);">${bk.id}</td>
                        <td>
                            <div>
                                <p style="font-weight: 600;">${bk.customerName}</p>
                                <p style="font-size: 0.75rem; color: var(--text-muted);">${bk.customerEmail}</p>
                            </div>
                        </td>
                        <td style="font-weight: 600;">${bk.movieTitle}</td>
                        <td style="font-size: 0.875rem;">${bk.showtime}</td>
                        <td>${bk.seats ? bk.seats.join(', ') : 'N/A'}</td>
                        <td style="font-weight: 700; color: var(--primary-red);">${formatVND(bk.totalAmount)}</td>
                        <td>${statusBadge}</td>
                    </tr>
                `;
            });
        }
    }

    // 4. Render top-performing movie
    const topMovieCard = document.getElementById('dashboard-top-movie');
    const topMovieTitle = document.getElementById('top-movie-title');
    const topMovieStats = document.getElementById('top-movie-stats');
    
    if (topMovieCard && topMovieTitle && topMovieStats) {
        // Calculate sales per movie title
        const salesMap = {};
        db.bookings.forEach(b => {
            if (b.status === 'paid') {
                const seatCount = b.seats ? b.seats.length : 1;
                salesMap[b.movieTitle] = (salesMap[b.movieTitle] || 0) + seatCount;
            }
        });
        
        let maxTitle = '';
        let maxTickets = 0;
        for (let title in salesMap) {
            if (salesMap[title] > maxTickets) {
                maxTickets = salesMap[title];
                maxTitle = title;
            }
        }
        
        // Find matching movie poster
        let posterUrl = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80';
        if (maxTitle) {
            const mv = db.movies.find(m => maxTitle.includes(m.title) || m.title.includes(maxTitle));
            if (mv && mv.poster) posterUrl = mv.poster;
            
            topMovieTitle.textContent = maxTitle;
            topMovieStats.innerHTML = `<i class="fas fa-ticket-alt"></i> ${maxTickets} vé đã bán`;
        } else {
            topMovieTitle.textContent = db.movies[0] ? db.movies[0].title : "Chưa có dữ liệu";
            topMovieStats.innerHTML = `<i class="fas fa-ticket-alt"></i> 0 vé đã bán`;
            if (db.movies[0]) posterUrl = db.movies[0].poster;
        }

        const bgEl = topMovieCard.querySelector('.top-movie-bg');
        if (bgEl) bgEl.style.backgroundImage = `url('${posterUrl}')`;
    }
}


// ================= 2. TAB: QUẢN LÝ PHIM =================
function renderMoviesTable() {
    const tbody = document.getElementById('movies-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    db.movies.forEach(m => {
        let statusBadge = m.status === 'now-showing' 
            ? `<span class="badge-admin now-showing">Đang Chiếu</span>` 
            : `<span class="badge-admin coming-soon">Sắp Chiếu</span>`;

        tbody.innerHTML += `
            <tr>
                <td>
                    <div class="table-poster" style="background-image: url('${m.poster}')"></div>
                </td>
                <td>
                    <div style="font-weight: 600; font-size: 1rem;">${m.title}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Độ tuổi: <span style="font-weight: bold; color: white;">${m.age}</span></div>
                </td>
                <td>${m.genre}</td>
                <td><i class="far fa-clock"></i> ${m.duration}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon edit" onclick="openEditMovieModal('${m.id}')" title="Sửa thông tin">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteMovie('${m.id}')" title="Xóa phim">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function filterMoviesTable() {
    const searchVal = document.getElementById('movie-search').value.toLowerCase();
    const filterVal = document.getElementById('movie-filter-status').value;
    const tbody = document.getElementById('movies-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    db.movies.forEach(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchVal);
        const matchesFilter = filterVal === 'all' || m.status === filterVal;
        
        if (matchesSearch && matchesFilter) {
            let statusBadge = m.status === 'now-showing' 
                ? `<span class="badge-admin now-showing">Đang Chiếu</span>` 
                : `<span class="badge-admin coming-soon">Sắp Chiếu</span>`;

            tbody.innerHTML += `
                <tr>
                    <td>
                        <div class="table-poster" style="background-image: url('${m.poster}')"></div>
                    </td>
                    <td>
                        <div style="font-weight: 600; font-size: 1rem;">${m.title}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Độ tuổi: <span style="font-weight: bold; color: white;">${m.age}</span></div>
                    </td>
                    <td>${m.genre}</td>
                    <td><i class="far fa-clock"></i> ${m.duration}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="actions-cell">
                            <button class="btn-icon edit" onclick="openEditMovieModal('${m.id}')" title="Sửa thông tin">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete" onclick="deleteMovie('${m.id}')" title="Xóa phim">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
    });
}

// Modal actions Movie
function openAddMovieModal() {
    document.getElementById('movie-modal-title').textContent = "Thêm phim mới";
    document.getElementById('movie-id').value = "";
    document.getElementById('movie-form').reset();
    document.getElementById('movie-modal').style.display = 'flex';
}

function openEditMovieModal(id) {
    const m = db.movies.find(mv => mv.id === id);
    if (!m) return;
    
    document.getElementById('movie-modal-title').textContent = "Chỉnh sửa phim";
    document.getElementById('movie-id').value = m.id;
    document.getElementById('movie-title-input').value = m.title;
    document.getElementById('movie-genre-input').value = m.genre;
    document.getElementById('movie-duration-input').value = m.duration;
    document.getElementById('movie-age-input').value = m.age;
    document.getElementById('movie-status-input').value = m.status;
    document.getElementById('movie-poster-input').value = m.poster;
    document.getElementById('movie-trailer-input').value = m.trailer;
    document.getElementById('movie-desc-input').value = m.desc;
    
    document.getElementById('movie-modal').style.display = 'flex';
}

function closeMovieModal() {
    document.getElementById('movie-modal').style.display = 'none';
}

async function handleMovieSubmit(event) {
    event.preventDefault();
    const id = document.getElementById('movie-id').value;
    const title = document.getElementById('movie-title-input').value;
    const genre = document.getElementById('movie-genre-input').value;
    const duration = document.getElementById('movie-duration-input').value;
    const age = document.getElementById('movie-age-input').value;
    const status = document.getElementById('movie-status-input').value;
    const poster = document.getElementById('movie-poster-input').value || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80';
    const trailer = document.getElementById('movie-trailer-input').value || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const desc = document.getElementById('movie-desc-input').value;

    const apiPayload = {
        title: title,
        genre: genre,
        duration: parseInt(duration) || 120,
        ageRating: age,
        status: status,
        posterUrl: poster,
        trailerUrl: trailer,
        description: desc
    };

    try {
        if (id) {
            apiPayload.id = id;
            await fetch(`/api/movies/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload)
            });
        } else {
            apiPayload.id = '00000000-0000-0000-0000-000000000000';
            await fetch(`/api/movies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload)
            });
        }
    } catch(e) {
        console.error("Lỗi khi lưu phim", e);
    }

    closeMovieModal();
    loadMoviesFromAPI();
}

async function deleteMovie(id) {
    if (confirm("Bạn có chắc chắn muốn xóa bộ phim này khỏi hệ thống? Tất cả suất chiếu liên quan cũng sẽ bị ảnh hưởng.")) {
        try {
            await fetch(`/api/movies/${id}`, { method: 'DELETE' });
            
            // Clean related showtimes
            let showtimesList = db.showtimes.filter(s => s.movieId !== id);
            saveDB('3hd2k_showtimes', showtimesList);
            
            loadMoviesFromAPI();
        } catch(e) {
            console.error("Lỗi khi xóa phim", e);
        }
    }
}


// ================= 3. TAB: QUẢN LÝ LỊCH CHIẾU =================
function populateCinemaDropdowns() {
    const filterCin = document.getElementById('showtime-filter-cinema');
    if (filterCin && filterCin.options.length <= 1) {
        db.cinemas.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            filterCin.appendChild(opt);
        });
    }
}

function renderShowtimesTable() {
    const tbody = document.getElementById('showtimes-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    db.showtimes.forEach(st => {
        tbody.innerHTML += `
            <tr>
                <td style="font-weight: 600;">${st.movieTitle}</td>
                <td>${st.cinemaName}</td>
                <td><span style="font-weight: 600; color: #fff;">${st.room}</span></td>
                <td>${st.date}</td>
                <td style="font-weight: 700; color: var(--primary-red);"><i class="far fa-clock"></i> ${st.time}</td>
                <td style="font-weight: 700; color: #daa520;">${formatVND(st.price)}</td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon delete" onclick="deleteShowtime('${st.id}')" title="Xóa lịch chiếu">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function filterShowtimesTable() {
    const searchVal = document.getElementById('showtime-search').value.toLowerCase();
    const filterCin = document.getElementById('showtime-filter-cinema').value;
    const tbody = document.getElementById('showtimes-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    db.showtimes.forEach(st => {
        const matchesSearch = st.movieTitle.toLowerCase().includes(searchVal);
        const matchesCinema = filterCin === 'all' || st.cinemaId === filterCin;
        
        if (matchesSearch && matchesCinema) {
            tbody.innerHTML += `
                <tr>
                    <td style="font-weight: 600;">${st.movieTitle}</td>
                    <td>${st.cinemaName}</td>
                    <td><span style="font-weight: 600; color: #fff;">${st.room}</span></td>
                    <td>${st.date}</td>
                    <td style="font-weight: 700; color: var(--primary-red);"><i class="far fa-clock"></i> ${st.time}</td>
                    <td style="font-weight: 700; color: #daa520;">${formatVND(st.price)}</td>
                    <td>
                        <div class="actions-cell">
                            <button class="btn-icon delete" onclick="deleteShowtime('${st.id}')" title="Xóa lịch chiếu">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
    });
}

function openAddShowtimeModal() {
    // Populate movies dropdown in modal
    const movieSelect = document.getElementById('st-movie-select');
    movieSelect.innerHTML = '';
    // Only show now showing or coming soon movies
    db.movies.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.title;
        movieSelect.appendChild(opt);
    });

    // Populate cinemas dropdown in modal
    const cinemaSelect = document.getElementById('st-cinema-select');
    cinemaSelect.innerHTML = '';
    db.cinemas.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        cinemaSelect.appendChild(opt);
    });

    populateModalRooms();
    
    // Set date min to today
    const dateInput = document.getElementById('st-date-input');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;

    document.getElementById('showtime-modal').style.display = 'flex';
}

function populateModalRooms() {
    const cinemaId = document.getElementById('st-cinema-select').value;
    const roomSelect = document.getElementById('st-room-select');
    roomSelect.innerHTML = '';
    
    // We offer 3 standard rooms per cinema
    for (let i = 1; i <= 3; i++) {
        const opt = document.createElement('option');
        opt.value = `Phòng Chiếu ${i}`;
        opt.textContent = `Phòng Chiếu ${i}`;
        roomSelect.appendChild(opt);
    }
}

function closeShowtimeModal() {
    document.getElementById('showtime-modal').style.display = 'none';
}

function handleShowtimeSubmit(event) {
    event.preventDefault();
    const movieId = document.getElementById('st-movie-select').value;
    const cinemaId = document.getElementById('st-cinema-select').value;
    const room = document.getElementById('st-room-select').value;
    const price = parseInt(document.getElementById('st-price-input').value);
    const date = document.getElementById('st-date-input').value;
    const time = document.getElementById('st-time-input').value;

    const movie = db.movies.find(m => m.id === movieId);
    const cinema = db.cinemas.find(c => c.id === cinemaId);
    
    const newSt = {
        id: 'st_' + Math.random().toString(36).substr(2, 9),
        movieId,
        movieTitle: movie ? movie.title : 'N/A',
        cinemaId,
        cinemaName: cinema ? cinema.name : 'N/A',
        room,
        date,
        time,
        price
    };

    let showtimesList = [...db.showtimes];
    showtimesList.push(newSt);
    saveDB('3hd2k_showtimes', showtimesList);
    closeShowtimeModal();
    renderShowtimesTable();
}

function deleteShowtime(id) {
    if (confirm("Bạn có chắc muốn xóa lịch chiếu này? Khách hàng sẽ không thể tìm thấy suất chiếu này nữa.")) {
        const filtered = db.showtimes.filter(st => st.id !== id);
        saveDB('3hd2k_showtimes', filtered);
        renderShowtimesTable();
    }
}


// ================= 4. TAB: QUẢN LÝ PHÒNG CHIẾU VÀ GHẾ =================
function populateRoomDropdown() {
    const roomSelect = document.getElementById('room-select');
    if (!roomSelect) return;
    
    if (roomSelect.options.length === 0) {
        db.cinemas.forEach(c => {
            for (let i = 1; i <= 3; i++) {
                const opt = document.createElement('option');
                opt.value = `${c.id}_Phòng Chiếu ${i}`;
                opt.textContent = `${c.name} - Phòng ${i}`;
                roomSelect.appendChild(opt);
            }
        });
    }
}

function loadRoomSeatMap() {
    const combinedRoomId = document.getElementById('room-select').value;
    const gridEl = document.getElementById('admin-seating-grid');
    if (!gridEl) return;
    
    gridEl.innerHTML = '';
    
    // Check if layout exists
    let layout = db.roomLayouts[combinedRoomId];
    if (!layout) {
        layout = { rows: 8, cols: 12, seatTypes: {} };
        // Populate standard types
        for (let r = 0; r < layout.rows; r++) {
            const rowLetter = String.fromCharCode(65 + r);
            for (let c = 1; c <= layout.cols; c++) {
                const seatId = `${rowLetter}${c}`;
                layout.seatTypes[seatId] = 'standard';
            }
        }
        db.roomLayouts[combinedRoomId] = layout;
        saveDB('3hd2k_rooms_layouts', db.roomLayouts);
    }

    // Set configuration inputs
    document.getElementById('room-rows').value = layout.rows;
    document.getElementById('room-cols').value = layout.cols;

    // Set grid CSS
    gridEl.style.gridTemplateColumns = `repeat(${layout.cols}, auto)`;
    
    // Draw grid
    for (let r = 0; r < layout.rows; r++) {
        const rowLetter = String.fromCharCode(65 + r);
        for (let c = 1; c <= layout.cols; c++) {
            const seatId = `${rowLetter}${c}`;
            let seatType = layout.seatTypes[seatId] || 'standard';
            
            const seatDiv = document.createElement('div');
            seatDiv.className = `seat-admin-cell ${seatType}`;
            seatDiv.id = `admin-seat-${seatId}`;
            seatDiv.dataset.seatId = seatId;
            seatDiv.textContent = seatId;
            
            // Set double seat width colspan simulator if double
            if (seatType === 'double') {
                seatDiv.style.gridColumnEnd = `span 2`;
            }

            // Click seat to toggle type
            seatDiv.addEventListener('click', () => {
                toggleSeatDesignation(combinedRoomId, seatId, seatDiv);
            });

            gridEl.appendChild(seatDiv);
        }
    }
    
    // Set title
    const nameMap = {
        'ha-dong': '3HD2K HÀ ĐÔNG',
        'le-trong-tan': '3HD2K LÊ TRỌNG TẤN',
        'my-dinh': '3HD2K MỸ ĐÌNH'
    };
    const parts = combinedRoomId.split('_');
    const cinName = nameMap[parts[0]] || parts[0];
    document.getElementById('room-map-title').textContent = `Sơ đồ ghế: ${cinName} - ${parts[1]}`;
}

function toggleSeatDesignation(roomId, seatId, seatDiv) {
    const layout = db.roomLayouts[roomId];
    if (!layout) return;

    // Toggle styling class
    seatDiv.className = `seat-admin-cell ${activeSeatType}`;
    layout.seatTypes[seatId] = activeSeatType;
    
    if (activeSeatType === 'double') {
        seatDiv.style.gridColumnEnd = `span 2`;
    } else {
        seatDiv.style.gridColumnEnd = `auto`;
    }

    // Notice details
    console.log(`Updated seat ${seatId} to type: ${activeSeatType}`);
}

function updateRoomGridSize() {
    const combinedRoomId = document.getElementById('room-select').value;
    const rows = parseInt(document.getElementById('room-rows').value);
    const cols = parseInt(document.getElementById('room-cols').value);
    
    if (rows < 4 || rows > 15 || cols < 6 || cols > 20) {
        alert("Kích thước phòng chiếu không hợp lệ. Số hàng ghế phải từ 4-15, số ghế mỗi hàng từ 6-20.");
        return;
    }

    if (confirm("Thay đổi kích thước phòng chiếu sẽ đặt lại một phần cách phân hạng ghế hiện tại. Bạn có chắc muốn tiếp tục?")) {
        const layout = db.roomLayouts[combinedRoomId] || { seatTypes: {} };
        const newTypes = {};
        
        for (let r = 0; r < rows; r++) {
            const rowLetter = String.fromCharCode(65 + r);
            for (let c = 1; c <= cols; c++) {
                const seatId = `${rowLetter}${c}`;
                // Preserve old types if available, otherwise default
                newTypes[seatId] = layout.seatTypes[seatId] || 'standard';
            }
        }
        
        db.roomLayouts[combinedRoomId] = {
            rows: rows,
            cols: cols,
            seatTypes: newTypes
        };

        saveDB('3hd2k_rooms_layouts', db.roomLayouts);
        loadRoomSeatMap();
    }
}

function saveCurrentRoomLayout() {
    saveDB('3hd2k_rooms_layouts', db.roomLayouts);
    alert("Cấu hình sơ đồ ghế phòng chiếu đã được lưu trữ thành công vào LocalStorage.");
}


// ================= 5. TAB: QUẢN LÝ ĐẶT VÉ =================
function renderBookingsTable() {
    const tbody = document.getElementById('bookings-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    db.bookings.forEach(bk => {
        let statusBadge = '';
        let actionButtons = '';
        
        if (bk.status === 'paid') {
            statusBadge = `<span class="badge-admin paid">Đã thanh toán</span>`;
            actionButtons = `
                <button class="btn-icon delete" onclick="cancelBooking('${bk.id}')" title="Hủy vé & hoàn ghế">
                    <i class="fas fa-ban"></i>
                </button>
            `;
        } else if (bk.status === 'pending') {
            statusBadge = `<span class="badge-admin pending">Chờ thanh toán</span>`;
            actionButtons = `
                <button class="btn-icon confirm" onclick="approveBooking('${bk.id}')" title="Duyệt thanh toán">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn-icon delete" onclick="cancelBooking('${bk.id}')" title="Từ chối/Hủy vé">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
        } else {
            statusBadge = `<span class="badge-admin cancelled">Đã hủy</span>`;
            actionButtons = `<span style="font-size:0.75rem; color:var(--text-muted);">Không có thao tác</span>`;
        }

        tbody.innerHTML += `
            <tr>
                <td style="font-weight: 700; color: var(--primary-red);">${bk.id}</td>
                <td>
                    <div>
                        <p style="font-weight: 600;">${bk.customerName}</p>
                        <p style="font-size: 0.75rem; color: var(--text-muted);">${bk.customerEmail}</p>
                    </div>
                </td>
                <td style="font-weight: 600;">${bk.movieTitle}</td>
                <td style="font-size:0.875rem;">${bk.showtime}</td>
                <td style="font-weight: 600;">${bk.seats ? bk.seats.join(', ') : 'N/A'}</td>
                <td style="font-weight: 700; color: var(--primary-red);">${formatVND(bk.totalAmount)}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="actions-cell">${actionButtons}</div>
                </td>
            </tr>
        `;
    });
}

function filterBookingsTable() {
    const searchVal = document.getElementById('booking-search').value.toLowerCase();
    const filterVal = document.getElementById('booking-filter-status').value;
    const tbody = document.getElementById('bookings-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    db.bookings.forEach(bk => {
        const matchesSearch = bk.id.toLowerCase().includes(searchVal) || 
                              bk.customerName.toLowerCase().includes(searchVal) ||
                              bk.customerEmail.toLowerCase().includes(searchVal);
        const matchesFilter = filterVal === 'all' || bk.status === filterVal;
        
        if (matchesSearch && matchesFilter) {
            let statusBadge = '';
            let actionButtons = '';
            
            if (bk.status === 'paid') {
                statusBadge = `<span class="badge-admin paid">Đã thanh toán</span>`;
                actionButtons = `
                    <button class="btn-icon delete" onclick="cancelBooking('${bk.id}')" title="Hủy vé & hoàn ghế">
                        <i class="fas fa-ban"></i>
                    </button>
                `;
            } else if (bk.status === 'pending') {
                statusBadge = `<span class="badge-admin pending">Chờ thanh toán</span>`;
                actionButtons = `
                    <button class="btn-icon confirm" onclick="approveBooking('${bk.id}')" title="Duyệt thanh toán">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-icon delete" onclick="cancelBooking('${bk.id}')" title="Từ chối/Hủy vé">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
            } else {
                statusBadge = `<span class="badge-admin cancelled">Đã hủy</span>`;
                actionButtons = `<span style="font-size:0.75rem; color:var(--text-muted);">Không có thao tác</span>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td style="font-weight: 700; color: var(--primary-red);">${bk.id}</td>
                    <td>
                        <div>
                            <p style="font-weight: 600;">${bk.customerName}</p>
                            <p style="font-size: 0.75rem; color: var(--text-muted);">${bk.customerEmail}</p>
                        </div>
                    </td>
                    <td style="font-weight: 600;">${bk.movieTitle}</td>
                    <td style="font-size:0.875rem;">${bk.showtime}</td>
                    <td style="font-weight: 600;">${bk.seats ? bk.seats.join(', ') : 'N/A'}</td>
                    <td style="font-weight: 700; color: var(--primary-red);">${formatVND(bk.totalAmount)}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="actions-cell">${actionButtons}</div>
                    </td>
                </tr>
            `;
        }
    });
}

function approveBooking(id) {
    if (confirm(`Bạn muốn xác nhận thanh toán thành công cho hóa đơn vé ${id}?`)) {
        const bookingsList = db.bookings.map(bk => {
            if (bk.id === id) {
                return { ...bk, status: 'paid' };
            }
            return bk;
        });
        saveDB('3hd2k_bookings', bookingsList);
        renderBookingsTable();
    }
}

function cancelBooking(id) {
    if (confirm(`Cảnh báo: Hủy vé ${id} sẽ giải phóng toàn bộ số ghế liên kết của lịch chiếu đó. Bạn có chắc muốn tiếp tục?`)) {
        const bookingsList = db.bookings.map(bk => {
            if (bk.id === id) {
                return { ...bk, status: 'cancelled' };
            }
            return bk;
        });
        saveDB('3hd2k_bookings', bookingsList);
        renderBookingsTable();
    }
}


// ================= 6. TAB: QUẢN LÝ COMBO =================
function renderCombosTable() {
    const tbody = document.getElementById('combos-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    db.combos.forEach(cb => {
        tbody.innerHTML += `
            <tr>
                <td>
                    <div class="table-combo-img" style="background-image: url('${cb.image}')"></div>
                </td>
                <td style="font-weight: 600; font-size: 1rem;">${cb.name}</td>
                <td style="font-size: 0.875rem; color: var(--text-muted);">${cb.desc}</td>
                <td style="font-weight: 700; color: var(--primary-red);">${formatVND(cb.price)}</td>
                <td style="font-weight: 600;">${cb.stock} phần</td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon edit" onclick="openEditComboModal('${cb.id}')" title="Sửa combo">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="deleteCombo('${cb.id}')" title="Xóa combo">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function filterCombosTable() {
    const searchVal = document.getElementById('combo-search').value.toLowerCase();
    const tbody = document.getElementById('combos-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    db.combos.forEach(cb => {
        if (cb.name.toLowerCase().includes(searchVal)) {
            tbody.innerHTML += `
                <tr>
                    <td>
                        <div class="table-combo-img" style="background-image: url('${cb.image}')"></div>
                    </td>
                    <td style="font-weight: 600; font-size: 1rem;">${cb.name}</td>
                    <td style="font-size: 0.875rem; color: var(--text-muted);">${cb.desc}</td>
                    <td style="font-weight: 700; color: var(--primary-red);">${formatVND(cb.price)}</td>
                    <td style="font-weight: 600;">${cb.stock} phần</td>
                    <td>
                        <div class="actions-cell">
                            <button class="btn-icon edit" onclick="openEditComboModal('${cb.id}')" title="Sửa combo">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete" onclick="deleteCombo('${cb.id}')" title="Xóa combo">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
    });
}

function openAddComboModal() {
    document.getElementById('combo-modal-title').textContent = "Thêm Combo bắp nước mới";
    document.getElementById('combo-id').value = "";
    document.getElementById('combo-form').reset();
    document.getElementById('combo-modal').style.display = 'flex';
}

function openEditComboModal(id) {
    const cb = db.combos.find(c => c.id === id);
    if (!cb) return;

    document.getElementById('combo-modal-title').textContent = "Chỉnh sửa Combo";
    document.getElementById('combo-id').value = cb.id;
    document.getElementById('combo-name-input').value = cb.name;
    document.getElementById('combo-price-input').value = cb.price;
    document.getElementById('combo-stock-input').value = cb.stock;
    document.getElementById('combo-image-input').value = cb.image;
    document.getElementById('combo-desc-input').value = cb.desc;

    document.getElementById('combo-modal').style.display = 'flex';
}

function closeComboModal() {
    document.getElementById('combo-modal').style.display = 'none';
}

function handleComboSubmit(event) {
    event.preventDefault();
    const id = document.getElementById('combo-id').value;
    const name = document.getElementById('combo-name-input').value;
    const price = parseInt(document.getElementById('combo-price-input').value);
    const stock = parseInt(document.getElementById('combo-stock-input').value);
    const image = document.getElementById('combo-image-input').value || 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=150&q=80';
    const desc = document.getElementById('combo-desc-input').value;

    let combosList = [...db.combos];
    if (id) {
        combosList = combosList.map(c => {
            if (c.id === id) {
                return { ...c, name, price, stock, image, desc };
            }
            return c;
        });
    } else {
        combosList.push({
            id: 'cb_' + Math.random().toString(36).substr(2, 9),
            name, price, stock, image, desc
        });
    }

    saveDB('3hd2k_combos', combosList);
    closeComboModal();
    renderCombosTable();
}

function deleteCombo(id) {
    if (confirm("Bạn có chắc chắn muốn xóa combo này? Khách hàng sẽ không thể đặt combo này nữa.")) {
        const filtered = db.combos.filter(c => c.id !== id);
        saveDB('3hd2k_combos', filtered);
        renderCombosTable();
    }
}


// ================= 7. TAB: QUẢN LÝ NGƯỜI DÙNG =================
function renderUsersTable() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    db.users.forEach(u => {
        let roleBadge = u.role === 'admin' 
            ? `<span class="badge-admin role-admin">Admin</span>` 
            : `<span class="badge-admin role-user">Thành viên</span>`;
            
        let statusBadge = u.status === 'active' 
            ? `<span class="badge-admin active-user">Hoạt động</span>` 
            : `<span class="badge-admin locked-user">Đang khóa</span>`;

        let actionButtons = '';
        if (u.role !== 'admin') {
            const toggleIcon = u.status === 'active' ? 'fa-lock' : 'fa-lock-open';
            const toggleText = u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản';
            
            actionButtons = `
                <button class="btn-icon block" onclick="toggleUserLock('${u.email}')" title="${toggleText}">
                    <i class="fas ${toggleIcon}"></i>
                </button>
                <button class="btn-icon view" onclick="viewUserHistory('${u.email}')" title="Xem lịch sử đặt vé">
                    <i class="fas fa-history"></i>
                </button>
            `;
        } else {
            actionButtons = `<span style="font-size:0.75rem; color:var(--text-muted);">Không có thao tác</span>`;
        }

        tbody.innerHTML += `
            <tr>
                <td>
                    <div class="table-avatar">${u.name.charAt(0).toUpperCase()}</div>
                </td>
                <td style="font-weight: 600;">${u.name}</td>
                <td>${u.email}</td>
                <td>${roleBadge}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="actions-cell">${actionButtons}</div>
                </td>
            </tr>
        `;
    });
}

function filterUsersTable() {
    const searchVal = document.getElementById('user-search').value.toLowerCase();
    const filterRole = document.getElementById('user-filter-role').value;
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    db.users.forEach(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchVal) || u.email.toLowerCase().includes(searchVal);
        const matchesRole = filterRole === 'all' || u.role === filterRole;
        
        if (matchesSearch && matchesRole) {
            let roleBadge = u.role === 'admin' 
                ? `<span class="badge-admin role-admin">Admin</span>` 
                : `<span class="badge-admin role-user">Thành viên</span>`;
                
            let statusBadge = u.status === 'active' 
                ? `<span class="badge-admin active-user">Hoạt động</span>` 
                : `<span class="badge-admin locked-user">Đang khóa</span>`;

            let actionButtons = '';
            if (u.role !== 'admin') {
                const toggleIcon = u.status === 'active' ? 'fa-lock' : 'fa-lock-open';
                actionButtons = `
                    <button class="btn-icon block" onclick="toggleUserLock('${u.email}')">
                        <i class="fas ${toggleIcon}"></i>
                    </button>
                    <button class="btn-icon view" onclick="viewUserHistory('${u.email}')">
                        <i class="fas fa-history"></i>
                    </button>
                `;
            } else {
                actionButtons = `<span style="font-size:0.75rem; color:var(--text-muted);">Không có thao tác</span>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td>
                        <div class="table-avatar">${u.name.charAt(0).toUpperCase()}</div>
                    </td>
                    <td style="font-weight: 600;">${u.name}</td>
                    <td>${u.email}</td>
                    <td>${roleBadge}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="actions-cell">${actionButtons}</div>
                    </td>
                </tr>
            `;
        }
    });
}

function toggleUserLock(email) {
    const user = db.users.find(u => u.email === email);
    if (!user) return;
    
    const actionText = user.status === 'active' ? 'KHOÁ' : 'MỞ KHOÁ';
    if (confirm(`Bạn có đồng ý ${actionText} tài khoản của người dùng ${user.name} (${email}) không?`)) {
        const list = db.users.map(u => {
            if (u.email === email) {
                return { ...u, status: u.status === 'active' ? 'locked' : 'active' };
            }
            return u;
        });
        saveDB('3hd2k_users', list);
        renderUsersTable();
    }
}

// View history modal of customer
function viewUserHistory(email) {
    const user = db.users.find(u => u.email === email);
    if (!user) return;
    
    document.getElementById('user-history-name').textContent = user.name;
    document.getElementById('user-history-email').textContent = user.email;
    
    const tbody = document.getElementById('user-history-tbody');
    tbody.innerHTML = '';
    
    const userBookings = db.bookings.filter(b => b.customerEmail === email);
    
    if (userBookings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;" class="text-muted">Chưa có giao dịch đặt vé nào.</td></tr>`;
    } else {
        userBookings.forEach(bk => {
            let statusBadge = '';
            if (bk.status === 'paid') statusBadge = `<span class="badge-admin paid">Đã thanh toán</span>`;
            else if (bk.status === 'pending') statusBadge = `<span class="badge-admin pending">Chờ duyệt</span>`;
            else statusBadge = `<span class="badge-admin cancelled">Đã hủy</span>`;

            tbody.innerHTML += `
                <tr>
                    <td style="font-weight:700; color:var(--primary-red);">${bk.id}</td>
                    <td style="font-weight:600;">${bk.movieTitle}</td>
                    <td style="font-size:0.8125rem;">${bk.showtime}</td>
                    <td>${bk.seats ? bk.seats.join(', ') : 'N/A'}</td>
                    <td style="font-weight:700; color:var(--primary-red);">${formatVND(bk.totalAmount)}</td>
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
    // 1. Build labels and data for monthly revenue
    // Standard months Jan-Dec
    const monthlyRev = Array(12).fill(0);
    const selectedYear = parseInt(document.getElementById('stats-year-filter').value) || 2026;

    db.bookings.forEach(bk => {
        if (bk.status === 'paid') {
            const date = new Date(bk.dateCreated);
            if (date.getFullYear() === selectedYear) {
                const monthIdx = date.getMonth();
                monthlyRev[monthIdx] += bk.totalAmount || 0;
            }
        }
    });

    // Destroy existing chart to avoid overlay issues on refresh
    if (revenueChartInstance) revenueChartInstance.destroy();
    
    const revCtx = document.getElementById('revenue-chart').getContext('2d');
    
    // Gradient fill for charts
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
                borderRadius: 4,
                hoverBackgroundColor: 'rgba(229, 9, 20, 0.85)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#f5f5f5', font: { family: 'Inter' } }
                }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.06)' },
                    ticks: {
                        color: '#888888',
                        callback: function(val) { return val / 1000 + 'k'; }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#888888' }
                }
            }
        }
    });

    // 2. Movie pie chart distribution
    const movieShare = {};
    db.bookings.forEach(bk => {
        if (bk.status === 'paid') {
            movieShare[bk.movieTitle] = (movieShare[bk.movieTitle] || 0) + (bk.totalAmount || 0);
        }
    });

    const movieLabels = Object.keys(movieShare);
    const movieData = Object.values(movieShare);

    if (moviePieChartInstance) moviePieChartInstance.destroy();
    
    const pieCtx = document.getElementById('movie-pie-chart').getContext('2d');
    
    moviePieChartInstance = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: movieLabels.length > 0 ? movieLabels : ['Chưa có dữ liệu'],
            datasets: [{
                data: movieData.length > 0 ? movieData : [100],
                backgroundColor: [
                    'rgba(229, 9, 20, 0.8)',
                    'rgba(30, 144, 255, 0.8)',
                    'rgba(46, 139, 87, 0.8)',
                    'rgba(218, 165, 32, 0.8)',
                    'rgba(138, 43, 226, 0.8)',
                    'rgba(219, 112, 147, 0.8)'
                ],
                borderColor: '#0c0c0c',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#f5f5f5', font: { family: 'Inter', size: 11 } }
                }
            }
        }
    });

    // 3. Best selling combo list
    const comboListEl = document.getElementById('top-selling-combos-list');
    if (comboListEl) {
        comboListEl.innerHTML = '';
        
        // Simulating sale rank based on stock levels and preset ranks
        // Since bookings only contain totalAmount, we list combos sorted by stock (inverse) & price
        const sortedCombos = [...db.combos].sort((a,b) => (150 - a.stock) - (150 - b.stock));
        
        sortedCombos.forEach((cb, idx) => {
            const soldCount = 150 - cb.stock; // Simulating sold count
            const SimulatedRevenue = soldCount * cb.price;
            
            comboListEl.innerHTML += `
                <div class="stat-list-item">
                    <div class="stat-item-left">
                        <div class="stat-rank">${idx + 1}</div>
                        <div>
                            <p class="stat-item-name">${cb.name}</p>
                            <p class="stat-item-sales">Đã bán: ${soldCount} phần</p>
                        </div>
                    </div>
                    <span class="stat-item-revenue">${formatVND(SimulatedRevenue)}</span>
                </div>
            `;
        });
    }
}

function updateRevenueChart() {
    renderStatsDashboard();
}

// Close modal if clicking outside content
window.addEventListener('click', (e) => {
    const movieModal = document.getElementById('movie-modal');
    const showtimeModal = document.getElementById('showtime-modal');
    const comboModal = document.getElementById('combo-modal');
    const userHistoryModal = document.getElementById('user-history-modal');
    
    if (e.target === movieModal) closeMovieModal();
    if (e.target === showtimeModal) closeShowtimeModal();
    if (e.target === comboModal) closeComboModal();
    if (e.target === userHistoryModal) closeUserHistoryModal();
});
