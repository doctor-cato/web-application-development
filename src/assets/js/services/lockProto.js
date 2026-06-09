/**
 * lockProto.js
 * Front-end-only prototype for seat locking using BroadcastChannel + localStorage TTL.
 * Works across tabs/windows in the same browser profile (no server required).
 * - Lock duration: 15 minutes
 * - Storage key: cinema_seat_locks
 * - Channel name: cinema_seat_channel
 */

const CHANNEL_NAME = 'cinema_seat_channel';
const LS_KEY = 'cinema_seat_locks';
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

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

function updateSeatDom(showtimeId, seatId, action, ownerId) {
  // Find seat element by data-seat attribute
  const el = document.querySelector(`[data-seat="${seatId}"]`);
  if (!el) return;
  if (action === 'lock') {
    el.classList.remove('seat--available','seat--selected');
    el.classList.add('seat--locked');
    el.setAttribute('data-locked-by', ownerId || '');
  } else if (action === 'unlock') {
    el.classList.remove('seat--locked');
    el.classList.add('seat--available');
    el.removeAttribute('data-locked-by');
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
      const el = document.querySelector(`[data-seat="${msg.seatId}"]`); if (el) { el.classList.remove('seat--locked','seat--available','seat--selected'); el.classList.add('seat--booked'); }
    }
  };
}

// Demo renderer: if seat-grid empty, create a simple grid for prototype
function ensureDemoGrid() {
  const grid = document.getElementById('seat-grid');
  if (!grid) return;
  // If contains seats already, skip
  if (grid.querySelector('[data-seat]')) return;
  // build 8 cols x 6 rows as demo
  const rows = 6, cols = 8;
  const wrapper = document.createElement('div');
  wrapper.className = 'w-full flex flex-col items-center gap-2';
  for (let r=0;r<rows;r++) {
    const row = document.createElement('div');
    row.className = 'flex gap-2';
    for (let c=0;c<cols;c++) {
      const seatId = String.fromCharCode(65+r) + (c+1);
      const s = document.createElement('button');
      s.className = 'seat seat--available w-10 h-8 rounded-sm';
      s.setAttribute('data-seat', seatId);
      s.title = seatId;
      row.appendChild(s);
    }
    wrapper.appendChild(row);
  }
  grid.innerHTML = '';
  grid.appendChild(wrapper);
}

function attachHandlers(showtimeId = 'demo') {
  ensureDemoGrid();
  document.querySelectorAll('[data-seat]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const seatId = btn.getAttribute('data-seat');
      // if booked or locked by other, ignore
      if (btn.classList.contains('seat--booked')) return;
      if (btn.classList.contains('seat--locked')) {
        // if locked by self, allow unlock
        const owner = btn.getAttribute('data-locked-by') || 'local';
        if (owner === 'local') { unlockSeat(showtimeId, seatId); updateSeatDom(showtimeId, seatId, 'unlock'); }
        return;
      }
      // optimistic local select => lock
      const ok = lockSeat(showtimeId, seatId, 'local');
      if (ok) {
        // mark selected for current tab
        btn.classList.remove('seat--available');
        btn.classList.add('seat--selected');
        // also reflect locked state (others will see locked)
        setTimeout(() => updateSeatDom(showtimeId, seatId, 'lock', 'local'), 50);
      } else {
        // someone else locked
        alert('Ghế đã được giữ bởi người khác.');
      }
    });
  });
}

// Initialize on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  try { cleanupExpired(); } catch (e) {}
  attachHandlers();
  // initial render of existing locks
  const map = getSeatMap('demo');
  Object.keys(map).forEach(seatId => updateSeatDom('demo', seatId, 'lock', map[seatId].userId));
});

// Export API for manual use
export { lockSeat, unlockSeat, getSeatMap, cleanupExpired };
