const fs = require('fs');
let content = fs.readFileSync('frontend/src/user/user-profile/profile.js', 'utf8');

const loadOffersFn = `
async function loadRealOffers() {
    const grid = document.querySelector('.offers-grid');
    if (!grid) return;

    grid.innerHTML = '<div style="text-align:center;padding:2rem;color:#888;width:100%;grid-column:1/-1;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Đang tải ưu đãi...</p></div>';

    try {
        const res = await fetch(\`\${API_BASE_URL}/vouchers\`);
        if (!res.ok) throw new Error('Network response was not ok');
        const vouchers = await res.json();
        
        grid.innerHTML = '';
        
        if (vouchers.length === 0) {
            grid.innerHTML = '<div style="text-align:center;padding:2rem;color:#888;width:100%;grid-column:1/-1;"><i class="fas fa-box-open fa-2x"></i><p>Hiện chưa có ưu đãi nào.</p></div>';
            return;
        }

        vouchers.forEach(v => {
            let discountStr = v.discountType === 'Percent' ? \`Giảm \${v.discountAmount}%\` : \`Giảm \${v.discountAmount.toLocaleString('vi-VN')}đ\`;
            let minOrderStr = v.minOrderAmount > 0 ? \`Áp dụng cho hóa đơn từ \${v.minOrderAmount.toLocaleString('vi-VN')}đ.\` : 'Áp dụng cho mọi hóa đơn.';
            let maxDiscountStr = v.discountType === 'Percent' && v.maxDiscountAmount > 0 ? \` Giảm tối đa \${v.maxDiscountAmount.toLocaleString('vi-VN')}đ.\` : '';
            let dateStr = v.expiryDate ? new Date(v.expiryDate).toLocaleDateString('vi-VN') : 'Không thời hạn';
            
            const card = document.createElement('div');
            card.className = 'offer-card discount';
            card.innerHTML = \`
                <div class="offer-icon">
                    <i class="fas fa-tags"></i>
                </div>
                <div class="offer-details">
                    <h3>\${v.code} - \${discountStr}</h3>
                    <p>\${v.description || ''} \${minOrderStr}\${maxDiscountStr}</p>
                    <span class="offer-date"><i class="far fa-clock"></i> HSD: \${dateStr}</span>
                </div>
                <button class="btn-use-offer" onclick="window.location.href='/explore/movie-search/index.html?tab=now-showing'">Dùng ngay</button>
            \`;
            grid.appendChild(card);
        });
    } catch (e) {
        console.error('Error fetching vouchers:', e);
        grid.innerHTML = '<div style="text-align:center;padding:2rem;color:#ff4d4f;width:100%;grid-column:1/-1;"><i class="fas fa-exclamation-triangle fa-2x"></i><p>Lỗi tải dữ liệu ưu đãi. Vui lòng thử lại sau.</p></div>';
    }
}
`;

content = content.replace('function initProfile() {', loadOffersFn + '\nfunction initProfile() {');
content = content.replace('try { setup2FA(); } catch(e) { console.error(\'setup2FA error:\', e); }', 'try { setup2FA(); } catch(e) { console.error(\'setup2FA error:\', e); }\n    try { loadRealOffers(); } catch(e) { console.error(\'loadRealOffers error:\', e); }');

fs.writeFileSync('frontend/src/user/user-profile/profile.js', content);
console.log('Done replacing profile.js');
