const fs = require('fs');
let content = fs.readFileSync('frontend/src/user/user-profile/profile.js', 'utf8');

const regex = /function setupAvatarUpload\(\) \{[\s\S]*?\};\s*reader\.readAsDataURL\(file\);\s*\}/;

const newFn = `function setupAvatarUpload() {
    const avatarInput = document.getElementById('avatar-input');
    const avatarImg = document.getElementById('sidebar-avatar');

    if (!avatarInput || !avatarImg) return;

    avatarInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Visual feedback
        const originalSrc = avatarImg.src;
        avatarImg.style.opacity = '0.5';

        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(\`\${API_BASE_URL}/auth/upload-avatar\`, {
                method: 'POST',
                headers: {
                    'Authorization': \`Bearer \${token}\`
                },
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Lỗi khi upload ảnh');
            }

            const data = await response.json();
            
            // The backend returns avatarUrl like "/uploads/images/xxx.png"
            // We prepend the API_BASE_URL (removing /api) to make it absolute if needed, 
            // or just let the backend handle it. Let's use the exact path from backend:
            const avatarUrl = API_BASE_URL.replace('/api', '') + data.avatarUrl;

            // Update DOM
            avatarImg.src = avatarUrl;
            avatarImg.style.opacity = '1';

            // Update session
            let session = null;
            try { session = getCurrentUser(); } catch(e) {}
            if (session) {
                session.avatar = avatarUrl;
                setCurrentUser(session);
            }

            // Sync with old localStorage logic if needed
            localStorage.setItem('userAvatar', avatarUrl);
            
            const toast = window.toast || { success: alert, error: alert };
            if(window.toast) toast.success('Đã cập nhật ảnh đại diện thành công!');
            else alert('Đã cập nhật ảnh đại diện thành công!');
            
            // Reload to update navbar
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
}`;

const match = regex.exec(content);
if (match) {
    content = content.replace(match[0], newFn);
    fs.writeFileSync('frontend/src/user/user-profile/profile.js', content);
    console.log('setupAvatarUpload updated successfully');
} else {
    console.error('Regex match failed. Falling back to indexOf.');
    const startIdx = content.indexOf('function setupAvatarUpload() {');
    const endIdx = content.indexOf('function setup2FA()');
    if (startIdx !== -1 && endIdx !== -1) {
        content = content.substring(0, startIdx) + newFn + '\n\n' + content.substring(endIdx);
        fs.writeFileSync('frontend/src/user/user-profile/profile.js', content);
        console.log('Updated via indexOf');
    }
}
