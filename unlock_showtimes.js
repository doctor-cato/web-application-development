const fs = require('fs');

function unlockShowtimes() {
    let content = fs.readFileSync('frontend/src/explore/movie-details/movie-detail.js', 'utf8');

    // Replace the lock time logic
    content = content.replace(
        /if \(now >= lockTime\) \{\s*status = 'past';\s*\}/g,
        `if (now >= lockTime) {
                        // status = 'past'; // Đã comment lại để luôn cho phép click đặt vé test (Demo mode)
                    }`
    );

    fs.writeFileSync('frontend/src/explore/movie-details/movie-detail.js', content, 'utf8');
}

unlockShowtimes();
