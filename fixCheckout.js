const fs = require('fs');
let code = fs.readFileSync('frontend/src/booking/checkout/checkout.js', 'utf8');

// 1. Add global VOUCHERS
code = code.replace(
    'let COMBOS = { none: 0 };',
    'let COMBOS = { none: 0 };\r\nlet VOUCHERS = [];'
);

// 2. Add fetch /api/vouchers in init()
const fetchVouchersLogic = `
  try {
      const res = await fetch('/api/vouchers');
      if (res.ok) {
          VOUCHERS = await res.json();
          VOUCHERS = VOUCHERS.filter(v => v.isActive && new Date(v.expiryDate) >= new Date());
          
          const offersList = document.getElementById('offers-list');
          if (offersList && VOUCHERS.length > 0) {
              offersList.innerHTML = VOUCHERS.map(v => \`
                  <div class="offer-item" data-code="\${v.code}" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.3s; border-radius: 6px;">
                      <div style="display: flex; gap: 1rem; align-items: center;">
                          <div style="font-size: 1.5rem; color: #f59e0b;"><i class="fas fa-ticket-alt"></i></div>
                          <div>
                              <div style="font-weight: 600; color: #f59e0b; letter-spacing: 0.5px;">\${v.code}</div>
                              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">\${v.description}</div>
                          </div>
                      </div>
                      <button class="btn-select-offer" style="background: var(--primary-red); border: none; color: white; padding: 0.4rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; cursor: pointer;" onclick="applyPromo('\${v.code}')">Dùng</button>
                  </div>
              \`).join('');
          }
      }
  } catch(e) { console.error('Fetch vouchers failed', e); }
`;
code = code.replace(
    "  const payBtn = document.getElementById('btn-pay');\r\n  if (payBtn) payBtn.addEventListener('click', handlePayClick);",
    "  const payBtn = document.getElementById('btn-pay');\r\n  if (payBtn) payBtn.addEventListener('click', handlePayClick);\r\n\r\n" + fetchVouchersLogic
);

// 3. Update applyPromo UI interaction (attach click listeners on offers)
const btnSelectHandlers = `
  document.querySelectorAll('.btn-select-offer').forEach(btn => {
      btn.addEventListener('click', (e) => {
          const code = e.target.closest('.offer-item').getAttribute('data-code');
          applyPromo(code);
      });
  });
`;
code = code.replace(
    "} catch(e) { console.error('Fetch combos failed in checkout', e); }",
    "} catch(e) { console.error('Fetch combos failed in checkout', e); }\r\n" + btnSelectHandlers
);


// 4. Update updateTotal logic for VOUCHERS
const newUpdateTotalLogic = `  let discountAmount = 0;
  if (currentPromoCode) {
    const v = VOUCHERS.find(x => x.code === currentPromoCode);
    if (!v) {
      alert('Mã khuyến mãi không hợp lệ hoặc đã hết hạn.');
      removePromo();
    } else if (total < v.minOrderAmount) {
      alert('Đơn hàng chưa đạt tối thiểu ' + formatPrice(v.minOrderAmount) + ' để áp dụng mã này.');
      removePromo();
    } else {
      if (v.discountType === 'FIXED_AMOUNT') {
        discountAmount = v.discountValue;
      } else {
        discountAmount = total * (v.discountValue / 100);
        if (v.maxDiscountAmount && discountAmount > v.maxDiscountAmount) {
          discountAmount = v.maxDiscountAmount;
        }
      }
    }
  }
  
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

  const vipDiscountRow = document.getElementById('order-summary-vip-discount-row');
  const vipDiscountAmountEl = document.getElementById('order-summary-vip-discount-amount');
  const vipDiscountLabelEl = document.getElementById('vip-discount-label');
  if (vipDiscountRow && vipDiscountAmountEl) {
    if (vipDiscountAmount > 0) {
      vipDiscountRow.style.display = 'flex';
      vipDiscountAmountEl.innerText = '-' + formatPrice(vipDiscountAmount);
      if (vipDiscountLabelEl) {
          vipDiscountLabelEl.innerText = \`Ưu đãi VIP (\${vipPlan === 'platinum' ? '10%' : '5%'})\`;
      }
    } else {
      vipDiscountRow.style.display = 'none';
      vipDiscountAmountEl.innerText = '-0 đ';
    }
  }

  const loyaltyDiscountRow = document.getElementById('order-summary-loyalty-discount-row');
  const loyaltyDiscountAmountEl = document.getElementById('order-summary-loyalty-discount-amount');
  const loyaltyDiscountLabelEl = document.getElementById('loyalty-discount-label');
  if (loyaltyDiscountRow && loyaltyDiscountAmountEl) {
    if (loyaltyTierName) {
      loyaltyDiscountRow.style.display = 'flex';
      loyaltyDiscountAmountEl.innerText = '-' + formatPrice(loyaltyComboDiscountAmount);
      if (loyaltyDiscountLabelEl) {
          loyaltyDiscountLabelEl.innerText = \`Hạng thẻ \${loyaltyTierName} (Giảm \${loyaltyComboDiscountPercent * 100}% Combo)\`;
      }
    } else {
      loyaltyDiscountRow.style.display = 'none';
      loyaltyDiscountAmountEl.innerText = '-0 đ';
    }
  }

  total = Math.max(0, total - discountAmount - vipDiscountAmount - loyaltyComboDiscountAmount);`;

const regex = /  let discountAmount = 0;\r?\n  if \(currentPromoCode === 'GIAM50K' && total >= 200000\) \{[\s\S]*?  total = Math\.max\(0, total - discountAmount - vipDiscountAmount - loyaltyComboDiscountAmount\);/;

code = code.replace(regex, newUpdateTotalLogic);

fs.writeFileSync('frontend/src/booking/checkout/checkout.js', code);
console.log('updated checkout.js');
