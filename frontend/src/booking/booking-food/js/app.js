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
    comboBimBim: {
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

  const order = {
    movie: 'Dune: Part Two',
    format: 'IMAX 2D',
    seats: 'G12, G13, G14',
    ticketLabel: '3x Vé người lớn',
    ticketPrice: 450000,
  };

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

    if (!qtyRow) return;

    qtyRow.querySelectorAll('.qty-label, .qty-display').forEach((el) => {
      el.style.display = 'none';
      el.style.opacity = '';
      el.style.pointerEvents = '';
    });

    const minusIndex = current.qty === 1 ? 1 : current.qty;
    const plusIndex = current.qty === 10 ? 11 : current.qty + 1;

    const minusEl = qtyRow.querySelector(`.btn-minus-${minusIndex}`);
    const valueEl = qtyRow.querySelector(`.val-${current.qty}`);
    const plusEl = qtyRow.querySelector(`.btn-plus-${plusIndex}`);

    if (minusEl) {
      minusEl.style.display = 'inline-flex';
      if (current.qty === 1) {
        minusEl.style.opacity = '0.35';
        minusEl.style.pointerEvents = 'none';
      }
    }

    if (valueEl) valueEl.style.display = 'inline-flex';

    if (plusEl) {
      plusEl.style.display = 'inline-flex';
      if (current.qty === 10) {
        plusEl.style.opacity = '0.35';
        plusEl.style.pointerEvents = 'none';
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
  }

  function renderAll() {
    productIds.forEach(renderCard);
    renderSummary();
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
    } else if (qtyLabel) {
      const step = qtyLabel.textContent.trim() === '+' ? 1 : -1;
      state[id].qty = Math.max(1, Math.min(10, state[id].qty + step));
    }

    renderCard(id);
    renderSummary();
  });

  if (refs.search) {
    refs.search.addEventListener('input', (event) => {
      applySearchFilter(event.target.value);
    });
  }

  refs.navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      refs.navLinks.forEach((item) => item.classList.remove('active'));
      link.classList.add('active');
    });
  });

  renderAll();
})();
