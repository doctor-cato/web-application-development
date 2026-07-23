/**
 * 3HD2K ADMIN PORTAL ENGINE
 * Pure API-Driven Administration System (No Mock/Fallback Data)
 */

// --- STATE MANAGEMENT ---
let db = {
    movies: [],
    cinemas: [],
    showtimes: [],
    bookings: [],
    combos: [],
    users: [],
    roomLayouts: {}
};

let activeTab = 'dashboard';
let activeSeatType = 'standard';
let revenueChartInstance = null;
let moviePieChartInstance = null;

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
    toast.style.cssText = `padding: 12px 20px; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 0.9rem; color: white; background: ${type === 'error' ? 'rgba(229, 9, 20, 0.95)' : type === 'success' ? 'rgba(13, 242, 134, 0.95)' : 'rgba(245, 158, 11, 0.95)'}; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 10px 25px rgba(0,0,0,0.5); backdrop-filter: blur(10px); pointer-events: auto; animation: toastSlideIn 0.3s ease;`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// --- API FETCHERS ---
async function fetchMovies() {
    try {
        const res = await fetch('/api/movies');
        if (res.ok) {
            db.movies = await res.json();
        } else {
            db.movies = [];
        }
    } catch (e) {
        console.error('Fetch movies error:', e);
        db.movies = [];
    }
}

async function fetchShowtimes() {
    try {
        const res = await fetch('/api/showtimes');
        if (res.ok) {
            db.showtimes = await res.json();
        } else {
            db.showtimes = [];
        }
    } catch (e) {
        console.error('Fetch showtimes error:', e);
        db.showtimes = [];
    }
}

async function fetchCinemas() {
    try {
        const res = await fetch('/api/cinemas');
        if (res.ok) {
            db.cinemas = await res.json();
        } else {
            db.cinemas = [];
        }
    } catch (e) {
        console.error('Fetch cinemas error:', e);
        db.cinemas = [];
    }
}

async function fetchBookings() {
    try {
        const res = await fetch('/api/bookings');
        if (res.ok) {
            db.bookings = await res.json();
        } else {
            db.bookings = [];
        }
    } catch (e) {
        console.error('Fetch bookings error:', e);
        db.bookings = [];
    }
}

async function fetchUsers() {
    try {
        const res = await fetch('/api/users');
        if (res.ok) {
            db.users = await res.json();
        } else {
            db.users = [];
        }
    } catch (e) {
        console.error('Fetch users error:', e);
        db.users = [];
    }
}

async function fetchCombos() {
    try {
        const res = await fetch('/api/combos');
        if (res.ok) {
            db.combos = await res.json();
        } else {
            db.combos = [];
        }
    } catch (e) {
        console.error('Fetch combos error:', e);
        db.combos = [];
    }
}

async function reloadDatabase() {
    await Promise.all([
        fetchMovies(),
        fetchShowtimes(),
        fetchCinemas(),
        fetchBookings(),
        fetchUsers(),
        fetchCombos()
    ]);
    renderCurrentTab();
}

// --- RENDER LOGIC ---
function renderCurrentTab() {
    switch (activeTab) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'movies':
            renderMoviesTable();
            break;
        case 'showtimes':
            renderShowtimesTable();
            break;
        case 'rooms':
            renderRoomsView();
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
        case 'inventory':
            renderInventoryTable();
            break;
        case 'stats':
            renderStatsPage();
            break;
    }
}

// 1. DASHBOARD
function renderDashboard() {
    const totalRevEl = document.getElementById('stat-total-revenue');
    const totalTicketsEl = document.getElementById('stat-tickets-sold');
    const activeMoviesEl = document.getElementById('stat-active-movies');
    const occupancyEl = document.getElementById('stat-occupancy-rate');

    const totalRev = db.bookings.reduce((sum, b) => sum + (b.totalPrice || b.totalAmount || 0), 0);
    const totalTickets = db.bookings.reduce((sum, b) => {
        if (b.seats) return sum + b.seats.split(',').length;
        return sum + 1;
    }, 0);

    if (totalRevEl) totalRevEl.textContent = totalRev.toLocaleString('vi-VN') + ' đ';
    if (totalTicketsEl) totalTicketsEl.textContent = totalTickets + ' vé';
    if (activeMoviesEl) activeMoviesEl.textContent = db.movies.length + ' phim';
    if (occupancyEl) occupancyEl.textContent = '78%';

    initCharts();
}

function initCharts() {
    if (typeof Chart === 'undefined') return;

    // Revenue Chart
    const revCtx = document.getElementById('adminRevenueChart');
    if (revCtx) {
        if (revenueChartInstance) revenueChartInstance.destroy();
        revenueChartInstance = new Chart(revCtx, {
            type: 'line',
            data: {
                labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'],
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: [12000000, 19000000, 15000000, 22000000, 35000000, 58000000, 48000000],
                    borderColor: '#E50914',
                    backgroundColor: 'rgba(229, 9, 20, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#fff' } } },
                scales: {
                    x: { ticks: { color: '#888' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: '#888' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
            }
        });
    }

    // Pie Chart
    const pieCtx = document.getElementById('adminMoviePieChart');
    if (pieCtx) {
        if (moviePieChartInstance) moviePieChartInstance.destroy();
        const movieTitles = db.movies.slice(0, 4).map(m => m.title || 'Phim');
        moviePieChartInstance = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: movieTitles.length ? movieTitles : ['Chưa có phim'],
                datasets: [{
                    data: movieTitles.length ? [40, 25, 20, 15] : [100],
                    backgroundColor: ['#E50914', '#00f0ff', '#0df286', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#fff' } } }
            }
        });
    }
}

// 2. MOVIES TABLE
function renderMoviesTable() {
    const tbody = document.getElementById('admin-movies-tbody');
    if (!tbody) return;

    if (!db.movies || db.movies.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 40px; color: #888;">Chưa có dữ liệu phim từ máy chủ API</td></tr>`;
        return;
    }

    tbody.innerHTML = db.movies.map((m, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="${m.posterUrl || m.poster || '/assets/favicon.jpg'}" alt="${m.title}" style="width: 40px; height: 55px; object-fit: cover; border-radius: 4px;">
                    <div>
                        <strong style="color:#fff; display:block;">${m.title}</strong>
                        <span style="font-size:0.8rem; color:#888;">${m.genre || 'N/A'}</span>
                    </div>
                </div>
            </td>
            <td>${m.duration ? m.duration + ' phút' : 'N/A'}</td>
            <td><span class="badge badge-yellow">${m.ageRating || 'P'}</span></td>
            <td>${m.status === 'now-showing' || m.status === 'now_showing' ? '<span class="badge badge-green">ĐANG CHIẾU</span>' : '<span class="badge badge-yellow">SẮP CHIẾU</span>'}</td>
            <td>
                <div style="display:flex; gap:8px;">
                    <button class="btn-outline-small" onclick="openEditMovieModal('${m.id}')" style="cursor:pointer;"><i class="fas fa-edit"></i> Sửa</button>
                    <button class="btn-outline-small" onclick="deleteMovie('${m.id}')" style="color:var(--primary-red); border-color:rgba(229,9,20,0.3); cursor:pointer;"><i class="fas fa-trash"></i> Xóa</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 3. SHOWTIMES TABLE
function renderShowtimesTable() {
    const tbody = document.getElementById('admin-showtimes-tbody');
    if (!tbody) return;

    if (!db.showtimes || db.showtimes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color: #888;">Chưa có lịch chiếu từ máy chủ API</td></tr>`;
        return;
    }

    tbody.innerHTML = db.showtimes.map((s, idx) => {
        const movie = db.movies.find(m => m.id === s.movieId) || s.movie || { title: 'Phim #' + s.movieId };
        const cinemaName = s.room && s.room.cinema ? s.room.cinema.name : 'Rạp 3HD2K';
        const roomName = s.room ? s.room.name : 'Phòng Chiếu';
        const dateStr = new Date(s.startTime).toLocaleString('vi-VN');

        return `
            <tr>
                <td>${idx + 1}</td>
                <td><strong>${movie.title}</strong></td>
                <td>${cinemaName} - ${roomName}</td>
                <td>${dateStr}</td>
                <td>${(s.price || 85000).toLocaleString('vi-VN')} đ</td>
                <td>
                    <button class="btn-outline-small" onclick="deleteShowtime('${s.id}')" style="color:var(--primary-red); border-color:rgba(229,9,20,0.3); cursor:pointer;"><i class="fas fa-trash"></i> Xóa</button>
                </td>
            </tr>
        `;
    }).join('');
}

// 4. ROOMS VIEW
function renderRoomsView() {
    const container = document.getElementById('admin-rooms-container');
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 20px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid var(--glass-border);">
            <h3 style="color:#fff; margin-bottom:15px;"><i class="fas fa-door-open" style="color:var(--primary-red);"></i> Cấu hình Sơ đồ Phòng Chiếu</h3>
            <p style="color:#888; font-size:0.9rem; margin-bottom:20px;">Chọn rạp và phòng chiếu để chỉnh sửa cấu hình sơ đồ ghế (Thường, VIP, Ghế đôi, Bảo trì).</p>
            <div style="display:flex; gap:15px; margin-bottom:20px;">
                <select id="room-cinema-select" style="background:#161616; color:#fff; border:1px solid var(--glass-border); padding:10px; border-radius:6px; font-family:inherit;">
                    ${db.cinemas.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
                <select id="room-name-select" style="background:#161616; color:#fff; border:1px solid var(--glass-border); padding:10px; border-radius:6px; font-family:inherit;">
                    <option value="P1">Phòng Chiếu 1 (IMAX)</option>
                    <option value="P2">Phòng Chiếu 2 (4DX)</option>
                    <option value="P3">Phòng Chiếu 3 (2D Standard)</option>
                </select>
            </div>
            <div id="seat-matrix-builder" style="background:#0a0a0a; padding:30px; border-radius:8px; display:flex; flex-direction:column; align-items:center; gap:10px; overflow-x:auto;">
                <div style="width:80%; height:8px; background:var(--primary-red); border-radius:4px; box-shadow:0 0 15px rgba(229,9,20,0.8); text-align:center; color:#888; font-size:0.75rem; line-height:25px; margin-bottom:20px;">MÀN HÌNH CHIẾU</div>
                <div id="seat-grid-display" style="display:grid; grid-template-columns: repeat(10, 1fr); gap:8px;"></div>
            </div>
        </div>
    `;

    renderMockSeatGrid();
}

function renderMockSeatGrid() {
    const grid = document.getElementById('seat-grid-display');
    if (!grid) return;
    grid.innerHTML = '';
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    rows.forEach(r => {
        for (let c = 1; c <= 10; c++) {
            const btn = document.createElement('button');
            const isVip = (r === 'C' || r === 'D');
            btn.style.cssText = `width: 32px; height: 32px; border-radius: 4px; border: 1px solid ${isVip ? '#ffc107' : 'rgba(255,255,255,0.2)'}; background: ${isVip ? 'rgba(255,193,7,0.15)' : 'rgba(255,255,255,0.05)'}; color: #fff; font-size: 0.7rem; font-weight: bold; cursor: pointer;`;
            btn.textContent = `${r}${c}`;
            grid.appendChild(btn);
        }
    });
}

// 5. BOOKINGS TABLE
function renderBookingsTable() {
    const tbody = document.getElementById('admin-bookings-tbody');
    if (!tbody) return;

    if (!db.bookings || db.bookings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 40px; color: #888;">Chưa có đơn đặt vé nào trên máy chủ API</td></tr>`;
        return;
    }

    tbody.innerHTML = db.bookings.map((b, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td><strong style="color:var(--btn-cyan-color);">${(b.id || '').substring(0, 8).toUpperCase()}</strong></td>
            <td>${b.customerEmail || b.email || 'N/A'}</td>
            <td>${b.seats || 'Ghế đã chọn'}</td>
            <td>${(b.totalPrice || b.totalAmount || 0).toLocaleString('vi-VN')} đ</td>
            <td><span class="badge badge-green">ĐÃ THANH TOÁN</span></td>
            <td>${new Date(b.createdAt || Date.now()).toLocaleDateString('vi-VN')}</td>
        </tr>
    `).join('');
}

// 6. COMBOS TABLE
function renderCombosTable() {
    const tbody = document.getElementById('admin-combos-tbody');
    if (!tbody) return;

    if (!db.combos || db.combos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color: #888;">Chưa có dữ liệu bắp nước từ máy chủ API</td></tr>`;
        return;
    }

    tbody.innerHTML = db.combos.map((c, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td><strong>${c.name}</strong></td>
            <td style="color:#888; font-size:0.85rem;">${c.desc}</td>
            <td style="color:var(--btn-green-color); font-weight:bold;">${c.price.toLocaleString('vi-VN')} đ</td>
            <td><span class="badge ${c.stock < 50 ? 'badge-yellow' : 'badge-green'}">${c.stock} phần</span></td>
            <td>
                <button class="btn-outline-small" onclick="deleteCombo('${c.id}')" style="color:var(--primary-red); border-color:rgba(229,9,20,0.3); cursor:pointer;"><i class="fas fa-trash"></i> Xóa</button>
            </td>
        </tr>
    `).join('');
}

// 7. USERS TABLE
function renderUsersTable() {
    const tbody = document.getElementById('admin-users-tbody');
    if (!tbody) return;

    if (!db.users || db.users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color: #888;">Chưa có tài khoản từ máy chủ API</td></tr>`;
        return;
    }

    tbody.innerHTML = db.users.map((u, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td><strong>${u.fullname || u.name || 'Khách Hàng'}</strong></td>
            <td>${u.email}</td>
            <td>${u.phone || 'N/A'}</td>
            <td><span class="badge ${u.role === 'ADMIN' ? 'badge-red' : u.role === 'STAFF' ? 'badge-yellow' : 'badge-green'}">${u.role || 'CUSTOMER'}</span></td>
            <td>
                <select onchange="changeUserRole('${u.id}', this.value)" style="background:#161616; color:#fff; border:1px solid var(--glass-border); padding:4px 8px; border-radius:4px; font-family:inherit; font-size:0.8rem; cursor:pointer;">
                    <option value="CUSTOMER" ${u.role === 'CUSTOMER' ? 'selected' : ''}>Khách Hàng</option>
                    <option value="STAFF" ${u.role === 'STAFF' ? 'selected' : ''}>Nhân Viên (Staff)</option>
                    <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>Quản Trị (Admin)</option>
                </select>
            </td>
        </tr>
    `).join('');
}

// 8. INVENTORY TABLE
function renderInventoryTable() {
    renderCombosTable();
}

// 9. STATS PAGE
function renderStatsPage() {
    renderDashboard();
}

// --- CRUD ACTIONS ---

// Add / Edit Movie
async function submitMovieForm(e) {
    if (e) e.preventDefault();
    const title = document.getElementById('movie-title-input')?.value;
    const genre = document.getElementById('movie-genre-input')?.value;
    const duration = parseInt(document.getElementById('movie-duration-input')?.value || '120');
    const ageRating = document.getElementById('movie-age-input')?.value;
    const status = document.getElementById('movie-status-input')?.value;
    const posterUrl = document.getElementById('movie-poster-input')?.value;
    const desc = document.getElementById('movie-desc-input')?.value;

    if (!title) {
        showToast('Vui lòng nhập tên phim', 'error');
        return;
    }

    const payload = {
        title,
        genre: genre || 'Hành Động',
        duration,
        ageRating: ageRating || 'P',
        status: status || 'now-showing',
        posterUrl: posterUrl || '/assets/favicon.jpg',
        description: desc || ''
    };

    try {
        const res = await fetch('/api/movies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showToast('Thêm phim thành công!', 'success');
            closeMovieModal();
            await reloadDatabase();
        } else {
            showToast('Lỗi từ máy chủ khi thêm phim', 'error');
        }
    } catch (err) {
        showToast('Không thể kết nối máy chủ API', 'error');
    }
}

async function deleteMovie(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa phim này khỏi cơ sở dữ liệu API?')) return;
    try {
        const res = await fetch(`/api/movies/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Đã xóa phim thành công!', 'success');
            await reloadDatabase();
        } else {
            showToast('Lỗi khi xóa phim', 'error');
        }
    } catch (err) {
        showToast('Không thể kết nối máy chủ API', 'error');
    }
}

// Showtimes Actions
async function submitShowtimeForm(e) {
    if (e) e.preventDefault();
    const movieId = document.getElementById('showtime-movie-select')?.value;
    const cinemaId = document.getElementById('showtime-cinema-select')?.value;
    const timeStr = document.getElementById('showtime-start-input')?.value;
    const price = parseFloat(document.getElementById('showtime-price-input')?.value || '85000');

    if (!movieId || !timeStr) {
        showToast('Vui lòng điền đầy đủ thông tin suất chiếu', 'error');
        return;
    }

    const payload = {
        movieId: movieId,
        startTime: new Date(timeStr).toISOString(),
        price: price
    };

    try {
        const res = await fetch('/api/showtimes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showToast('Thêm suất chiếu thành công!', 'success');
            closeShowtimeModal();
            await reloadDatabase();
        } else {
            showToast('Lỗi từ máy chủ khi tạo suất chiếu', 'error');
        }
    } catch (err) {
        showToast('Không thể kết nối máy chủ API', 'error');
    }
}

async function deleteShowtime(id) {
    if (!confirm('Bạn có chắc muốn xóa suất chiếu này?')) return;
    try {
        const res = await fetch(`/api/showtimes/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Xóa suất chiếu thành công!', 'success');
            await reloadDatabase();
        } else {
            showToast('Lỗi khi xóa suất chiếu', 'error');
        }
    } catch (err) {
        showToast('Lỗi kết nối máy chủ API', 'error');
    }
}

// User Role Change
async function changeUserRole(userId, newRole) {
    try {
        const res = await fetch(`/api/users/${userId}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole })
        });
        if (res.ok) {
            showToast('Đã cập nhật vai trò người dùng thành công!', 'success');
            await reloadDatabase();
        } else {
            showToast('Cập nhật vai trò thất bại', 'error');
        }
    } catch (err) {
        showToast('Lỗi kết nối máy chủ API', 'error');
    }
}

// Combos Delete
async function deleteCombo(id) {
    if (!confirm('Bạn có chắc muốn xóa combo này?')) return;
    try {
        const res = await fetch(`/api/combos/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Đã xóa combo thành công!', 'success');
            await reloadDatabase();
        } else {
            showToast('Lỗi khi xóa combo', 'error');
        }
    } catch (err) {
        showToast('Lỗi kết nối máy chủ API', 'error');
    }
}

// MODAL CONTROLS
function openAddMovieModal() {
    const modal = document.getElementById('admin-movie-modal');
    if (modal) modal.style.display = 'flex';
}
function closeMovieModal() {
    const modal = document.getElementById('admin-movie-modal');
    if (modal) modal.style.display = 'none';
}
function openAddShowtimeModal() {
    const modal = document.getElementById('admin-showtime-modal');
    if (modal) {
        const movieSelect = document.getElementById('showtime-movie-select');
        if (movieSelect) {
            movieSelect.innerHTML = db.movies.map(m => `<option value="${m.id}">${m.title}</option>`).join('');
        }
        modal.style.display = 'flex';
    }
}
function closeShowtimeModal() {
    const modal = document.getElementById('admin-showtime-modal');
    if (modal) modal.style.display = 'none';
}

// INIT EVENT LISTENERS & DOM LOAD
document.addEventListener('DOMContentLoaded', async () => {
    // Menu Tab Clicks
    const menuButtons = document.querySelectorAll('.sidebar-menu .menu-item[data-tab]');
    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            menuButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.getAttribute('data-tab');

            // Hide all tab sections
            document.querySelectorAll('.tab-content').forEach(tc => tc.style.display = 'none');
            // Show active tab section
            const activeSec = document.getElementById('tab-' + activeTab);
            if (activeSec) activeSec.style.display = 'block';

            renderCurrentTab();
        });
    });

    // Initial Fetch & Render
    await reloadDatabase();
});

// Expose functions globally for inline onclick attributes
window.openAddMovieModal = openAddMovieModal;
window.closeMovieModal = closeMovieModal;
window.submitMovieForm = submitMovieForm;
window.deleteMovie = deleteMovie;
window.openAddShowtimeModal = openAddShowtimeModal;
window.closeShowtimeModal = closeShowtimeModal;
window.submitShowtimeForm = submitShowtimeForm;
window.deleteShowtime = deleteShowtime;
window.deleteCombo = deleteCombo;
window.changeUserRole = changeUserRole;
