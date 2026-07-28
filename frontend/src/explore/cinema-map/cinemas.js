
const cinemasList = document.getElementById('cinemas-list');
const hudCoordinates = document.getElementById('hud-coordinates');
let map = null;
let markerObjects = {};
let activeId = null;

function getActiveCinemasData() {
    if (window.cinemas && Array.isArray(window.cinemas) && window.cinemas.length > 0) {
        return window.cinemas;
    }
    return [
        {
            id: 'c1',
            name: '3HD2K HÀ ĐÔNG',
            address: 'Tầng 5, AEON Mall Hà Đông, Dương Nội, Quận Hà Đông, Hà Nội',
            distance: '0.5 KM',
            screens: 9,
            features: ['IMAX', '4DX', 'Dolby Atmos'],
            lat: 20.9780,
            lng: 105.7580
        },
        {
            id: 'c2',
            name: '3HD2K LÊ TRỌNG TẤN',
            address: 'Tầng 4, Trung tâm TM Hồ Gươm Plaza, 102 Trần Phú, Quận Hà Đông, Hà Nội',
            distance: '2.1 KM',
            screens: 7,
            features: ['Dolby Atmos', 'ScreenX'],
            lat: 20.9850,
            lng: 105.7850
        },
        {
            id: 'c3',
            name: '3HD2K CẦU GIẤY',
            address: 'Tầng 3, 241 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
            distance: '2.0 KM',
            screens: 8,
            features: ['IMAX', 'Dolby Atmos'],
            lat: 21.0360,
            lng: 105.7820
        },
        {
            id: 'c4',
            name: '3HD2K MỸ ĐÌNH',
            address: 'Tầng 2, Keangnam Landmark 72, Phạm Hùng, Nam Từ Liêm, Hà Nội',
            distance: '5.3 KM',
            screens: 6,
            features: ['4DX', 'Dolby Atmos'],
            lat: 21.0168,
            lng: 105.7840
        },
        {
            id: 'c5',
            name: '3HD2K LÁNG HẠ',
            address: '88 Láng Hạ, Đống Đa, Hà Nội',
            distance: '1.7 KM',
            screens: 10,
            features: ['IMAX', 'ScreenX'],
            lat: 21.0150,
            lng: 105.8120
        },
        {
            id: 'c6',
            name: '3HD2K ROYAL CITY',
            address: 'Tầng B2, Vincom Mega Mall Royal City, 72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
            distance: '7.8 KM',
            screens: 12,
            features: ['IMAX', '4DX', 'Dolby Atmos', 'ScreenX'],
            lat: 21.0030,
            lng: 105.8150
        }
    ];
}

function initMap() {
    const mapContainer = document.getElementById('leaflet-map');
    if (!mapContainer || typeof L === 'undefined') return;

    const data = getActiveCinemasData();
    const firstCinema = data[0] || { lat: 20.9780, lng: 105.7580 };

    map = L.map('leaflet-map', {
        center: [firstCinema.lat, firstCinema.lng],
        zoom: 13,
        zoomControl: false,
        preferCanvas: true
    });

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

    data.forEach((cinema, index) => {
        const isActive = cinema.id === activeId || index === 0;
        if (isActive) activeId = cinema.id;
        addMarker(cinema, isActive);
    });

    map.on('move', updateHudCoords);
    updateHudCoords();
}

function addMarker(cinema, isActive) {
    const icon = buildIcon(cinema, isActive);
    const marker = L.marker([cinema.lat, cinema.lng], { icon, zIndexOffset: isActive ? 100 : 0 }).addTo(map);
    marker.on('click', () => setActiveCinema(cinema.id));
    markerObjects[cinema.id] = marker;
}

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

function updateHudCoords() {
    if (!hudCoordinates) return;
    hudCoordinates.textContent = `01. MAP MODE // GRID ACTIVE`;
}

function renderCinemas() {
    if (!cinemasList) return;
    const data = getActiveCinemasData();
    cinemasList.innerHTML = '';

    data.forEach((cinema, index) => {
        const isActive = cinema.id === activeId || (activeId === null && index === 0);
        if (isActive) activeId = cinema.id;

        const featuresHtml = cinema.features
            .map(f => `<span class="cinema-feature-tag">${f}</span>`)
            .join('');

        cinemasList.innerHTML += `
            <div class="cinema-card ${isActive ? 'active' : ''}" data-cinema-id="${cinema.id}" data-index="${index}">
                <div class="cinema-card-header">
                    <h2 class="cinema-name">${cinema.name}</h2>
                    <span class="cinema-distance">${cinema.distance}</span>
                </div>
                <p class="cinema-address">${cinema.address}</p>
                <div class="cinema-screens">
                    <i class="fas fa-video"></i>
                    <span>${cinema.screens} phòng chiếu</span>
                </div>
                <div class="cinema-card-footer">
                    <div class="cinema-features">${featuresHtml}</div>
                    <button class="btn-directions ${isActive ? 'active' : ''}" title="Chỉ đường">
                        <i class="fas fa-arrow-up-right-from-square"></i>
                    </button>
                </div>
            </div>
        `;
    });

    document.querySelectorAll('.cinema-card').forEach(card => {
        card.addEventListener('click', () => setActiveCinema(card.dataset.cinemaId));
    });

    document.querySelectorAll('.btn-directions').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.closest('.cinema-card').dataset.index);
            const data = getActiveCinemasData();
            const c = data[idx];
            if (c) window.open(`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`, '_blank');
        });
    });
}

function setActiveCinema(cinemaId) {
    activeId = cinemaId;
    const data = getActiveCinemasData();

    document.querySelectorAll('.cinema-card').forEach(card => {
        const isActive = card.dataset.cinemaId === cinemaId;
        card.classList.toggle('active', isActive);
        const btnDir = card.querySelector('.btn-directions');
        if (btnDir) btnDir.classList.toggle('active', isActive);
    });

    data.forEach(cinema => {
        const isActive = cinema.id === cinemaId;
        const m = markerObjects[cinema.id];
        if (!m) return;
        m.setIcon(buildIcon(cinema, isActive));
        m.setZIndexOffset(isActive ? 100 : 0);
    });

    const cinema = data.find(c => c.id === cinemaId);
    if (cinema && map) map.flyTo([cinema.lat, cinema.lng], 14, { duration: 0.8 });

    const activeCard = document.querySelector(`.cinema-card[data-cinema-id="${cinemaId}"]`);
    if (activeCard) activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

const btnLoc = document.getElementById('btn-my-location');
if (btnLoc) btnLoc.addEventListener('click', () => {
    if (!map) return;
    const data = getActiveCinemasData();
    const target = data.find(c => c.id === activeId) || data[0];
    map.flyTo([target.lat, target.lng], 14, { duration: 0.8 });
});

const btnZoomIn = document.getElementById('btn-zoom-in');
if (btnZoomIn) btnZoomIn.addEventListener('click', () => {
    if (map) map.zoomIn();
});

const btnZoomOut = document.getElementById('btn-zoom-out');
if (btnZoomOut) btnZoomOut.addEventListener('click', () => {
    if (map) map.zoomOut();
});

document.addEventListener('DOMContentLoaded', async () => {
    if (window.fetchCinemasPromise) {
        try {
            await window.fetchCinemasPromise;
        } catch (_) {}
    }
    renderCinemas();
    initMap();

    const urlParams = new URLSearchParams(window.location.search);
    const targetCinemaId = urlParams.get('cinema');

    if (targetCinemaId) {
        setTimeout(() => {
            setActiveCinema(targetCinemaId);
        }, 300);
    }
});
