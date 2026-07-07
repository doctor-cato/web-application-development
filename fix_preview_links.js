const fs = require('fs');

function fixHomeJs() {
    let content = fs.readFileSync('frontend/src/explore/home-page/home.js', 'utf8');
    const original = content;

    // Replace renderNowShowing hover links
    content = content.replace(
        /<span class="btn-book" onclick="event\.preventDefault\(\); event\.stopPropagation\(\); if\(window\.requireAuth.*?return; window\.location\.href='\$\{detailUrl\}'">Đặt vé ngay<\/span>/g,
        `<div style="display:flex; gap:10px; width:90%; padding:0; margin: 0 auto;">
                            <span class="btn-book" style="flex:1; text-align:center; font-size:0.85rem;" onclick="event.preventDefault(); event.stopPropagation(); if(window.requireAuth && !window.requireAuth('Bạn cần đăng nhập để đặt vé xem phim. Hãy đăng nhập hoặc tạo tài khoản để tiếp tục.')) return; window.location.href='../../booking/seat-booking/booking.html?id=\${movie.id}'">Đặt vé</span>
                            \${movie.trailerWatch ? \`<span class="btn-book" style="flex:1; text-align:center; font-size:0.85rem; background:rgba(255,255,255,0.2)" onclick="event.preventDefault(); event.stopPropagation(); window.open('\${movie.trailerWatch}', '_blank')">Trailer</span>\` : ''}
                        </div>`
    );

    // Replace renderComingSoon hover links
    content = content.replace(
        /<span class="btn-book" onclick="event\.preventDefault\(\); event\.stopPropagation\(\); window\.location\.href='\$\{detailUrl\}'">Đặt trước vé<\/span>/g,
        `<div style="display:flex; gap:10px; width:90%; padding:0; margin: 0 auto;">
                            <span class="btn-book" style="flex:1; text-align:center; font-size:0.85rem;" onclick="event.preventDefault(); event.stopPropagation(); if(window.requireAuth && !window.requireAuth('Bạn cần đăng nhập để đặt vé xem phim. Hãy đăng nhập hoặc tạo tài khoản để tiếp tục.')) return; window.location.href='../../booking/seat-booking/booking.html?id=\${movie.id}'">Đặt trước</span>
                            \${movie.trailerWatch ? \`<span class="btn-book" style="flex:1; text-align:center; font-size:0.85rem; background:rgba(255,255,255,0.2)" onclick="event.preventDefault(); event.stopPropagation(); window.open('\${movie.trailerWatch}', '_blank')">Trailer</span>\` : ''}
                        </div>`
    );

    if (content !== original) {
        fs.writeFileSync('frontend/src/explore/home-page/home.js', content, 'utf8');
        console.log('Fixed home.js hover previews');
    }
}

function fixMoviesJs() {
    let content = fs.readFileSync('frontend/src/explore/movie-search/movies.js', 'utf8');
    const original = content;

    // The original uses an <a> tag for btn-book:
    // <a href="../../booking/seat-booking/booking.html?id=${movie.id}" class="btn-book" onclick="event.stopPropagation(); if(window.requireAuth && !window.requireAuth('Bạn cần đăng nhập để đặt vé. Hãy đăng nhập hoặc tạo tài khoản để tiếp tục.')) { event.preventDefault(); return false; }">
    //      ${currentTab === 'now-showing' ? 'Đặt vé ngay' : 'Đặt trước vé'}
    // </a>

    // Replace it with flex div containing both book and trailer
    content = content.replace(
        /<a href="\.\.\/\.\.\/booking\/seat-booking\/booking\.html\?id=\$\{movie\.id\}" class="btn-book" onclick="event\.stopPropagation\(\); if\(window\.requireAuth.*?\{ event\.preventDefault\(\); return false; \}">[\s\S]*?<\/a>/,
        `<div style="display:flex; gap:10px; width:90%; padding:0; margin: 0 auto; pointer-events: auto;">
                            <a href="../../booking/seat-booking/booking.html?id=\${movie.id}" class="btn-book" style="flex:1; text-align:center; font-size:0.85rem; padding: 8px 10px;" onclick="event.stopPropagation(); if(window.requireAuth && !window.requireAuth('Bạn cần đăng nhập để đặt vé. Hãy đăng nhập hoặc tạo tài khoản để tiếp tục.')) { event.preventDefault(); return false; }">
                                \${currentTab === 'now-showing' ? 'Đặt vé' : 'Đặt trước'}
                            </a>
                            \${movie.trailerWatch ? \`<span class="btn-book" style="flex:1; text-align:center; font-size:0.85rem; padding: 8px 10px; background:rgba(255,255,255,0.2); cursor:pointer;" onclick="event.preventDefault(); event.stopPropagation(); window.open('\${movie.trailerWatch}', '_blank')">Trailer</span>\` : ''}
                        </div>`
    );

    if (content !== original) {
        fs.writeFileSync('frontend/src/explore/movie-search/movies.js', content, 'utf8');
        console.log('Fixed movies.js hover previews');
    }
}

fixHomeJs();
fixMoviesJs();
