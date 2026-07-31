const http = require('http');

http.get('http://localhost:5111/api/movies', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const movies = JSON.parse(data);
        console.log("Total movies:", movies.length);
        if (movies.length > 0) {
            console.log("First movie trailerUrl:", movies[0].trailerUrl);
            console.log("First movie gallery:", movies[0].gallery);
        }
    });
}).on('error', err => {
    console.error("Error:", err.message);
});
