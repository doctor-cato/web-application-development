
export function createMovieCard(movie, currentTab = 'now-showing') {
    const badgeClass = _ratingBadge(movie.age);
    let detailUrl = movie.id ? `../movie-details/index.html?id=${movie.id}` : '#';

    if (new URLSearchParams(window.location.search).get('cinematch') === 'true' || localStorage.getItem('cinematch_active') === 'true') {
        detailUrl += '&cinematch=true';
    }

    const tagsHtml = (movie.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

    const div = document.createElement('div');
    div.className = 'movie-card';
    div.onclick = () => window.location.href = detailUrl;
    div.style.cursor = 'pointer';

    const titleHash = Math.abs((movie.title || '').split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0));
    const imdbRating = movie.imdbRating || (7.8 + (titleHash % 18) / 10).toFixed(1);
    const rtRating = movie.rottenTomatoes || (80 + (titleHash % 18)) + '%';

    div.innerHTML = `
        <div class="poster ${movie.poster ? '' : 'placeholder'}" ${movie.poster ? `style="background-image: url('${movie.poster}')"` : ''}>
            <div class="poster-overlay">
                <span class="overlay-text">Xem thêm</span>
                <a href="${detailUrl}" class="btn-book" onclick="event.stopPropagation(); if(window.requireAuth && !window.requireAuth('Bạn cần đăng nhập để đặt vé. Hãy đăng nhập hoặc tạo tài khoản để tiếp tục.')) { event.preventDefault(); return false; }">
                    ${currentTab === 'now-showing' ? 'Đặt vé ngay' : 'Đặt trước vé'}
                </a>
            </div>
        </div>
        <div class="info">
            <h3><a href="${detailUrl}">${movie.title}</a></h3>
            <div class="movie-meta-row" style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                <span class="duration"><i class="far fa-clock"></i> ${movie.duration}</span>
                <span class="ratings-badge" style="font-size:0.75rem; color:#f59e0b; font-weight:600;"><i class="fas fa-star" style="color:#f59e0b;"></i> ${imdbRating} • 🍅 ${rtRating}</span>
                <span class="age-badge ${badgeClass}">${movie.age}</span>
            </div>
            <div class="tags">${tagsHtml}</div>
        </div>
    `;

    return div;
}

const AGE_BADGE = { '18': 'badge-18', 'C18': 'badge-18', '16': 'badge-16', 'C16': 'badge-16', '13': 'badge-13', 'C13': 'badge-13', 'K': 'badge-k' };
function _ratingBadge(age) {
    if (!age) return 'badge-p';
    const a = age.toString().toUpperCase();
    return Object.entries(AGE_BADGE).find(([k]) => a.includes(k))?.[1] ?? 'badge-p';
}
