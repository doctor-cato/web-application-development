/**
 * pages/profile.js — Trang hồ sơ người dùng
 * ─────────────────────────────────────────────────────────────
 * Trách nhiệm:
 *   - Guard: redirect về login.html nếu chưa đăng nhập
 *   - Render thông tin tài khoản (tên, email, phone, ngày sinh)
 *   - Xử lý đổi ảnh đại diện (FileReader → LocalStorage)
 *   - Nút "Đăng xuất" → authService.logout() → redirect về index.html
 * ─────────────────────────────────────────────────────────────
 */

import { getSession, logout, updateProfile } from '/auth/auth-services/authService.js';
import { renderNavbar } from '/shared/components/navbar.js';
import { setupProfileUI } from './profile-ui.js';

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Guard check
    const session = getSession();
    if (!session) {
        window.location.href = '/auth/user-login/login.html';
        return;
    }

    // 2. Render Profile Info
    renderProfile(session);

    // 3. Setup event listeners
    setupEventListeners(session);
    
    // 4. Setup UI (Modals, accordions, etc)
    setupProfileUI();
});

// --- RENDER ---
function renderProfile(user) {
    // Sidebar
    document.getElementById('sidebar-name').textContent = user.name || 'Khách';
    document.getElementById('sidebar-avatar').src = user.avatar || '/shared/images/avatar.jpg';
    
    // Form
    document.getElementById('fullname').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('dob').value = user.dob || '';

    // Render navbar dropdown details if needed (navbar component handles most of this)
    // Update localstorage so that navbar can pickup avatar changes
    localStorage.setItem('userAvatar', user.avatar || '/shared/images/avatar.jpg');
    localStorage.setItem('userName', user.name || 'Khách');
}

// --- EVENT LISTENERS ---
function setupEventListeners(session) {
    // 1. Avatar upload
    const avatarInput = document.getElementById('avatar-input');
    if (avatarInput) {
        let newAvatarData = session.avatar;
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const img = new Image();
                    img.onload = function() {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 150;
                        const MAX_HEIGHT = 150;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                            }
                        } else {
                            if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                            }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        newAvatarData = canvas.toDataURL('image/jpeg', 0.7);
                        
                        // Update UI immediately
                        document.getElementById('sidebar-avatar').src = newAvatarData;
                        
                        const navbarAvatar = document.querySelector('.user-btn .user-avatar');
                        if (navbarAvatar) navbarAvatar.src = newAvatarData;
                        
                        const dropdownAvatar = document.querySelector('.user-header-avatar');
                        if (dropdownAvatar) dropdownAvatar.src = newAvatarData;
                        
                        // Save to session immediately
                        updateProfile({ avatar: newAvatarData });
                    };
                    img.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 2. Save profile form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = document.getElementById('fullname').value.trim();
            const newPhone = document.getElementById('phone').value.trim();
            const newDob = document.getElementById('dob').value;
            
            // Only name, phone, dob can be updated from this form, avatar is updated instantly
            const result = updateProfile({ 
                fullname: newName, 
                phone: newPhone, 
                dob: newDob 
            });

            if(result.ok){
                document.getElementById('sidebar-name').textContent = newName;
                const userNameEl = document.querySelector('.dropdown-user-info h4');
                if (userNameEl) userNameEl.textContent = newName;
                alert('Cập nhật thông tin thành công!');
            } else {
                 alert('Lỗi cập nhật: ' + result.error);
            }
        });
    }

    // 3. Logout
    const logoutBtn = document.getElementById('sidebar-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // 4. Tabs handling
    setupTabs();
}

function setupTabs() {
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    function switchTab(tabId) {
        history.replaceState(null, null, '#' + tabId);

        menuItems.forEach(i => i.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));
        
        const activeItem = document.querySelector(`.sidebar-menu .menu-item[data-tab="${tabId}"]`);
        if (activeItem) activeItem.classList.add('active');
        
        const targetTab = document.getElementById('tab-' + tabId);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            switchTab(this.getAttribute('data-tab'));
        });
    });

    if (window.location.hash) {
        const hashTab = window.location.hash.substring(1);
        const validTabs = ['info', 'history', 'offers', 'settings'];
        if (validTabs.includes(hashTab)) {
            switchTab(hashTab);
        }
    }
}
