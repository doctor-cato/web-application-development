const fs = require('fs');

function restoreHomeJs() {
    let content = fs.readFileSync('frontend/src/explore/home-page/home.js', 'utf8');

    // Replace the DOMContentLoaded listener
    content = content.replace(
        /document\.addEventListener\('DOMContentLoaded', \(\) => \{\s*renderNowShowing\(nowShowingMovies\);\s*/,
        `document.addEventListener('DOMContentLoaded', async () => {
    if (window.fetchMoviesPromise) {
        await window.fetchMoviesPromise;
    }
    
    // Initialize hero movie (now that data is loaded)
    if (heroMovies[0] && heroMovies[0].trailer) {
        iframe.src = heroMovies[0].trailer + '?enablejsapi=1';
        if (trailerYtLink && heroMovies[0].trailerWatch) {
            trailerYtLink.href = heroMovies[0].trailerWatch;
        }
        if (btnWatch) btnWatch.style.display = 'inline-flex';
    } else {
        if (btnWatch) btnWatch.style.display = 'none';
    }
    if (btnBookNow && heroMovies[0] && heroMovies[0].id) {
        btnBookNow.href = \`../movie-details/index.html?id=\${heroMovies[0].id}\`;
    }
    
    // Update content explicitly on first load to replace mock data
    if (heroMovies.length > 0) {
        changeHeroSlide(0);
    }

    renderNowShowing(nowShowingMovies);
    if (typeof renderComingSoon === 'function') {
        renderComingSoon(comingSoonMovies);
    }
    `
    );

    // I also need to make sure I don't leave the old duplicate logic at the top level
    // Wait, let's just leave the top level fallback logic as it was, it doesn't hurt.

    fs.writeFileSync('frontend/src/explore/home-page/home.js', content, 'utf8');
}

restoreHomeJs();
