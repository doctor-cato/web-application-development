import re

js_file = 'src/shared/components/seatGrid.js'

with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

# Add groupSize logic
# Replace let _callbacks = null; with let _callbacks = null;\nlet _groupSize = 1;
js = js.replace('let _callbacks = null;', 'let _callbacks = null;\nlet _groupSize = 1;')

# Add setGroupSize
js = js + "\nexport function setGroupSize(size) { _groupSize = size; }\n"

# Add _getGroupSeats
js = js + """
function _getGroupSeats(startSeatId) {
  if (_groupSize <= 1) return [startSeatId];
  
  const row = startSeatId.charAt(0);
  const startNum = parseInt(startSeatId.substring(1));
  const isCoupleRow = row === 'J';
  const numSeats = isCoupleRow ? 6 : 12;
  
  const group = [];
  const block1End = isCoupleRow ? 3 : 6;
  const startBlock = startNum <= block1End ? 1 : 2;
  
  for (let i = 0; i < _groupSize; i++) {
    const num = startNum + i;
    if (num > numSeats) return null;
    
    const currentBlock = num <= block1End ? 1 : 2;
    if (currentBlock !== startBlock) return null; // Crosses aisle
    
    const currentSeatId = `${row}${num}`;
    const el = _seatElements[currentSeatId];
    
    if (!el || el.classList.contains('seat--booked') || el.classList.contains('seat--locked')) {
      return null;
    }
    
    group.push(currentSeatId);
  }
  return group;
}
"""

# Replace _createSeatEl event listeners
# The old one had:
#   el.addEventListener('click', () => { ... });
#   return el;
# We will replace this part.

old_click = """  el.addEventListener('click', () => {
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
  });"""

new_click_and_hover = """  el.addEventListener('mouseenter', () => {
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
  });"""

js = js.replace(old_click, new_click_and_hover)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js)

print("seatGrid.js updated.")
