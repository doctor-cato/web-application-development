const fs = require('fs');
const path = require('path');
function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.html') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            // Replace ../../shared with /shared etc.
            content = content.replace(/(['"])(?:\.\.\/)+shared\//g, '$1/shared/');
            content = content.replace(/(['"])(?:\.\.\/)+booking\//g, '$1/booking/');
            content = content.replace(/(['"])(?:\.\.\/)+explore\//g, '$1/explore/');
            content = content.replace(/(['"])(?:\.\.\/)+auth\//g, '$1/auth/');
            
            // Fix CSS url() paths like url('../../shared/images/...')
            content = content.replace(/url\(['"]?(?:\.\.\/)+shared\//g, 'url(\'/shared/');
            
            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed', fullPath);
            }
        }
    }
}
traverseDir('frontend/src');
