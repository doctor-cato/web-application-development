const fs = require('fs');

let checkoutJs = fs.readFileSync('frontend/src/booking/checkout/checkout.js', 'utf8');

const regex = /  let discountAmount = 0;[\s\S]*?\/\/ Loyalty Tier Combo Discount logic/;

const replacement = `  let discountAmount = 0;
  if (currentPromoCode === 'GIAM50K' && total >= 200000) {
    discountAmount = 50000;
  } else if (currentPromoCode === 'BAPFREE') {
    discountAmount = 65000;
  } else if (currentPromoCode === 'FOOD10' || currentPromoCode === 'DISCOUNT10') {
    discountAmount = Math.floor(totalComboPrice * 0.1);
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
  let session = {};
  try {
      const u = localStorage.getItem('currentUser');
      if (u) session = JSON.parse(u);
  } catch(e) {}

  const isVip = localStorage.getItem('is_vip') === 'true' || session.role === 'vip';
  const vipPlan = localStorage.getItem('vip_plan') || session.vip_plan || '';
  let vipDiscountPercent = 0;
  if (isVip || vipPlan) {
      if (vipPlan === 'gold') vipDiscountPercent = 0.05;
      else if (vipPlan === 'platinum') vipDiscountPercent = 0.10;
  }
  
  let vipDiscountAmount = 0;
  if (vipDiscountPercent > 0) {
      vipDiscountAmount = Math.floor(total * vipDiscountPercent);
  }

  // Loyalty Tier Combo Discount logic`;

if (regex.test(checkoutJs)) {
    checkoutJs = checkoutJs.replace(regex, replacement);
    fs.writeFileSync('frontend/src/booking/checkout/checkout.js', checkoutJs, 'utf8');
    console.log("Success");
} else {
    console.log("Regex not found");
}
