const fs = require('fs');

const files = [
    'frontend/src/shared/js/data.js',
    'frontend/src/booking/seat-booking/booking.js',
    'frontend/src/management/admin.html'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/http:\/\/\$\{window\.location\.hostname\}:5111/g, '');
        content = content.replace(/http:\/\/localhost:5111/g, '');
        fs.writeFileSync(file, content);
        console.log("Patched URLs in " + file);
    } else {
        console.log("File not found: " + file);
    }
});
