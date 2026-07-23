/**
 * seatGrid.js
 * Component tạo sơ đồ ghế tương tác cho trang booking, sử dụng giao diện Tailwind CSS chuẩn.
 */

let _selectedSeats = new Set();
let _seatElements = {}; // { 'A1': HTMLElement }
let _callbacks = null;
let _groupSize = 1;
let _isCineMatchMode = false;

export function setCineMatchMode(isActive) {
  _isCineMatchMode = isActive;
  const gridContainer = document.querySelector('.seat-grid-container');
  if (gridContainer) {
      if (isActive) gridContainer.classList.add('cine-match-active');
      else gridContainer.classList.remove('cine-match-active');
  }
}

export function renderSeatGrid(container, seatMap, callbacks) {
  _selectedSeats.clear();
  _seatElements = {};
  _callbacks = callbacks || {};
  
  container.innerHTML = '';
  
  const gridContainer = document.createElement('div');
  gridContainer.className = 'seat-grid-container';

  const rows = ['A','B','C','D','E','F','G','H','I','J'];
  
  rows.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'seat-row-wrapper';
    
    // Row label start
    const labelStart = document.createElement('div');
    labelStart.className = 'seat-row-label text-right';
    labelStart.innerText = row;
    rowEl.appendChild(labelStart);

    // Seats container
    const seatsContainer = document.createElement('div');
    seatsContainer.className = 'seat-row-seats';

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
         aisle.className = 'seat-aisle';
         seatsContainer.appendChild(aisle);
      }
    }

    rowEl.appendChild(seatsContainer);

    // Row label end
    const labelEnd = document.createElement('div');
    labelEnd.className = 'seat-row-label text-left';
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
  /* PONYTAIL: Prevent text selection & double-tap zoom issues on mobile screens */
  const el = document.createElement('div');
  el.className = 'seat seat--available';
  el.style.userSelect = 'none';
  el.style.webkitUserSelect = 'none';
  el.style.touchAction = 'manipulation';
  el.innerText = seatId;
  el.dataset.id = seatId;

  // Determine type
  const type = getSeatType(seatId);
  if (type === 'vip') {
    el.classList.add('seat--vip');
  } else if (type === 'couple') {
    el.classList.add('seat--couple');
  }
  
  const row = seatId.charAt(0);
  if (row === 'F' || row === 'G') {
      el.classList.add('seat-social-zone');
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

  el.addEventListener('mouseenter', () => {
    if (_groupSize > 1) {
      if (el.classList.contains('seat--booked') || el.classList.contains('seat--locked')) return;
      const group = _getGroupSeats(seatId);
      if (group) {
        group.forEach(id => {
          if(_seatElements[id]) _seatElements[id].classList.add('seat--preview-valid');
        });
      } else {
        el.classList.add('seat--preview-invalid');
      }
    }
  });

  el.addEventListener('mouseleave', () => {
    if (_groupSize > 1) {
      Object.values(_seatElements).forEach(s => {
        s.classList.remove('seat--preview-valid', 'seat--preview-invalid');
      });
    }
  });

  el.addEventListener('click', () => {
    if (el.classList.contains('seat--booked') || el.classList.contains('seat--locked')) {
      return; // cannot click
    }
    
    if (_isCineMatchMode) {
      // Cine-Match Mode logic
      if (!el.classList.contains('seat-social-zone')) {
        el.classList.add('seat--preview-invalid');
        setTimeout(() => el.classList.remove('seat--preview-invalid'), 300);
        return;
      }
      
      if (_selectedSeats.has(seatId)) {
        // Deselect
        _selectedSeats.delete(seatId);
        el.classList.remove('seat--selected');
        el.classList.add('seat--available');
        
        // Remove adjacent mark
        const adjacent = el.dataset.cineMatchAdjacent;
        if (adjacent && _seatElements[adjacent]) {
          _seatElements[adjacent].classList.remove('seat--cinematch-adjacent');
          _seatElements[adjacent].classList.add('seat--available');
          _seatElements[adjacent].innerText = adjacent;
          delete _seatElements[adjacent].dataset.cineMatchPrimary;
        }
        delete el.dataset.cineMatchAdjacent;
        
        if (_callbacks.onDeselect) _callbacks.onDeselect(seatId);
      } else {
        // Find adjacent seat for match
        const tempGroupSize = _groupSize;
        _groupSize = 2; // Force find 2 seats
        const group = _getGroupSeats(seatId);
        _groupSize = tempGroupSize;
        
        if (group && group.length === 2) {
           const adjacentId = group.find(id => id !== seatId);
           
           _selectedSeats.add(seatId);
           el.classList.remove('seat--available');
           el.classList.add('seat--selected');
           el.dataset.cineMatchAdjacent = adjacentId;
           
           // Mark adjacent seat visually
           _seatElements[adjacentId].classList.remove('seat--available');
           _seatElements[adjacentId].classList.add('seat--cinematch-adjacent');
           _seatElements[adjacentId].dataset.cineMatchPrimary = seatId;
           _seatElements[adjacentId].innerText = '❓';
           
           if (_callbacks.onSelect) _callbacks.onSelect(seatId);
        } else {
           el.classList.add('seat--preview-invalid');
           setTimeout(() => el.classList.remove('seat--preview-invalid'), 300);
        }
      }
      return; // Exit here for Cine-Match mode
    }
    
    if (_groupSize > 1) {
      if (_selectedSeats.has(seatId)) {
        // Deselect individual seat
        _selectedSeats.delete(seatId);
        el.classList.remove('seat--selected');
        el.classList.add('seat--available');
        if (_callbacks.onDeselect) _callbacks.onDeselect(seatId);
      } else {
        const group = _getGroupSeats(seatId);
        if (group) {
          group.forEach(id => {
            if (!_selectedSeats.has(id)) {
              _selectedSeats.add(id);
              _seatElements[id].classList.remove('seat--available');
              _seatElements[id].classList.add('seat--selected');
              if (_callbacks.onSelect) _callbacks.onSelect(id);
            }
          });
          // Remove hover preview after clicking
          Object.values(_seatElements).forEach(s => {
            s.classList.remove('seat--preview-valid', 'seat--preview-invalid');
          });
        } else {
           el.classList.add('seat--preview-invalid');
           setTimeout(() => el.classList.remove('seat--preview-invalid'), 300);
        }
      }
    } else {
      // Single select logic
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

export function getCineMatchAdjacentSeat(seatId) {
  const el = _seatElements[seatId];
  return el ? el.dataset.cineMatchAdjacent : null;
}

export function setGroupSize(size) { _groupSize = size; }

function _getGroupSeats(startSeatId) {
  if (_groupSize <= 1) return [startSeatId];
  
  const row = startSeatId.charAt(0);
  const startNum = parseInt(startSeatId.substring(1));
  const isCoupleRow = row === 'J';
  const numSeats = isCoupleRow ? 6 : 12;
  const block1End = isCoupleRow ? 3 : 6;
  const startBlock = startNum <= block1End ? 1 : 2;

  // Helper: try to build a group starting from 'from' going in 'direction' (+1 or -1)
  function tryDirection(from, direction) {
    const group = [];
    for (let i = 0; i < _groupSize; i++) {
      const num = from + i * direction;
      if (num < 1 || num > numSeats) return null;
      const currentBlock = num <= block1End ? 1 : 2;
      if (currentBlock !== startBlock) return null; // Crosses aisle
      const currentSeatId = `${row}${num}`;
      const el = _seatElements[currentSeatId];
      if (!el || el.classList.contains('seat--booked') || el.classList.contains('seat--locked')) {
        return null;
      }
      group.push(currentSeatId);
    }
    // Sort by seat number so display order is consistent
    group.sort((a, b) => parseInt(a.substring(1)) - parseInt(b.substring(1)));
    return group;
  }

  // Strategy 1: Left-to-right (original)
  let result = tryDirection(startNum, 1);
  if (result) return result;
  
  // Strategy 2: Right-to-left
  result = tryDirection(startNum, -1);
  if (result) return result;
  
  // Strategy 3: Center around clicked seat
  const offset = Math.floor(_groupSize / 2);
  result = tryDirection(startNum - offset, 1);
  if (result) return result;

  return null;
}
