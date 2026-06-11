// --- SEARCH EXPAND LOGIC ---
const searchPill = document.getElementById('search-pill');
const searchInput = document.getElementById('search-input');

if (searchPill) {
    searchPill.addEventListener('click', () => {
        searchPill.classList.add('active');
        searchInput.focus();
    });
}

// Close search when clicking outside
document.addEventListener('click', (e) => {
    if (searchPill && !searchPill.contains(e.target)) {
        searchPill.classList.remove('active');
        searchInput.value = ''; // clear input when collapsed
    }
});

