const fs = require('fs');

function refineHomeJs() {
    let content = fs.readFileSync('frontend/src/explore/home-page/home.js', 'utf8');

    // Replace the div we injected previously with a cleaner version
    content = content.replace(
        /<div style="display:flex; gap:10px; width:90%; padding:0; margin: 0 auto;">[\s\S]*?<\/div>/g,
        `<div style="display:flex; gap:10px; margin-top:15px; width:90%; justify-content:center;">
                            <a class="btn-book" style="margin-top:0; flex:1; text-align:center; padding:8px 0; font-size:0.85rem;" href="../../booking/seat-booking/booking.html?id=\${movie.id}" onclick="event.stopPropagation(); if(window.requireAuth && !window.requireAuth('Bạn cần đăng nhập để đặt vé xem phim. Hãy đăng nhập hoặc tạo tài khoản để tiếp tục.')) { event.preventDefault(); return false; }">Đặt vé</a>
                            \${movie.trailerWatch ? \`<a class="btn-book" style="margin-top:0; flex:1; text-align:center; padding:8px 0; font-size:0.85rem; background:rgba(255,255,255,0.2);" href="\${movie.trailerWatch}" target="_blank" onclick="event.stopPropagation();">Trailer</a>\` : ''}
                        </div>`
    );

    fs.writeFileSync('frontend/src/explore/home-page/home.js', content, 'utf8');
}

function refineMoviesJs() {
    let content = fs.readFileSync('frontend/src/explore/movie-search/movies.js', 'utf8');

    content = content.replace(
        /<div style="display:flex; gap:10px; width:90%; padding:0; margin: 0 auto; pointer-events: auto;">[\s\S]*?<\/div>/g,
        `<div style="display:flex; gap:10px; margin-top:15px; width:90%; justify-content:center; pointer-events: auto;">
                            <a class="btn-book" style="margin-top:0; flex:1; text-align:center; padding:8px 0; font-size:0.85rem;" href="../../booking/seat-booking/booking.html?id=\${movie.id}" onclick="event.stopPropagation(); if(window.requireAuth && !window.requireAuth('Bạn cần đăng nhập để đặt vé. Hãy đăng nhập hoặc tạo tài khoản để tiếp tục.')) { event.preventDefault(); return false; }">
                                \${currentTab === 'now-showing' ? 'Đặt vé' : 'Đặt trước'}
                            </a>
                            \${movie.trailerWatch ? \`<a class="btn-book" style="margin-top:0; flex:1; text-align:center; padding:8px 0; font-size:0.85rem; background:rgba(255,255,255,0.2);" href="\${movie.trailerWatch}" target="_blank" onclick="event.stopPropagation();">Trailer</a>\` : ''}
                        </div>`
    );

    fs.writeFileSync('frontend/src/explore/movie-search/movies.js', content, 'utf8');
}

refineHomeJs();
refineMoviesJs();
