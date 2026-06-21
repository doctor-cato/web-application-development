// ============================================================
//  3HD2K — Movie Detail Page Logic
// ============================================================

// ── STATE ───────────────────────────────────────────────────
let currentMovie = null;
let selectedDateIndex = 0;
let galleryImages = [];
let currentLightboxIdx = 0;
let isLiked = false;

// ── UTILITY ─────────────────────────────────────────────────
function getMovieIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || null;
}

function getAgeBadgeClass(age) {
    const map = { 'P': 'age-p', 'T13': 'age-t13', 'T16': 'age-t16', 'T18': 'age-t18', 'C18': 'age-c18' };
    return map[age] || 'age-t13';
}

function getFormatClass(fmt) {
    const map = { 'IMAX': 'imax', '4DX': 'four-dx', '3D': 'three-d' };
    return map[fmt] || '';
}

function renderStars(rating, total = 5, starCount = 5) {
    const normalized = (rating / total) * starCount;
    let html = '';
    for (let i = 1; i <= starCount; i++) {
        if (i <= Math.floor(normalized)) html += '<i class="fas fa-star star filled"></i>';
        else if (i - normalized < 1) html += '<i class="fas fa-star-half-alt star half"></i>';
        else html += '<i class="far fa-star star"></i>';
    }
    return html;
}

function formatRatingCount(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
}

// Generate next N dates from today
function generateDates(count = 7) {
    const dates = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const monthNames = ['Th.1','Th.2','Th.3','Th.4','Th.5','Th.6','Th.7','Th.8','Th.9','Th.10','Th.11','Th.12'];
    const today = new Date();
    for (let i = 0; i < count; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push({
            label: i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : dayNames[d.getDay()],
            day: d.getDate(),
            month: monthNames[d.getMonth()],
            full: d
        });
    }
    return dates;
}

// ── TOAST ───────────────────────────────────────────────────
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── RENDER HERO ─────────────────────────────────────────────
function renderHero(movie) {
    // Backdrop
    const backdrop = document.getElementById('hero-backdrop');
    if (backdrop) {
        backdrop.style.backgroundImage = `url('${movie.backdrop || movie.poster}')`;
    }

    // Poster
    const heroPosterImg = document.getElementById('hero-poster-img');
    if (heroPosterImg) {
        heroPosterImg.src = movie.poster;
        heroPosterImg.alt = movie.title;
    }

    // Title
    document.getElementById('hero-title').textContent = movie.title;
    const titleEn = document.getElementById('hero-title-en');
    if (movie.titleEn && movie.titleEn !== movie.title) {
        titleEn.textContent = movie.titleEn + (movie.year ? ` (${movie.year})` : '');
    } else {
        titleEn.textContent = movie.year ? `(${movie.year})` : '';
    }

    // Badges (age + formats)
    const badgesEl = document.getElementById('hero-badges');
    const ageClass = getAgeBadgeClass(movie.age);
    let badgesHtml = `<span class="detail-age-badge ${ageClass}">${movie.age}</span>`;
    (movie.formats || []).forEach(fmt => {
        const fmtClass = getFormatClass(fmt);
        badgesHtml += `<span class="detail-format-badge ${fmtClass}">${fmt}</span>`;
    });
    badgesEl.innerHTML = badgesHtml;

    // Meta row (year, duration, genre, rating)
    const metaRow = document.getElementById('hero-meta-row');
    metaRow.innerHTML = `
        <span class="detail-hero-meta-item"><i class="fas fa-calendar-alt"></i>${movie.year}</span>
        <span class="detail-hero-meta-item"><i class="far fa-clock"></i>${movie.duration}</span>
        <span class="detail-hero-meta-item"><i class="fas fa-film"></i>${movie.genre}</span>
        <span class="detail-hero-meta-item detail-rating-stars">
            <span class="stars-row">${renderStars(movie.rating)}</span>
            <span class="detail-rating-num">${movie.rating.toFixed(1)}</span>
            <span class="detail-rating-count">(${formatRatingCount(movie.ratingCount)})</span>
        </span>
    `;

    // Trailer buttons
    const heroTrailerBtn = document.getElementById('hero-btn-trailer');
    if (heroTrailerBtn) {
        heroTrailerBtn.onclick = () => openTrailerModal(movie.trailer, movie.trailerWatch);
    }

    // Page title & breadcrumb
    document.title = `${movie.title} - 3HD2K`;
    document.getElementById('breadcrumb-movie-name').textContent = movie.title;

    // Breadcrumb: now showing vs coming soon
    const inNowShowing = nowShowingMovies.some(m => m.id === movie.id);
    const tabLink = document.getElementById('breadcrumb-tab-link');
    if (tabLink) {
        tabLink.textContent = inNowShowing ? 'Phim Đang Chiếu' : 'Phim Sắp Chiếu';
        tabLink.href = inNowShowing ? '/explore/movie-search/index.html?tab=now-showing' : '/explore/movie-search/index.html?tab=coming-soon';
    }
}

// ── RENDER METADATA ─────────────────────────────────────────
function renderMetadata(movie) {
    // Synopsis
    const synopsisEl = document.getElementById('synopsis-text');
    if (synopsisEl) synopsisEl.textContent = movie.synopsis || '';

    // Toggle synopsis
    const synopsisToggle = document.getElementById('synopsis-toggle');
    if (synopsisToggle) {
        synopsisToggle.addEventListener('click', () => {
            const el = document.getElementById('synopsis-text');
            const label = document.getElementById('synopsis-toggle-label');
            const icon = document.getElementById('synopsis-icon');
            el.classList.toggle('collapsed');
            if (el.classList.contains('collapsed')) {
                label.textContent = 'Xem thêm';
                icon.className = 'fas fa-chevron-down';
            } else {
                label.textContent = 'Thu gọn';
                icon.className = 'fas fa-chevron-up';
            }
        });
    }

    // Meta grid
    const metaGrid = document.getElementById('meta-grid');
    if (metaGrid) {
        metaGrid.innerHTML = `
            <div class="detail-meta-item">
                <span class="meta-label">Thời lượng</span>
                <span class="meta-value"><i class="far fa-clock" style="color:var(--primary-red);margin-right:6px;"></i>${movie.duration}</span>
            </div>
            <div class="detail-meta-item">
                <span class="meta-label">Thể loại</span>
                <span class="meta-value">${movie.genre}</span>
            </div>
            <div class="detail-meta-item">
                <span class="meta-label">Ngày khởi chiếu</span>
                <span class="meta-value"><i class="fas fa-calendar" style="color:var(--primary-red);margin-right:6px;"></i>${movie.releaseDate}</span>
            </div>
            <div class="detail-meta-item">
                <span class="meta-label">Đạo diễn</span>
                <span class="meta-value"><a href="#">${movie.director}</a></span>
            </div>
            <div class="detail-meta-item">
                <span class="meta-label">Ngôn ngữ</span>
                <span class="meta-value">${movie.language}</span>
            </div>
            <div class="detail-meta-item">
                <span class="meta-label">Phân loại</span>
                <span class="meta-value"><span class="detail-age-badge ${getAgeBadgeClass(movie.age)}" style="font-size:0.75rem;">${movie.age}</span></span>
            </div>
        `;
    }

    // Cast
    const castList = document.getElementById('cast-list');
    if (castList && movie.cast) {
        castList.innerHTML = movie.cast.map(actor => `
            <div class="cast-item" title="${actor.name}">
                <img class="cast-avatar" src="${actor.avatar}" alt="${actor.name}" loading="lazy">
                <span class="cast-name">${actor.name}</span>
            </div>
        `).join('');
    }
}

// ── RENDER SHOWTIMES ─────────────────────────────────────────
function renderDateTabs(dates) {
    const container = document.getElementById('date-tabs');
    if (!container) return;
    container.innerHTML = dates.map((d, i) => `
        <button class="date-tab ${i === selectedDateIndex ? 'active' : ''}"
                onclick="selectDate(${i})"
                id="date-tab-${i}">
            <span class="day-name">${d.label}</span>
            <span class="day-num">${d.day}</span>
            <span class="month-name">${d.month}</span>
        </button>
    `).join('');
}

function selectDate(idx) {
    selectedDateIndex = idx;
    // Update tabs
    document.querySelectorAll('.date-tab').forEach((btn, i) => {
        btn.classList.toggle('active', i === idx);
    });
    renderCinemaShowtimes();
}

function renderCinemaShowtimes() {
    const listEl = document.getElementById('cinema-showtime-list');
    if (!listEl || !currentMovie) return;

    const selectedCinema = document.getElementById('filter-cinema-brand')?.value || 'all';
    const selectedFormat = document.getElementById('filter-showtime-format')?.value || 'all';

    const movieFormats = currentMovie.formats || ['2D'];

    let filteredCinemas = cinemas;
    if (selectedCinema !== 'all') {
        filteredCinemas = cinemas.filter(c => c.id === selectedCinema);
    }

    listEl.innerHTML = filteredCinemas.map(cinema => {
        const formatsToShow = selectedFormat === 'all'
            ? movieFormats
            : movieFormats.filter(f => f === selectedFormat);

        if (formatsToShow.length === 0) return '';

        const formatRows = formatsToShow.map(fmt => {
            const showtimes = generateShowtimes(cinema.id, fmt);
            const btns = showtimes.map(st => {
                let status = st.status;
                if (typeof selectedDateIndex !== 'undefined') {
                    const [h, m] = st.time.split(':').map(Number);
                    const now = new Date();
                    
                    // Tính chính xác mốc thời gian của suất chiếu cho ngày được chọn
                    const showDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
                    showDate.setDate(showDate.getDate() + selectedDateIndex);
                    
                    // Chỉ khóa (vô hiệu hóa) khi thời gian thực tế vượt quá giờ chiếu 60 phút
                    const lockTime = new Date(showDate.getTime() + 60 * 60000);
                    if (now >= lockTime) {
                        status = 'past';
                    }
                }

                if (status === 'full' || status === 'past') {
                    const title = status === 'full' ? 'Hết vé' : 'Đã chiếu';
                    return `<span class="showtime-btn ${status}" title="${title}">${st.time}</span>`;
                }
                return `<a href="#" class="showtime-btn ${status}" 
                            title="${status === 'almost-full' ? 'Sắp hết vé' : 'Còn vé'}"
                            onclick="handleBooking(event, '${cinema.name}', '${fmt}', '${st.time}')">
                            ${st.time}
                        </a>`;
            }).join('');

            const formatLabel = fmt === '2D Lồng tiếng' ? fmt :
                `${fmt} ${selectedDateIndex === 0 ? 'Phụ đề' : 'Lồng tiếng'}`;

            return `
                <div class="format-showtime-row">
                    <span class="format-label-badge">${fmt} Phụ đề</span>
                    <div class="showtime-buttons">${btns}</div>
                </div>
            `;
        }).join('');

        const featureTags = cinema.features.map(f =>
            `<span class="cinema-feature-tag">${f}</span>`
        ).join('');

        return `
            <div class="cinema-showtime-card">
                <div class="cinema-showtime-header">
                    <div class="cinema-info">
                        <div class="cinema-name"><i class="fas fa-map-marker-alt" style="color:var(--primary-red);margin-right:6px;"></i>${cinema.name}</div>
                        <div class="cinema-address">${cinema.address}</div>
                    </div>
                    <div class="cinema-features-tags">${featureTags}</div>
                </div>
                <div class="cinema-showtime-formats">${formatRows}</div>
            </div>
        `;
    }).join('');

    if (listEl.innerHTML.trim() === '') {
        listEl.innerHTML = `
            <div style="padding:40px;text-align:center;color:var(--text-muted);">
                <i class="fas fa-calendar-times" style="font-size:2.5rem;opacity:0.4;margin-bottom:12px;"></i>
                <p>Không tìm thấy suất chiếu phù hợp.</p>
            </div>
        `;
    }
}

function handleBooking(event, cinemaName, format, time) {
    event.preventDefault();
    if (!window.requireAuth('Bạn cần đăng nhập để đặt vé xem phim. Hãy đăng nhập hoặc tạo tài khoản để tiếp tục.')) return;
    showToast(`🎬 Đang chuyển đến trang đặt vé: ${cinemaName} — ${format} lúc ${time}`);
    setTimeout(() => {
        localStorage.removeItem('checkoutFood');
        window.location.href = `/booking/seat-booking/booking.html?id=${currentMovie.id}&showtimeId=${time}`;
    }, 1500);
}

let currentReviews = [];
let currentRatingSelection = 5;

// ── RENDER RATINGS ───────────────────────────────────────────
function renderRatings(movie) {
    document.getElementById('rating-value').textContent = movie.rating.toFixed(1);
    document.getElementById('rating-count-text').textContent = `${movie.ratingCount.toLocaleString('vi-VN')} lượt đánh giá`;

    // Stars large
    const starsLarge = document.getElementById('rating-stars-large');
    if (starsLarge) {
        starsLarge.innerHTML = renderStars(movie.rating);
    }

    // External scores (mock values derived from our rating)
    const imdbScore = (movie.rating * 2.0).toFixed(1);
    const rtScore = Math.round(movie.rating * 20);
    document.getElementById('imdb-score').textContent = `${imdbScore}/10`;
    document.getElementById('rt-score').textContent = `${rtScore}%`;

    if (currentReviews.length === 0 && typeof mockReviews !== 'undefined') {
        currentReviews = [...mockReviews];
    }
    renderReviews();
}

function renderReviews() {
    const reviewsPanel = document.getElementById('reviews-panel');
    if (reviewsPanel) {
        reviewsPanel.innerHTML = currentReviews.map((rev, idx) => {
            const stars = Array.from({length: 5}, (_, i) =>
                `<i class="${i < rev.rating ? 'fas' : 'far'} fa-star star ${i < rev.rating ? 'filled' : ''}"></i>`
            ).join('');
            return `
                <div class="review-card">
                    <div class="review-header">
                        <img class="review-avatar" src="${rev.avatar}" alt="${rev.user}" loading="lazy">
                        <div class="review-user-info">
                            <div class="user-name">${rev.user}</div>
                            <div class="review-date">${rev.date}</div>
                        </div>
                        <div class="review-stars">${stars}</div>
                    </div>
                    <p class="review-text">${rev.text}</p>
                </div>
            `;
        }).join('');
    }
}

function submitComment() {
    if (!window.requireAuth('Bạn cần đăng nhập để viết bình luận. Hãy đăng nhập hoặc tạo tài khoản để tiếp tục.')) return;
    
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (!text) {
        showToast('Vui lòng nhập nội dung bình luận!');
        return;
    }
    
    const userName = localStorage.getItem('userName') || 'Người dùng';
    const userAvatar = localStorage.getItem('userAvatar') || 'https://i.pravatar.cc/150?img=11';
    
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    
    const newComment = {
        user: userName,
        date: dateStr,
        rating: currentRatingSelection,
        text: text,
        avatar: userAvatar
    };
    
    currentReviews.unshift(newComment);
    input.value = '';
    
    // Update average rating
    const sum = currentReviews.reduce((acc, rev) => acc + rev.rating, 0);
    currentMovie.rating = sum / currentReviews.length;
    currentMovie.ratingCount = currentReviews.length;
    
    renderHero(currentMovie);
    renderRatings(currentMovie);
    showToast('Bình luận của bạn đã được gửi!');
}



// ── MEDIA GALLERY ────────────────────────────────────────────
function renderGallery(movie) {
    // Trailer iframe
    const iframe = document.getElementById('detail-trailer-iframe');
    if (iframe && movie.trailer) {
        iframe.src = movie.trailer + '?rel=0&modestbranding=1';
    }

    // Gallery grid
    galleryImages = movie.gallery || [];
    const galleryGrid = document.getElementById('gallery-grid');
    if (galleryGrid) {
        galleryGrid.innerHTML = galleryImages.map((url, i) => `
            <div class="gallery-item" onclick="openLightbox(${i})" role="button" aria-label="Xem ảnh ${i+1}">
                <img src="${url}" alt="Gallery ${i+1}" loading="lazy">
            </div>
        `).join('');
    }
}

function switchMediaTab(tab) {
    ['trailer', 'gallery'].forEach(t => {
        document.getElementById(`tab-${t}`)?.classList.toggle('active', t === tab);
        document.getElementById(`panel-${t}`)?.classList.toggle('active', t === tab);
    });
}

// ── LIGHTBOX ─────────────────────────────────────────────────
function openLightbox(idx) {
    currentLightboxIdx = idx;
    const overlay = document.getElementById('lightbox-overlay');
    const img = document.getElementById('lightbox-img');
    if (overlay && img) {
        img.src = galleryImages[idx];
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const overlay = document.getElementById('lightbox-overlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
}

function closeLightboxOnBg(event) {
    if (event.target === document.getElementById('lightbox-overlay')) {
        closeLightbox();
    }
}

function lightboxNav(dir) {
    currentLightboxIdx = (currentLightboxIdx + dir + galleryImages.length) % galleryImages.length;
    const img = document.getElementById('lightbox-img');
    if (img) {
        img.style.opacity = '0';
        img.style.transform = 'scale(0.95)';
        setTimeout(() => {
            img.src = galleryImages[currentLightboxIdx];
            img.style.transition = 'opacity 0.2s, transform 0.2s';
            img.style.opacity = '1';
            img.style.transform = 'scale(1)';
        }, 150);
    }
}

// ── RELATED MOVIES ───────────────────────────────────────────
function renderRelatedMovies(movie) {
    const carousel = document.getElementById('related-carousel');
    if (!carousel) return;

    const related = allMoviesData.filter(m => m.id !== movie.id).slice(0, 10);
    carousel.innerHTML = related.map(m => {
        const ageClass = getAgeBadgeClass(m.age);
        return `
            <a href="/explore/movie-details/index.html?id=${m.id}" class="related-movie-card">
                <div class="related-poster">
                    <img src="${m.poster}" alt="${m.title}" loading="lazy">
                    <span class="related-age-badge ${ageClass}">${m.age}</span>
                </div>
                <div class="related-movie-title">${m.title}</div>
                <div class="related-movie-meta">${m.genre} · ${m.duration}</div>
            </a>
        `;
    }).join('');
}

function scrollRelated(dir) {
    const carousel = document.getElementById('related-carousel');
    if (carousel) carousel.scrollBy({ left: dir * 360, behavior: 'smooth' });
}

// ── TRAILER MODAL ────────────────────────────────────────────
function openTrailerModal(embedUrl, watchUrl) {
    const modal = document.getElementById('trailer-modal');
    const iframe = document.getElementById('trailer-video');
    if (!modal || !iframe) return;
    iframe.src = embedUrl + '?autoplay=1&rel=0';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeTrailerModal() {
    const modal = document.getElementById('trailer-modal');
    const iframe = document.getElementById('trailer-video');
    if (modal) modal.style.display = 'none';
    if (iframe) iframe.src = '';
    document.body.style.overflow = '';
}

// ── INTERACT ─────────────────────────────────────────────────
function toggleLike() {
    isLiked = !isLiked;
    const btn = document.getElementById('btn-like');
    if (!btn) return;
    btn.classList.toggle('liked', isLiked);
    btn.innerHTML = isLiked
        ? '<i class="fas fa-heart"></i> Đã thích'
        : '<i class="far fa-heart"></i> Thích';
    showToast(isLiked ? '❤️ Đã thêm vào danh sách yêu thích!' : 'Đã bỏ thích.');
}

function shareMovie() {
    const url = window.location.href;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showToast('🔗 Đã sao chép link phim vào clipboard!');
        });
    } else {
        const el = document.createElement('textarea');
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        showToast('🔗 Đã sao chép link phim!');
    }
}

// ── SUPPORT MENU ─────────────────────────────────────────────
function toggleSupportMenu() {
    const menu = document.getElementById('support-menu');
    const icon = document.getElementById('support-icon');
    if (!menu) return;
    menu.classList.toggle('open');
    icon.className = menu.classList.contains('open')
        ? 'fas fa-times'
        : 'fas fa-headset';
}

// ── SCROLL HELPERS ───────────────────────────────────────────
function scrollToShowtimes() {
    const el = document.getElementById('section-showtimes');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── KEYBOARD SUPPORT ─────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    const lightboxOpen = document.getElementById('lightbox-overlay')?.classList.contains('open');
    if (lightboxOpen) {
        if (e.key === 'ArrowLeft') lightboxNav(-1);
        if (e.key === 'ArrowRight') lightboxNav(1);
        if (e.key === 'Escape') closeLightbox();
    }
    const modalOpen = document.getElementById('trailer-modal')?.style.display === 'flex';
    if (modalOpen && e.key === 'Escape') closeTrailerModal();
});

// ── CLOSE MODAL ON BACKDROP ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('trailer-modal');
    const closeBtn = document.getElementById('close-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeTrailerModal);
    if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) closeTrailerModal();
    });

    // Showtime filter changes
    ['filter-city', 'filter-cinema-brand', 'filter-showtime-format'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', renderCinemaShowtimes);
    });

    // ── INIT ──────────────────────────────────────────────────
    const movieId = getMovieIdFromURL();

    if (!movieId) {
        // Fallback: use first nowShowing movie
        currentMovie = allMoviesData[0];
    } else {
        currentMovie = allMoviesData.find(m => m.id === movieId) || allMoviesData[0];
    }

    if (typeof mockReviews !== 'undefined') {
        currentReviews = [...mockReviews];
    }
    
    if (currentReviews.length > 0 && currentMovie) {
        const sum = currentReviews.reduce((acc, rev) => acc + rev.rating, 0);
        currentMovie.rating = sum / currentReviews.length;
        currentMovie.ratingCount = currentReviews.length;
    }

    if (!currentMovie) {
        document.title = '3HD2K - Không tìm thấy phim';
        document.querySelector('.detail-main').innerHTML = `
            <div style="padding: 100px 20px; text-align:center; color: var(--text-muted);">
                <i class="fas fa-film" style="font-size:4rem;opacity:0.3;margin-bottom:24px;"></i>
                <h2>Không tìm thấy phim</h2>
                <p style="margin:12px 0 28px;">Bộ phim bạn tìm kiếm không tồn tại hoặc đã bị gỡ.</p>
                <a href="/explore/movie-search/index.html" class="btn btn-primary">← Quay lại danh sách phim</a>
            </div>
        `;
        return;
    }

    // Render all sections
    renderHero(currentMovie);
    renderMetadata(currentMovie);

    const dates = generateDates(7);
    renderDateTabs(dates);
    renderCinemaShowtimes();

    renderRatings(currentMovie);
    renderGallery(currentMovie);
    renderRelatedMovies(currentMovie);

    // Animate hero backdrop on load
    const backdrop = document.getElementById('hero-backdrop');
    if (backdrop) {
        backdrop.style.transform = 'scale(1.08)';
        setTimeout(() => { backdrop.style.transition = 'transform 1.5s ease'; backdrop.style.transform = 'scale(1.0)'; }, 100);
    }

    // Comment Rating Selection
    const stars = document.querySelectorAll('#rating-stars-input i');
    const display = document.getElementById('rating-value-display');
    if (stars.length > 0 && display) {
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                currentRatingSelection = parseInt(e.target.getAttribute('data-value'), 10);
                display.textContent = `${currentRatingSelection}/5`;
                stars.forEach(s => {
                    if (parseInt(s.getAttribute('data-value'), 10) <= currentRatingSelection) {
                        s.classList.add('active');
                        s.classList.replace('far', 'fas');
                    } else {
                        s.classList.remove('active');
                        s.classList.replace('fas', 'far');
                    }
                });
            });
        });
    }
});
