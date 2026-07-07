const fs = require('fs');

let profileJs = fs.readFileSync('frontend/src/user/user-profile/profile.js', 'utf8');

const regex = /\/\/ Dynamic VIP Tab Content Update[\s\S]*?\/\/ ── 4\. Update Form Inputs/;

const newLogic = `// Dynamic VIP Tab Content Update
    const vipTabHeader = document.querySelector('#tab-vip .vip-header');
    const vipTabPerks = document.querySelector('#tab-vip .vip-perks-grid');
    const vipTabSubtitle = document.querySelector('#tab-vip > p');
    const vipUpgradeBtn = document.querySelector('#tab-vip .btn-save');

    if (vipPlan) {
        if (vipTabSubtitle) {
            const planName = vipPlan.charAt(0).toUpperCase() + vipPlan.slice(1);
            vipTabSubtitle.textContent = \`Các đặc quyền bạn đang được hưởng với hạng VIP \${planName}\`;
            vipTabSubtitle.style.color = 'var(--neon-green)';
            vipTabSubtitle.style.fontWeight = 'bold';
        }
    }

    if (vipTabHeader && vipTabPerks && vipPlan) {
        let title = 'VIP PLATINUM';
        let subtitle = 'Gói cao cấp nhất với vô vàn ưu đãi';
        let color = '#ffd700';
        let perksHtml = '';

        if (vipPlan === 'silver') {
            title = 'VIP SILVER';
            subtitle = 'Khởi đầu hành trình điện ảnh cao cấp';
            color = '#C0C0C0';
            perksHtml = \`
                <div class="vip-perk-card" style="background: rgba(30,30,30,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.5rem; text-align: center;">
                    <div style="width: 60px; height: 60px; background: rgba(192,192,192,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: \${color}; font-size: 1.5rem;"><i class="fas fa-coins"></i></div>
                    <h4 style="color: #fff; margin-bottom: 0.5rem; font-size: 1.1rem;">Tích điểm 1.2x</h4>
                    <p style="color: #aaa; font-size: 0.9rem;">Nhân 1.2 điểm thưởng khi giao dịch.</p>
                </div>
                <div class="vip-perk-card" style="background: rgba(30,30,30,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.5rem; text-align: center;">
                    <div style="width: 60px; height: 60px; background: rgba(192,192,192,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: \${color}; font-size: 1.5rem;"><i class="fas fa-percent"></i></div>
                    <h4 style="color: #fff; margin-bottom: 0.5rem; font-size: 1.1rem;">Giảm 5% F&B</h4>
                    <p style="color: #aaa; font-size: 0.9rem;">Giảm giá 5% khi mua bắp nước.</p>
                </div>
            \`;
            
            if (vipUpgradeBtn) {
                vipUpgradeBtn.textContent = 'Nâng cấp lên VIP Gold / Platinum';
                vipUpgradeBtn.style.display = 'inline-block';
            }
        } else if (vipPlan === 'gold') {
            title = 'VIP GOLD';
            subtitle = 'Trải nghiệm điện ảnh đỉnh cao';
            color = '#FFD700';
            perksHtml = \`
                <div class="vip-perk-card" style="background: rgba(30,30,30,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.5rem; text-align: center;">
                    <div style="width: 60px; height: 60px; background: rgba(255,215,0,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: \${color}; font-size: 1.5rem;"><i class="fas fa-coins"></i></div>
                    <h4 style="color: #fff; margin-bottom: 0.5rem; font-size: 1.1rem;">Tích điểm 1.5x</h4>
                    <p style="color: #aaa; font-size: 0.9rem;">Nhân 1.5 điểm thưởng khi giao dịch.</p>
                </div>
                <div class="vip-perk-card" style="background: rgba(30,30,30,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.5rem; text-align: center;">
                    <div style="width: 60px; height: 60px; background: rgba(255,215,0,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: \${color}; font-size: 1.5rem;"><i class="fas fa-ticket-alt"></i></div>
                    <h4 style="color: #fff; margin-bottom: 0.5rem; font-size: 1.1rem;">Vé miễn phí</h4>
                    <p style="color: #aaa; font-size: 0.9rem;">Tặng 1 vé xem phim 2D/3D miễn phí mỗi tháng.</p>
                </div>
                <div class="vip-perk-card" style="background: rgba(30,30,30,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.5rem; text-align: center;">
                    <div style="width: 60px; height: 60px; background: rgba(255,215,0,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: \${color}; font-size: 1.5rem;"><i class="fas fa-percent"></i></div>
                    <h4 style="color: #fff; margin-bottom: 0.5rem; font-size: 1.1rem;">Giảm 10% F&B</h4>
                    <p style="color: #aaa; font-size: 0.9rem;">Giảm giá 10% khi mua bắp nước.</p>
                </div>
            \`;
            
            if (vipUpgradeBtn) {
                vipUpgradeBtn.textContent = 'Nâng cấp lên VIP Platinum';
                vipUpgradeBtn.style.display = 'inline-block';
            }
        } else if (vipPlan === 'platinum') {
            if (vipUpgradeBtn) {
                vipUpgradeBtn.style.display = 'none';
            }
        }

        if (perksHtml) {
            vipTabHeader.innerHTML = \`
                <i class="fas fa-crown" style="font-size: 3.5rem; color: \${color}; margin-bottom: 1rem; filter: drop-shadow(0 0 15px \${color}80);"></i>
                <h3 style="font-family: 'Inter', sans-serif; font-size: 2rem; color: #fff; letter-spacing: 1px; margin-bottom: 0.5rem; text-transform: uppercase;">\${title}</h3>
                <p style="color: \${color}; font-size: 1.1rem; font-weight: 500;">\${subtitle}</p>
            \`;
            vipTabPerks.innerHTML = perksHtml;
            document.querySelector('#tab-vip .vip-benefits-container').style.borderColor = color;
        }
    }

    // ── 4. Update Form Inputs`;

if (regex.test(profileJs)) {
    profileJs = profileJs.replace(regex, newLogic);
    fs.writeFileSync('frontend/src/user/user-profile/profile.js', profileJs, 'utf8');
    console.log("Success");
} else {
    console.log("Regex failed");
}
