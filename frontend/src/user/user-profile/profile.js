import { getBookings, saveBookings } from '/shared/utils/storage.js';
import { getCurrentUser, clearCurrentUser, setCurrentUser } from '/auth/auth-services/storage.js';
import { updateProfile, logout, showLogoutModal } from '/auth/auth-services/authService.js';
import { setupProfileUI } from './profile-ui.js';
import { API_BASE_URL } from '/shared/utils/apiConfig.js';

function formatPrice(amount) {
    if (!amount) return '0 đ';
    return amount.toLocaleString('vi-VN') + 'đ';
}

function checkIsAdminUser(session) {
    if (!session) {
        try { session = getCurrentUser(); } catch(_) {}
    }
    const email = (localStorage.getItem('userEmail') || (session && session.email) || '').toLowerCase();
    const name = (localStorage.getItem('userName') || (session && (session.name || session.fullname)) || '').toLowerCase();
    const role = (localStorage.getItem('user_role') || localStorage.getItem('role') || (session && session.role) || '').toUpperCase();
    return role === 'ADMIN' || email.includes('admin') || name.includes('admin');
}

function showToast(message, type = 'info') {
    let container = document.getElementById('profile-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'profile-toast-container';
        container.style.cssText = 'position:fixed; top:24px; right:24px; z-index:99999; display:flex; flex-direction:column; gap:10px; pointer-events:none; font-family:"Inter", sans-serif;';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    const isSuccess = type === 'success';
    toast.style.cssText = `padding: 12px 20px; border-radius: 8px; font-size: 0.9rem; color: white; background: ${isSuccess ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)'}; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 10px 25px rgba(0,0,0,0.5); backdrop-filter: blur(10px); pointer-events: auto; transition: opacity 0.3s ease, transform 0.3s ease; transform: translateY(-10px); opacity: 0; font-weight: 500;`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
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

    let email = (session && session.email) || localStorage.getItem('userEmail') || '';
    let name  = (session && (session.fullname || session.fullName || session.name) && (session.fullname || session.fullName || session.name) !== 'Khách')
        ? (session.fullname || session.fullName || session.name)
        : (localStorage.getItem('userName') || '');
    let phone = (session && (session.phone || session.phoneNumber)) || localStorage.getItem('userPhone') || '';
    let avatar = (session && session.avatar) || localStorage.getItem('userAvatar') || '';
    let dob = (session && (session.dob || session.dateOfBirth || session.date_of_birth)) || localStorage.getItem('userDob') || '';
    let gender = (session && session.gender) || localStorage.getItem('userGender') || 'male';

    if (email) {
        try {
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const found = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
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

    if (!name && email) {
        name = email.split('@')[0];
    }

    const nameEl = document.getElementById('sidebar-name');
    if (nameEl) nameEl.innerText = name || 'Khách';

    const avatarEl = document.getElementById('sidebar-avatar');
    if (avatarEl && avatar) avatarEl.src = avatar;

    let rewardsPoints = 0;
    try {
        const rewardsData = JSON.parse(localStorage.getItem('3hd2k_rewards') || '{}');
        rewardsPoints = rewardsData.points || 0;
    } catch(_) {}

    const vipEl = document.querySelector('.sidebar-vip');
    if (vipEl) {
        const isAdmin = checkIsAdminUser(session);
        const isVip = localStorage.getItem('is_vip') === 'true' || isAdmin;
        const vipPlan = (session && session.vip_plan) ? session.vip_plan : (localStorage.getItem('vip_plan') || '');
        if (isAdmin) {
            vipEl.innerHTML = `<i class="fas fa-user-shield" style="color: #ff4b4b;"></i> QUẢN TRỊ VIÊN - <span id="sidebar-points">${rewardsPoints}</span> điểm (Mọi khung & Quyền lợi)`;
        } else if (isVip || vipPlan) {
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
    if (!customerCode && email) {
        let hash = 0;
        for (let i = 0; i < email.length; i++) hash = (hash << 5) - hash + email.charCodeAt(i);
        const codeStr = Math.abs(hash).toString(36).toUpperCase().padStart(6, 'X').slice(0, 6);
        customerCode = '3HD2K-' + codeStr;
        localStorage.setItem('userCustomerCode', customerCode);
    } else if (!customerCode) {
        customerCode = '3HD2K-' + Math.random().toString(36).slice(2, 8).toUpperCase();
        localStorage.setItem('userCustomerCode', customerCode);
    }

    const customerCodeInput = document.getElementById('customerCode');
    if (customerCodeInput) customerCodeInput.value = customerCode || '';

    const membershipInput = document.getElementById('membership');
    if (membershipInput) {
        const isAdmin = checkIsAdminUser(session);
        const isVip = localStorage.getItem('is_vip') === 'true' || isAdmin;
        const vipPlan = (session && session.vip_plan) ? session.vip_plan : (localStorage.getItem('vip_plan') || '');
        if (isAdmin) {
            membershipInput.value = 'Quản trị viên (Toàn quyền & Tất cả khung viền)';
        } else if (isVip || vipPlan) {
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
            showLogoutModal();
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
            setCurrentUser(updates);
            
            const email = (getCurrentUser() || {}).email || localStorage.getItem('userEmail');
            if (email) {
                const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                const idx = users.findIndex(u => u.email && u.email.toLowerCase() === email.toLowerCase());
                if (idx !== -1) {
                    users[idx] = { ...users[idx], ...updates };
                    localStorage.setItem('registeredUsers', JSON.stringify(users));
                }
            }

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
    
    let session = null;
    try { session = getCurrentUser(); } catch(e) {}
    const isAdmin = checkIsAdminUser(session);
    const isVip = localStorage.getItem('is_vip') === 'true' || (session && session.role === 'vip') || isAdmin;
    const vipPlan = (localStorage.getItem('vip_plan') || (session && session.vip_plan) || '').toLowerCase();

    function hasAccess(bType) {
        if (isAdmin) return true;
        if (points >= requiredPoints[bType]) return true;
        if (isVip) {
            if (vipPlan === 'platinum' && ['silver', 'gold', 'vjp', 'diamond'].includes(bType)) return true;
            if (vipPlan === 'gold' && ['silver', 'gold'].includes(bType)) return true;
            if (vipPlan === 'silver' && ['silver'].includes(bType)) return true;
        }
        return false;
    }

    let savedBorder = localStorage.getItem('userAvatarBorder') || 'member';
    if (!hasAccess(savedBorder)) {
        if (isVip) {
            if (isAdmin || vipPlan === 'platinum') savedBorder = 'diamond';
            else if (vipPlan === 'gold') savedBorder = 'gold';
            else if (vipPlan === 'silver') savedBorder = 'silver';
            else savedBorder = 'member';
        } else {
            savedBorder = 'member';
        }
        localStorage.setItem('userAvatarBorder', savedBorder);
    }
    
    if (savedBorder === 'member' && isVip) {
        if (isAdmin || vipPlan === 'platinum') savedBorder = 'diamond';
        else if (vipPlan === 'gold') savedBorder = 'gold';
        else if (vipPlan === 'silver') savedBorder = 'silver';
        localStorage.setItem('userAvatarBorder', savedBorder);
    }

    applyBorder(savedBorder);

    borderOptions.forEach(option => {
        const borderType = option.getAttribute('data-border');
        const req = requiredPoints[borderType] || 0;

        option.classList.remove('locked');
        const existingLock = option.querySelector('.fa-lock');
        if (existingLock) existingLock.remove();

        if (!hasAccess(borderType)) {
            option.classList.add('locked');
            option.title = `Cần ${req} điểm hoặc thẻ VIP để mở khóa`;

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

        option.onclick = (e) => {
            e.preventDefault();
            if (!hasAccess(borderType)) {
                showToast(`🔒 Cần tối thiểu ${req} điểm hoặc đăng ký VIP để sử dụng viền này!`, 'error');
                return;
            }
            applyBorder(borderType);
            localStorage.setItem('userAvatarBorder', borderType);
            showToast(`✨ Đã thay đổi viền đại diện thành công!`, 'success');
        };
    });

    function applyBorder(borderType) {
        avatarImg.className = '';
        avatarImg.classList.add(`avatar-border-${borderType}`);

        borderOptions.forEach(opt => opt.classList.remove('active'));
        const activeOpt = document.querySelector(`.border-option[data-border="${borderType}"]`);
        if (activeOpt) activeOpt.classList.add('active');
    }
}

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

    avatarInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        
        const originalSrc = avatarImg.src;
        avatarImg.style.opacity = '0.5';

        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/auth/upload-avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Lỗi khi upload ảnh');
            }

            const data = await response.json();
            
            
            
            
            const avatarUrl = API_BASE_URL.replace('/api', '') + data.avatarUrl;

            // Update DOM
            avatarImg.src = avatarUrl;
            avatarImg.style.opacity = '1';

            
            let session = null;
            try { session = getCurrentUser(); } catch(e) {}
            if (session) {
                session.avatar = avatarUrl;
                setCurrentUser(session);
            }

            
            localStorage.setItem('userAvatar', avatarUrl);
            
            const toast = window.toast || { success: alert, error: alert };
            if(window.toast) toast.success('Đã cập nhật ảnh đại diện thành công!');
            else alert('Đã cập nhật ảnh đại diện thành công!');
            
            
            setTimeout(() => window.location.reload(), 1000);

        } catch (error) {
            console.error('Upload avatar error:', error);
            avatarImg.src = originalSrc;
            avatarImg.style.opacity = '1';
            const toast = window.toast || { success: alert, error: alert };
            if(window.toast) toast.error('Không thể cập nhật ảnh: ' + error.message);
            else alert('Không thể cập nhật ảnh: ' + error.message);
        }
    });
}


async function loadRealOffers() {
    const grid = document.querySelector('.offers-grid');
    if (!grid) return;

    grid.innerHTML = '<div style="text-align:center;padding:2rem;color:#888;width:100%;grid-column:1/-1;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Đang tải ưu đãi...</p></div>';

    try {
        const res = await fetch(`${API_BASE_URL}/vouchers`);
        if (!res.ok) throw new Error('Network response was not ok');
        const vouchers = await res.json();
        
        grid.innerHTML = '';
        
        if (vouchers.length === 0) {
            grid.innerHTML = '<div style="text-align:center;padding:2rem;color:#888;width:100%;grid-column:1/-1;"><i class="fas fa-box-open fa-2x"></i><p>Hiện chưa có voucher nào.</p></div>';
            return;
        }

        vouchers.forEach(v => {
            let discountStr = v.discountType === 'PERCENTAGE' ? `Giảm ${v.discountValue}%` : `Giảm ${v.discountValue.toLocaleString('vi-VN')}đ`;
            let minOrderStr = v.minOrderAmount > 0 ? `Áp dụng cho hóa đơn từ ${v.minOrderAmount.toLocaleString('vi-VN')}đ.` : 'Áp dụng cho mọi hóa đơn.';
            let maxDiscountStr = v.discountType === 'PERCENTAGE' && v.maxDiscountAmount > 0 ? ` Giảm tối đa ${v.maxDiscountAmount.toLocaleString('vi-VN')}đ.` : '';
            let dateStr = v.expiryDate ? new Date(v.expiryDate).toLocaleDateString('vi-VN') : 'Không thời hạn';
            
            const card = document.createElement('div');
            card.className = 'offer-card discount';
            card.innerHTML = `
                <div class="offer-icon">
                    <i class="fas fa-tags"></i>
                </div>
                <div class="offer-details">
                    <h3>${v.code} - ${discountStr}</h3>
                    <p>${v.description || ''} ${minOrderStr}${maxDiscountStr}</p>
                    <span class="offer-date"><i class="far fa-clock"></i> HSD: ${dateStr}</span>
                </div>
                <button class="btn-use-offer" onclick="window.location.href='/explore/movie-search/index.html?tab=now-showing'">Dùng ngay</button>
            `;
            grid.appendChild(card);
        });
    } catch (e) {
        console.warn('Voucher API not available or empty, showing default empty state:', e);
        grid.innerHTML = '<div style="text-align:center;padding:2rem;color:#888;width:100%;grid-column:1/-1;"><i class="fas fa-box-open fa-2x"></i><p>Hiện chưa có voucher nào.</p></div>';
    }
}

async function fetchMe() {
    try {
        const token = localStorage.getItem('jwt_token') || localStorage.getItem('auth_token') || sessionStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            const session = getCurrentUser() || {};

            Object.keys(data).forEach(key => {
                if (data[key] === null || data[key] === undefined) {
                    delete data[key];
                }
            });

            const updated = { ...session, ...data };
            if (data.dateOfBirth) updated.dob = data.dateOfBirth;

            setCurrentUser(updated);
            
            if (data.fullname || data.name) localStorage.setItem('userName', data.fullname || data.name);
            if (data.email) localStorage.setItem('userEmail', data.email);
            if (data.phone) localStorage.setItem('userPhone', data.phone);
            if (data.dateOfBirth) localStorage.setItem('userDob', data.dateOfBirth);
            if (data.gender) localStorage.setItem('userGender', data.gender);
            if (data.avatar) localStorage.setItem('userAvatar', data.avatar);
            if (data.role) localStorage.setItem('user_role', data.role);
            if (data.vipPlan) localStorage.setItem('vip_plan', data.vipPlan);
            
            let rewards = {};
            try { rewards = JSON.parse(localStorage.getItem('3hd2k_rewards') || '{}'); } catch(e){}
            rewards.points = data.points || 0;
            localStorage.setItem('3hd2k_rewards', JSON.stringify(rewards));
        }
    } catch (e) {
        console.error('fetchMe error:', e);
    }
}

async function initProfile() {
    try { await fetchMe(); } catch(e) { console.error('fetchMe failed:', e); }
    try { initTabs(); } catch(e) { console.error('initTabs error:', e); }
    try { loadUserInfo(); } catch(e) { console.error('loadUserInfo error:', e); }
    try { setupProfileForm(); } catch(e) { console.error('setupProfileForm error:', e); }
    try { setupProfileUI(); } catch(e) { console.error('setupProfileUI error:', e); }
    try { renderRealHistory(); } catch(e) { console.error('renderRealHistory error:', e); }
    try { initLogout(); } catch(e) { console.error('initLogout error:', e); }
    try { initAvatarBorders(); } catch(e) { console.error('initAvatarBorders error:', e); }
    try { setupAvatarUpload(); } catch(e) { console.error('setupAvatarUpload error:', e); }
    try { setup2FA(); } catch(e) { console.error('setup2FA error:', e); }
    try { loadRealOffers(); } catch(e) { console.error('loadRealOffers error:', e); }
    
    window.addEventListener('vouchersUpdated', () => {
        console.log('Reloading offers due to SignalR update...');
        try { loadRealOffers(); } catch(e) { console.error('loadRealOffers error:', e); }
    });
}


function setup2FA() {
    const toggle2FA = document.getElementById('toggle-2fa');
    if (!toggle2FA) return;

    const session = getCurrentUser();
    if (session && session.isTwoFactorEnabled) {
        toggle2FA.checked = true;
    }

    toggle2FA.addEventListener('change', async (e) => {
        const isEnabled = e.target.checked;
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/toggle-2fa`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isEnabled })
            });

            if (response.ok) {
                const data = await response.json();
                if (session) {
                    session.isTwoFactorEnabled = data.isTwoFactorEnabled;
                    setCurrentUser(session);
                }
                const toast = window.toast || { success: alert, error: alert };
                if(window.toast) toast.success('Đã cập nhật trạng thái Xác minh hai bước.');
                else alert('Đã cập nhật trạng thái Xác minh hai bước.');
            } else {
                e.target.checked = !isEnabled;
                alert('Không thể cập nhật cấu hình 2FA.');
            }
        } catch (error) {
            e.target.checked = !isEnabled;
            console.error('Lỗi khi bật/tắt 2FA', error);
            alert('Lỗi kết nối khi cập nhật 2FA.');
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfile);
} else {
    initProfile();
}
