import { getLastBooking } from '../../shared/utils/storage.js';

function qs(sel) { return document.querySelector(sel); }

function init() {
    const booking = getLastBooking();

    // If no booking found, redirect to home page
    if (!booking) {
        window.location.href = '../../index.html';
        return;
    }

    // Update Hero Banner
    const heroImage = document.getElementById('bs-hero-image');
    if (heroImage && booking.poster) {
        heroImage.style.backgroundImage = `linear-gradient(to top, rgba(12, 12, 12, 1) 0%, rgba(12, 12, 12, 0.4) 60%, rgba(12, 12, 12, 0.1) 100%), url('${booking.poster}')`;
    }

    const titleEl = document.getElementById('bs-movie-title');
    if (titleEl) {
        titleEl.textContent = booking.movieTitle || 'Vé Xem Phim';
    }

    const tagsEl = document.getElementById('bs-movie-tags');
    if (tagsEl) {
        // Just show basic info or keep it standard if genre/tags are missing in booking object.
        // We'll keep standard tags for visual fidelity, but we could make it dynamic.
    }

    // Update Details
    const roomEl = document.getElementById('bs-room');
    if (roomEl) {
        roomEl.textContent = booking.room || 'Phòng chiếu tiêu chuẩn';
    }

    const dateEl = document.getElementById('bs-date');
    if (dateEl) {
        // Format date: "Thứ Sáu, 15 Th12, 2024"
        const d = new Date(booking.createdAt);
        const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        const dayName = days[d.getDay()];
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        dateEl.textContent = `${dayName}, ${day} Th${month}, ${year}`;
    }

    const timeEl = document.getElementById('bs-time');
    if (timeEl) {
        timeEl.textContent = booking.showtimeText || '--:--';
    }

    const seatsEl = document.getElementById('bs-seats');
    if (seatsEl) {
        const seats = Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats;
        seatsEl.textContent = seats || 'Chưa chọn ghế';
    }

    const codeEl = document.getElementById('bs-ticket-code');
    if (codeEl) {
        // Format the booking ID slightly for display (e.g. bk_1234 -> TK-1234)
        let displayCode = booking.id || 'TK-UNKNOWN';
        if (displayCode.startsWith('bk_')) {
            displayCode = displayCode.replace('bk_', 'TK-').toUpperCase();
        }
        codeEl.textContent = displayCode;
    }
}

document.addEventListener('DOMContentLoaded', init);
