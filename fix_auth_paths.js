const fs = require('fs');


const filesToFix = [
    'frontend/src/auth/auth-services/authService.js',
    'frontend/src/auth/user-login/login.js',
    'frontend/src/auth/user-register/register.js',
    'frontend/src/user/vip-registration/app.js'
];

filesToFix.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (filePath.endsWith('authService.js')) {
            // Replace the whole logout function
            const newLogout = `export function logout() {
    clearCurrentUser();
    window.location.href = '/explore/home-page/index.html';
}`;
            content = content.replace(/export function logout\(\) \{[\s\S]*?window\.location\.href = prefix \+ '\/explore\/home-page\/index\.html';\n\}/, newLogout);
        } else {
            // Replace relative paths with absolute
            content = content.replace(/\.\.\/\.\.\/explore\/home-page\/index\.html/g, '/explore/home-page/index.html');
        }
        
        fs.writeFileSync(filePath, content);
        console.log(`Fixed ${filePath}`);
    } else {
        console.log(`File not found: ${filePath}`);
    }
});
