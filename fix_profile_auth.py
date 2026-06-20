import re

js_file = 'src/user/user-profile/profile.js'

with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update imports
old_import = "import { getBookings, lsGet, lsRemove, KEYS } from '../../shared/utils/storage.js';"
new_import = """import { getBookings } from '../../shared/utils/storage.js';
import { getCurrentUser, clearCurrentUser } from '../../auth/auth-services/storage.js';"""

if old_import in js:
    js = js.replace(old_import, new_import)

# 2. Update loadUserInfo
old_load = """function loadUserInfo() {
    const user = lsGet(KEYS.CURRENT_USER);
    if (user) {
        // Update Sidebar
        const nameEl = document.getElementById('sidebar-name');
        if (nameEl) nameEl.innerText = user.fullname || user.email.split('@')[0];
        
        const pointsEl = document.getElementById('sidebar-points');
        if (pointsEl) pointsEl.innerText = user.points || '120'; // dummy points

        // Update Form Inputs (if they exist in tab-info)
        const fullnameInput = document.getElementById('profile-fullname');
        if (fullnameInput) fullnameInput.value = user.fullname || '';
        
        const emailInput = document.getElementById('profile-email');
        if (emailInput) emailInput.value = user.email || '';
        
        const phoneInput = document.getElementById('profile-phone');
        if (phoneInput) phoneInput.value = user.phone || '0987654321';
    } else {
        // Not logged in, maybe redirect or keep as Guest
        const nameEl = document.getElementById('sidebar-name');
        if (nameEl) nameEl.innerText = 'Khách';
    }
}"""

new_load = """function loadUserInfo() {
    // Read from legacy keys or token if getCurrentUser works
    const user = getCurrentUser();
    const isLogged = localStorage.getItem('isLoggedIn') === 'true';
    
    if (user || isLogged) {
        const name = localStorage.getItem('userName') || (user ? user.name : '');
        const email = localStorage.getItem('userEmail') || (user ? user.email : '');
        const phone = '0987654321'; // Dummy phone
        
        // Update Sidebar
        const nameEl = document.getElementById('sidebar-name');
        if (nameEl) nameEl.innerText = name || email.split('@')[0] || 'User';
        
        const pointsEl = document.getElementById('sidebar-points');
        if (pointsEl) pointsEl.innerText = '120'; // dummy points

        // Update Form Inputs (if they exist in tab-info)
        const fullnameInput = document.getElementById('profile-fullname');
        if (fullnameInput) fullnameInput.value = name || '';
        
        const emailInput = document.getElementById('profile-email');
        if (emailInput) emailInput.value = email || '';
        
        const phoneInput = document.getElementById('profile-phone');
        if (phoneInput) phoneInput.value = phone;
    } else {
        // Not logged in, maybe redirect or keep as Guest
        const nameEl = document.getElementById('sidebar-name');
        if (nameEl) nameEl.innerText = 'Khách';
    }
}"""

if old_load in js:
    js = js.replace(old_load, new_load)

# 3. Update initLogout
old_logout = """function initLogout() {
    const logoutBtn = document.getElementById('sidebar-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                lsRemove(KEYS.CURRENT_USER);
                window.location.href = '../../index.html';
            }
        });
    }
}"""

new_logout = """function initLogout() {
    const logoutBtn = document.getElementById('sidebar-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                clearCurrentUser();
                window.location.href = '../../index.html';
            }
        });
    }
}"""

if old_logout in js:
    js = js.replace(old_logout, new_logout)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js)

print("Profile js patched to use correct auth methods.")
