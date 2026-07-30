
let currentMovie = null;
let selectedDateIndex = 0;
let galleryImages = [];
let currentLightboxIdx = 0;

function getMovieIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    return id ? id.replace(/\s+/g, '-') : null;
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

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
}

function renderHero(movie) {

    const backdrop = document.getElementById('hero-backdrop');
    if (backdrop) {
        backdrop.style.backgroundImage = `url('${movie.backdrop || movie.poster}')`;
    }

    const heroPosterImg = document.getElementById('hero-poster-img');
    if (heroPosterImg) {
        heroPosterImg.src = movie.poster;
        heroPosterImg.alt = movie.title;
    }

    document.getElementById('hero-title').textContent = movie.title;
    const titleEn = document.getElementById('hero-title-en');
    if (movie.titleEn && movie.titleEn !== movie.title) {
        titleEn.textContent = movie.titleEn + (movie.year ? ` (${movie.year})` : '');
    } else {
        titleEn.textContent = movie.year ? `(${movie.year})` : '';
    }

    const badgesEl = document.getElementById('hero-badges');
    const ageClass = getAgeBadgeClass(movie.age);
    let badgesHtml = `<span class="detail-age-badge ${ageClass}">${movie.age}</span>`;
    (movie.formats || []).forEach(fmt => {
        const fmtClass = getFormatClass(fmt);
        badgesHtml += `<span class="detail-format-badge ${fmtClass}">${fmt}</span>`;
    });
    badgesEl.innerHTML = badgesHtml;

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

    const heroTrailerBtn = document.getElementById('hero-btn-trailer');
    if (heroTrailerBtn) {
        heroTrailerBtn.onclick = () => openTrailerModal(movie.trailer, movie.trailerWatch);
    }

    document.title = `${movie.title} - 3HD2K`;
    document.getElementById('breadcrumb-movie-name').textContent = movie.title;

    const inNowShowing = nowShowingMovies.some(m => m.id === movie.id);
    const tabLink = document.getElementById('breadcrumb-tab-link');
    if (tabLink) {
        tabLink.textContent = inNowShowing ? 'Phim Đang Chiếu' : 'Phim Sắp Chiếu';
        tabLink.href = inNowShowing ? '/explore/movie-search/index.html?tab=now-showing' : '/explore/movie-search/index.html?tab=coming-soon';
    }
}

function renderMetadata(movie) {

    const synopsisEl = document.getElementById('synopsis-text');
    if (synopsisEl) synopsisEl.textContent = movie.synopsis || '';

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

    document.querySelectorAll('.date-tab').forEach((btn, i) => {
        btn.classList.toggle('active', i === idx);
    });
    renderCinemaShowtimes();
}

function isShowtimeForCinema(s, cinema) {
    if (!s || !cinema) return false;
    const cId = String(cinema.id || '').toLowerCase().trim();
    const cName = (cinema.name || '').toLowerCase().trim();

    const sCinemaId = (s.cinemaId || (s.room ? s.room.cinemaId : '') || '').toLowerCase().trim();
    const sCinemaName = (s.cinemaName || '').toLowerCase().trim();

    if (sCinemaId && sCinemaId === cId) return true;
    if (sCinemaName && cName && (sCinemaName.includes(cName) || cName.includes(sCinemaName))) return true;

    const map = {
        'ha-dong': ['ha-dong', 'c1', 'hà đông'],
        'c1': ['ha-dong', 'c1', 'hà đông'],
        'le-trong-tan': ['le-trong-tan', 'c2', 'lê trọng tấn'],
        'c2': ['le-trong-tan', 'c2', 'lê trọng tấn'],
        'cau-giay': ['cau-giay', 'c3', 'cầu giấy'],
        'c3': ['cau-giay', 'c3', 'cầu giấy'],
        'my-dinh': ['my-dinh', 'c4', 'mỹ đình'],
        'c4': ['my-dinh', 'c4', 'mỹ đình'],
        'lang-ha': ['lang-ha', 'c5', 'láng hạ'],
        'c5': ['lang-ha', 'c5', 'láng hạ'],
        'royal-city': ['royal-city', 'c6', 'royal'],
        'c6': ['royal-city', 'c6', 'royal']
    };

    const keys = map[cId] || [];
    return keys.some(k => sCinemaId.includes(k) || sCinemaName.includes(k));
}

function isShowtimeForMovie(s, movie) {
    if (!s || !movie) return false;
    const mIdStr = String(movie.id || '').toLowerCase().trim();
    const stIdStr = String(s.movieId || '').toLowerCase().trim();
    if (stIdStr && stIdStr === mIdStr) return true;

    const mTitle = (movie.title || '').toLowerCase().trim();
    const stTitle = (s.movieTitle || '').toLowerCase().trim();
    if (mTitle && stTitle && (mTitle === stTitle || mTitle.includes(stTitle) || stTitle.includes(mTitle))) {
        return true;
    }
    return false;
}

function isSameDay(stDateOrIso, targetDate) {
    if (!stDateOrIso || !targetDate) return false;

    const tYear = targetDate.getFullYear();
    const tMonth = String(targetDate.getMonth() + 1).padStart(2, '0');
    const tDay = String(targetDate.getDate()).padStart(2, '0');
    const targetYMD = `${tYear}-${tMonth}-${tDay}`;

    if (typeof stDateOrIso === 'string') {
        const datePart = stDateOrIso.split('T')[0];
        if (datePart === targetYMD) return true;

        const parsed = new Date(stDateOrIso.includes('T') ? stDateOrIso : `${stDateOrIso}T00:00:00`);
        if (!isNaN(parsed.getTime())) {
            const pYear = parsed.getFullYear();
            const pMonth = String(parsed.getMonth() + 1).padStart(2, '0');
            const pDay = String(parsed.getDate()).padStart(2, '0');
            const parsedYMD = `${pYear}-${pMonth}-${pDay}`;
            if (parsedYMD === targetYMD) return true;
        }
    }
    return false;
}

function renderCinemaShowtimes() {
    const listEl = document.getElementById('cinema-showtime-list');
    if (!listEl || !currentMovie) return;

    const selectedCinema = document.getElementById('filter-cinema-brand')?.value || 'all';
    const selectedFormat = document.getElementById('filter-showtime-format')?.value || 'all';
    const selectedCity = document.getElementById('filter-city')?.value || 'all';

    const movieFormats = currentMovie.formats || ['2D'];

    let filteredCinemas = cinemas;
    if (selectedCity !== 'all') {
        const cityMap = { 'hanoi': 'Hà Nội', 'hcm': 'Hồ Chí Minh', 'danang': 'Đà Nẵng' };
        const cityStr = cityMap[selectedCity];
        if (cityStr) {
            filteredCinemas = filteredCinemas.filter(c => c.address && c.address.includes(cityStr));
        }
    }
    if (selectedCinema !== 'all') {
        filteredCinemas = filteredCinemas.filter(c => c.id === selectedCinema);
    }

    const currentMovieShowtimes = window.currentMovieShowtimes || [];

    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    targetDate.setDate(targetDate.getDate() + (typeof selectedDateIndex !== 'undefined' ? selectedDateIndex : 0));

    const cinemaCards = filteredCinemas.map(cinema => {
        const matchingShowtimes = currentMovieShowtimes.filter(s => {
            return isShowtimeForMovie(s, currentMovie) &&
                   isShowtimeForCinema(s, cinema) &&
                   isSameDay(s.date || s.startTime, targetDate);
        });

        if (matchingShowtimes.length === 0) return '';

        const formatsToShow = selectedFormat === 'all'
            ? movieFormats
            : movieFormats.filter(f => f === selectedFormat);

        if (formatsToShow.length === 0) return '';

        const formatRows = formatsToShow.map(fmt => {
            matchingShowtimes.sort((a, b) => {
                const timeA = a.time || (a.startTime ? a.startTime.split('T')[1]?.substring(0,5) : '00:00');
                const timeB = b.time || (b.startTime ? b.startTime.split('T')[1]?.substring(0,5) : '00:00');
                return timeA.localeCompare(timeB);
            });

            const btns = matchingShowtimes.map(st => {
                const timeStr = st.time || (st.startTime ? st.startTime.split('T')[1]?.substring(0,5) : '12:00');
                let status = 'available';

                if (typeof selectedDateIndex !== 'undefined' && selectedDateIndex === 0) {
                    const [h, m] = timeStr.split(':').map(Number);
                    const showDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
                    if (now >= showDate) {
                        status = 'past';
                    }
                }

                if (status === 'full' || status === 'past') {
                    const title = status === 'full' ? 'Hết vé' : 'Đã chiếu';
                    return `<span class="showtime-btn ${status}" title="${title}">${timeStr}</span>`;
                }
                return `<a href="#" class="showtime-btn ${status}"
                            title="${status === 'almost-full' ? 'Sắp hết vé' : 'Còn vé'}"
                            onclick="handleBooking(event, '${cinema.name}', '${fmt}', '${timeStr}', '${st.id}')">
                            ${timeStr}
                        </a>`;
            }).join('');

            const formatLabel = fmt === '2D Lồng tiếng' ? fmt : `${fmt} Phụ đề`;

            return `
                <div class="format-showtime-row">
                    <span class="format-label-badge">${formatLabel}</span>
                    <div class="showtime-buttons">${btns}</div>
                </div>
            `;
        }).join('');

        if (!formatRows.trim()) return '';

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
    }).filter(c => c.trim() !== '').join('');

    if (cinemaCards.trim() === '') {
        listEl.innerHTML = `
            <div style="padding:40px;text-align:center;color:var(--text-muted);">
                <i class="fas fa-calendar-times" style="font-size:2.5rem;opacity:0.4;margin-bottom:12px;"></i>
                <p style="margin-top:8px;">Chưa có suất chiếu nào được xếp cho phim này tại cụm rạp đã chọn vào ngày này.</p>
            </div>
        `;
    } else {
        listEl.innerHTML = cinemaCards;
    }
}

function handleBooking(event, cinemaName, format, time, showtimeId) {
    event.preventDefault();
    if (!window.requireAuth('Bạn cần đăng nhập để đặt vé xem phim. Hãy đăng nhập hoặc tạo tài khoản để tiếp tục.')) return;
    showToast(`🎬 Đang chuyển đến trang đặt vé: ${cinemaName} — ${format} lúc ${time}`);
    setTimeout(() => {
        localStorage.removeItem('checkoutFood');
        let targetUrl = `../../booking/seat-booking/booking.html?id=${currentMovie.id}&showtimeId=${showtimeId || time}`;
        if (new URLSearchParams(window.location.search).get('cinematch') === 'true' || localStorage.getItem('cinematch_active') === 'true') {
            targetUrl += '&cinematch=true';
        }
        window.location.href = targetUrl;
    }, 1500);
}

let currentReviews = [];
let currentRatingSelection = 5;

function renderRatings(movie) {
    document.getElementById('rating-value').textContent = movie.rating.toFixed(1);
    document.getElementById('rating-count-text').textContent = `${movie.ratingCount.toLocaleString('vi-VN')} lượt đánh giá`;

    const starsLarge = document.getElementById('rating-stars-large');
    if (starsLarge) {
        starsLarge.innerHTML = renderStars(movie.rating);
    }

    // 👱‍♀️ ponytail: Removed fake third-party ratings (IMDb/RT) because YAGNI and they shouldn't be mathematically derived from our internal ratings.
    // Upgrade path: Fetch real scores from OMDb or TMDB API when needed.

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
            const borderClass = rev.borderClass ? rev.borderClass : '';
            const vipPlanClass = rev.vipPlan ? `review-card-${rev.vipPlan}` : '';
            return `
                <div class="review-card ${vipPlanClass}">
                    <div class="review-header">
                        <img class="review-avatar ${borderClass}" src="${rev.avatar}" alt="${rev.user}" loading="lazy">
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
    const userBorder = 'avatar-border-' + (localStorage.getItem('userAvatarBorder') || 'member');

    const vipPlan = localStorage.getItem('vip_plan') || '';

    const newComment = {
        user: userName,
        date: dateStr,
        rating: currentRatingSelection,
        text: text,
        avatar: userAvatar,
        borderClass: userBorder,
        vipPlan: vipPlan
    };

    currentReviews.unshift(newComment);
    input.value = '';

    const sum = currentReviews.reduce((acc, rev) => acc + rev.rating, 0);
    currentMovie.rating = sum / currentReviews.length;
    currentMovie.ratingCount = currentReviews.length;

    renderHero(currentMovie);
    renderRatings(currentMovie);
    showToast('Bình luận của bạn đã được gửi!');
}

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

function renderGallery(movie) {

    const iframe = document.getElementById('detail-trailer-iframe');
    const fallback = document.getElementById('detail-trailer-fallback');
    const ytLink = document.getElementById('detail-trailer-yt-link');
    const trailerUrl = movie.trailer || movie.trailerUrl || '';
    if (iframe && trailerUrl) {
        const embedUrl = getYouTubeEmbedUrl(trailerUrl);
        const sep = embedUrl.includes('?') ? '&' : '?';
        iframe.src = embedUrl + `${sep}rel=0&modestbranding=1&enablejsapi=1`;
        if (fallback) fallback.style.display = 'none';
        iframe.style.display = 'block';
        if (ytLink) {
            ytLink.href = movie.trailerWatch || trailerUrl;
        }
    }

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

function openTrailerModal(embedUrl, watchUrl) {
    const modal = document.getElementById('trailer-modal');
    const iframe = document.getElementById('trailer-video');
    const fallback = document.getElementById('trailer-fallback');
    const ytLink = document.getElementById('trailer-yt-link');
    if (!modal || !iframe) return;

    const rawUrl = embedUrl || watchUrl || '';
    if (!rawUrl) {
        showToast('Chưa có link trailer cho phim này');
        return;
    }
    const formattedEmbed = getYouTubeEmbedUrl(rawUrl);
    const sep = formattedEmbed.includes('?') ? '&' : '?';
    iframe.src = formattedEmbed + `${sep}autoplay=1&rel=0&enablejsapi=1`;
    if (fallback) fallback.style.display = 'none';
    iframe.style.display = 'block';
    if (ytLink) {
        ytLink.href = watchUrl || rawUrl;
    }

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

function scrollToShowtimes() {
    const el = document.getElementById('section-showtimes');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

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

document.addEventListener('DOMContentLoaded', async () => {
    const modal = document.getElementById('trailer-modal');
    const closeBtn = document.getElementById('close-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeTrailerModal);
    if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) closeTrailerModal();
    });

    ['filter-city', 'filter-cinema-brand', 'filter-showtime-format'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', renderCinemaShowtimes);
    });

    if (window.fetchMoviesPromise) await window.fetchMoviesPromise;
    if (window.fetchCinemasPromise) await window.fetchCinemasPromise;

    const movieId = getMovieIdFromURL();

    if (!movieId) {

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
        document.querySelector('.movie-detail-page').innerHTML = `
            <div style="padding: 100px 20px; text-align:center; color: var(--text-muted);">
                <i class="fas fa-film" style="font-size:4rem;opacity:0.3;margin-bottom:24px;"></i>
                <h2>Không tìm thấy phim</h2>
                <p style="margin:12px 0 28px;">Bộ phim bạn tìm kiếm không tồn tại hoặc đã bị gỡ.</p>
                <a href="/explore/movie-search/index.html" class="btn btn-primary">← Quay lại danh sách phim</a>
            </div>
        `;
        return;
    }

    renderHero(currentMovie);
    renderMetadata(currentMovie);

    const dates = generateDates(7);
    renderDateTabs(dates);

    if (window.fetchShowtimesByMovie && currentMovie) {
        window.currentMovieShowtimes = await window.fetchShowtimesByMovie(currentMovie.id);
    }
    renderCinemaShowtimes();

    renderRatings(currentMovie);
    renderGallery(currentMovie);
    renderRelatedMovies(currentMovie);

    const backdrop = document.getElementById('hero-backdrop');
    if (backdrop) {
        backdrop.style.transform = 'scale(1.08)';
        setTimeout(() => { backdrop.style.transition = 'transform 1.5s ease'; backdrop.style.transform = 'scale(1.0)'; }, 100);
    }

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

window.addEventListener('message', (e) => {
    if (!e.origin.includes('youtube.com') && !e.origin.includes('youtube-nocookie.com')) return;
    try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data.event === 'onError' && [2, 5, 100, 101, 150, 151, 153].includes(data.info)) {
            const iframe1 = document.getElementById('trailer-video');
            const iframe2 = document.getElementById('detail-trailer-iframe');
            if (iframe1 && (e.source === iframe1.contentWindow || !e.source)) {
                const fb = document.getElementById('trailer-fallback');
                if (fb) fb.style.display = 'flex';
                iframe1.style.display = 'none';
            }
            if (iframe2 && (e.source === iframe2.contentWindow || !e.source)) {
                const fb = document.getElementById('detail-trailer-fallback');
                if (fb) fb.style.display = 'flex';
                iframe2.style.display = 'none';
            }
        }
    } catch (_) {}
});
