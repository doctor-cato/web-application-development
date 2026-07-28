
let currentTab = 'coming-soon';
let currentMovies = [];
const MOVIES_PER_PAGE = 5;
let visibleCount = MOVIES_PER_PAGE;

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

function getTabFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'coming-soon';
}

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
        const cardHtml = `
            <div class="movie-card">
                <div class="poster ${movie.poster ? '' : 'placeholder'}" ${movie.poster ? `style="background-image: url('${movie.poster}')"` : ''}>
                    <span class="age-badge-overlay ${badgeClass}">${movie.age}</span>
                </div>
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <div class="movie-sub">
                        <span class="genre">${movie.genre || ''}</span>
                        <span>${movie.duration}</span>
                    </div>
                </div>
            </div>
        `;
        moviesGrid.innerHTML += cardHtml;
    });

    if (visibleCount >= movies.length) {
        loadMoreContainer.style.display = 'none';
    } else {
        loadMoreContainer.style.display = 'flex';
    }
}

function getMoviesForTab(tab) {
    if (tab === 'now-showing') {

        return nowShowingMovies.map(m => ({
            ...m,
            genre: m.genre || m.tags.join(', ')
        }));
    } else {
        return comingSoonMovies;
    }
}

function applyMoviesFilters() {
    let movies = getMoviesForTab(currentTab);

    const genre = filterGenre ? filterGenre.value : 'all';
    const format = filterFormat ? filterFormat.value : 'all';
    const age = filterAge ? filterAge.value : 'all';
    const sort = sortSelect ? sortSelect.value : 'newest';

    if (genre !== 'all') {
        movies = movies.filter(m => {
            const movieGenre = m.genre || '';
            return movieGenre.includes(genre);
        });
    }

    if (format !== 'all') {
        movies = movies.filter(m => {
            const movieTags = m.tags || m.formats || [];
            return movieTags.includes(format);
        });
    }

    if (age !== 'all') {
        movies = movies.filter(m => m.age === age);
    }

    switch (sort) {
        case 'name-az':
            movies.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
            break;
        case 'name-za':
            movies.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
            break;
        case 'duration':
            movies.sort((a, b) => {
                const getMins = (m) => {
                    if (m.durationMinutes) return m.durationMinutes;
                    let val = parseInt(m.duration, 10) || 0;
                    return (val > 0 && val < 10) ? val * 60 : val;
                };
                return getMins(b) - getMins(a);
            });
            break;
        default:
            break;
    }

    currentMovies = movies;
    visibleCount = MOVIES_PER_PAGE;
    renderMoviesGrid(currentMovies);
}

function switchTab(tab) {
    currentTab = tab;

    tabNowShowing.classList.toggle('active', tab === 'now-showing');
    tabComingSoon.classList.toggle('active', tab === 'coming-soon');

    if (breadcrumbCurrent) {
        breadcrumbCurrent.textContent = tab === 'now-showing' ? 'Phim Đang Chiếu' : 'Phim Sắp Chiếu';
    }

    if (filterGenre) filterGenre.value = 'all';
    if (filterFormat) filterFormat.value = 'all';
    if (filterAge) filterAge.value = 'all';
    if (sortSelect) sortSelect.value = 'newest';

    const newUrl = `movies.html?tab=${tab}`;
    window.history.replaceState(null, '', newUrl);

    applyMoviesFilters();
}

function loadMore() {
    visibleCount += MOVIES_PER_PAGE;
    renderMoviesGrid(currentMovies);
}

if (tabNowShowing) tabNowShowing.addEventListener('click', () => switchTab('now-showing'));
if (tabComingSoon) tabComingSoon.addEventListener('click', () => switchTab('coming-soon'));
if (btnLoadMore) btnLoadMore.addEventListener('click', loadMore);

if (filterGenre) filterGenre.addEventListener('change', applyMoviesFilters);
if (filterFormat) filterFormat.addEventListener('change', applyMoviesFilters);
if (filterAge) filterAge.addEventListener('change', applyMoviesFilters);
if (sortSelect) sortSelect.addEventListener('change', applyMoviesFilters);

document.addEventListener('DOMContentLoaded', () => {
    const initialTab = getTabFromURL();
    switchTab(initialTab);
});
