(async () => {
  let products = {};
  let state = {};
  let productIds = [];

  const money = (value) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`;

  function normalizeImagePath(path) {
    if (!path) return '/shared/images/food_popcorn.png';
    if (typeof path === 'string') {
        path = path.trim().replace(/^["'\[\s]+|["'\]\s]+$/g, '');
    }
    if (!path) return '/shared/images/food_popcorn.png';
    if (path.includes('3hd2k-api.somee.com')) {
        path = path.replace(/^https?:\/\/3hd2k-api\.somee\.com/, '');
    }
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    if (path.startsWith('/shared/') || path.startsWith('../')) return path;
    if (path.startsWith('/')) return path;
    return `/${path}`;
  }

  try {
    const res = await fetch('/api/combos');
    if (res.ok) {
        const data = await res.json();
        data.forEach(item => {
            products[item.id] = {
                name: item.name,
                price: item.price,
                desc: item.desc || item.description || '',
                image: normalizeImagePath(item.image),
                category: item.category || 'Combo'
            };
        });
    }
  } catch (e) {
      console.error('API Error:', e);
  }

  productIds = Object.keys(products);
  state = Object.fromEntries(
    productIds.map((id) => [id, { added: false, qty: 1 }]),
  );

  const gridCombo = document.getElementById('grid-combo');
  const gridFood = document.getElementById('grid-food');

  productIds.forEach(id => {
      const p = products[id];
      const html = `
          <article class="card" data-product="${id}">
            <div class="media">
              <img loading="lazy" src="${p.image}" alt="${p.name}">
            </div>
            <div class="body">
              <h3>${p.name}</h3>
              <div class="price">${money(p.price)}</div>
              <p class="desc">${p.desc}</p>
              <div class="controls">
                <div class="qty-row">
                  <div class="qty-label btn-minus">-</div>
                  <span class="qty-display">1</span>
                  <div class="qty-label btn-plus">+</div>
                </div>
                <div class="add-row"><label class="add-label ${id}-btn-label"></label></div>
              </div>
            </div>
          </article>
      `;
      if (p.category === 'Combo') {
          if (gridCombo) gridCombo.insertAdjacentHTML('beforeend', html);
      } else {
          if (gridFood) gridFood.insertAdjacentHTML('beforeend', html);
      }
  });

  const order = {
    movie: 'Dune: Part Two',
    format: 'IMAX 2D',
    seats: 'G12, G13, G14',
    ticketLabel: '3x Vé người lớn',
    ticketPrice: 450000,
  };

  const refs = {
    search: document.querySelector('.search'),
    navLinks: [...document.querySelectorAll('.food-tab')],
    summary: {
      movie: document.querySelector('.summary .movie'),
      ticketLabel: document.querySelector('.summary .line-ticket .muted'),
      ticketPrice: document.querySelector('.summary .line-ticket .price'),
      amount: document.querySelector('.summary .amount'),
      items: document.querySelector('.summary-products'),
    },
    cards: Object.fromEntries(
      productIds.map((id) => [id, document.querySelector(`.card[data-product="${id}"]`)]),
    )
  };

  function renderCard(id) {
    const card = refs.cards[id];
    if (!card) return;

    const product = products[id];
    const current = state[id];

    const titleEl = card.querySelector('h3');
    const priceEl = card.querySelector('.price');
    const descEl = card.querySelector('.desc');
    const addLabel = card.querySelector('.add-label');
    const qtyRow = card.querySelector('.qty-row');

    if (titleEl) titleEl.textContent = product.name;
    if (priceEl) priceEl.textContent = money(product.price);
    if (descEl) descEl.textContent = product.desc;

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

    const minusEl = qtyRow.querySelector(`.btn-minus-${minusIndex}`) || qtyRow.querySelector('.btn-minus');
    const valueEl = qtyRow.querySelector(`.val-${current.qty}`) || qtyRow.querySelector('.qty-display');
    const plusEl = qtyRow.querySelector(`.btn-plus-${plusIndex}`) || qtyRow.querySelector('.btn-plus');

    if (minusEl) {
      minusEl.style.display = 'inline-flex';
      if (current.qty === 1) {
        minusEl.style.opacity = '0.35';
        minusEl.style.pointerEvents = 'none';
      }
    }

    if (valueEl) {
        valueEl.style.display = 'inline-flex';
        valueEl.textContent = current.qty;
    }

    if (plusEl) {
      plusEl.style.display = 'inline-flex';
      if (current.qty === 10) {
        plusEl.style.opacity = '0.35';
        plusEl.style.pointerEvents = 'none';
      }
    }
  }

  function renderSummary() {
    if (refs.summary.movie) refs.summary.movie.textContent = `${order.movie} • ${order.format} • ${order.seats}`;
    if (refs.summary.ticketLabel) refs.summary.ticketLabel.textContent = order.ticketLabel;
    if (refs.summary.ticketPrice) refs.summary.ticketPrice.textContent = money(order.ticketPrice);
    if (refs.summary.items) refs.summary.items.innerHTML = '';

    const productTotal = productIds.reduce((sum, id) => {
      const item = state[id];
      if (!item.added) return sum;

      const line = document.createElement('div');
      line.className = 'line line-product';
      line.innerHTML = `
        <span class="muted">${products[id].name}</span>
        <span class="count">${item.qty}x · ${money(products[id].price * item.qty)}</span>
      `;
      if (refs.summary.items) refs.summary.items.appendChild(line);

      return sum + products[id].price * item.qty;
    }, 0);

    if (refs.summary.amount) refs.summary.amount.textContent = money(order.ticketPrice + productTotal);
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
      const targetId = link.getAttribute('data-target');
      if (targetId) {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  renderAll();
})();
