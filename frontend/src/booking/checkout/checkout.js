import { getCheckout, saveCheckout } from '/shared/utils/storage.js';
import { createTransaction } from '/shared/utils/paymentService.js';
import { formatPrice } from '/explore/home-page/movieService.js';
import { requireAuth } from '/shared/utils/authGuard.js';

// Kiểm tra đăng nhập ngay khi tải trang thanh toán
if (!requireAuth('Bạn cần đăng nhập để thanh toán vé. Hãy đăng nhập hoặc tạo tài khoản để tiếp tục.')) {
    document.addEventListener('DOMContentLoaded', () => {
        const main = document.querySelector('main');
        if (main) main.style.filter = 'blur(5px)';
    });
}

const COMBOS = { none: 0, single: 65000, double: 95000 };

function parseDataAmount(el) {
  if (!el) return 0;
  const a = el.getAttribute('data-amount');
  return a ? Number(a) : 0;
}

function renderCheckout() {
  const co = getCheckout();
  if (!co) return;

  // Basic fields
  const titleEl = document.getElementById('order-summary-movie');
  if (titleEl && co.movieTitle) titleEl.innerText = co.movieTitle;

  const posterEl = document.getElementById('order-summary-poster');
  if (posterEl && co.poster) posterEl.src = co.poster;



  if (co.genre) {
    const g = document.getElementById('order-summary-genre');
    if (g) g.innerText = co.genre;
  }

  const showtimeEl = document.getElementById('order-summary-showtime');
  if (showtimeEl && co.showtimeText) showtimeEl.innerText = co.showtimeText;

  const roomEl = document.getElementById('order-summary-room');
  if (roomEl && co.room) roomEl.innerText = co.room;

  // Seats
  const seatsEl = document.getElementById('order-summary-seats');
  if (seatsEl && Array.isArray(co.seats)) {
    seatsEl.innerHTML = '';
    co.seats.forEach(s => {
      const span = document.createElement('span');
      span.className = 'seat-badge';
      span.innerText = s;
      seatsEl.appendChild(span);
    });
  }

  const changeSeatBtn = document.getElementById('change-seat-btn');
  if (changeSeatBtn && co.movieId) {
    let url = `../seat-booking/booking.html?id=${co.movieId}`;
    if (co.showtimeId) url += `&showtimeId=${co.showtimeId}`;
    changeSeatBtn.href = url;
  }

  // amounts
  const seatsAmount = Number(co.seatAmount || co.total || 0) - Number(co.comboPrice || 0);
  const seatAmountEl = document.getElementById('order-summary-seat-amount');
  if (seatAmountEl) {
    seatAmountEl.setAttribute('data-amount', seatsAmount);
    seatAmountEl.innerText = formatPrice(seatsAmount);
  }

  const totalEl = document.getElementById('order-total');
  const total = Number(co.total || 0);
  if (totalEl) {
    totalEl.setAttribute('data-amount', total);
    totalEl.innerText = formatPrice(total);
  }
}

let currentDiscount = 0;
let currentPromoCode = '';

function updateTotal() {
  const seatsAmountEl = document.getElementById('order-summary-seat-amount');
  const seatsAmount = parseDataAmount(seatsAmountEl);
  const combo = getSelectedCombo();
  
  // Update Combo Row
  const comboRow = document.getElementById('order-summary-combo-row');
  const comboAmountEl = document.getElementById('order-summary-combo-amount');
  const foodListContainer = document.getElementById('order-summary-food-list');
  
  // Custom food from booking-food
  let customFoodPrice = 0;
  let customFoodArr = [];
  try {
      const checkoutFoodStr = localStorage.getItem('checkoutFood');
      if (checkoutFoodStr) {
          customFoodArr = JSON.parse(checkoutFoodStr);
          customFoodPrice = customFoodArr.reduce((sum, item) => sum + (item.price * item.qty), 0);
      }
  } catch(e) {}

  let totalComboPrice = combo.price;
  
  if (customFoodArr.length > 0) {
      // If custom food is selected, override quick combos
      totalComboPrice = customFoodPrice;
      
      // Also uncheck radio buttons visually
      document.querySelectorAll('label.combo-card').forEach(x => x.classList.remove('selected'));
      document.querySelector('input[name="combo"][value="none"]').checked = true; // reset underlying radio
      
      const upsellPanel = document.getElementById('food-upsell-panel');
      if (upsellPanel) {
          upsellPanel.innerHTML = `
              <div class="glass-panel" style="width: 100%; padding: 1rem; border: 1px solid var(--primary-color);">
                  <div style="color: var(--primary-color); font-weight: bold; margin-bottom: 0.5rem;"><i class="fas fa-check-circle"></i> Đã chọn món trong Menu Đầy Đủ</div>
                  <div style="font-size: 0.9rem; color: var(--text-muted);">
                      ${customFoodArr.map(item => `${item.qty}x ${item.name}`).join('<br>')}
                  </div>
              </div>
          `;
      }
  }

  if (comboRow && comboAmountEl) {
    if (totalComboPrice > 0) {
      comboRow.style.display = 'flex';
      comboAmountEl.innerText = formatPrice(totalComboPrice);
      if (foodListContainer) {
          if (customFoodArr.length > 0) {
              foodListContainer.innerHTML = customFoodArr.map(item => `<div style="font-size: 0.8rem; color: var(--text-muted); display: flex; justify-content: space-between;"><span>${item.qty}x ${item.name}</span><span>${formatPrice(item.price * item.qty)}</span></div>`).join('');
          } else {
              const comboName = combo.id === 'single' ? 'Combo 1 Người' : (combo.id === 'double' ? 'Combo 2 Người' : '');
              foodListContainer.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); display: flex; justify-content: space-between;"><span>1x ${comboName}</span><span>${formatPrice(combo.price)}</span></div>`;
          }
      }
    } else {
      comboRow.style.display = 'none';
      comboAmountEl.innerText = '0 đ';
      if (foodListContainer) foodListContainer.innerHTML = '';
    }
  }

  let total = seatsAmount + totalComboPrice;
  
  // Calculate discount
  let discountAmount = 0;
  if (currentPromoCode === 'GIAM50K' && total >= 200000) {
    discountAmount = 50000;
  } else if (currentPromoCode === 'BAPFREE') {
    discountAmount = 65000;
  } else if (currentPromoCode) {
    // Code applied but condition not met or invalid code
    if (currentPromoCode === 'GIAM50K') {
      alert('Đơn hàng chưa đạt tối thiểu 200.000đ để áp dụng mã này.');
      removePromo();
      return;
    }
  }

  currentDiscount = discountAmount;
  
  // VIP Discount logic
  const isVip = localStorage.getItem('is_vip') === 'true';
  const vipPlan = localStorage.getItem('vip_plan') || '';
  let vipDiscountPercent = 0;
  if (isVip) {
      if (vipPlan === 'gold') vipDiscountPercent = 0.05;
      else if (vipPlan === 'platinum') vipDiscountPercent = 0.10;
  }
  
  let vipDiscountAmount = 0;
  if (vipDiscountPercent > 0) {
      vipDiscountAmount = Math.floor(total * vipDiscountPercent);
  }

  // Loyalty Tier Combo Discount logic
  let currentPoints = 0;
  try {
      const raw = localStorage.getItem('3hd2k_rewards');
      if (raw) currentPoints = JSON.parse(raw).points || 0;
  } catch (_) {}
  
  let loyaltyComboDiscountPercent = 0;
  let loyaltyTierName = '';
  if (currentPoints >= 2000) { loyaltyComboDiscountPercent = 0.10; loyaltyTierName = 'DIAMOND'; }
  else if (currentPoints >= 1000) { loyaltyComboDiscountPercent = 0.08; loyaltyTierName = 'VIP'; }
  else if (currentPoints >= 500) { loyaltyComboDiscountPercent = 0.05; loyaltyTierName = 'VÀNG'; }
  else if (currentPoints >= 200) { loyaltyComboDiscountPercent = 0.02; loyaltyTierName = 'BẠC'; }

  let loyaltyComboDiscountAmount = 0;
  if (loyaltyComboDiscountPercent > 0 && totalComboPrice > 0) {
      loyaltyComboDiscountAmount = Math.floor(totalComboPrice * loyaltyComboDiscountPercent);
  }

  // Determine which discount is better (we take the maximum of VIP total discount vs Loyalty Combo discount)
  // or apply them separately? The user wants both or the best one. Since VIP applies to TOTAL and Loyalty applies to COMBO, VIP is likely better. Let's just use max.
  // Actually, we will show BOTH rows but apply them independently. VIP applies to the Total, Loyalty applies to Combo. Both stack.
  
  // Update Discount Row
  const discountRow = document.getElementById('order-summary-discount-row');
  const discountAmountEl = document.getElementById('order-summary-discount-amount');
  if (discountRow && discountAmountEl) {
    if (discountAmount > 0) {
      discountRow.style.display = 'flex';
      discountAmountEl.innerText = '-' + formatPrice(discountAmount);
    } else {
      discountRow.style.display = 'none';
      discountAmountEl.innerText = '-0 đ';
    }
  }

  // Update VIP Discount Row
  const vipDiscountRow = document.getElementById('order-summary-vip-discount-row');
  const vipDiscountAmountEl = document.getElementById('order-summary-vip-discount-amount');
  const vipDiscountLabelEl = document.getElementById('vip-discount-label');
  if (vipDiscountRow && vipDiscountAmountEl) {
    if (vipDiscountAmount > 0) {
      vipDiscountRow.style.display = 'flex';
      vipDiscountAmountEl.innerText = '-' + formatPrice(vipDiscountAmount);
      if (vipDiscountLabelEl) {
          vipDiscountLabelEl.innerText = `Ưu đãi VIP (${vipPlan === 'platinum' ? '10%' : '5%'})`;
      }
    } else {
      vipDiscountRow.style.display = 'none';
      vipDiscountAmountEl.innerText = '-0 đ';
    }
  }

  // Update Loyalty Discount Row
  const loyaltyDiscountRow = document.getElementById('order-summary-loyalty-discount-row');
  const loyaltyDiscountAmountEl = document.getElementById('order-summary-loyalty-discount-amount');
  const loyaltyDiscountLabelEl = document.getElementById('loyalty-discount-label');
  if (loyaltyDiscountRow && loyaltyDiscountAmountEl) {
    if (loyaltyTierName) {
      loyaltyDiscountRow.style.display = 'flex';
      loyaltyDiscountAmountEl.innerText = '-' + formatPrice(loyaltyComboDiscountAmount);
      if (loyaltyDiscountLabelEl) {
          loyaltyDiscountLabelEl.innerText = `Hạng thẻ ${loyaltyTierName} (Giảm ${loyaltyComboDiscountPercent * 100}% Combo)`;
      }
    } else {
      loyaltyDiscountRow.style.display = 'none';
      loyaltyDiscountAmountEl.innerText = '-0 đ';
    }
  }

  total = Math.max(0, total - discountAmount - vipDiscountAmount - loyaltyComboDiscountAmount);

  const totalEl = document.getElementById('order-total');
  if (totalEl) {
    totalEl.setAttribute('data-amount', total);
    totalEl.innerText = formatPrice(total);
  }
}

function applyPromo(code) {
  currentPromoCode = code.toUpperCase();
  document.getElementById('promo-input').value = currentPromoCode;
  
  updateTotal();
  
  if (currentDiscount > 0) {
    document.getElementById('promo-input-group').style.display = 'none';
    document.getElementById('offers-list').style.display = 'none';
    document.getElementById('applied-promo-container').style.display = 'flex';
    document.getElementById('applied-promo-code').innerText = currentPromoCode;
  }
}

function removePromo() {
  currentPromoCode = '';
  currentDiscount = 0;
  document.getElementById('promo-input').value = '';
  document.getElementById('promo-input-group').style.display = 'flex';
  document.getElementById('applied-promo-container').style.display = 'none';
  updateTotal();
}

function getSelectedCombo() {
  const v = document.querySelector('input[name="combo"]:checked')?.value || 'none';
  return { id: v, price: COMBOS[v] || 0 };
}

function getSelectedPayment() {
  return document.querySelector('input[name="payment"]:checked')?.value || 'momo';
}

function init() {
  startCountdown(5 * 60);
  
  // Attach handlers
  const payBtn = document.getElementById('btn-pay');
  if (payBtn) payBtn.addEventListener('click', handlePayClick);

  // combo radio behavior
  document.querySelectorAll('input[name="combo"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('label.combo-card').forEach(x => x.classList.remove('selected'));
      const card = e.target.closest('.combo-card');
      if (card) card.classList.add('selected');
      localStorage.removeItem('checkoutFood'); // Clear custom food if they pick a quick combo
      updateTotal();
    });
  });

  // payment radio behavior
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('label.payment-card').forEach(x => {
        x.classList.remove('selected-momo', 'selected-vnpay');
        const icon = x.querySelector('i');
        if (icon) icon.style.display = 'none';
      });

      const selectedRadio = e.target;
      const card = selectedRadio.closest('.payment-card');
      if (card) {
        if (selectedRadio.value === 'momo') card.classList.add('selected-momo');
        if (selectedRadio.value === 'vnpay') card.classList.add('selected-vnpay');
        const icon = card.querySelector('i');
        if (icon) icon.style.display = 'block';
      }
    });
  });

  const offersList = document.getElementById('offers-list');

  const btnApplyPromo = document.getElementById('btn-apply-promo');
  if (btnApplyPromo) {
    btnApplyPromo.addEventListener('click', () => {
      const val = document.getElementById('promo-input').value.trim();
      if (val) {
        applyPromo(val);
      } else if (offersList) {
        offersList.style.display = offersList.style.display === 'none' ? 'flex' : 'none';
      }
    });
  }

  const btnRemovePromo = document.getElementById('btn-remove-promo');
  if (btnRemovePromo) {
    btnRemovePromo.addEventListener('click', removePromo);
  }

  document.querySelectorAll('.btn-select-offer').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const offerItem = e.target.closest('.offer-item');
      if (offerItem) {
        const code = offerItem.getAttribute('data-code');
        applyPromo(code);
      }
    });
  });


    // SPLIT & LOCK LOGIC
    const btnSplitPay = document.getElementById('btn-split-pay');
    const splitModal = document.getElementById('split-modal');
    const closeSplitModal = document.getElementById('close-split-modal');
    const splitLinkInput = document.getElementById('split-link-input');
    const btnCopyLink = document.getElementById('btn-copy-link');
    const checkoutSessionData = getCheckout();

    // Hide Split & Lock if user didn't turn on group booking OR seats < 2
    if (btnSplitPay) {
        const seatsCount = checkoutSessionData && checkoutSessionData.seats ? checkoutSessionData.seats.length : 0;
        const isGroupBooking = checkoutSessionData && checkoutSessionData.isGroupBooking;
        if (!isGroupBooking || seatsCount < 2) {
            btnSplitPay.style.display = 'none';
        }
    }

    if (btnSplitPay) {
        btnSplitPay.addEventListener('click', () => {
            const orderId = 'SPLIT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            
            const baseUrl = window.location.href.split('?')[0].replace('checkout/checkout.html', 'group-booking/room.html');
            const splitLink = baseUrl + '?order=' + orderId;
            splitLinkInput.value = splitLink;
            
            // Gán link này cho nút MỞ TRANG THEO DÕI
            const openDashboardBtn = splitModal.querySelector('a.btn-primary');
            if (openDashboardBtn) openDashboardBtn.href = splitLink;
            
            const splitData = {
                orderId: orderId,
                checkoutData: checkoutSessionData,
                customFood: localStorage.getItem('selectedFood'),
                status: 'PENDING',
                paidSeats: [] // Khởi tạo trống để không bị lỗi người đầu tiên đã thanh toán
            };
            localStorage.setItem('splitOrder_' + orderId, JSON.stringify(splitData));
            
            // Tự động gán ghế đầu tiên cho Host (người tạo link)
            if (checkoutSessionData.seats && checkoutSessionData.seats.length > 0) {
                localStorage.setItem('mySeatForOrder_' + orderId, checkoutSessionData.seats[0]);
            }
            
            splitModal.style.display = 'flex';
        });
    }

    if (closeSplitModal) {
        closeSplitModal.addEventListener('click', () => {
            splitModal.style.display = 'none';
        });
    }

    if (btnCopyLink) {
        btnCopyLink.addEventListener('click', () => {
            splitLinkInput.select();
            document.execCommand('copy');
            
            const icon = btnCopyLink.querySelector('i');
            icon.className = 'fas fa-check';
            btnCopyLink.style.color = '#10b981';
            
            setTimeout(() => {
                icon.className = 'fas fa-copy';
                btnCopyLink.style.color = 'var(--primary-red)';
            }, 2000);
        });
    }

  // render data from session
  renderCheckout();
  updateTotal();
}

let expireTime = 0;
let isExpired = false;

function handlePayClick(e) {
  e.preventDefault();
  
  if (isExpired || (expireTime > 0 && Date.now() >= expireTime)) {
    alert('Thời gian giữ ghế đã hết! Vui lòng chọn lại ghế.');
    const co = getCheckout();
    let url = '../seat-booking/booking.html';
    if (co && co.movieId) {
      url += `?id=${co.movieId}`;
      if (co.showtimeId) url += `&showtimeId=${co.showtimeId}`;
    }
    window.location.href = url;
    return;
  }
  
  // read final total (including discount & combo) from DOM data attribute
  const totalEl = document.getElementById('order-total');
  const total = parseDataAmount(totalEl);
  const combo = getSelectedCombo();

  let customFoodStr = localStorage.getItem('checkoutFood');
  let customFood = customFoodStr ? JSON.parse(customFoodStr) : [];

  const checkoutData = {
    // minimal fields used by payment/booking
    movieTitle: document.querySelector('#order-summary-movie')?.innerText || 'Unknown',
    showtimeText: document.querySelector('#order-summary-showtime')?.innerText || '',
    room: document.querySelector('#order-summary-room')?.innerText || '',
    seats: Array.from(document.querySelectorAll('#order-summary-seats .seat-badge')).map(s => s.innerText) || [],
    combo: combo.id,
    customFood: customFood,
    total,
    provider: getSelectedPayment()
  };

  // save checkout into session in case needed later
  saveCheckout(checkoutData);

  const transaction = createTransaction(total, getSelectedPayment());
  const txId = transaction.transactionId;
  const provider = transaction.method;
  
  // redirect to payment simulator page
  window.location.href = `payment_simulation.html?provider=${encodeURIComponent(provider)}&txId=${encodeURIComponent(txId)}`;
}

function startCountdown(seconds) {
  const cdEl = document.getElementById('checkout-countdown');
  if (!cdEl) return;
  
  expireTime = Date.now() + seconds * 1000;
  
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  
  cdEl.innerText = formatTime(seconds);
  
  const timer = setInterval(() => {
    const remain = Math.max(0, Math.floor((expireTime - Date.now()) / 1000));
    
    if (remain <= 0) {
      isExpired = true;
      clearInterval(timer);
      cdEl.innerText = '00:00';
      
      const payBtn = document.getElementById('btn-pay');
      if (payBtn) {
        payBtn.disabled = true;
        payBtn.innerText = 'ĐÃ HẾT HẠN';
        payBtn.style.opacity = '0.5';
        payBtn.style.cursor = 'not-allowed';
      }

      alert('Thời gian giữ ghế đã hết! Vui lòng chọn lại ghế.');
      const co = getCheckout();
      let url = '../seat-booking/booking.html';
      if (co && co.movieId) {
        url += `?id=${co.movieId}`;
        if (co.showtimeId) url += `&showtimeId=${co.showtimeId}`;
      }
      window.location.href = url;
    } else {
      cdEl.innerText = formatTime(remain);
    }
  }, 1000);
}

init();
