import { getBookings, saveBookings } from '/shared/utils/storage.js';
import { getCurrentUser, clearCurrentUser, setCurrentUser } from '/auth/auth-services/storage.js';
import { updateProfile, logout } from '/auth/auth-services/authService.js';
import { setupProfileUI } from './profile-ui.js';

function formatPrice(amount) {
    if (!amount) return '0 đ';
    return amount.toLocaleString('vi-VN') + 'đ';
}

async function renderRealHistory() {
    const container = document.getElementById('real-history-container');
    if (!container) return;

    window._renderRealHistory = renderRealHistory;

    if (window.fetchMoviesPromise) {
        try {
            await window.fetchMoviesPromise;
        } catch(e) {}
    }

    let bookings = getBookings();
    if (!Array.isArray(bookings)) bookings = [];

    let needsSave = false;
    bookings.forEach(b => {
        if (!b.id) {
            b.id = '3HD2K-' + Math.random().toString(36).slice(2, 11).toUpperCase();
            needsSave = true;
        }
    });
    if (needsSave) saveBookings(bookings);

    if (bookings.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#aaa;"><i class="fas fa-ticket-alt" style="font-size:3rem;margin-bottom:1rem;display:block;"></i>Chưa có vé đặt nào.</div>';
        return;
    }

    const displayBookings = [...bookings].reverse();
    let html = '';

    displayBookings.forEach((booking, index) => {
        const isCancelled = booking.status === 'Cancelled' || booking.status === 'cancelled';
        const isGroup = booking.seats && booking.seats.length > 2;
        const seatStr = booking.seats ? booking.seats.join(', ') : 'N/A';
        const typeStr = isGroup ? 'group' : 'standard';

        const typeBadgeHtml = isGroup
            ? '<div style="margin-top:0.5rem;"><span style="background:rgba(16,185,129,0.2);color:#10b981;padding:2px 8px;border-radius:4px;font-size:0.75rem;border:1px solid rgba(16,185,129,0.4);">Vé Nhóm (Split & Lock)</span></div>'
            : '<div style="margin-top:0.5rem;"><span style="background:rgba(229,9,20,0.2);color:#ff4b4b;padding:2px 8px;border-radius:4px;font-size:0.75rem;border:1px solid rgba(229,9,20,0.3);">Vé Tiêu Chuẩn</span></div>';

                        let poster = booking.poster || '';
        let displayTitle = booking.movieTitle || 'Phim';

        if (window.allMoviesData) {
            let foundMovie = window.allMoviesData.find(m => m.id === booking.movieId);
            
            if (!foundMovie && booking.movieTitle) {
                foundMovie = window.allMoviesData.find(m => m.title && m.title.toLowerCase() === booking.movieTitle.toLowerCase());
            }

            if (!foundMovie && booking.movieTitle) {
                foundMovie = window.allMoviesData.find(m => m.title && (m.title.toLowerCase().includes(booking.movieTitle.toLowerCase()) || booking.movieTitle.toLowerCase().includes(m.title.toLowerCase())));
            }

            if (foundMovie) {
                poster = foundMovie.poster || foundMovie.bg || poster;
                displayTitle = foundMovie.title || displayTitle;
            }
        }

        if (poster.startsWith('images/')) poster = '/shared/' + poster;
        else if (poster.startsWith('assets/')) poster = '/shared/' + poster;
        if (!poster) poster = '/shared/images/f1_movie.jpg';

        const dateStr = booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('vi-VN') : 'N/A';
        const timeStr = booking.showtimeText || 'N/A';
        const totalStr = booking.total ? booking.total.toLocaleString('vi-VN') + 'đ' : '0đ';
        const roomStr = booking.room || 'Rạp';
        const posterSafe = poster.replace(/'/g, "\\'");
        const titleSafe = displayTitle.replace(/'/g, "\\'");
        const idStr = booking.id || '';
        const roomSafe  = (booking.room || 'Rạp').replace(/'/g, "\'");
        const cardStyle = isCancelled
            ? 'opacity:0.65;border:1px solid rgba(150,150,150,0.3)!important;box-shadow:none!important;'
            : 'border:1px solid rgba(229,9,20,0.3)!important;box-shadow:0 0 15px rgba(229,9,20,0.08)!important;';

        let actionHtml = '';
        if (isCancelled) {
            actionHtml = `
            <div class="history-action">
                <span class="status" style="background:rgba(255,255,255,0.1);color:#aaa;border:1px solid rgba(255,255,255,0.2);">Đã huỷ</span>
                <div class="history-price">${totalStr}</div>
                <div style="font-size:0.85rem;color:#e50914;margin-top:0.5rem;text-align:right;"><i class="fas fa-times-circle"></i> Đã hoàn tiền 80%</div>
            </div>`;
        } else {
            actionHtml = `
            <div class="history-action">
                <span class="status status-upcoming">Sắp chiếu</span>
                <div class="history-price">${totalStr}</div>
                <div style="display:flex;gap:0.75rem;margin-top:1rem;justify-content:flex-end;width:100%;">
                    <button onclick="openCancelModal('${titleSafe}','${timeStr}','${seatStr}','${totalStr}','${idStr}')" style="padding:0.35rem 1rem;font-size:0.8rem;font-family:'Inter',sans-serif;font-weight:500;border-radius:30px;background:transparent;border:1px solid rgba(229,9,20,0.5);color:#e50914;cursor:pointer;" onmouseover="this.style.background='rgba(229,9,20,0.1)'" onmouseout="this.style.background='transparent'">Huỷ vé</button>
                    <button onclick="openTicketModal('${typeStr}','${titleSafe}','${dateStr}','${timeStr}','${roomSafe}','${seatStr}','3HD2K Vincom Đồng Khởi','${poster}','${idStr}')" style="padding:0.35rem 1rem;font-size:0.8rem;font-family:'Inter',sans-serif;font-weight:500;border-radius:30px;background:#e50914;color:#fff;border:none;cursor:pointer;box-shadow:0 4px 10px rgba(229,9,20,0.3);">Xem mã vé</button>
                </div>
            </div>`;
        }

        html += `
            <div class="history-card" style="${cardStyle}">
                <div class="ticket-select-wrapper">
                    <input type="checkbox" class="ticket-cb" data-id="${idStr}" ${isCancelled ? 'disabled' : ''}>
                </div>
                <div class="history-img">
                    <img src="${poster}" alt="${titleSafe}">
                </div>
                <div class="history-info">
                    <h3>${titleSafe}</h3>
                    <p><i class="fas fa-map-marker-alt"></i> 3HD2K Vincom Đồng Khởi - ${roomSafe}</p>
                    <p><i class="fas fa-clock"></i> ${timeStr}</p>
                    <p><i class="fas fa-couch"></i> Ghế: ${seatStr}</p>
                    ${typeBadgeHtml}
                </div>
                ${actionHtml}
            </div>
        `;
    });

    container.innerHTML = html;

    const urlParams = new URLSearchParams(window.location.search);
    const bookingIdToOpen = urlParams.get('bookingId');
    if (bookingIdToOpen) {
        const target = displayBookings.find(b => b.id === bookingIdToOpen);
        if (target) {
            setTimeout(() => {
                const idx = displayBookings.indexOf(target);
                const btns = container.querySelectorAll('button');

                const allViewBtns = container.querySelectorAll('button:last-child');
                if (allViewBtns[idx]) {
                    allViewBtns[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    allViewBtns[idx].click();
                }
            }, 300);
        }
    }
}

function initTabs() {
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item:not(.logout)');
    const tabContents = document.querySelectorAll('.tab-content');

    function switchTab(tabId) {

        menuItems.forEach(m => m.classList.remove('active'));
        tabContents.forEach(t => t.classList.remove('active'));

        const item = Array.from(menuItems).find(m => m.getAttribute('data-tab') === tabId);
        if (item) item.classList.add('active');

        const targetId = 'tab-' + tabId;
        const targetTab = document.getElementById(targetId);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);

            window.history.pushState({}, '', '?tab=' + tabId);
        });
    });

    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
        switchTab(tab);
    }
}

function loadUserInfo() {
    const isLogged = localStorage.getItem('isLoggedIn') === 'true';
    let session = null;
    try {
        session = getCurrentUser();
    } catch(e) {
        console.error("getCurrentUser error", e);
    }

    let name  = (session && (session.fullname || session.fullName || session.name) && (session.fullname || session.fullName || session.name) !== 'Khách') ? (session.fullname || session.fullName || session.name) : '';
    let email = (session && session.email) ? session.email : '';
    let phone = (session && session.phone) ? session.phone : '';
    let avatar = (session && session.avatar) ? session.avatar : '';
    let dob = (session && (session.dob || session.dateOfBirth || session.date_of_birth)) ? (session.dob || session.dateOfBirth || session.date_of_birth) : '';
    let gender = (session && session.gender) ? session.gender : '';

    if (!session) {
        if (!name)   name   = localStorage.getItem('userName')  || '';
        if (!email)  email  = localStorage.getItem('userEmail') || '';
        if (!avatar) avatar = localStorage.getItem('userAvatar') || '';
        if (!phone)  phone  = localStorage.getItem('userPhone') || '';
        if (!dob)    dob    = localStorage.getItem('userDob') || '';
        if (!gender) gender = localStorage.getItem('userGender') || 'male';
    }

    if (email) {
        try {
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const found = users.find(u => u.email === email);
            if (found) {
                if (!name || name === 'Khách') name = found.fullname || found.name || name;
                if (!phone) phone = found.phone || phone;
                if (!avatar) avatar = found.avatar || avatar;
                if (!dob) dob = found.dob || found.dateOfBirth || found.date_of_birth || dob;
                if (!gender) gender = found.gender || gender;
            }
        } catch(e) {
            console.error('[Profile] registeredUsers read error', e);
        }
    }

    const nameEl = document.getElementById('sidebar-name');
    if (nameEl) nameEl.innerText = name || (email ? email.split('@')[0] : 'Khách');

    const avatarEl = document.getElementById('sidebar-avatar');
    if (avatarEl && avatar) avatarEl.src = avatar;

    let rewardsPoints = 0;
    try {
        const rewardsData = JSON.parse(localStorage.getItem('3hd2k_rewards') || '{}');
        rewardsPoints = rewardsData.points || 0;
    } catch(_) {}

    const vipEl = document.querySelector('.sidebar-vip');
    if (vipEl) {
        const isVip = localStorage.getItem('is_vip') === 'true';
        const vipPlan = (session && session.vip_plan) ? session.vip_plan : (localStorage.getItem('vip_plan') || '');
        if (isVip || vipPlan) {
            const planLabel = vipPlan ? vipPlan.charAt(0).toUpperCase() + vipPlan.slice(1) : '';
            vipEl.innerHTML = `<i class="fas fa-crown"></i> VIP ${planLabel} - <span id="sidebar-points">${rewardsPoints}</span> điểm`;
        } else {
            vipEl.innerHTML = `Hạng thường - <span id="sidebar-points">${rewardsPoints}</span> điểm`;
        }
    }

    const fullnameInput = document.getElementById('fullname');
    if (fullnameInput) fullnameInput.value = name || '';

    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.value = email || '';

    const phoneInput = document.getElementById('phone');
    if (phoneInput) phoneInput.value = phone || '';

    const dobInput = document.getElementById('dob');
    if (dobInput) {
        if (dob && typeof dob === 'string' && dob.includes('T')) {
            dob = dob.split('T')[0];
        }
        dobInput.value = dob || '';
    }

    const genderInput = document.querySelector(`input[name="gender"][value="${gender || 'male'}"]`);
    if (genderInput) genderInput.checked = true;

    let customerCode = localStorage.getItem('userCustomerCode');
    if (!customerCode) {
        customerCode = '3HD2K-' + Math.random().toString(36).slice(2, 8).toUpperCase();
        localStorage.setItem('userCustomerCode', customerCode);
    }
    const customerCodeInput = document.getElementById('customerCode');
    if (customerCodeInput) customerCodeInput.value = customerCode || '';

    const membershipInput = document.getElementById('membership');
    if (membershipInput) {
        const isVip = localStorage.getItem('is_vip') === 'true';
        const vipPlan = (session && session.vip_plan) ? session.vip_plan : (localStorage.getItem('vip_plan') || '');
        if (isVip || vipPlan) {
            const planLabel = vipPlan ? vipPlan.charAt(0).toUpperCase() + vipPlan.slice(1) : '';
            membershipInput.value = `VIP ${planLabel}`;
        } else {
            membershipInput.value = 'Thành viên thường';
        }
    }
}

function initLogout() {
    const logoutBtn = document.getElementById('sidebar-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                logout();
            }
        });
    }
}

function setupProfileForm() {
    const form = document.getElementById('profile-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const fullnameInput = document.getElementById('fullname');
        const phoneInput = document.getElementById('phone');
        const dobInput = document.getElementById('dob');
        const genderInput = document.querySelector('input[name="gender"]:checked');

        let updates = {};

        if (fullnameInput) {
            const newName = fullnameInput.value.trim();
            localStorage.setItem('userName', newName);
            updates.fullname = newName;

            const nameEl = document.getElementById('sidebar-name');
            if (nameEl) nameEl.innerText = newName || 'User';
        }

        if (phoneInput) {
            const newPhone = phoneInput.value.trim();
            localStorage.setItem('userPhone', newPhone);
            updates.phone = newPhone;
        }

        if (dobInput) {
            const newDob = dobInput.value;
            localStorage.setItem('userDob', newDob);
            updates.dob = newDob;
        }

        if (genderInput) {
            const newGender = genderInput.value;
            localStorage.setItem('userGender', newGender);
            updates.gender = newGender;
        }

        try {
            updateProfile(updates);
        } catch (error) {
            console.error('[Profile] updateProfile error', error);
        }

        const btn = form.querySelector('.btn-save');
        if (btn) {
            const origHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Đã lưu thành công!';
            btn.style.background = '#10b981';
            setTimeout(() => {
                btn.innerHTML = origHTML;
                btn.style.background = '';
            }, 2000);
        }
    });
}

function initAvatarBorders() {
    const avatarImg = document.getElementById('sidebar-avatar');
    const borderOptions = document.querySelectorAll('.border-option');
    if (!avatarImg || borderOptions.length === 0) return;

    let points = 0;
    try {
        const rewardsData = JSON.parse(localStorage.getItem('3hd2k_rewards') || '{}');
        points = rewardsData.points || 0;
    } catch(_) {}

    const requiredPoints = {
        'member': 0,
        'silver': 200,
        'gold': 500,
        'vjp': 1000,
        'diamond': 2000
    };

    let savedBorder = localStorage.getItem('userAvatarBorder') || 'member';
    if (points < requiredPoints[savedBorder]) {
        savedBorder = 'member';
        localStorage.setItem('userAvatarBorder', 'member');
    }

    applyBorder(savedBorder);

    borderOptions.forEach(option => {
        const borderType = option.getAttribute('data-border');
        const req = requiredPoints[borderType] || 0;

        if (points < req) {
            option.classList.add('locked');
            option.title = `Cần ${req} điểm để mở khóa`;

            const iconEl = document.createElement('i');
            iconEl.className = 'fas fa-lock';
            iconEl.style.position = 'absolute';
            iconEl.style.top = '10px';
            iconEl.style.right = '10px';
            iconEl.style.color = '#fff';
            iconEl.style.fontSize = '12px';
            iconEl.style.opacity = '0.7';
            option.style.position = 'relative';
            option.appendChild(iconEl);
        }

        option.addEventListener('click', () => {
            if (points < req) {
                alert(`Bạn cần đạt tối thiểu ${req} điểm để sử dụng viền này!`);
                return;
            }
            applyBorder(borderType);
            localStorage.setItem('userAvatarBorder', borderType);
        });
    });

    function applyBorder(borderType) {

        avatarImg.className = '';
        avatarImg.classList.add(`avatar-border-${borderType}`);

        borderOptions.forEach(opt => opt.classList.remove('active'));
        const activeOpt = document.querySelector(`.border-option[data-border="${borderType}"]`);
        if (activeOpt) activeOpt.classList.add('active');
    }
}

function setupAvatarUpload() {
    const avatarInput = document.getElementById('avatar-input');
    const avatarImg = document.getElementById('sidebar-avatar');

    if (!avatarInput || !avatarImg) return;

    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const base64Str = event.target.result;
            
            avatarImg.src = base64Str;
            
            localStorage.setItem('userAvatar', base64Str);
            
            let session = null;
            try {
                session = getCurrentUser();
            } catch(e) {}
            
            if (session) {
                session.avatar = base64Str;
                setCurrentUser(session);
            }
            
            try {
                const email = session ? session.email : localStorage.getItem('userEmail');
                if (email) {
                    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                    const foundIndex = users.findIndex(u => u.email === email);
                    if (foundIndex !== -1) {
                        users[foundIndex].avatar = base64Str;
                        localStorage.setItem('registeredUsers', JSON.stringify(users));
                    }
                }
            } catch(e) {}
        };
        reader.readAsDataURL(file);
    });
}

function initProfile() {
    try { initTabs(); } catch(e) { console.error('initTabs error:', e); }
    try { loadUserInfo(); } catch(e) { console.error('loadUserInfo error:', e); }
    try { setupProfileForm(); } catch(e) { console.error('setupProfileForm error:', e); }
    try { setupProfileUI(); } catch(e) { console.error('setupProfileUI error:', e); }
    try { renderRealHistory(); } catch(e) { console.error('renderRealHistory error:', e); }
    try { initLogout(); } catch(e) { console.error('initLogout error:', e); }
    try { initAvatarBorders(); } catch(e) { console.error('initAvatarBorders error:', e); }
    try { setupAvatarUpload(); } catch(e) { console.error('setupAvatarUpload error:', e); }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfile);
} else {
    initProfile();
}
