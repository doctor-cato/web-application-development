/**
 * seatGrid.js
 * Component tạo sơ đồ ghế tương tác cho trang booking.
 */

let _selectedSeats = new Set();
let _seatElements = {}; // { 'A1': HTMLElement }
let _callbacks = null;

export function renderSeatGrid(container, seatMap, callbacks) {
  _selectedSeats.clear();
  _seatElements = {};
  _callbacks = callbacks || {};
  
  container.innerHTML = '';
  
  const screen = document.createElement('div');
  screen.className = 'screen-arc';
  screen.innerHTML = '<div class="screen-text text-center text-muted mb-4">SCREEN</div>';
  container.appendChild(screen);

  const gridContainer = document.createElement('div');
  gridContainer.className = 'seat-grid d-flex flex-column align-items-center gap-2';

  const rows = ['A','B','C','D','E','F','G','H','I','J'];
  
  rows.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'seat-row d-flex gap-2 justify-content-center';
    
    // Row label start
    const labelStart = document.createElement('div');
    labelStart.className = 'seat-row-label text-muted';
    labelStart.style.width = '20px';
    labelStart.innerText = row;
    rowEl.appendChild(labelStart);

    for (let i = 1; i <= 12; i++) {
      const seatId = `${row}${i}`;
      const seatInfo = seatMap[seatId] || null;
      const seatEl = _createSeatEl(seatId, seatInfo);
      _seatElements[seatId] = seatEl;
      rowEl.appendChild(seatEl);
    }

    // Row label end
    const labelEnd = document.createElement('div');
    labelEnd.className = 'seat-row-label text-muted';
    labelEnd.style.width = '20px';
    labelEnd.innerText = row;
    rowEl.appendChild(labelEnd);

    gridContainer.appendChild(rowEl);
  });

  container.appendChild(gridContainer);
  container.appendChild(_getLegend());
}

export function updateSeat(seatId, newState, userId) {
  const el = _seatElements[seatId];
  if (!el) return;
  
  // Clear old states
  el.classList.remove('seat-locked', 'seat-booked', 'seat-selected');
  el.title = `Seat ${seatId}`;

  if (newState === 'locked') {
    if (_selectedSeats.has(seatId) && el.dataset.userId !== userId) {
       // Someone else locked it, and we had it selected? 
       // In real life, we should deselect it
       _selectedSeats.delete(seatId);
       if (_callbacks.onDeselect) _callbacks.onDeselect(seatId);
    }
    el.classList.add('seat-locked');
    el.title = `Seat ${seatId} (Locked)`;
  } else if (newState === 'booked') {
    el.classList.add('seat-booked');
    el.title = `Seat ${seatId} (Booked)`;
  } else if (_selectedSeats.has(seatId)) {
    el.classList.add('seat-selected');
  }
}

export function getSelectedSeats() {
  return Array.from(_selectedSeats);
}

export function clearSelection() {
  _selectedSeats.forEach(seatId => {
    if (_seatElements[seatId]) {
      _seatElements[seatId].classList.remove('seat-selected');
    }
  });
  _selectedSeats.clear();
}

function _createSeatEl(seatId, seatInfo) {
  const el = document.createElement('div');
  el.className = 'seat-item btn btn-outline-secondary p-0 text-center';
  el.style.width = '35px';
  el.style.height = '35px';
  el.style.lineHeight = '35px';
  el.style.fontSize = '12px';
  el.style.cursor = 'pointer';
  el.innerText = seatId;
  el.dataset.id = seatId;

  // Determine type
  const type = getSeatType(seatId);
  if (type === 'vip') {
    el.classList.add('seat-vip');
    el.classList.replace('btn-outline-secondary', 'btn-outline-danger');
  } else if (type === 'couple') {
    el.classList.add('seat-couple');
    el.classList.replace('btn-outline-secondary', 'btn-outline-info');
    // Couple seats often look wider, let's just make it visually distinct
  }

  if (seatInfo) {
    if (seatInfo.status === 'booked' || seatInfo.bookingId) {
      el.classList.add('seat-booked', 'disabled');
      el.style.backgroundColor = '#6c757d';
      el.style.color = '#fff';
      el.title = `Seat ${seatId} (Booked)`;
    } else if (seatInfo.expiresAt) {
      el.classList.add('seat-locked', 'disabled');
      el.style.backgroundColor = '#ffc107';
      el.title = `Seat ${seatId} (Locked)`;
    }
  }

  el.addEventListener('click', () => {
    if (el.classList.contains('seat-booked') || el.classList.contains('seat-locked')) {
      return; // cannot click
    }
    
    if (_selectedSeats.has(seatId)) {
      _selectedSeats.delete(seatId);
      el.classList.remove('seat-selected');
      el.style.backgroundColor = '';
      el.style.color = '';
      if (_callbacks.onDeselect) _callbacks.onDeselect(seatId);
    } else {
      _selectedSeats.add(seatId);
      el.classList.add('seat-selected');
      el.style.backgroundColor = '#28a745';
      el.style.color = '#fff';
      if (_callbacks.onSelect) _callbacks.onSelect(seatId);
    }
  });

  return el;
}

function _getLegend() {
  const div = document.createElement('div');
  div.className = 'seat-legend d-flex justify-content-center flex-wrap gap-4 mt-4 text-muted small';
  div.innerHTML = `
    <div class="d-flex align-items-center gap-2"><div style="width:20px;height:20px;border:1px solid #ccc;border-radius:4px;"></div> Thường</div>
    <div class="d-flex align-items-center gap-2"><div style="width:20px;height:20px;border:1px solid #dc3545;border-radius:4px;"></div> VIP</div>
    <div class="d-flex align-items-center gap-2"><div style="width:20px;height:20px;border:1px solid #0dcaf0;border-radius:4px;"></div> Đôi</div>
    <div class="d-flex align-items-center gap-2"><div style="width:20px;height:20px;background:#28a745;border-radius:4px;"></div> Đang chọn</div>
    <div class="d-flex align-items-center gap-2"><div style="width:20px;height:20px;background:#ffc107;border-radius:4px;"></div> Đang giữ</div>
    <div class="d-flex align-items-center gap-2"><div style="width:20px;height:20px;background:#6c757d;border-radius:4px;"></div> Đã đặt</div>
  `;
  return div;
}

export function getSeatType(seatId) {
  const row = seatId.charAt(0);
  if (row === 'J') return 'couple';
  if (['H', 'I'].includes(row)) return 'vip';
  return 'regular';
}
