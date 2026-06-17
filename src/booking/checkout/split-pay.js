import { lsSet, KEYS } from '../../shared/utils/storage.js';
import { confirmBooking } from '../seat-booking/bookingService.js';
import { createTransaction } from '../../shared/utils/paymentService.js';
import { formatPrice } from '../../explore/home-page/movieService.js';

let orderData = null;
let orderId = '';
let selectedSeats = [];
let selectedAddonTotal = 0;
let pricePerSeat = 0;

function init() {
    const params = new URLSearchParams(window.location.search);
    orderId = params.get('order');
    
    if (!orderId) {
        showError("Không tìm thấy mã đơn hàng. Vui lòng kiểm tra lại đường link.");
        return;
    }
    
    const dataStr = localStorage.getItem('splitOrder_' + orderId);
    if (!dataStr) {
        showError("Đơn hàng không tồn tại hoặc đã hết hạn giữ chỗ (15 phút).");
        return;
    }
    
    orderData = JSON.parse(dataStr);
    
    // Ensure paidSeats array exists
    if (!orderData.paidSeats) orderData.paidSeats = [];
    
    // Calculate price per seat
    const checkoutData = orderData.checkoutData;
    const totalSeats = checkoutData.seats ? checkoutData.seats.length : 1;
    pricePerSeat = Math.round((checkoutData.total || 100000) / totalSeats); // rough estimation
    
    renderApp();
}

function showError(msg) {
    const app = document.getElementById('split-app');
    app.innerHTML = `
        <div style="text-align:center; padding: 4rem 1rem;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--primary-red); margin-bottom: 1rem;"></i>
            <h2 style="font-family: 'Oswald';">LỖI ĐƠN HÀNG</h2>
            <p style="color: var(--text-muted);">${msg}</p>
        </div>
    `;
}

function renderApp() {
    const checkoutData = orderData.checkoutData;
    const allSeats = checkoutData.seats || [];
    const paidCount = orderData.paidSeats.length;
    const progressPercent = (paidCount / allSeats.length) * 100;
    
    let seatsHtml = '';
    allSeats.forEach(seat => {
        const isPaid = orderData.paidSeats.includes(seat);
        const isSelected = selectedSeats.includes(seat);
        
        let classes = 'split-seat-card';
        if (isPaid) classes += ' paid';
        if (isSelected) classes += ' selected';
        
        seatsHtml += `
            <div class="${classes}" data-seat="${seat}">
                ${isPaid ? '<span class="paid-badge">✓ Đã trả</span>' : ''}
                <div class="split-seat-id">${seat}</div>
                <div class="split-seat-price">${formatPrice(pricePerSeat)}</div>
            </div>
        `;
    });
    
    const isFullyPaid = paidCount >= allSeats.length;
    const hasPaidMyPart = sessionStorage.getItem('my_split_payment_' + orderId) === 'true';
    
    if (isFullyPaid) {
        if (orderData.status !== 'COMPLETED') {
            orderData.status = 'COMPLETED';
            localStorage.setItem('splitOrder_' + orderId, JSON.stringify(orderData));
            
            const checkoutData = orderData.checkoutData;
            // Fake a transactionId since we simulated it
            checkoutData.transactionId = 'SPLIT-TX-' + Date.now();
            const booking = confirmBooking(checkoutData);
            lsSet(KEYS.LAST_BOOKING, booking);
        }
        // Redirect immediately to success page
        window.location.href = '../booking-success/index.html';
        return;
    }
    
    const appHtml = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div>
                <h1 class="header-title" style="text-align: left; margin-bottom: 0;">SPLIT & LOCK</h1>
                <p class="subtitle" style="text-align: left; margin-bottom: 0; display: flex; align-items: center; gap: 0.5rem;">
                    <img src="https://i.pravatar.cc/100?img=3" style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--primary-red);"> 
                    <span>Trưởng nhóm đã tạo đơn: <span style="color:var(--primary-red); font-weight:700;">#${orderId}</span></span>
                </p>
            </div>
            <div class="timer-badge">
                <i class="fas fa-hourglass-half"></i> <span id="split-timer">--:--</span>
            </div>
        </div>
        
        <!-- Progress -->
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="font-weight: 700; font-family: 'Oswald';">TIẾN ĐỘ THANH TOÁN NHÓM</span>
                <span class="progress-text">${paidCount} / ${allSeats.length} ghế</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
            </div>
            ${isFullyPaid ? '<p style="color: #10b981; font-size: 0.85rem; text-align: center; margin-top: 0.5rem;"><i class="fas fa-check-circle"></i> Nhóm đã thanh toán xong toàn bộ!</p>' : ''}
        </div>
        
        <!-- Movie Info -->
        <div class="movie-info-card glass-panel">
            <div class="movie-details" style="flex: 1;">
                <h3 style="color: var(--primary-red);">${checkoutData.movieTitle}</h3>
                <p><i class="fas fa-clock" style="width: 16px;"></i> ${checkoutData.showtimeText}</p>
                <p><i class="fas fa-map-marker-alt" style="width: 16px;"></i> ${checkoutData.room}</p>
            </div>
        </div>
        
        ${!isFullyPaid ? `
        <!-- Seat Selection -->
        <h3 style="font-family: 'Oswald'; margin-bottom: 0.5rem;">1. CHỌN GHẾ CỦA BẠN</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Bạn hãy nhấp vào vị trí ghế mà bạn muốn nhận thanh toán.</p>
        <div class="split-seat-grid">
            ${seatsHtml}
        </div>
        
        <!-- Addons -->
        <div class="addon-section">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                <div style="width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%);">
                    <img src="../../shared/images/food_popcorn.png" alt="Bắp Nước" style="width: 36px; height: 36px; object-fit: contain; filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.8));">
                </div>
                <h3 style="font-family: 'Oswald'; margin: 0; font-size: 1.5rem; letter-spacing: 1px;">2. BẮP NƯỚC CÁ NHÂN</h3>
            </div>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-left: 3.5rem;">Combo này sẽ được giao riêng cho bạn tại quầy, không dính dáng đến trưởng nhóm.</p>
            
            <div class="addon-item" style="margin-top: 1.5rem;">
                <div>
                    <div style="font-weight: 500;">Combo 1 Bắp + 1 Nước</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${formatPrice(65000)}</div>
                </div>
                <button class="btn btn-outline btn-addon" data-price="65000" style="padding: 0.25rem 0.75rem; border-radius: 20px;">Thêm</button>
            </div>
            <div class="addon-item">
                <div>
                    <div style="font-weight: 500;">1 Ly Nước Ngọt Size L</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${formatPrice(35000)}</div>
                </div>
                <button class="btn btn-outline btn-addon" data-price="35000" style="padding: 0.25rem 0.75rem; border-radius: 20px;">Thêm</button>
            </div>
        </div>
        
        <!-- Total -->
        <div class="total-section">
            <div>
                <div style="color: var(--text-muted); font-size: 0.9rem;">Tổng cần thanh toán:</div>
                <div style="font-size: 0.8rem; color: #888;">(<span id="selected-seat-count">0</span> ghế + Thêm món)</div>
            </div>
            <div class="total-price" id="total-display">0 đ</div>
        </div>
        
        ${hasPaidMyPart 
            ? `<button id="btn-pay-my-part" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem; padding: 1rem; font-size: 1.1rem; background: #10b981; border-color: #10b981;" disabled><i class="fas fa-check"></i> ĐÃ THANH TOÁN. ĐANG CHỜ NHÓM CỦA BẠN...</button>`
            : `<button id="btn-pay-my-part" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem; padding: 1rem; font-size: 1.1rem;" disabled>THANH TOÁN PHẦN CỦA TÔI</button>`
        }
        ` : `
        <div style="text-align: center; margin-top: 3rem; padding: 2rem; background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 12px;">
            <i class="fas fa-ticket-alt" style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;"></i>
            <h2 style="font-family: 'Oswald'; color: #10b981;">ĐƠN HÀNG ĐÃ HOÀN TẤT</h2>
            <p>Mã vé (QR Code) đã được gửi về email của trưởng nhóm.</p>
        </div>
        `}
    `;
    
    document.getElementById('split-app').innerHTML = appHtml;
    
    if (!isFullyPaid) {
        attachEvents();
        updateTotal();
    }

    // Start Timer
    const expiresAt = checkoutData.expiresAt || (Date.now() + 15 * 60 * 1000);
    const timerInterval = setInterval(() => {
        const now = Date.now();
        const remain = Math.max(0, Math.floor((expiresAt - now) / 1000));
        
        const m = Math.floor(remain / 60).toString().padStart(2, '0');
        const s = (remain % 60).toString().padStart(2, '0');
        const timerEl = document.getElementById('split-timer');
        if(timerEl) timerEl.innerText = `${m}:${s}`;
        
        if (remain <= 0 && !isFullyPaid) {
            clearInterval(timerInterval);
            showError("Thời gian giữ ghế (15 phút) đã kết thúc. Đơn hàng đã bị huỷ.");
        }
    }, 1000);

}

function attachEvents() {
    const hasPaidMyPart = sessionStorage.getItem('my_split_payment_' + orderId) === 'true';
    
    // Seat selection
    document.querySelectorAll('.split-seat-card:not(.paid)').forEach(card => {
        if (hasPaidMyPart) {
            card.style.cursor = 'not-allowed';
            card.style.opacity = '0.7';
            return; // Don't attach click event if already paid
        }
        card.addEventListener('click', () => {
            const seat = card.getAttribute('data-seat');
            if (selectedSeats.includes(seat)) {
                selectedSeats = selectedSeats.filter(s => s !== seat);
                card.classList.remove('selected');
            } else {
                selectedSeats.push(seat);
                card.classList.add('selected');
            }
            updateTotal();
        });
    });
    
    // Addon selection
    document.querySelectorAll('.btn-addon').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const b = e.target;
            const price = parseInt(b.getAttribute('data-price'));
            if (b.classList.contains('selected-addon')) {
                b.classList.remove('selected-addon');
                b.innerText = 'Thêm';
                b.style.background = 'transparent';
                b.style.color = 'var(--primary-red)';
                selectedAddonTotal -= price;
            } else {
                b.classList.add('selected-addon');
                b.innerText = 'Bỏ';
                b.style.background = 'var(--primary-red)';
                b.style.color = '#fff';
                selectedAddonTotal += price;
            }
            updateTotal();
        });
    });
    
    // Payment Method selection logic
    const paymentRadios = document.querySelectorAll('input[name="payment-method"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.querySelectorAll('.payment-card').forEach(c => {
                c.style.background = 'transparent';
                c.style.borderColor = 'rgba(255,255,255,0.2)';
            });
            const card = e.target.closest('.payment-card');
            if (card) {
                card.style.background = 'rgba(229, 9, 20, 0.1)';
                card.style.borderColor = 'var(--primary-red)';
            }
        });
    });

    // Pay button
    const payBtn = document.getElementById('btn-pay-my-part');
    if (payBtn) {
        payBtn.addEventListener('click', () => {
            document.getElementById('payment-modal').style.display = 'flex';
        });
    }
    
    // Close payment modal
    document.getElementById('close-payment-modal').addEventListener('click', () => {
        document.getElementById('payment-modal').style.display = 'none';
    });
    
    // Confirm Pay
    document.getElementById('btn-confirm-pay').addEventListener('click', handleConfirmPayment);
}

function updateTotal() {
    const total = (selectedSeats.length * pricePerSeat) + selectedAddonTotal;
    document.getElementById('total-display').innerText = formatPrice(total);
    document.getElementById('selected-seat-count').innerText = selectedSeats.length;
    
    const payBtn = document.getElementById('btn-pay-my-part');
    if (total > 0) {
        payBtn.disabled = false;
    } else {
        payBtn.disabled = true;
    }
}

function handleConfirmPayment() {
    const total = (selectedSeats.length * pricePerSeat) + selectedAddonTotal;
    const provider = document.querySelector('input[name="payment-method"]:checked').value;
    
    // Create transaction
    const transaction = createTransaction(total, provider);
    
    // We will immediately mark seats as PAID for demonstration, 
    // normally this happens after payment gateway callback
    orderData.paidSeats.push(...selectedSeats);
    
    // Save back to localStorage
    localStorage.setItem('splitOrder_' + orderId, JSON.stringify(orderData));
    
    // Mark this user as having paid their part
    sessionStorage.setItem('my_split_payment_' + orderId, 'true');
    
    // Redirect to simulator
    // Pass a returnUrl so simulator knows where to come back to
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `payment_simulation.html?provider=${encodeURIComponent(provider)}&amount=${total}&txId=${encodeURIComponent(transaction.transactionId)}&returnUrl=${returnUrl}`;
}

document.addEventListener('DOMContentLoaded', init);
