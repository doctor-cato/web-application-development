// ===== MOVIES PAGE LOGIC =====

// --- STATE ---
let currentTab = 'coming-soon'; // default tab
let currentMovies = [];
const MOVIES_PER_PAGE = 5;
let visibleCount = MOVIES_PER_PAGE;

// --- DOM ELEMENTS ---
const moviesGrid = document.getElementById('movies-grid');
const tabNowShowing = document.getElementById('tab-now-showing');
const tabComingSoon = document.getElementById('tab-coming-soon');
const breadcrumbCurrent = document.getElementById('breadcrumb-current');
const btnLoadMore = document.getElementById('btn-load-more');
const loadMoreContainer = document.getElementById('load-more-container');

const filterGenre = document.getElementById('movies-filter-genre');
const filterFormat = document.getElementById('movies-filter-format');
const filterAge = document.getElementById('movies-filter-age');
const sortSelect = document.getElementById('movies-sort');

// --- READ URL PARAMS ---
function getTabFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'coming-soon';
}

// --- GET AGE BADGE CLASS ---
function getAgeBadgeClass(age) {
    const ageMap = {
        'P': 'age-p',
        'T13': 'age-t13',
        'T16': 'age-t16',
        'T18': 'age-t18',
        'C18': 'age-c18'
    };
    return ageMap[age] || 'age-t13';
}

// --- RENDER MOVIE GRID ---
function renderMoviesGrid(movies) {
    if (!moviesGrid) return;
    moviesGrid.innerHTML = '';

    if (movies.length === 0) {
        moviesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 60px; text-align:center; color: var(--text-muted);">
                <i class="fas fa-film" style="font-size: 3.5rem; margin-bottom: 18px; opacity: 0.4;"></i>
                <h3 style="margin-bottom: 8px;">Không tìm thấy phim phù hợp</h3>
                <p style="font-size: 0.875rem;">Vui lòng thử thay đổi tiêu chí lọc của bạn.</p>
            </div>
        `;
        loadMoreContainer.style.display = 'none';
        return;
    }

    const moviesToShow = movies.slice(0, visibleCount);

    moviesToShow.forEach(movie => {
        const badgeClass = getAgeBadgeClass(movie.age);
        const detailUrl = movie.id ? `movie-detail.html?id=${movie.id}` : '#';
        const tagsHtml = movie.tags ? movie.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
        const cardHtml = `
            <div class="movie-card" onclick="window.location.href='${detailUrl}'" style="cursor:pointer;">
                <div class="poster ${movie.poster ? '' : 'placeholder'}" ${movie.poster ? `style="background-image: url('${movie.poster}')"` : ''}>
                    <div class="poster-overlay">
                        <span class="overlay-text">Xem thêm</span>
                        <a href="${detailUrl}" class="btn-book" onclick="event.stopPropagation()">
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
            </div>
        `;
        moviesGrid.innerHTML += cardHtml;
    });

    // Show/hide load more button
    if (visibleCount >= movies.length) {
        loadMoreContainer.style.display = 'none';
    } else {
        loadMoreContainer.style.display = 'flex';
    }
}

// --- GET DATA FOR CURRENT TAB ---
function getMoviesForTab(tab) {
    if (tab === 'now-showing') {
        // Add genre field to nowShowingMovies if missing
        return nowShowingMovies.map(m => ({
            ...m,
            genre: m.genre || m.tags.join(', ')
        }));
    } else {
        return comingSoonMovies;
    }
}

// --- APPLY FILTERS ---
function applyMoviesFilters() {
    let movies = getMoviesForTab(currentTab);

    const genre = filterGenre ? filterGenre.value : 'all';
    const format = filterFormat ? filterFormat.value : 'all';
    const age = filterAge ? filterAge.value : 'all';
    const sort = sortSelect ? sortSelect.value : 'newest';

    // Filter by genre
    if (genre !== 'all') {
        movies = movies.filter(m => {
            const movieGenre = m.genre || '';
            return movieGenre.includes(genre);
        });
    }

    // Filter by format
    if (format !== 'all') {
        movies = movies.filter(m => {
            const movieTags = m.tags || m.formats || [];
            return movieTags.includes(format);
        });
    }

    // Filter by age
    if (age !== 'all') {
        movies = movies.filter(m => m.age === age);
    }

    // Sort
    switch (sort) {
        case 'name-az':
            movies.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
            break;
        case 'name-za':
            movies.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
            break;
        case 'duration':
            movies.sort((a, b) => {
                const dA = parseInt(a.duration) || 0;
                const dB = parseInt(b.duration) || 0;
                return dB - dA;
            });
            break;
        default: // newest — keep original order
            break;
    }

    currentMovies = movies;
    visibleCount = MOVIES_PER_PAGE;
    renderMoviesGrid(currentMovies);
}

// --- SWITCH TABS ---
function switchTab(tab) {
    currentTab = tab;

    // Update active tab
    tabNowShowing.classList.toggle('active', tab === 'now-showing');
    tabComingSoon.classList.toggle('active', tab === 'coming-soon');

    // Update breadcrumb
    if (breadcrumbCurrent) {
        breadcrumbCurrent.textContent = tab === 'now-showing' ? 'Phim Đang Chiếu' : 'Phim Sắp Chiếu';
    }

    // Reset filters
    if (filterGenre) filterGenre.value = 'all';
    if (filterFormat) filterFormat.value = 'all';
    if (filterAge) filterAge.value = 'all';
    if (sortSelect) sortSelect.value = 'newest';

    // Update URL without reload
    const newUrl = `movies.html?tab=${tab}`;
    window.history.replaceState(null, '', newUrl);

    applyMoviesFilters();
}

// --- LOAD MORE ---
function loadMore() {
    visibleCount += MOVIES_PER_PAGE;
    renderMoviesGrid(currentMovies);
}

// --- EVENT LISTENERS ---
if (tabNowShowing) tabNowShowing.addEventListener('click', () => switchTab('now-showing'));
if (tabComingSoon) tabComingSoon.addEventListener('click', () => switchTab('coming-soon'));
if (btnLoadMore) btnLoadMore.addEventListener('click', loadMore);

if (filterGenre) filterGenre.addEventListener('change', applyMoviesFilters);
if (filterFormat) filterFormat.addEventListener('change', applyMoviesFilters);
if (filterAge) filterAge.addEventListener('change', applyMoviesFilters);
if (sortSelect) sortSelect.addEventListener('change', applyMoviesFilters);

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    const initialTab = getTabFromURL();
    switchTab(initialTab);
});
