// ===== CINEMAS PAGE — CALL OF DUTY TACTICAL MAP =====

const cinemasList = document.getElementById('cinemas-list');
const hudCoordinates = document.getElementById('hud-coordinates');
let map = null;
let markerObjects = {};
let activeId = null;

// --- INIT MAP ---
function initMap() {
    const mapContainer = document.getElementById('leaflet-map');
    if (!mapContainer || typeof L === 'undefined') return;

    map = L.map('leaflet-map', {
        center: [21.005, 105.790],
        zoom: 13,
        zoomControl: false,
        preferCanvas: true
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Light map base, while keeping the existing radar/marker HUD unchanged.
    const basePane = map.createPane('tactical-base');
    basePane.classList.add('tactical-base-pane');
    basePane.style.zIndex = 200;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        subdomains: 'abc',
        maxZoom: 19,
        detectRetina: true,
        pane: 'tactical-base'
    }).addTo(map);

    // Render markers
    cinemas.forEach((cinema, index) => {
        const isActive = index === 0;
        addMarker(cinema, isActive);
    });

    // Live coordinates in HUD
    map.on('move', updateHudCoords);
    updateHudCoords();
}

// --- ADD MARKER ---
function addMarker(cinema, isActive) {
    const icon = buildIcon(cinema, isActive);
    const marker = L.marker([cinema.lat, cinema.lng], { icon, zIndexOffset: isActive ? 100 : 0 }).addTo(map);
    marker.on('click', () => setActiveCinema(cinema.id));
    markerObjects[cinema.id] = marker;
}

// --- BUILD DIV ICON ---
function buildIcon(cinema, isActive) {
    return L.divIcon({
        className: '',
        html: `
            <div class="cod-marker-wrap ${isActive ? 'active' : ''}" data-id="${cinema.id}">
                ${isActive ? '<div class="cod-radar"></div>' : ''}
                <div class="cod-target">
                    <div class="cod-dot"></div>
                    ${isActive ? '<div class="cod-pulse"></div>' : ''}
                </div>
                <div class="cod-label">
                    <span class="cod-label-name">${cinema.name}</span>
                    <span class="cod-label-dist">${cinema.distance}</span>
                </div>
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
    });
}

// --- UPDATE HUD COORDINATES ---
function updateHudCoords() {
    if (!map || !hudCoordinates) return;
    const c = map.getCenter();
    hudCoordinates.textContent = `${c.lat.toFixed(4)}° N, ${c.lng.toFixed(4)}° E`;
}

// --- RENDER CARDS ---
function renderCinemas() {
    if (!cinemasList) return;

    const cardsHtml = cinemas.map((cinema, index) => {
        const featuresHtml = cinema.features
            .map(f => `<span class="cinema-feature-tag">${f}</span>`)
            .join('');

        return `
            <div class="cinema-card ${index === 0 ? 'active' : ''}" data-cinema-id="${cinema.id}" data-index="${index}">
                <div class="cinema-card-header">
                    <h2 class="cinema-name">${cinema.name}</h2>
                    <span class="cinema-distance">${cinema.distance}</span>
                </div>
                <p class="cinema-address">${cinema.address}</p>
                <div class="cinema-screens">
                    <i class="fas fa-tv"></i>
                    <span>${cinema.screens} phòng chiếu</span>
                </div>
                <div class="cinema-card-footer">
                    <div class="cinema-features">${featuresHtml}</div>
                    <button class="btn-directions" title="Chỉ đường">
                        <i class="fas fa-diamond-turn-right"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    cinemasList.innerHTML = cardsHtml;

    document.querySelectorAll('.cinema-card').forEach(card => {
        card.addEventListener('click', () => setActiveCinema(card.dataset.cinemaId));
    });

    document.querySelectorAll('.btn-directions').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.closest('.cinema-card').dataset.index);
            const c = cinemas[idx];
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`, '_blank');
        });
    });
}

// --- SET ACTIVE CINEMA ---
function setActiveCinema(cinemaId) {
    activeId = cinemaId;

    // Update cards
    document.querySelectorAll('.cinema-card').forEach(card => {
        card.classList.toggle('active', card.dataset.cinemaId === cinemaId);
    });

    // Rebuild all markers
    cinemas.forEach(cinema => {
        const isActive = cinema.id === cinemaId;
        const m = markerObjects[cinema.id];
        if (!m) return;
        m.setIcon(buildIcon(cinema, isActive));
        m.setZIndexOffset(isActive ? 100 : 0);
    });

    // Fly to cinema
    const cinema = cinemas.find(c => c.id === cinemaId);
    if (cinema && map) map.flyTo([cinema.lat, cinema.lng], 14, { duration: 0.8 });

    const activeCard = document.querySelector(`.cinema-card[data-cinema-id="${cinemaId}"]`);
    if (activeCard) activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// --- MY LOCATION BTN ---
const btnLoc = document.getElementById('btn-my-location');
if (btnLoc) btnLoc.addEventListener('click', () => {
    if (map) map.flyTo([21.005, 105.790], 13, { duration: 0.8 });
});

// --- INIT ---
document.addEventListener('DOMContentLoaded', async () => {
    if (window.fetchCinemasPromise) await window.fetchCinemasPromise;
    if (window.cinemas && window.cinemas.length > 0) {
        renderCinemas();
        initMap();
    } else {
        if (cinemasList) cinemasList.innerHTML = '<p style="padding: 20px; color: var(--text-muted);">Không có dữ liệu rạp</p>';
    }
});
