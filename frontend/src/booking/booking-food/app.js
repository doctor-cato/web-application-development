(async () => {
  const isHTTPS = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isVercelHost = typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('vercel'));
  const API_BASE_URL = (typeof window !== 'undefined' && window.API_BASE_URL) || 
      ((isHTTPS || isVercelHost) ? `${window.location.origin}/api` : 'http://3hd2k-api.somee.com/api');

  function getApiUrl(path) {
      const base = API_BASE_URL.replace(/\/+$/, '');
      const p = path.startsWith('/') ? path : '/' + path;
      return base + p;
  }

  const money = (value) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`;

  let products = {};
  
  try {
      const res = await fetch(getApiUrl('/combos'));
      if (res.ok) {
          const data = await res.json();
          data.forEach(item => {
              products[item.id] = {
                  name: item.name,
                  price: item.price,
                  desc: item.desc,
                  category: item.category || 'Combo',
                  image: item.image || item.imageUrl || '../../shared/images/combo_double.png'
              };
          });
      }
  } catch (e) {
      console.warn('API /combos error, fallback to localStorage', e);
  }
  
  if (Object.keys(products).length === 0) {
      const local = JSON.parse(localStorage.getItem('cinema_combos') || '[]');
      if (local.length > 0) {
          local.forEach(item => {
              products[item.id] = {
                  name: item.name,
                  price: item.price,
                  desc: item.desc,
                  category: item.category || 'Combo',
                  image: item.image || item.imageUrl || '../../shared/images/combo_double.png'
              };
          });
      } else {
          // Hardcoded fallback if both API and localStorage fail
          const defaultCombos = [
              { id: "cb_solo", name: "Combo Solo", desc: "1 Bắp Ngọt (L) + 1 Nước Ngọt (L)", price: 89000, stock: 150, image: "../../assets/combos/combo_solo.jpg", category: "Combo" },
              { id: "cb_couple", name: "Combo Couple", desc: "1 Bắp Ngọt (XL) + 2 Nước Ngọt (L)", price: 129000, stock: 120, image: "../../assets/combos/combo_couple.jpg", category: "Combo" },
              { id: "cb_family", name: "Combo Family", desc: "2 Bắp Ngọt (XL) + 4 Nước Ngọt (L) + 1 Snack", price: 219000, stock: 80, image: "../../assets/combos/combo_family.jpg", category: "Combo" }
          ];
          defaultCombos.forEach(item => {
              products[item.id] = {
                  name: item.name,
                  price: item.price,
                  desc: item.desc,
                  category: item.category,
                  image: item.image
              };
          });
      }
  }

  const productIds = Object.keys(products);
  const state = Object.fromEntries(
    productIds.map((id) => [id, { added: false, qty: 1 }])
  );

  const gridCombo = document.getElementById('grid-combo');
  const gridFood = document.getElementById('grid-food');

  if (gridCombo) gridCombo.innerHTML = '';
  if (gridFood) gridFood.innerHTML = '';

  productIds.forEach(id => {
      const p = products[id];
      const html = `
          <div class="card" data-product="${id}">
              <div class="media">
                  <img src="${p.image}" alt="">
              </div>
              <div class="body">
                  <h3>${p.name}</h3>
                  <p class="desc">${p.desc}</p>
                  <div class="price">${money(p.price)}</div>
                  <div class="controls">
                      <div class="qty-row">
                          <span class="qty-label btn-minus">-</span>
                          <span class="qty-display">1</span>
                          <span class="qty-label btn-plus">+</span>
                      </div>
                      <div class="add-row">
                          <label class="add-label" aria-pressed="false" for="add-${id}">THÊM VÀO ĐƠN</label>
                          <input type="checkbox" id="add-${id}" style="display:none">
                      </div>
                  </div>
              </div>
          </div>
      `;
      if (p.category === 'Combo') {
          if (gridCombo) gridCombo.insertAdjacentHTML('beforeend', html);
      } else {
          if (gridFood) gridFood.insertAdjacentHTML('beforeend', html);
      }
  });

  const urlParams = new URLSearchParams(window.location.search);
  const returnToLobby = urlParams.get('returnToLobby');

  let order = { movie: 'Chưa chọn phim', format: '', seats: '', ticketLabel: '0x Vé', ticketPrice: 0 };

  if (returnToLobby) {
    const raw = localStorage.getItem('splitOrder_' + returnToLobby);
    if (raw) {
      try {
        const groupData = JSON.parse(raw);
        const cd = groupData.checkoutData || {};
        const mySeat = localStorage.getItem('mySeatForOrder_' + returnToLobby);
        const activeSeats = (cd.seats || []).filter(s => !(groupData.cancelledSeats || []).includes(s));
        const activeCount = activeSeats.length || 1;
        const perSeat = Math.floor((cd.total || 0) / activeCount);
        order = {
          movie: cd.movieTitle || 'Chưa chọn phim',
          format: cd.room || '',
          seats: mySeat || activeSeats[0] || '',
          ticketLabel: `1x Vé (Ghế ${mySeat || activeSeats[0] || '?'})`,
          ticketPrice: perSeat,
        };
      } catch(e) {}
    }
  } else {
    const sessionRaw = sessionStorage.getItem('cinema_checkout');
    if (sessionRaw) {
      try {
        const sd = JSON.parse(sessionRaw);
        const seatNames = (sd.seats || []).join(', ');
        const seatCount = (sd.seats || []).length || 1;
        order = {
          movie: sd.movieTitle || 'Chưa chọn phim',
          format: sd.room || '',
          seats: seatNames,
          ticketLabel: `${seatCount}x Vé người lớn`,
          ticketPrice: sd.seatTotal || sd.seatAmount || sd.total || 0,
        };
      } catch(e) {}
    }
  }

  try {
    const checkoutFoodStr = localStorage.getItem('checkoutFood');
    if (checkoutFoodStr) {
        const foodArr = JSON.parse(checkoutFoodStr);
        foodArr.forEach(item => {
            if (state[item.id]) {
                state[item.id].added = true;
                state[item.id].qty = item.qty;
            }
        });
    }
  } catch (e) {
    console.error('Lỗi khi tải dữ liệu từ localStorage', e);
  }

  const refs = {
    search: document.querySelector('.search'),
    navLinks: [...document.querySelectorAll('.nav a')],
    summary: {
      movie: document.querySelector('.summary .movie'),
      ticketLabel: document.querySelector('.summary .line-ticket .muted'),
      ticketPrice: document.querySelector('.summary .line-ticket .price'),
      amount: document.querySelector('.summary .amount'),
      items: document.querySelector('.summary-products'),
    },
    cards: Object.fromEntries(
      productIds.map((id) => [id, document.querySelector(`.card[data-product="${id}"]`)]),
    ),
    addToggles: Object.fromEntries(
      productIds.map((id) => [id, document.getElementById(`add-${id}`)]),
    ),
  };

  function renderCard(id) {
    const card = refs.cards[id];
    if (!card) return;

    const product = products[id];
    const current = state[id];
    const addToggle = refs.addToggles[id];

    const titleEl = card.querySelector('h3');
    const priceEl = card.querySelector('.price');
    const descEl = card.querySelector('.desc');
    const addLabel = card.querySelector('.add-label');
    const qtyRow = card.querySelector('.qty-row');

    if (titleEl) titleEl.textContent = product.name;
    if (priceEl) priceEl.textContent = money(product.price);
    if (descEl) descEl.textContent = product.desc;

    if (addToggle) addToggle.checked = current.added;

    if (addLabel) {
      addLabel.setAttribute('aria-pressed', String(current.added));
      addLabel.textContent = current.added ? 'ĐÃ THÊM VÀO ĐƠN' : 'THÊM VÀO ĐƠN';
      addLabel.style.background = current.added ? 'rgba(255,255,255,0.05)' : '';
      addLabel.style.color = current.added ? 'var(--muted)' : '';
      addLabel.style.border = current.added ? '1px solid rgba(255,255,255,0.1)' : '';
      addLabel.style.boxShadow = current.added ? 'none' : '';
    }

    if (current.added) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }

    if (!qtyRow) return;

    const minusEl = qtyRow.querySelector('.btn-minus');
    const valueEl = qtyRow.querySelector('.qty-display');
    const plusEl = qtyRow.querySelector('.btn-plus');

    if (valueEl) valueEl.textContent = current.qty;

    if (minusEl) {
      if (current.qty === 1) {
        minusEl.style.opacity = '0.35';
        minusEl.style.pointerEvents = 'none';
      } else {
        minusEl.style.opacity = '1';
        minusEl.style.pointerEvents = 'auto';
      }
    }

    if (plusEl) {
      if (current.qty === 10) {
        plusEl.style.opacity = '0.35';
        plusEl.style.pointerEvents = 'none';
      } else {
        plusEl.style.opacity = '1';
        plusEl.style.pointerEvents = 'auto';
      }
    }
  }

  function renderSummary() {
    refs.summary.movie.textContent = `${order.movie} • ${order.format} • ${order.seats}`;
    refs.summary.ticketLabel.textContent = order.ticketLabel;
    refs.summary.ticketPrice.textContent = money(order.ticketPrice);

    refs.summary.items.innerHTML = '';

    const productTotal = productIds.reduce((sum, id) => {
      const item = state[id];
      if (!item.added) return sum;

      const line = document.createElement('div');
      line.className = 'line line-product';
      line.innerHTML = `
        <span class="muted">${products[id].name}</span>
        <span class="count">${item.qty}x · ${money(products[id].price * item.qty)}</span>
      `;
      refs.summary.items.appendChild(line);

      return sum + products[id].price * item.qty;
    }, 0);

    let finalProductTotal = productTotal;
    if (typeof window.currentDiscount !== 'undefined' && window.currentDiscount > 0) {
      const discountAmount = Math.floor(productTotal * (window.currentDiscount / 100));
      finalProductTotal = productTotal - discountAmount;
      const discountLine = document.createElement('div');
      discountLine.className = 'line line-product';
      discountLine.style.color = '#4caf50';
      discountLine.innerHTML = `
        <span>Khuyến mãi (${window.currentDiscount}%)</span>
        <span class="count">- ${money(discountAmount)}</span>
      `;
      refs.summary.items.appendChild(discountLine);
    }

    refs.summary.amount.textContent = money(order.ticketPrice + finalProductTotal);

    const selectedFoods = [];
    productIds.forEach(id => {
      if(state[id].added) {
        const card = refs.cards[id];
        const img = card ? card.querySelector('img').getAttribute('src') : '';
        selectedFoods.push({
          id: id,
          name: products[id].name,
          price: products[id].price,
          qty: state[id].qty,
          img: img
        });
      }
    });
    localStorage.setItem('selectedFood', JSON.stringify(selectedFoods));
  }

  function renderAll() {
    productIds.forEach(renderCard);
    renderSummary();
  }

  function shakeSummary() {
    const card = document.querySelector('.summary-card');
    if (card) {
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
    }
  }

  function applySearchFilter(query) {
    const normalized = query.trim().toLowerCase();

    productIds.forEach((id) => {
      const card = refs.cards[id];
      if (!card) return;

      const haystack = `${products[id].name} ${products[id].desc}`.toLowerCase();
      card.style.display = haystack.includes(normalized) ? '' : 'none';
    });
  }

  document.addEventListener('click', (event) => {
    const addLabel = event.target.closest('.add-label');
    const qtyLabel = event.target.closest('.qty-label');

    if (!addLabel && !qtyLabel) return;

    const card = event.target.closest('.card[data-product]');
    if (!card) return;

    event.preventDefault();
    event.stopPropagation();

    const id = card.dataset.product;
    if (!state[id]) return;

    if (addLabel) {
      state[id].added = !state[id].added;
      if (state[id].added) shakeSummary();
    } else if (qtyLabel) {
      const step = qtyLabel.textContent.trim() === '+' ? 1 : -1;
      state[id].qty = Math.max(1, Math.min(10, state[id].qty + step));
      if (step === 1 && state[id].added) shakeSummary();
    }

    renderCard(id);
    renderSummary();
  });

  document.querySelectorAll('.category').forEach(cat => {
    const prev = cat.querySelector('.prev');
    const next = cat.querySelector('.next');
    const grid = cat.querySelector('.grid');
    if(prev && next && grid) {
      prev.addEventListener('click', () => {
        grid.scrollBy({ left: -340, behavior: 'smooth' });
      });
      next.addEventListener('click', () => {
        grid.scrollBy({ left: 340, behavior: 'smooth' });
      });
    }
  });

  window.currentPromoCode = '';
  window.currentDiscount = 0;

  const btnApplyPromo = document.getElementById('btn-apply-promo');
  const btnRemovePromo = document.getElementById('btn-remove-promo');
  const promoInput = document.getElementById('promo-input');
  const promoInputGroup = document.getElementById('promo-input-group');
  const appliedPromoContainer = document.getElementById('applied-promo-container');
  const appliedPromoCodeEl = document.getElementById('applied-promo-code');
  const promoDropdown = document.getElementById('promo-dropdown');
  const promoToggleBtn = document.getElementById('promo-toggle-btn');

  if (promoToggleBtn && promoDropdown) {
    promoToggleBtn.addEventListener('click', () => {
      promoDropdown.classList.toggle('show');
    });
    document.addEventListener('click', (e) => {
      if (!promoDropdown.contains(e.target) && e.target !== promoToggleBtn && !promoToggleBtn.contains(e.target)) {
        promoDropdown.classList.remove('show');
      }
    });
  }

  if (btnApplyPromo) {
    btnApplyPromo.addEventListener('click', () => {
      const val = promoInput.value.trim().toUpperCase();
      if (val === 'DISCOUNT10' || val === 'FOOD10') {
        window.currentPromoCode = val;
        window.currentDiscount = 10;
        applyPromoUI();
        renderSummary();
      } else if (val) {
        alert('Mã khuyến mãi không hợp lệ hoặc đã hết hạn.');
      }
    });
  }

  if (btnRemovePromo) {
    btnRemovePromo.addEventListener('click', () => {
      window.currentPromoCode = '';
      window.currentDiscount = 0;
      promoInput.value = '';
      promoInputGroup.style.display = 'flex';
      appliedPromoContainer.style.display = 'none';
      renderSummary();
    });
  }

  function applyPromoUI() {
    promoInputGroup.style.display = 'none';
    appliedPromoContainer.style.display = 'flex';
    appliedPromoCodeEl.innerText = window.currentPromoCode;
  }

  const sections = document.querySelectorAll('.menu-section');
  const tabs = document.querySelectorAll('.food-tab');

  const observerOptions = {
    root: null,
    rootMargin: '-180px 0px -40% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        tabs.forEach(tab => {
          if (tab.dataset.target === id) {
            tab.classList.add('active');
          } else {
            tab.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => observer.observe(sec));

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = tab.dataset.target;
      const targetSec = document.getElementById(targetId);
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  const checkoutBtn = document.querySelector('.summary a.btn.primary');
  if (returnToLobby) {
    if (checkoutBtn) {
      checkoutBtn.innerHTML = '<i class="fas fa-check"></i> XÁC NHẬN & VỀ PHÒNG CHỜ';
      checkoutBtn.href = `../group-booking/room.html?order=${returnToLobby}`;
    }
    const btnBack = document.querySelector('.summary a.btn.ghost');
    if (btnBack) {
      btnBack.style.display = 'none';
    }
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const cart = [];
      productIds.forEach(id => {
          if (state[id].added) {
              cart.push({
                  id: id,
                  name: products[id].name,
                  price: products[id].price,
                  qty: state[id].qty
              });
          }
      });
      localStorage.setItem('checkoutFood', JSON.stringify(cart));

      let co = sessionStorage.getItem('cinema_checkout');
      if (!co) {
          sessionStorage.setItem('cinema_checkout', JSON.stringify({
              movieId: "food-only",
              movieTitle: "Chỉ Đặt Đồ Ăn",
              poster: "../../shared/images/combo_double.png",
              seats: [],
              ticketPrice: 0,
              totalPrice: 0,
              promoCode: window.currentPromoCode || ''
          }));
      } else {
          try {
              const sd = JSON.parse(co);
              sd.promoCode = window.currentPromoCode || sd.promoCode || '';
              sessionStorage.setItem('cinema_checkout', JSON.stringify(sd));
          } catch(err) {}
      }

      if (returnToLobby) {
          window.location.href = `../group-booking/room.html?order=${returnToLobby}`;
      } else {
          window.location.href = checkoutBtn.getAttribute('href');
      }
    });
  }

  renderAll();
})();
