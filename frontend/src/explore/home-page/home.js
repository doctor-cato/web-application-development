let currentHeroIndex = 0;
const heroSection = document.getElementById('hero-section');
const heroContent = document.getElementById('hero-content');
const titleEl = document.getElementById('hero-title');
const metaEl = document.getElementById('hero-meta');
const descEl = document.getElementById('hero-desc');
const ageEl = document.getElementById('hero-age');

// --- TRAILER MODAL ELEMENTS (khai báo sớm để dùng trong slider) ---
const modal = document.getElementById('trailer-modal');
const btnWatch = document.getElementById('btn-watch-trailer');
const btnClose = document.getElementById('close-modal');
const iframe = document.getElementById('trailer-video');
const trailerFallback = document.getElementById('trailer-fallback');
const trailerYtLink = document.getElementById('trailer-yt-link');
const btnBookNow = document.getElementById('btn-book-now');

// --- YOUTUBE EMBED HELPER ---
function getYouTubeEmbedUrl(url) {
    if (!url) return '';
    let cleanUrl = url.trim();
    let videoId = '';
    
    if (cleanUrl.includes('embed/')) {
        videoId = cleanUrl.split('embed/')[1]?.split('?')[0]?.split('&')[0];
    } else if (cleanUrl.includes('v=')) {
        videoId = cleanUrl.split('v=')[1]?.split('&')[0];
    } else if (cleanUrl.includes('youtu.be/')) {
        videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0];
    } else if (cleanUrl.match(/^[a-zA-Z0-9_-]{11}$/)) {
        videoId = cleanUrl;
    }

    if (videoId) {
        const origin = (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') 
            ? encodeURIComponent(window.location.origin) 
            : '';
        const originParam = origin ? `&origin=${origin}` : '';
        return `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&rel=0${originParam}`;
    }
    return cleanUrl;
}

function renderHeroMovie(movie) {
    if (!movie || (!movie.title && !movie.bg && !movie.poster)) {
        // Trạng thái CHƯA CÓ PHIM trong Database
        if (titleEl) titleEl.textContent = "CHƯA CÓ PHIM TRONG DATABASE";
        if (metaEl) metaEl.innerHTML = '<i class="fas fa-info-circle" style="color: var(--primary-red); margin-right: 6px;"></i> Hệ thống chưa có dữ liệu phim';
        if (descEl) descEl.textContent = "Hiện tại chưa có dữ liệu phim trong cơ sở dữ liệu. Khi cơ sở dữ liệu được cập nhật hình ảnh hoặc tiêu đề phim, phim mới sẽ tự động hiển thị để thay thế.";
        if (ageEl) ageEl.style.display = 'none';
        if (btnBookNow) btnBookNow.style.display = 'none';
        if (btnWatch) btnWatch.style.display = 'none';
        if (heroSection) heroSection.style.setProperty('--hero-bg-url', 'linear-gradient(135deg, #141414, #1f1f2e)');
        if (btnPrev) btnPrev.style.display = 'none';
        if (btnNext) btnNext.style.display = 'none';
        return;
    }

    // Trạng thái ĐÃ CÓ PHIM từ Database
    if (titleEl) titleEl.textContent = movie.title || 'Phim Không Tiêu Đề';
    if (metaEl) metaEl.innerHTML = movie.meta ? movie.meta.replace(/•/g, '&bull;') : 'Thông tin đang cập nhật';
    if (descEl) descEl.textContent = movie.desc || 'Nội dung phim đang được cập nhật...';
    
    if (ageEl) {
        ageEl.textContent = movie.age || 'P';
        ageEl.style.display = 'inline-block';
    }

    if (btnBookNow) {
        btnBookNow.style.display = 'inline-flex';
        if (movie.id) btnBookNow.href = `/booking/seat-booking/booking.html?movieId=${movie.id}`;
    }

    if (btnWatch) {
        btnWatch.style.display = movie.trailer ? 'inline-flex' : 'none';
    }

    if (heroSection && (movie.bg || movie.poster)) {
        const bgUrl = movie.bg || movie.poster;
        heroSection.style.setProperty('--hero-bg-url', `url('${bgUrl}')`);
        const bgOverlay = document.getElementById('hero-bg-overlay');
        if (bgOverlay) bgOverlay.style.backgroundImage = `url('${bgUrl}')`;
    }

    if (movie.trailer && iframe) {
        const embedUrl = getYouTubeEmbedUrl(movie.trailer);
        const sep = embedUrl.includes('?') ? '&' : '?';
        iframe.src = embedUrl + `${sep}enablejsapi=1`;
        if (trailerYtLink) {
            trailerYtLink.href = movie.trailerWatch || movie.trailer;
        }
    }

    const hasMultiple = window.heroMovies && window.heroMovies.length > 1;
    if (btnPrev) btnPrev.style.display = hasMultiple ? 'flex' : 'none';
    if (btnNext) btnNext.style.display = hasMultiple ? 'flex' : 'none';
}

const handleHeroRender = () => {
    const validHeroMovies = (window.heroMovies || []).filter(m => m.status === 'now-showing');
    if (validHeroMovies.length > 0 && (validHeroMovies[0].title || validHeroMovies[0].bg)) {
        renderHeroMovie(validHeroMovies[0]);
    } else {
        renderHeroMovie(null);
    }
};

if (window.fetchMoviesPromise) {
    window.fetchMoviesPromise.then(handleHeroRender).catch(handleHeroRender);
} else {
    handleHeroRender();
}

if (btnBookNow) {
    btnBookNow.addEventListener('click', (e) => {
        if (window.requireAuth && !window.requireAuth('Bạn cần đăng nhập để đặt vé xem phim. Hãy đăng nhập hoặc tạo tài khoản để tiếp tục.')) {
            e.preventDefault();
        }
    });
}

function changeHeroSlide(direction = 1) {
    if (!window.heroMovies || window.heroMovies.length === 0) return;
    
    currentHeroIndex = (currentHeroIndex + direction + window.heroMovies.length) % window.heroMovies.length;
    const movie = window.heroMovies[currentHeroIndex];

    const bgOverlay = document.getElementById('hero-bg-overlay');

    if (heroContent) {
        heroContent.style.opacity = 0;
        heroContent.style.transform = direction > 0 ? 'translateX(20px)' : 'translateX(-20px)';
    }
    if (bgOverlay) {
        bgOverlay.style.opacity = 0.3;
        bgOverlay.style.transform = 'scale(1.02)';
    }
    
    setTimeout(() => {
        renderHeroMovie(movie);
        if (heroContent) {
            heroContent.style.opacity = 1;
            heroContent.style.transform = 'translateX(0)';
        }
        if (bgOverlay) {
            bgOverlay.style.opacity = 1;
            bgOverlay.style.transform = 'scale(1)';
        }
    }, 400);
}

let slideInterval = setInterval(() => {
    if (window.heroMovies && window.heroMovies.length > 1) {
        changeHeroSlide(1);
    }
}, 5000);

function resetSlideInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => changeHeroSlide(1), 5000);
}

// Pause slider when tab is hidden to prevent background memory/CPU leaks
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearInterval(slideInterval);
    } else {
        resetSlideInterval();
    }
});

// --- MANUAL SLIDE LOGIC (HOVER ZONES) ---
const btnPrev = document.getElementById('hero-prev');
const btnNext = document.getElementById('hero-next');

if (btnPrev && btnNext) {
    btnPrev.addEventListener('click', () => {
        changeHeroSlide(-1);
        resetSlideInterval();
    });
    btnNext.addEventListener('click', () => {
        changeHeroSlide(1);
        resetSlideInterval();
    });
}

// --- TRAILER MODAL LOGIC ---

// Phát hiện lỗi YouTube embed qua postMessage (Error 2, 5, 100, 101, 150, 151, 153)
window.addEventListener('message', (e) => {
    if (!e.origin.includes('youtube.com') && !e.origin.includes('youtube-nocookie.com')) return;
    try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data.event === 'onError' && [2, 5, 100, 101, 150, 151, 153].includes(data.info)) {
            // Video bị chặn embed → hiện fallback
            if (trailerFallback) trailerFallback.style.display = 'flex';
            if (iframe) iframe.style.display = 'none';
        }
    } catch (_) {}
});

if (btnWatch) {
    btnWatch.addEventListener('click', (e) => {
        e.preventDefault();
        const currentMovie = (window.heroMovies && window.heroMovies.length > 0) ? window.heroMovies[currentHeroIndex] : null;
        const rawTrailer = (currentMovie && (currentMovie.trailerWatch || currentMovie.trailer)) ? (currentMovie.trailerWatch || currentMovie.trailer) : iframe.src;
        if (!rawTrailer) return;

        const formattedEmbed = getYouTubeEmbedUrl(rawTrailer);
        const sep = formattedEmbed.includes('?') ? '&' : '?';
        iframe.src = formattedEmbed + `${sep}autoplay=1`;

        if (trailerYtLink) {
            trailerYtLink.href = (currentMovie && (currentMovie.trailerWatch || currentMovie.trailer)) ? (currentMovie.trailerWatch || currentMovie.trailer) : rawTrailer;
        }

        if (trailerFallback) trailerFallback.style.display = 'none';
        iframe.style.display = 'block';
        modal.style.display = 'flex';
        clearInterval(slideInterval);
    });
}

function closeModal() {
    modal.style.display = 'none';
    iframe.src = '';
    iframe.style.display = 'block';
    if (trailerFallback) trailerFallback.style.display = 'none';
    // Resume slider
    slideInterval = setInterval(() => changeHeroSlide(1), 5000);
}

if (btnClose) {
    btnClose.addEventListener('click', closeModal);
}

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

const nowShowingGrid = document.getElementById('now-showing-grid');
const filterGenre = document.getElementById('filter-genre');
const filterFormat = document.getElementById('filter-format');
const filterCinema = document.getElementById('filter-cinema');

function renderNowShowing(movies) {
    if (!nowShowingGrid) return;
    
    if (movies.length === 0) {
        nowShowingGrid.innerHTML = `
            <div style="width:100%; padding: 40px; text-align:center; color: var(--text-muted);">
                <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                <h3>Không tìm thấy phim phù hợp</h3>
                <p style="font-size: 0.875rem;">Vui lòng thử thay đổi tiêu chí lọc của bạn.</p>
            </div>
        `;
        return;
    }

    const cardsHtml = movies.map(movie => {
        const tagsHtml = movie.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        const detailUrl = `/explore/movie-details/index.html?id=${movie.id}`;
        return `
            <div class="movie-card" onclick="window.location.href='${detailUrl}'" style="cursor:pointer;">
                <a href="${detailUrl}" class="poster" style="background-image: url('${movie.poster}')" aria-label="Xem chi tiết ${movie.title}">
                    <div class="poster-overlay">
                        <span class="overlay-text">Xem thêm</span>
                        <span class="btn-book" onclick="event.preventDefault(); event.stopPropagation(); if(window.requireAuth && !window.requireAuth('Bạn cần đăng nhập để đặt vé xem phim. Hãy đăng nhập hoặc tạo tài khoản để tiếp tục.')) return; window.location.href='${detailUrl}'">Đặt vé ngay</span>
                    </div>
                </a>
                <div class="info">
                    <h3><a href="${detailUrl}">${movie.title}</a></h3>
                    <div class="movie-meta-row">
                        <span class="duration"><i class="far fa-clock"></i> ${movie.duration}</span>
                        <span class="age-badge">${movie.age}</span>
                    </div>
                    <div class="tags">${tagsHtml}</div>
                </div>
            </div>
        `;
    }).join('');

    nowShowingGrid.innerHTML = cardsHtml;
}

function populateDynamicFilters() {
    if (filterGenre && window.allMoviesData) {
        const genres = new Set();
        window.allMoviesData.forEach(m => {
            if (m.genre) {
                m.genre.split(',').forEach(g => genres.add(g.trim()));
            }
        });
        genres.forEach(g => {
            if (g && !filterGenre.querySelector(`option[value="${CSS.escape(g)}"]`)) {
                const opt = document.createElement('option');
                opt.value = g;
                opt.textContent = g;
                filterGenre.appendChild(opt);
            }
        });
    }

    if (filterFormat && window.allMoviesData) {
        const formats = new Set();
        window.allMoviesData.forEach(m => {
            if (m.formats && Array.isArray(m.formats)) {
                m.formats.forEach(f => formats.add(f));
            }
        });
        formats.forEach(f => {
            if (f && !filterFormat.querySelector(`option[value="${CSS.escape(f)}"]`)) {
                const opt = document.createElement('option');
                opt.value = f;
                opt.textContent = f;
                filterFormat.appendChild(opt);
            }
        });
    }

    if (filterCinema && window.cinemas) {
        window.cinemas.forEach(c => {
            const val = c.id || c.name;
            if (val && !filterCinema.querySelector(`option[value="${CSS.escape(val)}"]`)) {
                const opt = document.createElement('option');
                opt.value = val;
                opt.textContent = c.name || val;
                filterCinema.appendChild(opt);
            }
        });
    }
}

function applyFilters() {
    const genre = filterGenre ? filterGenre.value : 'all';
    const format = filterFormat ? filterFormat.value : 'all';
    const cinema = filterCinema ? filterCinema.value : 'all';

    const filtered = (window.nowShowingMovies || []).filter(movie => {
        const matchGenre = genre === 'all' || (movie.genre && movie.genre.includes(genre));
        const matchFormat = format === 'all' || (movie.formats && movie.formats.includes(format));
        const matchCinema = cinema === 'all' || movie.cinema === cinema || movie.cinemaId === cinema;
        
        return matchGenre && matchFormat && matchCinema;
    });

    renderNowShowing(filtered);
}

// Attach event listeners to filters
if (filterGenre) filterGenre.addEventListener('change', applyFilters);
if (filterFormat) filterFormat.addEventListener('change', applyFilters);
if (filterCinema) filterCinema.addEventListener('change', applyFilters);

// Initial render
document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (window.fetchMoviesPromise) await window.fetchMoviesPromise;
    } catch (_) {}
    try {
        if (window.fetchCinemasPromise) await window.fetchCinemasPromise;
    } catch (_) {}

    populateDynamicFilters();

    const nowShowing = window.nowShowingMovies || (window.allMoviesData ? window.allMoviesData.filter(m => m.status === 'now-showing') : []);
    const comingSoon = window.comingSoonMovies || (window.allMoviesData ? window.allMoviesData.filter(m => m.status === 'coming-soon') : []);

    renderNowShowing(nowShowing);
    if (typeof window.renderComingSoon === 'function') {
        window.renderComingSoon(comingSoon);
    }

    // --- VIP LOGIC FOR REWARDS BUTTON ---
    const btnVip = document.getElementById('btn-home-vip');
    if (btnVip) {
        const isLogged = localStorage.getItem('isLoggedIn') === 'true';
        const isVip = localStorage.getItem('is_vip') === 'true';
        const vipPlan = localStorage.getItem('vip_plan'); // e.g., 'silver', 'gold', 'platinum'
        
        if (session && (session.role === 'vip' || localStorage.getItem('is_vip') === 'true')) {
            btnVip.href = '../../user/user-profile/index.html';
            btnVip.textContent = 'TRANG TÀI KHOẢN VIP';
        } else {
            btnVip.href = '../../user/vip-registration/index.html';
            btnVip.textContent = 'ĐĂNG KÝ THÀNH VIÊN VIP';
        }
    }

    // Kiểm tra xem có cần auto-open Quick Book cho Group Booking không
    setTimeout(() => {
        if (localStorage.getItem('show_quickbook') === 'true') {
            localStorage.removeItem('show_quickbook');
            const quickBookToggle = document.querySelector('.quick-book-toggle');
            if (quickBookToggle) {
                quickBookToggle.click(); // Mở Quick Book
            }
        }
    }, 500);

});

// Define comingSoonGrid
const comingSoonGrid = document.getElementById('coming-soon-grid');

window.renderComingSoon = function(movies) {
    if (!comingSoonGrid) return;
    
    if (!movies || movies.length === 0) {
        comingSoonGrid.innerHTML = `
            <div style="width:100%; padding: 40px; text-align:center; color: var(--text-muted);">
                <i class="fas fa-calendar-alt" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                <h3>Hiện chưa có phim sắp chiếu</h3>
            </div>
        `;
        return;
    }

    const cardsHtml = movies.map(movie => {
        const tagsHtml = movie.tags ? movie.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
        const detailUrl = `../movie-details/index.html?id=${movie.id}`;
        return `
            <div class="movie-card" onclick="window.location.href='${detailUrl}'" style="cursor:pointer;">
                <a href="${detailUrl}" class="poster" style="background-image: url('${movie.poster}')" aria-label="Xem chi tiết ${movie.title}">
                    <div class="poster-overlay">
                        <span class="overlay-text">Xem thêm</span>
                        <span class="btn-book" onclick="event.preventDefault(); event.stopPropagation(); window.location.href='${detailUrl}'">Đặt trước vé</span>
                    </div>
                </a>
                <div class="info">
                    <h3><a href="${detailUrl}">${movie.title}</a></h3>
                    <div class="movie-meta-row">
                        <span class="duration"><i class="far fa-clock"></i> ${movie.duration || 'N/A'}</span>
                        <span class="age-badge">${movie.age || 'P'}</span>
                    </div>
                    <div class="tags">${tagsHtml}</div>
                </div>
            </div>
        `;
    }).join('');

    comingSoonGrid.innerHTML = cardsHtml;
};
