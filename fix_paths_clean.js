const fs = require('fs');

function fixHomeJs() {
    let content = fs.readFileSync('frontend/src/explore/home-page/home.js', 'utf8');
    
    // Replace absolute links to relative
    content = content.replace(/\/explore\/movie-details\/index\.html/g, '../movie-details/index.html');
    content = content.replace(/\/booking\/seat-booking\/booking\.html/g, '../../booking/seat-booking/booking.html');

    fs.writeFileSync('frontend/src/explore/home-page/home.js', content, 'utf8');
}

function fixMoviesJs() {
    let content = fs.readFileSync('frontend/src/explore/movie-search/movies.js', 'utf8');
    
    // Replace absolute links to relative
    content = content.replace(/\/explore\/movie-details\/index\.html/g, '../movie-details/index.html');
    content = content.replace(/\/booking\/seat-booking\/booking\.html/g, '../../booking/seat-booking/booking.html');

    fs.writeFileSync('frontend/src/explore/movie-search/movies.js', content, 'utf8');
}

fixHomeJs();
fixMoviesJs();
