import { getBookings, saveBookings } from '../../shared/utils/storage.js';
import { getCurrentUser, clearCurrentUser, setCurrentUser } from '../../auth/auth-services/storage.js';
import { updateProfile } from '../../auth/auth-services/authService.js';
import { setupProfileUI } from './profile-ui.js';

function formatPrice(amount) {
    if (!amount) return '0 đ';
    return amount.toLocaleString('vi-VN') + 'đ';
}

function renderRealHistory() {
    const container = document.getElementById('real-history-container');
    if (!container) return;
    
    // Get all bookings from localStorage
    let bookings = getBookings();
    
    if (!Array.isArray(bookings)) {
        bookings = [];
    }
    
    // Reverse so newest is at the top
    bookings.reverse();
    
    let html = '';
    
    bookings.forEach((booking, index) => {
        const isGroup = booking.seats && booking.seats.length > 2;
        const seatStr = booking.seats ? booking.seats.join(', ') : 'N/A';
        const typeBadge = isGroup 
            ? `<div style="margin-top: 0.5rem;"><span style="background: rgba(16,185,129,0.2); color: #10b981; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; border: 1px solid rgba(16,185,129,0.4);">Vé Nhóm (Split & Lock)</span></div>` 
            : `<div style="margin-top: 0.5rem;"><span style="background: rgba(229, 9, 20, 0.2); color: #ff4b4b; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; border: 1px solid rgba(229, 9, 20, 0.3);">Vé Tiêu Chuẩn</span></div>`;
        
        // Use poster from booking or look it up from data.js
        let poster = booking.poster;
        
        // Try to lookup from data.js if poster is missing or we just want to be sure
        if (!poster && typeof heroMovies !== 'undefined' && typeof nowShowingMovies !== 'undefined') {
            const allMovies = [
                ...(typeof heroMovies !== 'undefined' ? heroMovies : []),
                ...(typeof nowShowingMovies !== 'undefined' ? nowShowingMovies : []),
                ...(typeof comingSoonMovies !== 'undefined' ? comingSoonMovies : [])
            ];
            const foundMovie = allMovies.find(m => m.title && booking.movieTitle && m.title.toLowerCase() === booking.movieTitle.toLowerCase());
            if (foundMovie) {
                poster = foundMovie.poster || foundMovie.bg;
            }
        }

        // Fix relative paths (images/... or assets/...) to point to /shared/
        if (poster && poster.startsWith('images/')) {
            poster = '/shared/' + poster;
        } else if (poster && poster.startsWith('assets/')) {
            poster = '/shared/' + poster;
        }

        // Fallbacks
        if (!poster) {
            if (booking.movieTitle && booking.movieTitle.toLowerCase().includes('war machine')) {
                poster = 'https://images.unsplash.com/photo-1534809027769-62466286b595?auto=format&fit=crop&w=400&q=80';
            } else if (booking.movieTitle && booking.movieTitle.toLowerCase().includes('interstellar')) {
                poster = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80';
            } else {
                // If nothing else, use a generic icon or the f1_movie.jpg
                poster = '/shared/images/f1_movie.jpg';
            }
        }

        const dateStr = booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('vi-VN') : 'N/A';
        const timeStr = booking.showtimeText || 'N/A';
        const typeStr = isGroup ? 'group' : 'single';
        const idStr = booking.id;
        const totalStr = formatPrice(booking.total);

        // Escape quotes in strings for onclick
        const titleSafe = booking.movieTitle ? booking.movieTitle.replace(/'/g, "\\'") : 'Phim';
        const roomSafe = booking.room ? booking.room.replace(/'/g, "\\'") : 'Rạp';
        
                let actionHtml = '';
        if (booking.status === 'Cancelled') {
            actionHtml = `
            <div class="history-action">
                <span class="status" id="real-status-${index}" style="background: rgba(255, 255, 255, 0.1); color: #aaa; border: 1px solid rgba(255, 255, 255, 0.2);">�? hu?</span>
                <div class="history-price">${totalStr}</div>
                <div style="font-size: 0.85rem; color: #e50914; margin-top: 0.5rem; text-align: right;"><i class="fas fa-times-circle"></i> �? ho�n ti?n 80%</div>
            </div>
            `;
        } else {
            actionHtml = `
            <div class="history-action">
                <span class="status status-upcoming" id="real-status-${index}">S?p chi?u</span>
                <div class="history-price">${totalStr}</div>
                <div style="display: flex; gap: 0.75rem; margin-top: 1rem; justify-content: flex-end; width: 100%;">
                    <button id="real-cancel-btn-${index}" onclick="openCancelModal('${titleSafe}', '${timeStr}', '${seatStr}', '${totalStr}', '${idStr}')" style="padding: 0.35rem 1rem; font-size: 0.8rem; font-family: 'Inter', sans-serif; font-weight: 500; border-radius: 30px; background: transparent; border: 1px solid rgba(229,9,20,0.5); color: #e50914; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(229,9,20,0.1)'; this.style.borderColor='#e50914'" onmouseout="this.style.background='transparent'; this.style.borderColor='rgba(229,9,20,0.5)'">Hu? v�</button>
                    <button id="real-view-btn-${index}" onclick="openTicketModal('${typeStr}', '${titleSafe}', '${dateStr}', '${timeStr}', '${roomSafe}', '${seatStr}', '3HD2K Vincom �?ng Kh?i', '${poster}', '${idStr}')" style="padding: 0.35rem 1rem; font-size: 0.8rem; font-family: 'Inter', sans-serif; font-weight: 500; border-radius: 30px; background: #e50914; color: #fff; border: 1px solid #e50914; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 10px rgba(229,9,20,0.3);" onmouseover="this.style.background='#ff4b4b'; this.style.boxShadow='0 6px 15px rgba(229,9,20,0.5)'" onmouseout="this.style.background='#e50914'; this.style.boxShadow='0 4px 10px rgba(229,9,20,0.3)'">Xem m? v�</button>
                </div>
            </div>
            `;
        }

        html += `
            <div class="history-card"  style="border: 1px solid rgba(16, 185, 129, 0.4) !important; box-shadow: 0 0 15px rgba(16, 185, 129, 0.1) !important;" ${booking.status === "Cancelled" ? "style=\"opacity:0.6\"" : ""}>
                
                <div class="ticket-select-wrapper">
                    <input type="checkbox" class="ticket-cb" data-id="${idStr}" data-index="${index}">
                </div>
                <div class="history-img">
                    <img src="${poster}" alt="${titleSafe}">
                </div>
                <div class="history-info">
                    <h3>${titleSafe}</h3>
                    <p><i class="fas fa-map-marker-alt"></i> 3HD2K Vincom Đồng Khởi - ${roomSafe}</p>
                    <p><i class="fas fa-clock"></i> ${timeStr}</p>
                    <p><i class="fas fa-couch"></i> Ghế: ${seatStr}</p>
                    ${typeBadge}
                </div>
                ${actionHtml}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Auto-open modal if URL has bookingId
    const urlParams = new URLSearchParams(window.location.search);
    const bookingIdToOpen = urlParams.get('bookingId');
    if (bookingIdToOpen) {
        const targetIndex = bookings.findIndex(b => b.id === bookingIdToOpen);
        if (targetIndex !== -1) {
            setTimeout(() => {
                const btn = document.getElementById(`real-view-btn-${targetIndex}`);
                if (btn) {
                    btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    btn.click();
                }
            }, 300);
        }
    }
}

function initTabs() {
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item:not(.logout)');
    const tabContents = document.querySelectorAll('.tab-content');

    function switchTab(tabId) {
        // Remove active from all tabs and menus
        menuItems.forEach(m => m.classList.remove('active'));
        tabContents.forEach(t => t.classList.remove('active'));
        
        // Add active to the requested item
        const item = Array.from(menuItems).find(m => m.getAttribute('data-tab') === tabId);
        if (item) item.classList.add('active');
        
        // Show corresponding tab
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
            // Optionally update URL
            window.history.pushState({}, '', '?tab=' + tabId);
        });
    });

    // Handle initial load from URL
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
        switchTab(tab);
    }
}

function loadUserInfo() {
    // ── 1. Detect login state ─────────────────────────────────────
    const isLogged = localStorage.getItem('isLoggedIn') === 'true';
    let session = null;
    try {
        session = getCurrentUser(); // reads auth_token
    } catch(e) {
        console.error("getCurrentUser error", e);
    }

    console.log('[Profile] isLogged:', isLogged, '| session:', session);

    if (!session && !isLogged) {
        // Truly not logged in
        const nameEl = document.getElementById('sidebar-name');
        if (nameEl) nameEl.innerText = 'Khách';
        return;
    }

    // ── 2. Gather data from all available sources ─────────────────
    // Priority: session (auth_token) > localStorage legacy keys > registered users list
    let name  = (session && session.name  && session.name  !== 'Khách') ? session.name  : '';
    let email = (session && session.email) ? session.email : '';
    let phone = (session && session.phone) ? session.phone : '';
    let avatar = (session && session.avatar) ? session.avatar : '';
    let dob = (session && session.dob) ? session.dob : '';
    let gender = (session && session.gender) ? session.gender : '';

    // Fallback to legacy localStorage keys
    if (!name)   name   = localStorage.getItem('userName')  || '';
    if (!email)  email  = localStorage.getItem('userEmail') || '';
    if (!avatar) avatar = localStorage.getItem('userAvatar') || '';
    if (!phone)  phone  = localStorage.getItem('userPhone') || '';
    if (!dob)    dob    = localStorage.getItem('userDob') || '';
    if (!gender) gender = localStorage.getItem('userGender') || 'male';

    // Last resort: look up from registered users using email
    if ((!name || name === 'Khách') && email) {
        try {
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const found = users.find(u => u.email === email);
            if (found) {
                name  = found.fullname || found.name || name;
                phone = found.phone || phone;
                avatar = found.avatar || avatar;
                dob = found.dob || dob;
                gender = found.gender || gender;
                console.log('[Profile] Found user in registeredUsers:', found);
            }
        } catch(e) {
            console.error('[Profile] registeredUsers parse error', e);
        }
    }

    console.log('[Profile] Resolved name:', name, '| email:', email);

    // ── 3. Update Sidebar ─────────────────────────────────────────
    const nameEl = document.getElementById('sidebar-name');
    if (nameEl) nameEl.innerText = name || (email ? email.split('@')[0] : 'User');

    const avatarEl = document.getElementById('sidebar-avatar');
    if (avatarEl && avatar) avatarEl.src = avatar;

    let rewardsPoints = 0;
    try {
        const rewardsData = JSON.parse(localStorage.getItem('3hd2k_rewards') || '{}');
        rewardsPoints = rewardsData.points || 0;
    } catch(_) {}

    // Update VIP / Hạng thường display
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

    // ── 4. Update Form Inputs ─────────────────────────────────────
    const fullnameInput = document.getElementById('fullname');
    if (fullnameInput) fullnameInput.value = name || '';

    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.value = email || '';

    const phoneInput = document.getElementById('phone');
    if (phoneInput) phoneInput.value = phone || '';

    const dobInput = document.getElementById('dob');
    if (dobInput) dobInput.value = dob || '';

    const genderInput = document.querySelector(`input[name="gender"][value="${gender}"]`);
    if (genderInput) genderInput.checked = true;
}

function initLogout() {
    const logoutBtn = document.getElementById('sidebar-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                try {
                    clearCurrentUser();
                } catch(e) {}
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userAvatar');
                localStorage.removeItem('is_vip');
                localStorage.removeItem('vip_plan');
                localStorage.removeItem('userPhone');
                window.location.href = '../../index.html';
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
            
            // Update sidebar
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

        // Try updating via authService to persist to registeredUsers
        try {
            updateProfile(updates);
        } catch (error) {
            console.error('[Profile] updateProfile error', error);
        }

        // Show feedback
        const btn = form.querySelector('.btn-save');
        if (btn) {
            const origText = btn.innerText;
            btn.innerText = 'Đã lưu thành công!';
            btn.style.background = '#10b981';
            setTimeout(() => {
                btn.innerText = origText;
                btn.style.background = '';
            }, 2000);
        }
    });
}

function initProfile() {
    try { initTabs(); } catch(e) { console.error('initTabs error:', e); }
    try { loadUserInfo(); } catch(e) { console.error('loadUserInfo error:', e); }
    try { setupProfileForm(); } catch(e) { console.error('setupProfileForm error:', e); }
    try { setupProfileUI(); } catch(e) { console.error('setupProfileUI error:', e); }
    try { renderRealHistory(); } catch(e) { console.error('renderRealHistory error:', e); }
    try { initLogout(); } catch(e) { console.error('initLogout error:', e); }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfile);
} else {
    initProfile();
}

// Handle ticket cancellation event from the static HTML modal
document.addEventListener('cancelTicket', (e) => {
    const ticketId = e.detail;
    if (!ticketId) return;

    let bookings = getBookings();
    if (!Array.isArray(bookings)) return;

    const bookingIndex = bookings.findIndex(b => b.id === ticketId);
    if (bookingIndex !== -1) {
        // Mark as cancelled
        bookings[bookingIndex].status = 'Cancelled';
        saveBookings(bookings);
        // Re-render
        renderRealHistory();
    }
});


