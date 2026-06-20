import re

html_file = 'src/booking/checkout/checkout.html'
js_file = 'src/booking/checkout/checkout.js'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update order-summary-combo-row
html = re.sub(
    r'<div class="price-row" id="order-summary-combo-row" style="display: none;">\s*<span class="price-label">Combo</span>\s*<span id="order-summary-combo-amount" class="price-value" data-amount="0">0 đ</span>\s*</div>',
    r'''<div class="price-row" id="order-summary-combo-row" style="display: none; align-items: flex-start; flex-direction: column; gap: 0.5rem;">
                            <div style="display: flex; justify-content: space-between; width: 100%;">
                                <span class="price-label">Đồ ăn & Thức uống</span>
                                <span id="order-summary-combo-amount" class="price-value" data-amount="0">0 đ</span>
                            </div>
                            <div id="order-summary-food-list" style="width: 100%; display: flex; flex-direction: column; gap: 4px; padding-left: 0.5rem; border-left: 2px solid var(--glass-border);"></div>
                        </div>''',
    html
)

# 2. Add IDs to upsell panel header
html = html.replace('<a href="../booking-food/index.html" class="btn-upsell-food">', '<a href="../booking-food/index.html" class="btn-upsell-food" id="btn-edit-food">')
html = html.replace('<i class="fas fa-utensils"></i> Menu Đầy Đủ', '<i class="fas fa-utensils"></i> <span id="btn-edit-food-text">Menu Đầy Đủ</span>')
html = html.replace('<div class="combo-list-horizontal">', '<div class="combo-list-horizontal" id="food-upsell-panel">')

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

# 3. Update checkout.js logic
# Remove the old combo radio listeners if we overwrite it, or just adapt.
# In checkout.js, there is currently logic for combos:
# `const comboRadios = document.querySelectorAll('input[name="combo"]');`
# I will append new logic at the top of DOMContentLoaded to hijack the combo logic if custom food is found.

new_logic = """
    // Custom Food Logic
    const savedFood = localStorage.getItem('selectedFood');
    const comboAmountEl = document.getElementById('order-summary-combo-amount');
    const comboRowEl = document.getElementById('order-summary-combo-row');
    const foodListEl = document.getElementById('order-summary-food-list');
    const upsellPanel = document.getElementById('food-upsell-panel');
    const btnEditText = document.getElementById('btn-edit-food-text');
    let customFoodTotal = 0;

    if(savedFood && savedFood !== '[]') {
        const foods = JSON.parse(savedFood);
        
        let foodListHtml = '';
        let upsellHtml = '<div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">';

        foods.forEach(f => {
            const cost = f.price * f.qty;
            customFoodTotal += cost;
            foodListHtml += `<div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
                                <span>${f.qty}x ${f.name}</span>
                                <span>${cost.toLocaleString('vi-VN')} đ</span>
                             </div>`;
                             
            upsellHtml += `<div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                            <div style="display: flex; gap: 12px; align-items: center;">
                                <img src="${f.img}" style="width: 48px; height: 48px; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">
                                <div>
                                    <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">${f.name}</div>
                                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">Số lượng: ${f.qty}</div>
                                </div>
                            </div>
                            <div style="color: var(--primary-red); font-weight: 700; font-size: 0.95rem;">${cost.toLocaleString('vi-VN')} đ</div>
                        </div>`;
        });
        upsellHtml += '</div>';

        if(customFoodTotal > 0) {
            comboAmountEl.textContent = customFoodTotal.toLocaleString('vi-VN') + ' đ';
            comboAmountEl.dataset.amount = customFoodTotal;
            comboRowEl.style.display = 'flex';
            foodListEl.innerHTML = foodListHtml;
            
            upsellPanel.innerHTML = upsellHtml;
            btnEditText.textContent = "Chỉnh sửa đồ ăn";
            document.querySelector('.booking-section-title[style*="border: none"]').textContent = "Giỏ đồ ăn của bạn";
        }
    }

    // Modify calculateTotal to use customFoodTotal if it exists
    const oldCalculateTotal = calculateTotal;
    calculateTotal = () => {
        let seatTotal = parseInt(document.getElementById('order-summary-seat-amount').dataset.amount) || 0;
        let comboTotal = customFoodTotal; // Default to custom food
        
        // If no custom food, fallback to radio buttons
        if(customFoodTotal === 0) {
            const selectedCombo = document.querySelector('input[name="combo"]:checked');
            if (selectedCombo) {
                if (selectedCombo.value === 'single') comboTotal = 65000;
                else if (selectedCombo.value === 'double') comboTotal = 95000;
            }
            comboAmountEl.dataset.amount = comboTotal;
            if(comboTotal > 0) {
                comboAmountEl.textContent = comboTotal.toLocaleString('vi-VN') + ' đ';
                comboRowEl.style.display = 'flex';
                foodListEl.innerHTML = '';
            } else {
                comboRowEl.style.display = 'none';
            }
        }
        
        let discount = parseInt(document.getElementById('order-summary-discount-amount').dataset.amount) || 0;
        let finalTotal = seatTotal + comboTotal - discount;
        
        if (finalTotal < 0) finalTotal = 0;
        
        document.getElementById('order-total').textContent = finalTotal.toLocaleString('vi-VN') + ' đ';
        document.getElementById('order-total').dataset.amount = finalTotal;
    };
"""

js = js.replace("document.addEventListener('DOMContentLoaded', () => {", "document.addEventListener('DOMContentLoaded', () => {\n" + new_logic)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js)
