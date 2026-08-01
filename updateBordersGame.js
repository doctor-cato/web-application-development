const fs = require('fs');
let content = fs.readFileSync('frontend/src/shared/css/main.css', 'utf8');

const regex = /\/\* ■■ AVATAR GLOBAL BORDER STYLES[\s\S]*?(?=\/\* ■■ AVATAR HOVER EFFECTS|\Z)/;

const newStyles = `/* ■■ AVATAR GLOBAL BORDER STYLES ■■■■■■■■■■■■■■■■■■■■■■■■■■ */

@property --angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
}

.avatar-border-member {
    border: 3px solid var(--primary-red) !important;
}

/* GAMING STYLE: SILVER (TITANIUM SWEEP) */
.avatar-border-silver {
    border: 4px solid transparent !important;
    border-radius: 50%;
    background: 
        linear-gradient(#141414, #141414) padding-box,
        linear-gradient(60deg, #3a3a5a, #b0b0d0, #ffffff, #b0b0d0, #3a3a5a) border-box;
    background-size: 100% 100%, 300% 300%;
    animation: metal-flow 3s linear infinite;
    box-shadow: 0 0 10px rgba(176, 176, 208, 0.4);
}
@keyframes metal-flow {
    0% { background-position: 0% 0%, 0% 50%; }
    100% { background-position: 0% 0%, 100% 50%; }
}

/* GAMING STYLE: GOLD (MYTHIC FIRE ROTATION) */
.avatar-border-gold {
    border: 5px solid transparent !important;
    border-radius: 50%;
    background: 
        linear-gradient(#141414, #141414) padding-box,
        conic-gradient(from var(--angle), #ff0000, #ff8c00, #ffd700, #ff8c00, #ff0000) border-box;
    animation: spin-conic 2.5s linear infinite;
    box-shadow: 0 0 20px rgba(255, 140, 0, 0.6);
}

.avatar-border-vjp {
    border: 4px solid transparent !important;
    border-radius: 50%;
    background: 
        linear-gradient(#141414, #141414) padding-box,
        conic-gradient(from var(--angle), #8a2be2, #e50914, #8a2be2) border-box;
    animation: spin-conic 2s linear infinite;
}

/* GAMING STYLE: PLATINUM (CHALLENGER RGB/COSMIC) */
.avatar-border-diamond {
    border: 6px solid transparent !important;
    border-radius: 50%;
    background: 
        linear-gradient(#141414, #141414) padding-box,
        conic-gradient(from var(--angle), #ff0000, #ff00ff, #0044ff, #00ffcc, #00ff00, #ffff00, #ff8800, #ff0000) border-box;
    animation: spin-conic 1.5s linear infinite;
    box-shadow: 0 0 25px rgba(0, 255, 204, 0.7), inset 0 0 10px rgba(0, 255, 204, 0.3);
}

@keyframes spin-conic {
    from { --angle: 0deg; }
    to { --angle: 360deg; }
}

`;

const match = regex.exec(content);
if (match) {
    content = content.replace(match[0], newStyles);
    fs.writeFileSync('frontend/src/shared/css/main.css', content);
    console.log('Replaced styles successfully.');
} else {
    console.log('Could not find the start string.');
}
