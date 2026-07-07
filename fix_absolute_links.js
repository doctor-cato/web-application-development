const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('frontend/src');

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.html') || fullPath.endsWith('.js')) {
            fixFile(fullPath);
        }
    }
}

function fixFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    const original = content;

    const relPath = path.relative(srcDir, filepath).replace(/\\/g, '/');
    const depth = relPath.split('/').length - 1;
    const prefix = depth === 0 ? './' : '../'.repeat(depth);
    const fileName = path.basename(filepath);

    if (fileName === 'authService.js') {
        const dynamicLogic = `const p = window.location.pathname;
    let prefix = '.';
    if (p.includes('/user-profile/') || p.includes('/user-notifications/') || p.includes('/user-login/') || p.includes('/user-register/') || p.includes('/group-booking/')) {
        prefix = '../../..';
    } else if (p.includes('/home-page/') || p.includes('/movie-search/') || p.includes('/movie-details/') || p.includes('/cinema-map/') || p.includes('/checkout/') || p.includes('/cancel-booking/') || p.includes('/seat-booking/')) {
        prefix = '../..';
    } else if (p.includes('/management/')) {
        prefix = '..';
    }
    window.location.href = prefix + '/explore/home-page/index.html';`;
        content = content.replace(/window\.location\.href\s*=\s*['"]\/explore\/home-page\/index\.html['"];/, dynamicLogic);
    } else {
        content = content.replace(/(['"])\/explore\//g, `$1${prefix}explore/`);
        content = content.replace(/action=(['"])\/explore\//g, `action=$1${prefix}explore/`);
    }

    if (content !== original) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Fixed ${relPath}`);
    }
}

traverseDir(srcDir);
