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
    const seatCount = Array.isArray(booking.seats) ? booking.seats.length
                    : (typeof booking.seats === 'string' && booking.seats.trim() !== '' ? booking.seats.split(',').length : 1);
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

    // Sync points to API backend when available (Issue #61)
    const userEmail = localStorage.getItem('user_email') || localStorage.getItem('email') || booking.userEmail || '';
    const userPhone = localStorage.getItem('user_phone') || localStorage.getItem('phone') || booking.userPhone || '';
    if (userEmail || userPhone) {
        fetch('/api/users/add-points', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: userPhone, email: userEmail, points: totalPts })
        }).catch(e => console.warn('API award points sync warning:', e));
    }

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
            const activeUserId = localStorage.getItem('user_id') || localStorage.getItem('currentUserId') || localStorage.getItem('userId') || null;
            
            if (activeUserId) {
                fetch('/api/cinematch/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: activeUserId,
                        showtimeId: parseInt(booking.showtimeId?.replace(/\D/g, '') || '0'),
                        seatId: Array.isArray(booking.seats) ? booking.seats[0] : booking.seats,
                        adjacentSeatId: booking.cineMatchAdjacentSeat || '',
                        matchPreference: booking.cineMatchPreference || 'any'
                    })
                }).then(res => res.json()).then(data => {
                    console.log('Cine-Match created:', data);
                    cmProcessed.push(booking.id);
                    localStorage.setItem(CINE_MATCH_PROCESSED_KEY, JSON.stringify(cmProcessed));
                }).catch(err => console.error('Error creating Cine-Match:', err));
            }
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
        // Ưu tiên booking.createdAt, fallback về Date.now()
        const rawDate = booking.createdAt || booking.bookingDate || new Date().toISOString();
        const d = new Date(rawDate);
        const isValid = !isNaN(d.getTime());
        if (isValid) {
            const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
            const dayName = days[d.getDay()];
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            dateEl.textContent = `${dayName}, ${day} Th${month}, ${year}`;
        } else {
            const now = new Date();
            const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
            dateEl.textContent = `${days[now.getDay()]}, ${String(now.getDate()).padStart(2,'0')} Th${String(now.getMonth()+1).padStart(2,'0')}, ${now.getFullYear()}`;
        }
    }

    const timeEl = document.getElementById('bs-time');
    if (timeEl) {
        // Ưu tiên showtimeText, fallback về giờ trong createdAt
        let timeStr = booking.showtimeText || '';
        if (!timeStr || timeStr.trim() === '') {
            const rawDate = booking.createdAt || null;
            if (rawDate) {
                const d = new Date(rawDate);
                if (!isNaN(d.getTime())) {
                    timeStr = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
                }
            }
        }
        timeEl.textContent = timeStr || '--:--';
    }

    const seatsEl = document.getElementById('bs-seats');
    if (seatsEl) {
        let seatsDisplay = 'Chưa chọn ghế';
        if (booking.seats) {
            if (Array.isArray(booking.seats) && booking.seats.length > 0) {
                seatsDisplay = booking.seats.join(', ');
            } else if (typeof booking.seats === 'string' && booking.seats.trim() !== '') {
                seatsDisplay = booking.seats;
            }
        }
        seatsEl.textContent = seatsDisplay;
    }

    const codeEl = document.getElementById('bs-ticket-code');
    if (codeEl) {
        // Ưu tiên: booking.id → booking.transactionId → tạo code từ timestamp
        let displayCode = booking.id || booking.transactionId || ('TK-' + Date.now().toString(36).toUpperCase());
        // Nếu code quá dài (là UUID) thì rút gọn lấy 8 ký tự cuối
        if (typeof displayCode === 'string' && displayCode.length > 20) {
            displayCode = displayCode.replace(/-/g, '').slice(-10).toUpperCase();
        }
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

    // Render Per-Seat Individual Ticket QR Codes (Issue #62)
    const seatsList = Array.isArray(booking.seats) 
        ? booking.seats 
        : (typeof booking.seats === 'string' && booking.seats.trim() !== '' ? booking.seats.split(',').map(s => s.trim()).filter(Boolean) : []);
    
    if (seatsList.length > 0) {
        if (!booking.tickets || !Array.isArray(booking.tickets) || booking.tickets.length < seatsList.length) {
            booking.tickets = seatsList.map(seat => ({
                seat: seat,
                ticketCode: 'TK-' + seat + '-' + Math.floor(100000 + Math.random() * 900000)
            }));
            try {
                localStorage.setItem('3hd2k_last_booking', JSON.stringify(booking));
            } catch (_) {}
        }

        const perSeatContainer = document.getElementById('per-seat-tickets-list');
        if (perSeatContainer) {
            perSeatContainer.innerHTML = '';
            booking.tickets.forEach((t, idx) => {
                const item = document.createElement('div');
                item.className = 'per-seat-ticket-card';
                item.style.cssText = 'background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); border-radius: 8px; padding: 10px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px;';
                
                const qrDivId = `qr-seat-${idx}`;
                item.innerHTML = `
                    <span style="font-weight: 800; font-size: 0.9rem; color: #ff3b45;"><i class="fas fa-chair"></i> Ghế ${t.seat}</span>
                    <div id="${qrDivId}" style="width: 100px; height: 100px; background: white; border-radius: 6px; padding: 4px; display: flex; align-items: center; justify-content: center;"></div>
                    <span style="font-family: 'Oswald', sans-serif; font-size: 0.8rem; color: #aaa; letter-spacing: 0.5px;">${t.ticketCode}</span>
                `;
                perSeatContainer.appendChild(item);

                if (typeof QRCode !== 'undefined') {
                    setTimeout(() => {
                        const target = document.getElementById(qrDivId);
                        if (target) {
                            target.innerHTML = '';
                            new QRCode(target, {
                                text: t.ticketCode,
                                width: 92,
                                height: 92,
                                colorDark: "#111111",
                                colorLight: "#ffffff",
                                correctLevel: QRCode.CorrectLevel.M
                            });
                        }
                    }, 50 * idx);
                }
            });
        }
    }

    // Attach global function for printing individual tickets
    window.printIndividualTickets = function() {
        window.print();
    };

    // Lưu đơn vé vào danh sách 3hd2k_bookings cho Admin Portal
    saveBookingToAdminStore(booking);

    // Tích điểm tự động sau khi hiển thị thông tin booking
    awardLoyaltyPoints(booking);
    
    // Thêm thông báo đặt vé
    createBookingNotification(booking);
}

function saveBookingToAdminStore(booking) {
    if (!booking || !booking.id) return;
    try {
        let bookings = JSON.parse(localStorage.getItem('3hd2k_bookings') || '[]');
        if (!Array.isArray(bookings)) bookings = [];
        
        if (!bookings.some(b => b.id === booking.id)) {
            const userEmail = localStorage.getItem('user_email') || localStorage.getItem('email') || booking.userEmail || booking.username || 'khach';
            const userName = localStorage.getItem('userName') || localStorage.getItem('user_name') || booking.customerName || userEmail;
            
            bookings.unshift({
                id: booking.id,
                username: userEmail,
                customerName: userName,
                movieTitle: booking.movieTitle || 'Vé xem phim',
                showtime: booking.showtimeText || booking.showtime || '19:00',
                seats: Array.isArray(booking.seats) ? booking.seats : (booking.seats ? booking.seats.split(',') : ['A01']),
                totalAmount: booking.total || booking.totalPrice || booking.totalAmount || 80000,
                status: 'paid',
                dateCreated: booking.createdAt || new Date().toISOString(),
                cinemaId: booking.cinemaId || 'ha-dong',
                roomName: booking.room || booking.roomName || 'Phòng chiếu 1',
                showtimeId: booking.showtimeId || ''
            });
            localStorage.setItem('3hd2k_bookings', JSON.stringify(bookings));
        }
    } catch (e) {
        console.error("Error saving booking to admin store:", e);
    }
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

