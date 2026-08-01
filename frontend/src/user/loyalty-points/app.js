
(function () {
  'use strict';

  const TIERS = [
    {
      id: 'bronze',
      name: 'ĐỒNG',
      min: 0,
      max: 199,
      color: '#CD7F32',
      gradient: 'linear-gradient(160deg, #1a1610 0%, #121008 45%, #100e08 100%)',
      glowColor: 'rgba(205,127,50,0.25)',
      privileges: [
        'Tích điểm 1x cho mỗi vé',
        'Nhận thông báo ưu đãi',
        'Mở khóa khung viền Đồng'
      ]
    },
    {
      id: 'silver',
      name: 'BẠC',
      min: 200,
      max: 399,
      color: '#C0C0C0',
      gradient: 'linear-gradient(160deg, #1e1e22 0%, #151518 45%, #101012 100%)',
      glowColor: 'rgba(192,192,192,0.30)',
      privileges: [
        'Tích điểm 1.25x',
        'Giảm 2% combo Bắp Nước',
        'Ưu tiên mua vé trước 30 phút',
        'Mở khóa khung viền Bạc'
      ]
    },
    {
      id: 'gold',
      name: 'VÀNG',
      min: 400,
      max: 599,
      color: '#FFD700',
      gradient: 'linear-gradient(160deg, #1a1814 0%, #141210 45%, #100e0c 100%)',
      glowColor: 'rgba(255,215,0,0.30)',
      privileges: [
        'Tích điểm 1.5x',
        'Giảm 5% combo',
        'Tham gia sự kiện premiere',
        'Mở khóa khung viền Vàng'
      ]
    },
    {
      id: 'platinum',
      name: 'BẠCH KIM',
      min: 600,
      max: 799,
      color: '#E5E4E2',
      gradient: 'linear-gradient(160deg, #1a1a1e 0%, #141418 45%, #0e0e12 100%)',
      glowColor: 'rgba(229,228,226,0.30)',
      privileges: [
        'Tích điểm 1.75x',
        'Giảm 8% combo',
        'Phòng chờ VIP',
        'Mở khóa khung viền Bạch Kim'
      ]
    },
    {
      id: 'diamond',
      name: 'KIM CƯƠNG',
      min: 800,
      max: Infinity,
      color: '#B9F2FF',
      gradient: 'linear-gradient(160deg, #0f1a1e 0%, #0c1418 45%, #0a0e12 100%)',
      glowColor: 'rgba(185,242,255,0.30)',
      privileges: [
        'Tích điểm 2.0x',
        'Giảm 10% combo',
        'Quà sinh nhật đặc biệt',
        'Mở khóa khung viền Kim Cương'
      ]
    }
  ];

  const EARN_ACTIONS = [
    { id: 'ticket', label: 'Mua vé phim', icon: '🎬', minPts: 50, maxPts: 150 },
    { id: 'combo', label: 'Mua combo Bắp Nước', icon: '🍿', minPts: 20, maxPts: 50 },
    { id: 'checkin', label: 'Check-in tại rạp', icon: '📍', minPts: 10, maxPts: 10 },
    { id: 'rate', label: 'Đánh giá phim', icon: '⭐', minPts: 15, maxPts: 15 },
    { id: 'share', label: 'Chia sẻ mạng xã hội', icon: '📱', minPts: 5, maxPts: 5 }
  ];

  let state = {
    points: 0,
    history: []
  };

  const STORAGE_KEY = '3hd2k_rewards';



  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state.points = parsed.points || 0;
        state.history = parsed.history || [];
      }
    } catch (_) {  }
  }

  async function fetchUserPoints() {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('auth_token');
    if (!token) return;
    try {
      const res = await fetch(`${window.API_BASE_URL}/auth/me`, { headers: window.getApiHeaders() });
      if (res.ok) {
        const userData = await res.json();
        const oldPoints = state.points;
        state.points = userData.points || 0;
        updateUI(oldPoints, true);
      }
    } catch (e) {
      console.warn('Failed to fetch user points:', e);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getTier(pts) {
    for (let i = TIERS.length - 1; i >= 0; i--) {
      if (pts >= TIERS[i].min) return TIERS[i];
    }
    return TIERS[0];
  }

  function getNextTier(pts) {
    const current = getTier(pts);
    const idx = TIERS.indexOf(current);
    return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function formatDate(d) {
    const date = new Date(d);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  }

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

  function animateCounter(el, from, to, duration = 800) {
    const start = performance.now();
    const diff = to - from;
    el.classList.add('counting');
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(from + diff * eased);
      el.innerHTML = `${value} <span>PTS</span>`;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.classList.remove('counting');
      }
    }
    requestAnimationFrame(tick);
  }

  let toastContainer;

  function initToastContainer() {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  function showToast(message, pts, icon) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const ptsFormatted = pts >= 0 ? `+${pts} PTS` : `${pts} PTS`;
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <div class="toast-body">
        <span class="toast-msg">${message}</span>
        <span class="toast-pts" style="${pts < 0 ? 'color: #8a8a8a;' : ''}">${ptsFormatted}</span>
      </div>
    `;
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('toast--visible');
    });

    setTimeout(() => {
      toast.classList.add('toast--hiding');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
  }

  function showCelebration(tier) {
    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';
    overlay.innerHTML = `
      <div class="celebration-confetti" id="confettiCanvas"></div>
      <div class="celebration-modal">
        <div class="celebration-glow" style="background:radial-gradient(circle, ${tier.color}44 0%, transparent 70%)"></div>
        <div class="celebration-badge" style="color:${tier.color}; border-color:${tier.color}; box-shadow:0 0 30px ${tier.color}55">
          <svg viewBox="0 0 24 24" fill="${tier.color}" width="36" height="36"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        </div>
        <h2 class="celebration-title">🎉 THĂNG HẠNG!</h2>
        <p class="celebration-tier" style="color:${tier.color}">${tier.name}</p>
        <p class="celebration-sub">Chúc mừng bạn đã đạt hạng <strong>${tier.name}</strong>!<br>Bạn đã mở khoá thêm các đặc quyền mới.</p>
        <button class="celebration-btn" style="background:${tier.color}; color:${tier.id === 'diamond' || tier.id === 'gold' ? '#000' : '#fff'}">Tuyệt vời!</button>
      </div>
    `;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('celebration--visible'));

    spawnConfetti(overlay.querySelector('#confettiCanvas'), tier.color);

    const btn = overlay.querySelector('.celebration-btn');
    btn.addEventListener('click', () => {
      overlay.classList.remove('celebration--visible');
      overlay.classList.add('celebration--hiding');
      setTimeout(() => overlay.remove(), 500);
    });
  }

  function spawnConfetti(container, accentColor) {
    const colors = [accentColor, '#E50914', '#FFD700', '#B9F2FF', '#C0C0C0', '#fff'];
    const shapes = ['confetti-square', 'confetti-circle', 'confetti-strip'];
    for (let i = 0; i < 60; i++) {
      const el = document.createElement('div');
      const shape = shapes[randomInt(0, shapes.length - 1)];
      el.className = `confetti-particle ${shape}`;
      el.style.left = randomInt(5, 95) + '%';
      el.style.backgroundColor = colors[randomInt(0, colors.length - 1)];
      el.style.animationDelay = (randomInt(0, 1200)) + 'ms';
      el.style.animationDuration = (randomInt(1800, 3500)) + 'ms';
      container.appendChild(el);
    }
  }

  function showTierDetailsModal() {
    const currentTier = getTier(state.points);
    const overlay = document.createElement('div');
    overlay.className = 'tier-modal-overlay';

    let tiersHTML = TIERS.map((t, i) => {
      const isCurrent = t.id === currentTier.id;
      const isUnlocked = state.points >= t.min;
      return `
        <div class="tier-detail-card ${isCurrent ? 'tier-detail-card--current' : ''} ${isUnlocked ? 'tier-detail-card--unlocked' : ''}" style="--tier-color:${t.color}">
          <div class="tier-detail-marker">
            <div class="tier-detail-dot" style="background:${t.color}; box-shadow:0 0 12px ${t.color}88"></div>
            ${i < TIERS.length - 1 ? '<div class="tier-detail-line"></div>' : ''}
          </div>
          <div class="tier-detail-content">
            <div class="tier-detail-header">
              <span class="tier-detail-name" style="color:${t.color}">${t.name}</span>
              <span class="tier-detail-range">${t.max === Infinity ? t.min + '+ PTS' : t.min + ' – ' + t.max + ' PTS'}</span>
              ${isCurrent ? '<span class="tier-detail-current-badge">HIỆN TẠI</span>' : ''}
            </div>
            <ul class="tier-detail-privileges">
              ${t.privileges.map(p => `<li><span class="td-check" style="color:${t.color}">✓</span> ${p}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    }).join('');

    overlay.innerHTML = `
      <div class="tier-modal">
        <div class="tier-modal-header">
          <h2>CHI TIẾT CÁC HẠNG THẺ</h2>
          <button class="tier-modal-close" aria-label="Đóng">&times;</button>
        </div>
        <div class="tier-modal-body">
          ${tiersHTML}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('tier-modal--visible'));

    const closeBtn = overlay.querySelector('.tier-modal-close');
    const close = () => {
      overlay.classList.remove('tier-modal--visible');
      overlay.classList.add('tier-modal--hiding');
      setTimeout(() => overlay.remove(), 400);
    };
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  }

  function updateUI(oldPoints, animate = false) {
    const tier = getTier(state.points);
    const nextTier = getNextTier(state.points);

    const pointsEl = $('.points');
    if (animate && oldPoints !== state.points) {
      animateCounter(pointsEl, oldPoints, state.points);
    } else {
      pointsEl.innerHTML = `${state.points} <span>PTS</span>`;
    }

    const badgeEl = $('.tier-badge');
    badgeEl.textContent = tier.name;
    badgeEl.style.color = tier.color;
    badgeEl.style.borderColor = tier.color + '80';
    badgeEl.style.background = tier.color + '1a';

    const card = $('.rewards-card');
    card.style.background = tier.gradient;
    card.style.borderColor = tier.color + '26';
    card.setAttribute('data-tier', tier.id);

    const glow = $('.rewards-card-glow');
    glow.style.background = `radial-gradient(ellipse, ${tier.glowColor} 0%, transparent 70%)`;

    if (nextTier) {
      const progressInTier = state.points - tier.min;
      const tierRange = nextTier.min - tier.min;
      const pct = Math.min((progressInTier / tierRange) * 100, 100);

      const fill = $('.progress-fill');
      const thumb = $('.progress-thumb');
      fill.style.width = pct + '%';
      fill.style.background = `linear-gradient(90deg, ${tier.color}cc, ${tier.color})`;
      fill.style.boxShadow = `0 0 12px ${tier.color}66`;
      thumb.style.left = pct + '%';
      thumb.style.borderColor = tier.color;
      thumb.style.boxShadow = `0 0 8px ${tier.color}80`;

      const labels = $$('.progress-labels span');
      labels[0].textContent = `Hạng ${tier.name}`;
      labels[1].textContent = `${nextTier.name} (${nextTier.min} PTS)`;

      const hint = $('.progress-hint');
      const remaining = nextTier.min - state.points;
      hint.innerHTML = `Còn <strong>${remaining} PTS</strong> nữa để thăng hạng ${nextTier.name}`;
      hint.style.display = '';
    } else {

      const fill = $('.progress-fill');
      const thumb = $('.progress-thumb');
      fill.style.width = '100%';
      fill.style.background = `linear-gradient(90deg, ${tier.color}cc, ${tier.color})`;
      fill.style.boxShadow = `0 0 12px ${tier.color}66`;
      thumb.style.left = '100%';
      thumb.style.borderColor = tier.color;

      const labels = $$('.progress-labels span');
      labels[0].textContent = `Hạng ${tier.name}`;
      labels[1].textContent = 'Hạng cao nhất';

      const hint = $('.progress-hint');
      hint.innerHTML = `🎉 Bạn đang ở <strong>hạng cao nhất</strong>!`;
    }

    const privCard = $('.privileges-card');
    privCard.querySelector('h2').textContent = `ĐẶC QUYỀN HẠNG ${tier.name}`;
    const privList = privCard.querySelector('.privilege-list');
    privList.innerHTML = tier.privileges.map(p => `
      <li>
        <span class="check"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
        ${p}
      </li>
    `).join('');

    if (tier.id === 'diamond') {
      card.classList.add('tier-diamond');
    } else {
      card.classList.remove('tier-diamond');
    }

    $$('.gift-card').forEach(card => {
      const ptsText = $('.gift-pts', card).textContent.trim();
      const pts = parseInt(ptsText);
      const btn = $('.btn-redeem', card);
      if (btn) {
        if (state.points < pts) {
          btn.setAttribute('disabled', 'true');
          btn.classList.add('btn-redeem--disabled');
          btn.textContent = 'Chưa đủ điểm';
        } else {
          btn.removeAttribute('disabled');
          btn.classList.remove('btn-redeem--disabled');
          btn.textContent = 'Đổi ngay';
        }
      }
    });
  }

  function renderHistory() {
    const list = $('.history-list');

    const dynamicItems = state.history.slice().reverse();

    $$('.history-item:not([data-static])', list).forEach(el => el.remove());
    $$('.empty-history', list).forEach(el => el.remove());

    if (dynamicItems.length === 0 && $$('.history-item[data-static]', list).length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-history';
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.color = '#888';
      emptyMsg.style.padding = '40px 20px';
      emptyMsg.textContent = 'Chưa có lịch sử giao dịch nào.';
      list.appendChild(emptyMsg);
      return;
    }

    dynamicItems.forEach(entry => {
      const item = document.createElement('article');
      item.className = 'history-item history-item--new';

      const isRedemption = entry.pts < 0;
      const ptsFormatted = isRedemption ? `${entry.pts} PTS` : `+${entry.pts} PTS`;
      const ptsStyle = isRedemption ? 'color: #8a8a8a;' : 'color: var(--accent);';
      const statusText = isRedemption ? 'Đã đổi' : 'Hoàn thành';

      item.innerHTML = `
        <div class="history-poster history-poster--dynamic" style="background:linear-gradient(160deg, ${entry.color || '#e50914'}, ${entry.colorDark || '#3a0a0d'})">
          <span class="history-emoji">${entry.icon}</span>
        </div>
        <div class="history-info">
          <h4>${entry.label}</h4>
          <p>${formatDate(entry.date)}</p>
        </div>
        <div class="history-meta">
          <span class="history-pts" style="${ptsStyle}">${ptsFormatted}</span>
          <span class="history-status" style="${isRedemption ? 'color: #8a8a8a;' : ''}">${statusText}</span>
        </div>
      `;
      list.insertBefore(item, list.firstChild);
    });
  }

  function earnPoints(action) {
    const pts = randomInt(action.minPts, action.maxPts);
    const oldPoints = state.points;
    const oldTier = getTier(oldPoints);

    state.points += pts;
    const newTier = getTier(state.points);

    const colorMap = {
      ticket: { color: '#e55d65', dark: '#3a1a1d' },
      combo: { color: '#d4a040', dark: '#3a2a10' },
      checkin: { color: '#4a9a7a', dark: '#1a3028' },
      rate: { color: '#c9a84c', dark: '#4a3810' },
      share: { color: '#6a8ac9', dark: '#1a2848' }
    };

    state.history.push({
      id: Date.now(),
      actionId: action.id,
      label: action.label,
      icon: action.icon,
      pts: pts,
      date: new Date().toISOString(),
      color: colorMap[action.id]?.color || '#e50914',
      colorDark: colorMap[action.id]?.dark || '#3a0a0d'
    });

    saveState();
    showToast(action.label, pts, action.icon);
    updateUI(oldPoints, true);
    renderHistory();

    if (newTier.id !== oldTier.id) {
      setTimeout(() => showCelebration(newTier), 600);
    }
  }

  function showRedeemConfirmationModal(title, pts, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'tier-modal-overlay confirmation-modal-overlay';
    overlay.innerHTML = `
      <div class="tier-modal confirmation-modal" style="max-width: 400px;">
        <div class="tier-modal-header">
          <h2>XÁC NHẬN ĐỔI QUÀ</h2>
          <button class="tier-modal-close" aria-label="Đóng">&times;</button>
        </div>
        <div class="tier-modal-body" style="align-items: center; text-align: center; gap: 16px; padding: 24px;">
          <div style="font-size: 48px; margin-bottom: 8px;">🎁</div>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #ccc;">
            Bạn có chắc chắn muốn đổi vật phẩm <br>
            <strong style="color: #fff; font-size: 16px;">${title}</strong> <br>
            với giá <strong style="color: var(--accent); font-size: 16px;">${pts} PTS</strong> không?
          </p>
          <div style="display: flex; gap: 12px; width: 100%; margin-top: 16px;">
            <button class="btn-cancel" style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #ccc; font-weight: 600;">Hủy</button>
            <button class="btn-confirm" style="flex: 1; padding: 12px; border-radius: 8px; border: 0; background: var(--accent); color: #fff; font-weight: 700;">Xác nhận</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('tier-modal--visible'));

    const closeBtn = overlay.querySelector('.tier-modal-close');
    const cancelBtn = overlay.querySelector('.btn-cancel');
    const confirmBtn = overlay.querySelector('.btn-confirm');

    const close = () => {
      overlay.classList.remove('tier-modal--visible');
      overlay.classList.add('tier-modal--hiding');
      setTimeout(() => overlay.remove(), 400);
    };

    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    confirmBtn.addEventListener('click', () => {
      close();
      onConfirm();
    });
  }

  function redeemGift(title, pts, idx) {
    if (state.points < pts) {
      showToast('Không đủ điểm để đổi ' + title, 0, '❌');
      return;
    }

    showRedeemConfirmationModal(title, pts, () => {
      const oldPoints = state.points;
      state.points -= pts;

      const colors = [
        { color: '#d4a040', dark: '#3a2a10' },
        { color: '#e55d65', dark: '#3a1a1d' },
        { color: '#6a8ac9', dark: '#1a2848' }
      ];
      const colorIndex = idx % colors.length;

      state.history.push({
        id: Date.now(),
        actionId: 'redeem_' + idx,
        label: `Đổi quà: ${title}`,
        icon: '🎁',
        pts: -pts,
        date: new Date().toISOString(),
        color: colors[colorIndex].color,
        colorDark: colors[colorIndex].dark
      });

      saveState();
      showToast(`Đổi quà thành công!`, -pts, '🎁');
      updateUI(oldPoints, true);
      renderHistory();
    });
  }



  async function loadGifts() {
    const grid = document.querySelector('.gifts-grid');
    if (!grid) return;
    grid.innerHTML = '<div style="text-align:center;padding:2rem;color:#888;width:100%;grid-column:1/-1;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Đang tải phần thưởng...</p></div>';

    try {
      const res = await fetch(`${window.API_BASE_URL}/vouchers`);
      if (!res.ok) throw new Error('API error');
      const vouchers = await res.json();
      
      const pointVouchers = vouchers.filter(v => v.pointsRequired && v.pointsRequired > 0);

      grid.innerHTML = '';
      if (pointVouchers.length === 0) {
        grid.innerHTML = '<div style="text-align:center;padding:2rem;color:#888;width:100%;grid-column:1/-1;"><i class="fas fa-box-open fa-2x"></i><p>Hiện chưa có quà tặng nào để đổi.</p></div>';
        return;
      }

      pointVouchers.forEach((v, idx) => {
        let discountStr = v.discountType === 'Percent' ? `Giảm ${v.discountAmount}%` : `Giảm ${v.discountAmount.toLocaleString('vi-VN')}đ`;
        
        const card = document.createElement('article');
        card.className = 'gift-card';
        card.innerHTML = `
          <div class="gift-media gift-media--voucher" style="background-image:url('https://images.unsplash.com/photo-1607083206869-4c7672f72a8a?w=480&h=280&fit=crop')"></div>
          <div class="gift-body">
            <h3>${v.code}</h3>
            <p>${discountStr} - ${v.description || ''}</p>
            <div class="gift-footer">
              <span class="gift-pts">${v.pointsRequired} PTS</span>
              <button class="btn-redeem">Đổi ngay</button>
            </div>
          </div>
        `;
        
        const btn = card.querySelector('.btn-redeem');
        if (state.points < v.pointsRequired) {
          btn.setAttribute('disabled', 'true');
          btn.classList.add('btn-redeem--disabled');
          btn.textContent = 'Chưa đủ điểm';
        }
        
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          redeemGift(v.code, v.pointsRequired, idx);
        });

        grid.appendChild(card);
      });
    } catch (e) {
      console.warn('Voucher API error:', e);
      grid.innerHTML = '<div style="text-align:center;padding:2rem;color:#888;width:100%;grid-column:1/-1;"><i class="fas fa-box-open fa-2x"></i><p>Hiện chưa có quà tặng nào để đổi.</p></div>';
    }
  }

  function buildEarnSection() {
    const section = document.createElement('section');
    section.className = 'earn-section';
    section.innerHTML = `
      <div class="section-head">
        <div class="section-title">
          <span class="earn-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z"/></svg>
          </span>
          CÁCH TÍCH ĐIỂM
        </div>
      </div>
      <p class="earn-info-text">Điểm thưởng sẽ được cộng tự động khi bạn thực hiện các hoạt động sau tại 3HD2K:</p>
      <div class="earn-grid">
        ${EARN_ACTIONS.map(action => `
          <div class="earn-card" data-action="${action.id}">
            <span class="earn-card-icon">${action.icon}</span>
            <span class="earn-card-label">${action.label}</span>
            <span class="earn-card-pts">+${action.minPts === action.maxPts ? action.minPts : action.minPts + '~' + action.maxPts} PTS</span>
          </div>
        `).join('')}
      </div>
    `;

    const giftsSection = $('.gifts-section');
    if (giftsSection && giftsSection.parentNode) {
      giftsSection.parentNode.insertBefore(section, giftsSection);
    }
  }

  function markStaticItems() {
    $$('.history-item').forEach(item => {
      item.setAttribute('data-static', 'true');
    });
  }

  function bindTierDetailsButton() {
    const btn = $('.btn-outline');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showTierDetailsModal();
      });
    }
  }

  async function init() {
    loadState();
    initToastContainer();
    markStaticItems();
    buildEarnSection();
    bindTierDetailsButton();
    await fetchUserPoints();
    loadGifts();
    updateUI(state.points, false);
    renderHistory();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
