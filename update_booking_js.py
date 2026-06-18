import re

js_file = 'src/booking/seat-booking/booking.js'

with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update import
old_import = "import { renderSeatGrid, updateSeat, getSelectedSeats, getSeatType } from '/shared/components/seatGrid.js';"
new_import = "import { renderSeatGrid, updateSeat, getSelectedSeats, getSeatType, setGroupSize } from '/shared/components/seatGrid.js';"
js = js.replace(old_import, new_import)

# 2. Add listeners to init()
# Find init() function start
init_start = "function init() {"
new_init_logic = """
  // Group Seat Logic
  const btnMinus = document.getElementById('btn-group-minus');
  const btnPlus = document.getElementById('btn-group-plus');
  const sizeDisplay = document.getElementById('group-size-display');
  let currentGroupSize = 1;
  
  if (btnMinus && btnPlus && sizeDisplay) {
      btnMinus.addEventListener('click', () => {
          if (currentGroupSize > 1) {
              currentGroupSize--;
              sizeDisplay.innerText = currentGroupSize;
              setGroupSize(currentGroupSize);
              btnPlus.disabled = false;
              if (currentGroupSize === 1) btnMinus.disabled = true;
          }
      });
      
      btnPlus.addEventListener('click', () => {
          if (currentGroupSize < 6) {
              currentGroupSize++;
              sizeDisplay.innerText = currentGroupSize;
              setGroupSize(currentGroupSize);
              btnMinus.disabled = false;
              if (currentGroupSize === 6) btnPlus.disabled = true;
          }
      });
  }
"""

js = js.replace(init_start, init_start + new_init_logic)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js)

print("booking.js updated.")
