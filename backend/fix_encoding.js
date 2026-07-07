const fs = require('fs');
let file = fs.readFileSync('C:/Users/Le Minh Khuong 1/web-application-development (1)/web-application-development/backend/SeedMovies.sql', 'utf8');
file = file.replace(/VALUES \('/g, "VALUES (N'");
file = file.replace(/, '/g, ", N'");
fs.writeFileSync('C:/Users/Le Minh Khuong 1/web-application-development (1)/web-application-development/backend/SeedMovies.sql', file, 'utf8');
console.log("Done");
