const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('frontend/src');

function fixFilePaths(filePath) {
    if (!filePath.endsWith('.html') && !filePath.endsWith('.js')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    const relPath = path.relative(srcDir, filePath).replace(/\\/g, '/');
    const depth = relPath.split('/').length - 1;
    const prefix = depth === 0 ? './' : '../'.repeat(depth);

    content = content.replace(/(href|src)=["']\/([^"']+)["']/g, (match, attr, p1) => {
        if (p1.startsWith('shared/') || p1.startsWith('explore/') || p1.startsWith('booking/') || p1.startsWith('auth/') || p1.startsWith('user/') || p1.startsWith('engagement/') || p1.startsWith('footer/')) {
            return attr + '="' + prefix + p1 + '"';
        }
        return match;
    });

    content = content.replace(/from\s+["']\/([^"']+)["']/g, (match, p1) => {
        if (p1.startsWith('shared/') || p1.startsWith('explore/') || p1.startsWith('booking/') || p1.startsWith('auth/') || p1.startsWith('user/') || p1.startsWith('engagement/') || p1.startsWith('footer/')) {
            return 'from \'' + prefix + p1 + '\'';
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Fixed:', relPath);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else {
            fixFilePaths(fullPath);
        }
    }
}

traverseDir(srcDir);
