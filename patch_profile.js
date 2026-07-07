const fs = require('fs');

const path = 'frontend/src/user/user-profile/profile.js';
let content = fs.readFileSync(path, 'utf8');

// Replace DOB format and Gender checked logic
const target1 = `    const dobInput = document.getElementById('dob');
    if (dobInput) dobInput.value = dob || '';

    const genderInput = document.querySelector(\`input[name="gender"][value="\${gender}"]\`);
    if (genderInput) genderInput.checked = true;
}`;

const replacement1 = `    const dobInput = document.getElementById('dob');
    if (dobInput) {
        if (dob) {
            dobInput.value = dob.split('T')[0];
        } else {
            dobInput.value = '';
        }
    }

    const genderInput = document.querySelector(\`input[name="gender"][value="\${gender}"]\`);
    if (genderInput) genderInput.checked = true;
}

async function handleAvatarUpload(file) {
    if (!file) return;
    const email = document.getElementById('email').value || localStorage.getItem('userEmail');
    if (!email) {
        alert("Không tìm thấy email người dùng!");
        return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:5111/api/auth/update-avatar', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        if (response.ok) {
            const avatarEl = document.getElementById('sidebar-avatar');
            if (avatarEl) avatarEl.src = 'http://localhost:5111' + data.avatarUrl;
            localStorage.setItem('userAvatar', 'http://localhost:5111' + data.avatarUrl);
            alert("Đổi ảnh đại diện thành công!");
        } else {
            alert("Lỗi tải ảnh: " + data.message);
        }
    } catch (error) {
        console.error("Lỗi khi upload ảnh:", error);
        alert("Lỗi kết nối máy chủ khi tải ảnh.");
    }
}`;

content = content.replace(target1, replacement1);

// Replace initialization logic to add event listener
const target2 = `    try { initLogout(); } catch(e) { console.error('initLogout error:', e); }
}`;

const replacement2 = `    try { initLogout(); } catch(e) { console.error('initLogout error:', e); }

    const avatarInput = document.getElementById('avatar-input');
    if (avatarInput) {
        avatarInput.addEventListener('change', function() {
            const file = this.files[0];
            handleAvatarUpload(file);
        });
    }
}`;

content = content.replace(target2, replacement2);

fs.writeFileSync(path, content, 'utf8');
console.log("Patched profile.js");
