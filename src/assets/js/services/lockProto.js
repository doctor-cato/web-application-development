/**
 * lockProto.js (updated)
 * Front-end-only prototype for seat locking using BroadcastChannel + localStorage TTL.
 * Enhancements:
 *  - per-seat countdown display
 *  - multi-seat selection for current tab
 *  - summary update and "Tiếp Tục" button that saves checkout to sessionStorage and redirects to checkout page
 */

const CHANNEL_NAME = 'cinema_seat_channel';
const LS_KEY = 'cinema_seat_locks';
const CHECKOUT_KEY = 'cinema_checkout';
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const PRICE = { normal: 80000, vip: 120000, couple: 150000 };

const bc = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel(CHANNEL_NAME) : null;

function _readLocks() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

function _writeLocks(m) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(m)); } catch (e) {}
}

function cleanupExpired() {
  const m = _readLocks();
  const now = Date.now();
  let changed = false;
  Object.keys(m).forEach(showId => {
    Object.keys(m[showId] || {}).forEach(seatId => {
      if (m[showId][seatId].expiresAt <= now) {
        delete m[showId][seatId];
        changed = true;
      }
    });
    if (Object.keys(m[showId] || {}).length === 0) delete m[showId];
  });
  if (changed) _writeLocks(m);
}

function formatMs(ms) {
  if (ms <= 0) return '00:00';
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2,'0');
  const ss = String(s % 60).padStart(2,'0');
  return `${mm}:${ss}`;
}

// selection state for this tab
const selectedSeats = new Set();

function lockSeat(showtimeId, seatId, userId = 'local') {
  cleanupExpired();
  const m = _readLocks();
  m[showtimeId] = m[showtimeId] || {};
  if (m[showtimeId][seatId]) return false; // already locked
  const expiresAt = Date.now() + LOCK_DURATION_MS;
  m[showtimeId][seatId] = { seatId, userId, expiresAt };
  _writeLocks(m);
  bc && bc.postMessage({ type: 'seat_locked', showtimeId, seatId, userId, expiresAt });
  // schedule local cleanup
  setTimeout(() => {
    const cur = _readLocks();
    if (cur[showtimeId] && cur[showtimeId][seatId] && cur[showtimeId][seatId].expiresAt <= Date.now()) {
      delete cur[showtimeId][seatId];
      _writeLocks(cur);
      bc && bc.postMessage({ type: 'seat_unlocked', showtimeId, seatId });
      updateSeatDom(showtimeId, seatId, 'unlock');
    }
  }, LOCK_DURATION_MS + 1000);
  return true;
}

function unlockSeat(showtimeId, seatId) {
  const m = _readLocks();
  if (m[showtimeId] && m[showtimeId][seatId]) {
    delete m[showtimeId][seatId];
    _writeLocks(m);
    bc && bc.postMessage({ type: 'seat_unlocked', showtimeId, seatId });
    return true;
  }
  return false;
}

function getSeatMap(showtimeId) {
  cleanupExpired();
  const m = _readLocks();
  return m[showtimeId] || {};
}

function ensureDemoGrid() {
  const grid = document.getElementById('seat-grid');
  if (!grid) return;
  if (grid.querySelector('[data-seat]')) return;
  const rows = 6, cols = 8;
  const wrapper = document.createElement('div');
  wrapper.className = 'w-full flex flex-col items-center gap-2';
  for (let r=0;r<rows;r++) {
    const row = document.createElement('div');
    row.className = 'flex gap-2';
    for (let c=0;c<cols;c++) {
      const seatId = String.fromCharCode(65+r) + (c+1);
      const s = document.createElement('button');
      s.className = 'seat seat--available w-10 h-8 rounded-sm relative';
      s.setAttribute('data-seat', seatId);
      s.title = seatId;
      // small countdown element
      const cd = document.createElement('span');
      cd.className = 'seat-countdown absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-secondary hidden';
      s.appendChild(cd);
      row.appendChild(s);
    }
    wrapper.appendChild(row);
  }
  grid.innerHTML = '';
  grid.appendChild(wrapper);
}

function updateSeatDom(showtimeId, seatId, action, ownerId) {
  const el = document.querySelector(`[data-seat="${seatId}"]`);
  if (!el) return;
  const cd = el.querySelector('.seat-countdown');
  if (action === 'lock') {
    el.classList.remove('seat--available','seat--selected');
    el.classList.add('seat--locked');
    el.setAttribute('data-locked-by', ownerId || '');
    if (cd) cd.classList.remove('hidden');
  } else if (action === 'unlock') {
    el.classList.remove('seat--locked','seat--selected');
    el.classList.add('seat--available');
    el.removeAttribute('data-locked-by');
    if (cd) { cd.classList.add('hidden'); cd.textContent = ''; }
  } else if (action === 'select') {
    el.classList.remove('seat--available');
    el.classList.add('seat--selected');
    if (cd) cd.classList.remove('hidden');
  }
}

function tickCountdowns() {
  const map = _readLocks();
  const now = Date.now();
  Object.keys(map).forEach(showId => {
    Object.keys(map[showId]).forEach(seatId => {
      const data = map[showId][seatId];
      const el = document.querySelector(`[data-seat="${seatId}"]`);
      if (!el) return;
      const cd = el.querySelector('.seat-countdown');
      const remaining = data.expiresAt - now;
      if (remaining <= 0) {
        // will be cleaned by cleanupExpired; reflect visually
        if (cd) { cd.textContent = '00:00'; }
      } else {
        if (cd) cd.textContent = formatMs(remaining);
      }
    });
  });
}

// update selection summary UI
function updateSummary() {
  const list = document.getElementById('selected-seats-list');
  const totalEl = document.getElementById('total-price');
  const btn = document.getElementById('btn-continue');
  if (!list || !totalEl || !btn) return;
  list.innerHTML = '';
  let total = 0;
  if (selectedSeats.size === 0) {
    list.innerHTML = '<p class="text-secondary text-xs italic">Chưa chọn ghế nào.</p>';
    totalEl.textContent = '0 đ';
    btn.disabled = true;
    return;
  }
  selectedSeats.forEach(s => {
    const span = document.createElement('span');
    span.className = 'bg-primary-container text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider mr-2';
    span.textContent = s;
    list.appendChild(span);
    // simple pricing: normal for all
    total += PRICE.normal;
  });
  totalEl.textContent = total.toLocaleString('vi-VN') + ' đ';
  btn.disabled = false;
}

function attachHandlers(showtimeId = 'demo') {
  ensureDemoGrid();
  // initial cleanup/render
  const map = getSeatMap(showtimeId);
  Object.keys(map).forEach(seatId => updateSeatDom(showtimeId, seatId, 'lock', map[seatId].userId));

  document.querySelectorAll('[data-seat]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const seatId = btn.getAttribute('data-seat');
      if (btn.classList.contains('seat--booked')) return;
      if (btn.classList.contains('seat--locked')) {
        const owner = btn.getAttribute('data-locked-by') || 'local';
        if (owner === 'local') {
          // allow unlock
          const ok = unlockSeat(showtimeId, seatId);
          if (ok) {
            selectedSeats.delete(seatId);
            updateSeatDom(showtimeId, seatId, 'unlock');
            updateSummary();
          }
        } else {
          alert('Ghế này đang được giữ bởi người khác.');
        }
        return;
      }
      // attempt to lock
      const ok = lockSeat(showtimeId, seatId, 'local');
      if (ok) {
        selectedSeats.add(seatId);
        updateSeatDom(showtimeId, seatId, 'select', 'local');
        updateSummary();
      } else {
        alert('Ghế đã được giữ bởi người khác.');
      }
    });
  });

  const btnContinue = document.getElementById('btn-continue');
  if (btnContinue) {
    btnContinue.addEventListener('click', () => {
      // build checkout object and save to sessionStorage
      const seats = Array.from(selectedSeats);
      const total = seats.length * PRICE.normal; // simple
      const checkout = {
        movieTitle: document.getElementById('movie-title')?.textContent || 'Demo Movie',
        showtimeId: showtimeId,
        room: document.getElementById('showtime-room')?.textContent || 'Demo Room',
        seats,
        combo: 'none',
        total
      };
      try { sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(checkout)); } catch (e) {}
      window.location.href = 'checkout.html';
    });
  }
}

if (bc) {
  bc.onmessage = (ev) => {
    const msg = ev.data;
    if (!msg || !msg.type) return;
    if (msg.type === 'seat_locked') {
      updateSeatDom(msg.showtimeId, msg.seatId, 'lock', msg.userId);
    } else if (msg.type === 'seat_unlocked') {
      updateSeatDom(msg.showtimeId, msg.seatId, 'unlock');
    } else if (msg.type === 'seat_booked') {
      const el = document.querySelector(`[data-seat="${msg.seatId}"]`);
      if (el) { el.classList.remove('seat--locked','seat--available','seat--selected'); el.classList.add('seat--booked'); }
    }
  };
}

// periodic tick to update countdown UI and cleanup expired locks
setInterval(() => { try { cleanupExpired(); tickCountdowns(); updateSummary(); } catch (e) {} }, 1000);

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  try { cleanupExpired(); } catch (e) {}
  attachHandlers('demo');
});

export { lockSeat, unlockSeat, getSeatMap, cleanupExpired };
