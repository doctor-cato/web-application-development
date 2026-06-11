const fs = require('fs');
let content = fs.readFileSync('src/shared/js/data.js', 'utf8');
content = content.replace(/"images\//g, '"../../shared/images/');
fs.writeFileSync('src/shared/js/data.js', content, 'utf8');
console.log('Fixed data.js paths');
