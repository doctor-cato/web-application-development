const fs = require('fs');
let content = fs.readFileSync('frontend/src/user/user-profile/profile.js', 'utf8');

const initProfileStr = `
function initProfile() {
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
}

`;

const setup2FAIdx = content.indexOf('function setup2FA() {');
if (setup2FAIdx !== -1) {
    content = content.substring(0, setup2FAIdx) + initProfileStr + content.substring(setup2FAIdx);
    fs.writeFileSync('frontend/src/user/user-profile/profile.js', content);
    console.log('Restored initProfile()');
} else {
    console.log('setup2FA not found');
}
