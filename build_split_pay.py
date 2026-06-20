import os

html_path = 'src/booking/checkout/split-pay.html'
js_path = 'src/booking/checkout/split-pay.js'

html_content = """<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chia Sẻ Thanh Toán | CGV Cinemas</title>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="../../shared/css/variables.css">
    <link rel="stylesheet" href="../../shared/css/global.css">
    <link rel="stylesheet" href="../css/booking.css">
    <link rel="stylesheet" href="../css/checkout.css">
    <style>
        body {
            background-color: var(--bg-dark);
            color: var(--text-light);
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
        }
        .split-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }
        .header-title {
            font-family: 'Oswald', sans-serif;
            text-align: center;
            font-size: 2rem;
            color: var(--primary-red);
            margin-bottom: 0.5rem;
            text-transform: uppercase;
        }
        .subtitle {
            text-align: center;
            color: var(--text-muted);
            margin-bottom: 2rem;
        }
        .movie-info-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 1rem;
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        .movie-poster {
            width: 80px;
            height: 120px;
            object-fit: cover;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }
        .movie-details h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.25rem;
        }
        .movie-details p {
            margin: 0 0 0.25rem 0;
            color: var(--text-muted);
            font-size: 0.875rem;
        }
        
        /* Seat Grid */
        .split-seat-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        .split-seat-card {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
        }
        .split-seat-card:hover:not(.paid) {
            background: rgba(229, 9, 20, 0.1);
            border-color: var(--primary-red);
        }
        .split-seat-card.selected {
            background: rgba(229, 9, 20, 0.2);
            border-color: var(--primary-red);
            box-shadow: 0 0 15px rgba(229,9,20,0.4);
        }
        .split-seat-card.paid {
            background: rgba(16, 185, 129, 0.1);
            border-color: #10b981;
            cursor: not-allowed;
            opacity: 0.8;
        }
        .split-seat-id {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        .split-seat-price {
            font-size: 0.8rem;
            color: var(--text-muted);
        }
        .paid-badge {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #10b981;
            color: #fff;
            font-size: 0.6rem;
            padding: 2px 6px;
            border-radius: 10px;
            font-weight: bold;
        }
        
        /* Add-ons */
        .addon-section {
            margin-top: 2rem;
            background: rgba(255,255,255,0.02);
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px dashed rgba(255,255,255,0.1);
        }
        .addon-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .addon-item:last-child {
            border-bottom: none;
        }
        
        /* Total Section */
        .total-section {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(255,255,255,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .total-price {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--primary-red);
        }
        
        /* Progress */
        .progress-bar-container {
            width: 100%;
            height: 10px;
            background: rgba(255,255,255,0.1);
            border-radius: 5px;
            overflow: hidden;
            margin-bottom: 0.5rem;
        }
        .progress-bar-fill {
            height: 100%;
            background: var(--primary-red);
            width: 0%;
            transition: width 0.3s ease;
        }
        .progress-text {
            font-size: 0.8rem;
            color: var(--text-muted);
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="split-container" id="split-app">
        <!-- Will be populated by JS -->
        <div style="text-align:center; padding: 3rem;">
            <i class="fas fa-spinner fa-spin fa-2x"></i>
            <p>Đang tải dữ liệu đơn hàng...</p>
        </div>
    </div>

    <!-- Payment Provider Selection Modal -->
    <div id="payment-modal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 9999; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
        <div class="glass-panel" style="width: 90%; max-width: 400px; padding: 2rem; position: relative; border: 1px solid rgba(255,255,255,0.2); border-radius: 12px;">
            <i class="fas fa-times" id="close-payment-modal" style="position: absolute; top: 1rem; right: 1rem; cursor: pointer; font-size: 1.25rem;"></i>
            <h3 style="margin-top: 0; text-align: center; font-family: 'Oswald'; font-size: 1.5rem;">Chọn Cổng Thanh Toán</h3>
            
            <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem;">
                <label class="payment-card selected-momo" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <input type="radio" name="payment-method" value="momo" checked style="display: none;">
                        <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" style="height: 30px; object-fit: contain;">
                        <span>Ví MoMo</span>
                    </div>
                </label>
                <label class="payment-card" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <input type="radio" name="payment-method" value="vnpay" style="display: none;">
                        <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418189687.png" alt="VNPay" style="height: 30px; object-fit: contain;">
                        <span>VNPAY</span>
                    </div>
                </label>
            </div>
            
            <button id="btn-confirm-pay" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem;">XÁC NHẬN THANH TOÁN</button>
        </div>
    </div>

    <script type="module" src="split-pay.js"></script>
</body>
</html>
"""

js_content = """import { createTransaction } from '../../shared/utils/paymentService.js';
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
    
    const appHtml = `
        <h1 class="header-title">CHIA SẺ THANH TOÁN</h1>
        <p class="subtitle">Đơn hàng: #${orderId}</p>
        
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
            <h3 style="font-family: 'Oswald'; margin-top: 0; margin-bottom: 0.5rem;"><i class="fas fa-popcorn" style="color: #FBBF24;"></i> 2. MUA THÊM BẮP NƯỚC (TUỲ CHỌN)</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem;">Phần này chỉ mua riêng cho bạn, không ảnh hưởng đến người khác.</p>
            
            <div class="addon-item" style="margin-top: 1rem;">
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
        
        <button id="btn-pay-my-part" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem; padding: 1rem; font-size: 1.1rem;" disabled>THANH TOÁN PHẦN CỦA TÔI</button>
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
}

function attachEvents() {
    // Seat selection
    document.querySelectorAll('.split-seat-card:not(.paid)').forEach(card => {
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
    
    // Redirect to simulator
    // Pass a returnUrl so simulator knows where to come back to
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `payment_simulation.html?provider=${encodeURIComponent(provider)}&txId=${encodeURIComponent(transaction.transactionId)}&returnUrl=${returnUrl}`;
}

document.addEventListener('DOMContentLoaded', init);
"""

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print("split-pay.html and split-pay.js created.")
