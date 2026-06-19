(() => {
  const products = {
    combo: {
      name: 'Combo Người Yêu Phim',
      price: 150000,
      desc:
        'Bữa tiệc tối thượng cho các tín đồ điện ảnh. Bao gồm một bắp XL, hai nước ngọt lớn và món nachos đẫm sốt đặc trưng.',
    },
    popcorn: {
      name: 'Bắp Đơn',
      price: 65000,
      desc: 'Bắp rang bơ cỡ lớn đặc trưng. Tùy chọn vị Bơ, Caramel hoặc Phô mai cay.',
    },
    popcornDuo: {
      name: 'Bắp Rang Đôi',
      price: 95000,
      desc:
        'Phần bắp đôi dành cho 2 người, nhiều hơn, giòn hơn và cực hợp khi xem phim cùng nhau.',
    },
    comboFamily: { name: 'Combo Gia Đình', price: 195000, desc: '2 Bắp lớn + 4 Nước ngọt. Phù hợp cho cả nhà.' }, comboSnack: { name: 'Combo Ăn Vặt', price: 85000, desc: '1 Nước ngọt + 1 Xúc xích + 1 Khoai tây chiên.' }, comboCinema: { name: 'Combo Siêu Khổng Lồ', price: 115000, desc: '1 Bắp siêu lớn + 1 Nước khổng lồ. Ăn mãi không hết.' }, comboDate: { name: 'Combo Hẹn Hò VIP', price: 135000, desc: '2 Bắp nhỏ + 2 Nước ngọt + 2 Xúc xích nướng.' }, comboParty: { name: 'Combo Tiệc Tùng', price: 250000, desc: '4 Bắp lớn + 4 Nước ngọt + 4 Snack. Quẩy hết mình.' }, comboBimBim: {
      name: 'Combo 2 Bỏng',
      price: 125000,
      desc:
        'Một bắp rang lớn đi kèm một bim bim khoai tây, hợp để đổi vị khi xem phim cùng nhau.',
    },
    coupleDrink: {
      name: 'Combo Cặp Đôi',
      price: 55000,
      desc:
        'Một cốc nước to kèm 2 ống hút chia đôi, phù hợp cho cặp đôi thích chia sẻ cùng nhau.',
    },
    drinksCombo2: {
      name: 'Combo 2 Nước',
      price: 65000,
      desc:
        'Combo gồm 2 ly nước riêng cho 2 người, tiện hơn khi đi xem phim cùng bạn bè hoặc người yêu.',
    },
    coca: {
      name: 'Coca',
      price: 35000,
      desc: 'Nước ngọt Coca mát lạnh, vị quen thuộc, dễ uống và hợp với bắp rang.',
    },
    pepsi: {
      name: 'Pepsi',
      price: 35000,
      desc: 'Nước ngọt Pepsi mát lạnh, vị ngọt đậm và rất hợp để uống kèm đồ ăn xem phim.',
    },
  };

  // Load order data dynamically from session
  const urlParams = new URLSearchParams(window.location.search);
  const returnToLobby = urlParams.get('returnToLobby');

  let order = { movie: '', format: '', seats: '', ticketLabel: '', ticketPrice: 0 };

  if (returnToLobby) {
    // From Group Booking Lobby
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
          movie: cd.movieTitle || '',
          format: cd.room || '',
          seats: mySeat || activeSeats[0] || '',
          ticketLabel: `1x Vé (Ghế ${mySeat || activeSeats[0] || '?'})`,
          ticketPrice: perSeat,
        };
      } catch(e) {}
    }
  } else {
    // From Single Booking (checkout flow)
    const sessionRaw = sessionStorage.getItem('cinema_checkout');
    if (sessionRaw) {
      try {
        const sd = JSON.parse(sessionRaw);
        const seatNames = (sd.seats || []).join(', ');
        const seatCount = (sd.seats || []).length || 1;
        order = {
          movie: sd.movieTitle || '',
          format: sd.room || '',
          seats: seatNames,
          ticketLabel: `${seatCount}x Vé người lớn`,
          ticketPrice: sd.total || 0,
        };
      } catch(e) {}
    }
  }

  const productIds = Object.keys(products);
  const state = Object.fromEntries(
    productIds.map((id) => [id, { added: false, qty: 1 }]),
  );

  const money = (value) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`;

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

    refs.summary.amount.textContent = money(order.ticketPrice + productTotal);

    // Save selected items to localStorage for the checkout page
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

  // (Bỏ qua search và navLinks cũ do đã sử dụng component navbar.js toàn cục)

  
  // Slider logic
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


  // Sticky Tabs Scroll Spy
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

  // Smooth scroll for tabs
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

  // Handle returnToLobby UI changes
  if (returnToLobby) {
    const btnContinue = document.querySelector('.summary a.btn.primary');
    if (btnContinue) {
      btnContinue.innerHTML = '<i class="fas fa-check"></i> XÁC NHẬN & VỀ PHÒNG CHỜ';
      btnContinue.href = `../group-booking/index.html?order=${returnToLobby}`;
    }
    const btnBack = document.querySelector('.summary a.btn.ghost');
    if (btnBack) {
      btnBack.style.display = 'none';
    }
  }

  renderAll();
})();
