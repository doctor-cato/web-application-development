const fs = require('fs');

let checkoutJs = fs.readFileSync('frontend/src/booking/checkout/checkout.js', 'utf8');

const regexApply = /function applyPromo\(code\) \{[\s\S]*?\}\n/g;
let newApply = `function applyPromo(code) {
  currentPromoCode = code.toUpperCase();
  document.getElementById('promo-input').value = currentPromoCode;
  
  updateTotal();
  
  if (currentDiscount > 0) {
    document.getElementById('promo-input-group').style.display = 'none';
    const offersList = document.getElementById('offers-list');
    if (offersList) offersList.style.display = 'none';
    document.getElementById('applied-promo-container').style.display = 'flex';
    document.getElementById('applied-promo-code').innerText = currentPromoCode;
  } else {
    // If we reached here and discount is 0, it means it was invalid or not applicable
    // Note: GIAM50K already alerts inside updateTotal if < 200k
    if (currentPromoCode === 'FOOD10' || currentPromoCode === 'DISCOUNT10' || currentPromoCode === 'BAPFREE') {
      alert('Mã này chỉ áp dụng khi bạn có mua Bắp/Nước.');
    } else if (currentPromoCode !== 'GIAM50K') {
      alert('Mã khuyến mãi không hợp lệ!');
    }
    removePromo();
  }
}
`;

checkoutJs = checkoutJs.replace(regexApply, newApply);

// Now add promo input focus listener
const initRegex = /const btnApplyPromo = document\.getElementById\('btn-apply-promo'\);/g;
const newInit = `const promoInput = document.getElementById('promo-input');
  if (promoInput && offersList) {
    promoInput.addEventListener('click', () => {
      offersList.style.display = 'flex';
    });
  }

  const btnApplyPromo = document.getElementById('btn-apply-promo');`;

checkoutJs = checkoutJs.replace(initRegex, newInit);

fs.writeFileSync('frontend/src/booking/checkout/checkout.js', checkoutJs, 'utf8');
console.log("Success");
