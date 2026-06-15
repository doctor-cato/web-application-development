/**
 * seatGrid.js
 * Component tạo sơ đồ ghế tương tác cho trang booking, sử dụng giao diện Tailwind CSS chuẩn.
 */

let _selectedSeats = new Set();
let _seatElements = {}; // { 'A1': HTMLElement }
let _callbacks = null;

export function renderSeatGrid(container, seatMap, callbacks) {
  _selectedSeats.clear();
  _seatElements = {};
  _callbacks = callbacks || {};
  
  container.innerHTML = '';
  
  const gridContainer = document.createElement('div');
  gridContainer.className = 'seat-rows space-y-4 w-full max-w-4xl flex flex-col items-center';

  const rows = ['A','B','C','D','E','F','G','H','I','J'];
  
  rows.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'flex items-center gap-3 w-full justify-center';
    
    // Row label start
    const labelStart = document.createElement('div');
    labelStart.className = 'w-6 text-sm text-secondary text-right font-bold';
    labelStart.innerText = row;
    rowEl.appendChild(labelStart);

    // Seats container
    const seatsContainer = document.createElement('div');
    seatsContainer.className = 'flex gap-2 flex-wrap justify-center';

    const isCoupleRow = row === 'J';
    const numSeats = isCoupleRow ? 6 : 12;

    for (let i = 1; i <= numSeats; i++) {
      const seatId = isCoupleRow ? `J${i}` : `${row}${i}`;
      const seatInfo = seatMap[seatId] || null;
      const seatEl = _createSeatEl(seatId, seatInfo);
      _seatElements[seatId] = seatEl;
      seatsContainer.appendChild(seatEl);

      // Add aisle
      if ((isCoupleRow && i === 3) || (!isCoupleRow && i === 6)) {
         const aisle = document.createElement('div');
         aisle.className = 'w-8';
         seatsContainer.appendChild(aisle);
      }
    }

    rowEl.appendChild(seatsContainer);

    // Row label end
    const labelEnd = document.createElement('div');
    labelEnd.className = 'w-6 text-sm text-secondary text-left font-bold';
    labelEnd.innerText = row;
    rowEl.appendChild(labelEnd);

    gridContainer.appendChild(rowEl);
  });

  container.appendChild(gridContainer);
}

export function updateSeat(seatId, newState, userId) {
  const el = _seatElements[seatId];
  if (!el) return;
  
  // Clear old states
  el.classList.remove('seat--locked', 'seat--booked', 'seat--selected', 'seat--available');
  el.title = `Seat ${seatId}`;

  if (newState === 'locked') {
    if (_selectedSeats.has(seatId) && el.dataset.userId !== userId) {
       _selectedSeats.delete(seatId);
       if (_callbacks.onDeselect) _callbacks.onDeselect(seatId);
    }
    el.classList.add('seat--locked');
    el.title = `Seat ${seatId} (Locked)`;
  } else if (newState === 'booked') {
    el.classList.add('seat--booked');
    el.title = `Seat ${seatId} (Booked)`;
  } else if (_selectedSeats.has(seatId)) {
    el.classList.add('seat--selected');
  } else {
    el.classList.add('seat--available');
  }
}

export function getSelectedSeats() {
  return Array.from(_selectedSeats);
}

export function clearSelection() {
  _selectedSeats.forEach(seatId => {
    if (_seatElements[seatId]) {
      _seatElements[seatId].classList.remove('seat--selected');
      _seatElements[seatId].classList.add('seat--available');
    }
  });
  _selectedSeats.clear();
}

function _createSeatEl(seatId, seatInfo) {
  const el = document.createElement('div');
  // Match Tailwind mockup exactly
  el.className = 'seat seat--available w-9 h-9 rounded-sm flex justify-center items-center text-[9px] text-white/30 font-bold';
  el.innerText = seatId;
  el.dataset.id = seatId;

  // Determine type
  const type = getSeatType(seatId);
  if (type === 'vip') {
    el.classList.add('seat--vip');
  } else if (type === 'couple') {
    el.classList.add('seat--couple');
  }

  if (seatInfo) {
    if (seatInfo.status === 'booked' || seatInfo.bookingId) {
      el.classList.remove('seat--available');
      el.classList.add('seat--booked');
      el.title = `Seat ${seatId} (Booked)`;
    } else if (seatInfo.expiresAt) {
      el.classList.remove('seat--available');
      el.classList.add('seat--locked');
      el.title = `Seat ${seatId} (Locked)`;
    }
  }

  el.addEventListener('click', () => {
    if (el.classList.contains('seat--booked') || el.classList.contains('seat--locked')) {
      return; // cannot click
    }
    
    if (_selectedSeats.has(seatId)) {
      _selectedSeats.delete(seatId);
      el.classList.remove('seat--selected');
      el.classList.add('seat--available');
      if (_callbacks.onDeselect) _callbacks.onDeselect(seatId);
    } else {
      _selectedSeats.add(seatId);
      el.classList.remove('seat--available');
      el.classList.add('seat--selected');
      if (_callbacks.onSelect) _callbacks.onSelect(seatId);
    }
  });

  return el;
}

export function getSeatType(seatId) {
  const row = seatId.charAt(0);
  if (row === 'J') return 'couple';
  if (['H', 'I'].includes(row)) return 'vip';
  return 'regular';
}
