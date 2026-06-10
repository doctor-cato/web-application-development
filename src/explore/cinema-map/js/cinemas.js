// ===== CINEMAS PAGE LOGIC =====

const cinemasList = document.getElementById('cinemas-list');
const mapMarkersContainer = document.getElementById('map-markers');

// --- RENDER CINEMA CARDS ---
function renderCinemas() {
    if (!cinemasList) return;
    cinemasList.innerHTML = '';

    cinemas.forEach((cinema, index) => {
        const featuresHtml = cinema.features
            .map(f => `<span class="cinema-feature-tag">${f}</span>`)
            .join('');

        const cardHtml = `
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
        cinemasList.innerHTML += cardHtml;
    });

    // Attach click events
    document.querySelectorAll('.cinema-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.cinemaId;
            setActiveCinema(id);
        });
    });

    // Directions buttons
    document.querySelectorAll('.btn-directions').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.cinema-card');
            const index = parseInt(card.dataset.index);
            const cinema = cinemas[index];
            // Open Google Maps directions
            const url = `https://www.google.com/maps/dir/?api=1&destination=${cinema.lat},${cinema.lng}`;
            window.open(url, '_blank');
        });
    });
}

// --- RENDER MAP MARKERS ---
function renderMapMarkers() {
    if (!mapMarkersContainer) return;
    mapMarkersContainer.innerHTML = '';

    // Map bounds: bbox=106.65,10.70,106.78,10.82
    const mapBounds = {
        west: 106.65,
        south: 10.70,
        east: 106.78,
        north: 10.82
    };

    const mapPanel = document.getElementById('cinemas-map');
    if (!mapPanel) return;

    cinemas.forEach((cinema, index) => {
        // Convert lat/lng to percentage position on the map
        const xPercent = ((cinema.lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100;
        const yPercent = ((mapBounds.north - cinema.lat) / (mapBounds.north - mapBounds.south)) * 100;

        const marker = document.createElement('div');
        marker.className = `map-marker ${index === 0 ? 'active' : ''}`;
        marker.dataset.cinemaId = cinema.id;
        marker.style.left = `${xPercent}%`;
        marker.style.top = `${yPercent}%`;
        marker.innerHTML = `<span class="map-marker-label">${cinema.name}</span>`;

        marker.addEventListener('click', () => {
            setActiveCinema(cinema.id);
        });

        mapMarkersContainer.appendChild(marker);
    });
}

// --- SET ACTIVE CINEMA ---
function setActiveCinema(cinemaId) {
    // Update cards
    document.querySelectorAll('.cinema-card').forEach(card => {
        card.classList.toggle('active', card.dataset.cinemaId === cinemaId);
    });

    // Update markers
    document.querySelectorAll('.map-marker').forEach(marker => {
        marker.classList.toggle('active', marker.dataset.cinemaId === cinemaId);
    });

    // Scroll active card into view
    const activeCard = document.querySelector(`.cinema-card[data-cinema-id="${cinemaId}"]`);
    if (activeCard) {
        activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    renderCinemas();
    renderMapMarkers();
});
