import { getBookings } from '../../shared/utils/storage.js';

function formatPrice(amount) {
    if (!amount) return '0 đ';
    return amount.toLocaleString('vi-VN') + 'đ';
}

function renderRealHistory() {
    const container = document.getElementById('real-history-container');
    if (!container) return;
    
    // Get all bookings from localStorage
    const bookings = getBookings();
    
    // Reverse so newest is at the top
    bookings.reverse();
    
    let html = '';
    
    bookings.forEach((booking, index) => {
        const isGroup = booking.seats && booking.seats.length > 2;
        const seatStr = booking.seats ? booking.seats.join(', ') : 'N/A';
        const typeBadge = isGroup 
            ? `<div style="margin-top: 0.5rem;"><span style="background: rgba(16,185,129,0.2); color: #10b981; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; border: 1px solid rgba(16,185,129,0.4);">Vé Nhóm (Split & Lock)</span></div>` 
            : `<div style="margin-top: 0.5rem;"><span style="background: rgba(229, 9, 20, 0.2); color: #ff4b4b; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; border: 1px solid rgba(229, 9, 20, 0.3);">Vé Tiêu Chuẩn</span></div>`;
        
        // Assume poster based on title, fallback to default if not exact
        let poster = '/shared/images/f1_movie.jpg';
        if (booking.movieTitle && booking.movieTitle.toLowerCase().includes('war machine')) {
            poster = 'https://images.unsplash.com/photo-1534809027769-62466286b595?auto=format&fit=crop&w=400&q=80';
        } else if (booking.movieTitle && booking.movieTitle.toLowerCase().includes('interstellar')) {
            poster = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80';
        }

        const dateStr = booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('vi-VN') : 'N/A';
        const timeStr = booking.showtimeText || 'N/A';
        const typeStr = isGroup ? 'group' : 'single';
        const idStr = booking.id;
        const totalStr = formatPrice(booking.total);

        // Escape quotes in strings for onclick
        const titleSafe = booking.movieTitle ? booking.movieTitle.replace(/'/g, "\\'") : 'Phim';
        const roomSafe = booking.room ? booking.room.replace(/'/g, "\\'") : 'Rạp';
        
        const actionHtml = `
            <div class="history-action">
                <span class="status status-upcoming" id="real-status-${index}">Sắp chiếu</span>
                <div class="history-price">${totalStr}</div>
                <div style="display: flex; gap: 0.75rem; margin-top: 1rem; justify-content: flex-end; width: 100%;">
                    <button id="real-cancel-btn-${index}" onclick="openCancelModal('${titleSafe}', '${timeStr}', '${seatStr}', '${totalStr}')" style="padding: 0.35rem 1rem; font-size: 0.8rem; font-family: 'Inter', sans-serif; font-weight: 500; border-radius: 30px; background: transparent; border: 1px solid rgba(229,9,20,0.5); color: #e50914; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(229,9,20,0.1)'; this.style.borderColor='#e50914'" onmouseout="this.style.background='transparent'; this.style.borderColor='rgba(229,9,20,0.5)'">Huỷ vé</button>
                    <button id="real-view-btn-${index}" onclick="openTicketModal('${typeStr}', '${titleSafe}', '${dateStr}', '${timeStr}', '${roomSafe}', '${seatStr}', '3HD2K Vincom Đồng Khởi', '${poster}', '${idStr}')" style="padding: 0.35rem 1rem; font-size: 0.8rem; font-family: 'Inter', sans-serif; font-weight: 500; border-radius: 30px; background: #e50914; color: #fff; border: 1px solid #e50914; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 10px rgba(229,9,20,0.3);" onmouseover="this.style.background='#ff4b4b'; this.style.boxShadow='0 6px 15px rgba(229,9,20,0.5)'" onmouseout="this.style.background='#e50914'; this.style.boxShadow='0 4px 10px rgba(229,9,20,0.3)'">Xem mã vé</button>
                </div>
            </div>
        `;

        html += `
            <div class="history-card" style="border: 1px solid rgba(16, 185, 129, 0.4) !important; box-shadow: 0 0 15px rgba(16, 185, 129, 0.1) !important;">
                <!-- Highlight border to show it's a real active booking -->
                <div class="history-img">
                    <img src="${poster}" alt="${titleSafe}">
                </div>
                <div class="history-info">
                    <h3>${titleSafe}</h3>
                    <p><i class="fas fa-map-marker-alt"></i> 3HD2K Vincom Đồng Khởi - ${roomSafe}</p>
                    <p><i class="fas fa-clock"></i> ${timeStr}</p>
                    <p><i class="fas fa-couch"></i> Ghế: ${seatStr}</p>
                    ${typeBadge}
                </div>
                ${actionHtml}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderRealHistory);
} else {
    renderRealHistory();
}
