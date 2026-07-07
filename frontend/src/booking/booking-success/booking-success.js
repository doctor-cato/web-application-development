import { getLastBooking } from '/shared/utils/storage.js';

function qs(sel) { return document.querySelector(sel); }

// ── Tích điểm tự động khi đặt vé thành công ────────────────
function awardLoyaltyPoints(booking) {
    if (!booking || !booking.id) return;

    const REWARDS_KEY = '3hd2k_rewards';
    const PROCESSED_KEY = '3hd2k_rewards_processed';

    // Kiểm tra xem booking này đã được tích điểm chưa (tránh trùng lặp khi reload)
    let processed = [];
    try {
        processed = JSON.parse(localStorage.getItem(PROCESSED_KEY) || '[]');
    } catch (_) { processed = []; }

    // Check VIP status to apply multiplier
    const isVip = localStorage.getItem('is_vip') === 'true';
    const vipPlan = localStorage.getItem('vip_plan') || '';
    let vipMultiplier = 1;
    if (isVip) {
        if (vipPlan === 'silver') vipMultiplier = 1.2;
        else if (vipPlan === 'gold') vipMultiplier = 1.5;
        else if (vipPlan === 'platinum') vipMultiplier = 2.0;
    }

    // Check Loyalty Tier for multiplier
    let currentPoints = 0;
    try {
        const raw = localStorage.getItem('3hd2k_rewards');
        if (raw) currentPoints = JSON.parse(raw).points || 0;
    } catch (_) {}
    
    let loyaltyMultiplier = 1;
    let loyaltyTierName = '';
    if (currentPoints >= 2000) { loyaltyMultiplier = 2.0; loyaltyTierName = 'DIAMOND'; }
    else if (currentPoints >= 1000) { loyaltyMultiplier = 1.75; loyaltyTierName = 'VIP'; }
    else if (currentPoints >= 500) { loyaltyMultiplier = 1.5; loyaltyTierName = 'VÀNG'; }
    else if (currentPoints >= 200) { loyaltyMultiplier = 1.25; loyaltyTierName = 'BẠC'; }

    const finalMultiplier = Math.max(vipMultiplier, loyaltyMultiplier);
    const multiplierLabel = finalMultiplier > 1 ? (finalMultiplier === loyaltyMultiplier && loyaltyMultiplier > vipMultiplier ? `[${loyaltyTierName} x${finalMultiplier}]` : `[VIP x${finalMultiplier}]`) : '';

    // Tính điểm: 50-150 PTS mỗi vé, tùy số ghế, nhân với hệ số VIP hoặc Hạng Thẻ
    const seatCount = Array.isArray(booking.seats) ? booking.seats.length : 1;
    const ptsPerSeat = Math.floor(Math.random() * 101) + 50; // 50~150
    const totalPts = Math.floor(ptsPerSeat * seatCount * finalMultiplier);

    // Đọc state rewards hiện tại
    let rewardsState = { points: 0, history: [] };
    try {
        const raw = localStorage.getItem(REWARDS_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            rewardsState.points = parsed.points || 0;
            rewardsState.history = parsed.history || [];
        }
    } catch (_) { /* first time */ }

    // Cộng điểm
    rewardsState.points += totalPts;
    rewardsState.history.push({
        id: Date.now(),
        actionId: 'ticket',
        label: `Mua vé: ${booking.movieTitle || 'Phim'} (${seatCount} vé)${multiplierLabel ? ` ${multiplierLabel}` : ''}`,
        icon: '🎬',
        pts: totalPts,
        date: new Date().toISOString(),
        color: '#e55d65',
        colorDark: '#3a1a1d'
    });

    // Lưu lại
    localStorage.setItem(REWARDS_KEY, JSON.stringify(rewardsState));

    // Đánh dấu booking đã được xử lý
    processed.push(booking.id);
    localStorage.setItem(PROCESSED_KEY, JSON.stringify(processed));

    // Hiển thị thông báo tích điểm trên giao diện (nếu có element)
    const pointsBadge = document.getElementById('bs-points-earned');
    if (pointsBadge) {
        pointsBadge.textContent = `+${totalPts} PTS`;
        pointsBadge.style.display = 'inline-block';
    }
}

function init() {
    const booking = getLastBooking();

    // If no booking found, redirect to home page
    if (!booking) {
        window.location.href = '../../index.html';
        return;
    }

    // --- Cine-Match Creation Logic ---
    if (booking.isCineMatch) {
        const CINE_MATCH_PROCESSED_KEY = '3hd2k_cinematch_processed';
        let cmProcessed = [];
        try { cmProcessed = JSON.parse(localStorage.getItem(CINE_MATCH_PROCESSED_KEY) || '[]'); } catch (_) {}
        
        if (!cmProcessed.includes(booking.id)) {
            // Fake user id for now if auth is not implemented properly
            const mockUserId = localStorage.getItem('currentUserId') || '11111111-1111-1111-1111-111111111111';
            
            fetch('/api/cinematch/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: mockUserId, // Replace with real GUID
                    showtimeId: parseInt(booking.showtimeId?.replace(/\D/g, '') || '200'),
                    seatId: Array.isArray(booking.seats) ? booking.seats[0] : booking.seats,
                    adjacentSeatId: booking.cineMatchAdjacentSeat || '',
                    matchPreference: booking.cineMatchPreference || 'any'
                })
            }).then(res => res.json()).then(data => {
                console.log('Cine-Match created:', data);
                cmProcessed.push(booking.id);
                localStorage.setItem(CINE_MATCH_PROCESSED_KEY, JSON.stringify(cmProcessed));
            }).catch(err => console.error('Failed to create Cine-Match:', err));
        }
    }

    // Update Hero Banner
    const heroImage = document.getElementById('bs-hero-image');
    let poster = booking.poster;
    let backdrop = null;
    let movieData = null;

    // Tìm dữ liệu phim để lấy backdrop và tags
    if (window.allMoviesData) {
        movieData = window.allMoviesData.find(m => m.title === booking.movieTitle || m.id === booking.movieId);
    }

    if (movieData) {
        backdrop = movieData.backdrop || movieData.bg; // heroMovies uses 'bg'
        if (backdrop && (backdrop.startsWith('images/') || backdrop.startsWith('assets/'))) {
            backdrop = '/shared/' + backdrop;
        }
    }

    // Ưu tiên backdrop, nếu không có thì dùng poster
    let bgImage = backdrop || poster;
    if (!backdrop && poster && (poster.startsWith('images/') || poster.startsWith('assets/'))) {
        bgImage = '/shared/' + poster;
    }

    if (heroImage && bgImage) {
        heroImage.style.backgroundImage = `linear-gradient(to top, rgba(12, 12, 12, 1) 0%, rgba(12, 12, 12, 0.6) 50%, rgba(12, 12, 12, 0.2) 100%), url('${bgImage}')`;
    }

    const titleEl = document.getElementById('bs-movie-title');
    if (titleEl) {
        titleEl.textContent = booking.movieTitle || 'Vé Xem Phim';
    }

    const tagsEl = document.getElementById('bs-movie-tags');
    if (tagsEl && movieData) {
        // Cập nhật tags thực tế
        let tagsHtml = '';
        if (movieData.formats) {
            movieData.formats.forEach(f => {
                tagsHtml += `<span class="tag" style="background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2);">${f}</span>`;
            });
        }
        if (movieData.language) {
            tagsHtml += `<span class="tag" style="background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2);">${movieData.language}</span>`;
        }
        if (movieData.rating) {
            tagsHtml += `<span class="tag rating" style="background: rgba(255,215,0,0.2); color: #ffd700; padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(255,215,0,0.4);"><i class="fas fa-star star-icon"></i> ${movieData.rating}</span>`;
        }
        // Thêm tag riêng cho heroMovies nếu không có format/language
        if (!tagsHtml && movieData.meta) {
             tagsHtml += `<span class="tag" style="background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2);">${movieData.meta}</span>`;
        }
        if (tagsHtml) {
            tagsEl.innerHTML = tagsHtml;
        }
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
        let displayCode = booking.id || 'UNKNOWN';
        codeEl.textContent = displayCode;

        // Generate actual QR Code dynamically
        const qrContainer = document.getElementById('qrcode-container');
        if (qrContainer && typeof QRCode !== 'undefined') {
            qrContainer.innerHTML = '';
            new QRCode(qrContainer, {
                text: displayCode,
                width: 180,
                height: 180,
                colorDark : "#111111",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.M
            });
            // Apply slight styling to the generated canvas/img for aesthetics
            setTimeout(() => {
                const qrEls = qrContainer.querySelectorAll('canvas, img');
                let hasImg = false;
                
                qrEls.forEach(qrEl => {
                    qrEl.style.width = '180px';
                    qrEl.style.height = '180px';
                    qrEl.style.maxWidth = '180px';
                    qrEl.style.objectFit = 'contain';
                    qrEl.style.borderRadius = '8px';
                    if (qrEl.tagName === 'IMG') {
                        if (qrEl.getAttribute('src')) {
                            qrEl.style.display = 'block';
                            hasImg = true;
                        } else {
                            qrEl.style.display = 'none';
                        }
                    }
                });
                
                qrEls.forEach(qrEl => {
                    if (qrEl.tagName === 'CANVAS') {
                        qrEl.style.display = hasImg ? 'none' : 'block';
                    }
                });
            }, 100);
        }
    }

    // Tích điểm tự động sau khi hiển thị thông tin booking
    awardLoyaltyPoints(booking);
    
    // Thêm thông báo đặt vé
    createBookingNotification(booking);
}

function createBookingNotification(booking) {
    if (!booking || !booking.id) return;
    
    const PROCESSED_NOTIF_KEY = '3hd2k_booking_notif_processed';
    let processed = [];
    try {
        processed = JSON.parse(localStorage.getItem(PROCESSED_NOTIF_KEY) || '[]');
    } catch (_) {}

    if (processed.includes(booking.id)) return; // Đã thêm thông báo rồi

    const seatCount = Array.isArray(booking.seats) ? booking.seats.length : 1;
    const room = booking.room || '3HD2K';
    
    const d = new Date(booking.createdAt);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const newNotif = {
        id: 'notif_' + booking.id,
        bookingId: booking.id,
        category: 'booking',
        unread: true,
        title: 'Đặt vé thành công!',
        text: `${booking.movieTitle || 'Phim'} – Suất ${booking.showtimeText || '--:--'}, ${formattedDate}`,
        textLong: `Bạn đã đặt thành công ${seatCount} vé phim "${booking.movieTitle || 'Phim'}" suất chiếu ${booking.showtimeText || '--:--'} ngày ${formattedDate} tại ${room}. Vui lòng kiểm tra email để nhận mã vé QR.`,
        timestamp: Date.now()
    };

    let notifs = [];
    try {
        notifs = JSON.parse(localStorage.getItem('3hd2k_notifications') || '[]');
    } catch (e) {}

    notifs.push(newNotif);
    localStorage.setItem('3hd2k_notifications', JSON.stringify(notifs));

    processed.push(booking.id);
    localStorage.setItem(PROCESSED_NOTIF_KEY, JSON.stringify(processed));

    if (window.updateNavNotifications) window.updateNavNotifications();
}

document.addEventListener('DOMContentLoaded', init);

