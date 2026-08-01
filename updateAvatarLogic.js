const fs = require('fs');

// Patch navbar.js
let navbar = fs.readFileSync('frontend/src/shared/components/navbar.js', 'utf8');
const navbarPatch = `
                let userBorder = localStorage.getItem('userAvatarBorder') || 'member';
                if (isVip && vipPlan) {
                    const planLower = vipPlan.toLowerCase();
                    // Auto-upgrade border if they haven't explicitly set one or if it's lower than their plan
                    if (userBorder === 'member') {
                        if (planLower === 'platinum') userBorder = 'diamond';
                        else if (planLower === 'gold') userBorder = 'gold';
                        else if (planLower === 'silver') userBorder = 'silver';
                        localStorage.setItem('userAvatarBorder', userBorder);
                    }
                }
                const borderClass = 'avatar-border-' + userBorder;
`;
navbar = navbar.replace("const borderClass = 'avatar-border-' + (localStorage.getItem('userAvatarBorder') || 'member');", navbarPatch);
fs.writeFileSync('frontend/src/shared/components/navbar.js', navbar);
console.log('navbar.js patched');

// Patch profile.js
let profile = fs.readFileSync('frontend/src/user/user-profile/profile.js', 'utf8');
const profilePatch = `
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
    try { session = JSON.parse(sessionStorage.getItem('userSession') || localStorage.getItem('userSession')); } catch(e) {}
    const isVip = localStorage.getItem('is_vip') === 'true' || (session && session.role === 'vip');
    const vipPlan = (localStorage.getItem('vip_plan') || (session && session.vip_plan) || '').toLowerCase();

    function hasAccess(bType) {
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
            if (vipPlan === 'platinum') savedBorder = 'diamond';
            else if (vipPlan === 'gold') savedBorder = 'gold';
            else if (vipPlan === 'silver') savedBorder = 'silver';
            else savedBorder = 'member';
        } else {
            savedBorder = 'member';
        }
        localStorage.setItem('userAvatarBorder', savedBorder);
    }
    
    // Force max VIP border if they are currently member
    if (savedBorder === 'member' && isVip) {
        if (vipPlan === 'platinum') savedBorder = 'diamond';
        else if (vipPlan === 'gold') savedBorder = 'gold';
        else if (vipPlan === 'silver') savedBorder = 'silver';
        localStorage.setItem('userAvatarBorder', savedBorder);
    }

    applyBorder(savedBorder);

    borderOptions.forEach(option => {
        const borderType = option.getAttribute('data-border');
        const req = requiredPoints[borderType] || 0;

        if (!hasAccess(borderType)) {
            option.classList.add('locked');
            option.title = \`Cần \${req} điểm hoặc thẻ VIP để mở khóa\`;

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
            if (!hasAccess(borderType)) {
                alert(\`Bạn cần đạt tối thiểu \${req} điểm hoặc đăng ký VIP để sử dụng viền này!\`);
                return;
            }
            applyBorder(borderType);
            localStorage.setItem('userAvatarBorder', borderType);
            
            // Reload the page to reflect in navbar or dispatch event
            window.location.reload();
        });
    });

    function applyBorder(borderType) {
        avatarImg.className = '';
        avatarImg.classList.add(\`avatar-border-\${borderType}\`);

        borderOptions.forEach(opt => opt.classList.remove('active'));
        const activeOpt = document.querySelector(\`.border-option[data-border="\${borderType}"]\`);
        if (activeOpt) activeOpt.classList.add('active');
    }
`;

const startIdx = profile.indexOf('let points = 0;');
const endIdx = profile.indexOf('function setupAvatarUpload()');
if (startIdx !== -1 && endIdx !== -1) {
    // We need to just replace up to the closing brace of initAvatarBorders
    const blockToReplace = profile.substring(startIdx, endIdx);
    profile = profile.replace(blockToReplace, profilePatch + '\n}\n\n');
    fs.writeFileSync('frontend/src/user/user-profile/profile.js', profile);
    console.log('profile.js patched');
} else {
    console.error('Could not find replace targets in profile.js');
}
