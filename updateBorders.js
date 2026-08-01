const fs = require('fs');
let content = fs.readFileSync('frontend/src/shared/css/main.css', 'utf8');

const startStr = '/* ■■ AVATAR GLOBAL BORDER STYLES';
const startIdx = content.indexOf(startStr);

const newStyles = `/* ■■ AVATAR GLOBAL BORDER STYLES ■■■■■■■■■■■■■■■■■■■■■■■■■■ */
.avatar-border-member {
    border: 3px solid var(--primary-red) !important;
}

.avatar-border-silver {
    border: 3px solid #e0e0e0 !important;
    box-shadow: 0 0 10px rgba(224, 224, 224, 0.5);
}

.avatar-border-gold {
    border: 4px solid #ffd700 !important;
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.6), inset 0 0 10px rgba(255, 215, 0, 0.4);
    animation: pulse-gold 2.5s infinite;
}

.avatar-border-vjp {
    border: 3px solid #e50914 !important;
    box-shadow: 0 0 20px rgba(229, 9, 20, 0.8);
    animation: pulse-vjp 2s infinite;
}

.avatar-border-diamond {
    border: 5px solid #e5e4e2 !important; /* Bạch Kim / Platinum */
    box-shadow: 0 0 20px rgba(229, 228, 226, 0.8), 0 0 40px rgba(138, 43, 226, 0.5), inset 0 0 15px rgba(0, 240, 255, 0.5);
    animation: pulse-plat 3s infinite alternate;
}

@keyframes pulse-gold {
    0% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.6), inset 0 0 10px rgba(255, 215, 0, 0.4); border-color: #ffd700; }
    50% { box-shadow: 0 0 30px rgba(255, 215, 0, 1), inset 0 0 15px rgba(255, 215, 0, 0.7); border-color: #ffea70; }
    100% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.6), inset 0 0 10px rgba(255, 215, 0, 0.4); border-color: #ffd700; }
}

@keyframes pulse-vjp {
    0% { box-shadow: 0 0 10px rgba(229, 9, 20, 0.5); }
    50% { box-shadow: 0 0 25px rgba(229, 9, 20, 1); }
    100% { box-shadow: 0 0 10px rgba(229, 9, 20, 0.5); }
}

@keyframes pulse-plat {
    0% { 
        border-color: #e5e4e2;
        box-shadow: 0 0 20px rgba(229, 228, 226, 0.8), 0 0 40px rgba(138, 43, 226, 0.5), inset 0 0 15px rgba(0, 240, 255, 0.5);
    }
    50% { 
        border-color: #00f0ff;
        box-shadow: 0 0 35px rgba(0, 240, 255, 1), 0 0 60px rgba(255, 42, 95, 0.6), inset 0 0 25px rgba(255, 215, 0, 0.6);
    }
    100% { 
        border-color: #ff2a5f;
        box-shadow: 0 0 30px rgba(255, 42, 95, 0.9), 0 0 50px rgba(138, 43, 226, 0.7), inset 0 0 20px rgba(0, 240, 255, 0.5);
    }
}

/* ■■ AVATAR HOVER EFFECTS ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ */
[class*="avatar-border-"] {
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.3s ease, box-shadow 0.3s ease !important;
}

.avatar-border-member:hover {
    box-shadow: 0 0 15px var(--primary-red);
    transform: scale(1.05);
}

.avatar-border-silver:hover {
    box-shadow: 0 0 25px rgba(224, 224, 224, 1);
    transform: scale(1.05);
}

.avatar-border-gold:hover {
    box-shadow: 0 0 35px rgba(255, 215, 0, 1), inset 0 0 15px rgba(255, 215, 0, 0.5);
    transform: scale(1.08);
}

.avatar-border-vjp:hover {
    animation: none;
    box-shadow: 0 0 35px rgba(229, 9, 20, 1);
    transform: scale(1.08);
    filter: brightness(1.2);
}

.avatar-border-diamond:hover {
    animation: none;
    box-shadow: 0 0 50px rgba(0, 240, 255, 1), 0 0 30px rgba(255, 42, 95, 0.8);
    transform: scale(1.15) rotate(5deg);
    filter: brightness(1.3);
}
`;

if (startIdx !== -1) {
    content = content.substring(0, startIdx) + newStyles;
    fs.writeFileSync('frontend/src/shared/css/main.css', content);
    console.log('Successfully updated VIP borders in main.css');
} else {
    // Attempt with different unicode encoding if it was saved strangely
    const regex = /\/\* .*AVATAR GLOBAL BORDER STYLES/i;
    const match = regex.exec(content);
    if (match) {
        content = content.substring(0, match.index) + newStyles;
        fs.writeFileSync('frontend/src/shared/css/main.css', content);
        console.log('Successfully updated VIP borders in main.css via Regex');
    } else {
        console.error('Could not find AVATAR GLOBAL BORDER STYLES in main.css');
    }
}
