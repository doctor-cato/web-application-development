/**
 * movieCard.js
 * ─────────────────────────────────────────────────────────────
 * Component tạo HTML card hiển thị thông tin phim.
 *
 * Cách dùng:
 *   import { createMovieCard } from '../../shared/components/movieCard.js';
 *   container.appendChild(createMovieCard(movie));
 *
 * Trách nhiệm:
 *   createMovieCard(movie, tab) — Trả về DOM element cho 1 phim
 *                                 tab: 'now-showing' (default) | 'coming-soon'
 *
 * Props movie object:
 *   { id, title, genre[], rating, duration, poster, ageRating, isNowShowing }
 * ─────────────────────────────────────────────────────────────
 */

export function createMovieCard(movie, currentTab = 'now-showing') {
    const badgeClass = _ratingBadge(movie.age);
    let detailUrl = movie.id ? `../movie-details/index.html?id=${movie.id}` : '#';
    
    // Support for cinematch mode
    if (new URLSearchParams(window.location.search).get('cinematch') === 'true' || localStorage.getItem('cinematch_active') === 'true') {
        detailUrl += '&cinematch=true';
    }
    
    const tagsHtml = (movie.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
    
    const div = document.createElement('div');
    div.className = 'movie-card';
    div.onclick = () => window.location.href = detailUrl;
    div.style.cursor = 'pointer';
    
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
            <div class="movie-meta-row">
                <span class="duration"><i class="far fa-clock"></i> ${movie.duration}</span>
                <span class="age-badge ${badgeClass}">${movie.age}</span>
            </div>
            <div class="tags">${tagsHtml}</div>
        </div>
    `;
    
    return div;
}

// ponytail: createComingSoonCard removed — callers use createMovieCard(m,'coming-soon') directly

const AGE_BADGE = { '18': 'badge-18', 'C18': 'badge-18', '16': 'badge-16', 'C16': 'badge-16', '13': 'badge-13', 'C13': 'badge-13', 'K': 'badge-k' };
function _ratingBadge(age) {
    if (!age) return 'badge-p';
    const a = age.toString().toUpperCase();
    return Object.entries(AGE_BADGE).find(([k]) => a.includes(k))?.[1] ?? 'badge-p';
}
