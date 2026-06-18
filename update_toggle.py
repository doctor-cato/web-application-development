import re

html_file = 'src/booking/seat-booking/booking.html'
js_file = 'src/booking/seat-booking/booking.js'
checkout_js_file = 'src/booking/checkout/checkout.js'

# 1. Update booking.html
with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

old_selector = """                    <!-- Upgraded Group Seat Selector (Below map) -->
                    <div class="group-seat-selector glass-panel" style="margin-top: 2.5rem; display: flex; align-items: center; justify-content: space-between; max-width: 500px; padding: 1rem 1.5rem; border: 1px solid rgba(229, 9, 20, 0.3); box-shadow: 0 4px 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(229,9,20,0.1); border-radius: 50px;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(229, 9, 20, 0.2); display: flex; align-items: center; justify-content: center; color: var(--primary-red); font-size: 1.2rem;">
                                <i class="fas fa-user-friends"></i>
                            </div>
                            <div>
                                <div style="font-weight: 700; color: #fff; font-size: 1rem; letter-spacing: 0.5px;">Chọn ghế nhóm</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Tự động chọn các ghế sát nhau</div>
                            </div>
                        </div>
                        <div class="group-seat-controls" style="background: rgba(0,0,0,0.6); padding: 0.25rem 0.5rem; border-radius: 30px; border: 1px solid rgba(255,255,255,0.1);">
                            <button id="btn-group-minus" class="group-seat-btn" style="border-radius: 50%;" disabled><i class="fas fa-minus" style="font-size: 0.8rem;"></i></button>
                            <span id="group-size-display" class="group-seat-value" style="width: 30px; font-size: 1.2rem;">1</span>
                            <button id="btn-group-plus" class="group-seat-btn" style="border-radius: 50%; background: rgba(229, 9, 20, 0.2); color: var(--primary-red); border: 1px solid rgba(229, 9, 20, 0.3);"><i class="fas fa-plus" style="font-size: 0.8rem;"></i></button>
                        </div>
                    </div>"""

new_selector = """                    <!-- Upgraded Group Seat Selector with Toggle -->
                    <div class="group-seat-selector glass-panel" style="margin-top: 2.5rem; display: flex; flex-direction: column; gap: 1rem; max-width: 500px; padding: 1rem 1.5rem; border: 1px solid rgba(229, 9, 20, 0.3); box-shadow: 0 4px 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(229,9,20,0.1); border-radius: 20px;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(229, 9, 20, 0.2); display: flex; align-items: center; justify-content: center; color: var(--primary-red); font-size: 1.2rem;">
                                    <i class="fas fa-user-friends"></i>
                                </div>
                                <div>
                                    <div style="font-weight: 700; color: #fff; font-size: 1rem; letter-spacing: 0.5px;">Bật chọn ghế nhóm</div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Tự động chọn sát nhau & Bật Split Pay</div>
                                </div>
                            </div>
                            <!-- Toggle Switch -->
                            <label style="position: relative; display: inline-block; width: 50px; height: 26px;">
                                <input type="checkbox" id="toggle-group-booking" style="opacity: 0; width: 0; height: 0;">
                                <span class="slider round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; transition: .4s; border-radius: 34px;">
                                    <span style="position: absolute; content: ''; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%;"></span>
                                </span>
                            </label>
                            <style>
                                input:checked + .slider { background-color: var(--primary-red); }
                                input:checked + .slider > span { transform: translateX(24px); }
                            </style>
                        </div>
                        
                        <!-- Counter UI (Hidden by default) -->
                        <div id="group-counter-ui" style="display: none; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
                            <span style="font-size: 0.85rem; color: #ccc;">Số lượng ghế cần tìm:</span>
                            <div class="group-seat-controls" style="background: rgba(0,0,0,0.6); padding: 0.25rem 0.5rem; border-radius: 30px; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center;">
                                <button id="btn-group-minus" class="group-seat-btn" style="border-radius: 50%;" disabled><i class="fas fa-minus" style="font-size: 0.8rem;"></i></button>
                                <span id="group-size-display" class="group-seat-value" style="width: 30px; font-size: 1.2rem; display: inline-block; text-align: center;">1</span>
                                <button id="btn-group-plus" class="group-seat-btn" style="border-radius: 50%; background: rgba(229, 9, 20, 0.2); color: var(--primary-red); border: 1px solid rgba(229, 9, 20, 0.3);"><i class="fas fa-plus" style="font-size: 0.8rem;"></i></button>
                            </div>
                        </div>
                    </div>"""

html = html.replace(old_selector, new_selector)
with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)


# 2. Update booking.js
with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

old_logic = """  // Group Seat Logic
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
  }"""

new_logic = """  // Group Seat Logic
  const btnMinus = document.getElementById('btn-group-minus');
  const btnPlus = document.getElementById('btn-group-plus');
  const sizeDisplay = document.getElementById('group-size-display');
  const toggleGroup = document.getElementById('toggle-group-booking');
  const counterUi = document.getElementById('group-counter-ui');
  let currentGroupSize = 1;
  
  if (toggleGroup && counterUi) {
      toggleGroup.addEventListener('change', (e) => {
          if (e.target.checked) {
              counterUi.style.display = 'flex';
              // Default to 2 when turned on
              currentGroupSize = 2;
              if(sizeDisplay) sizeDisplay.innerText = currentGroupSize;
              setGroupSize(currentGroupSize);
              if(btnMinus) btnMinus.disabled = false;
              if(btnPlus) btnPlus.disabled = false;
          } else {
              counterUi.style.display = 'none';
              currentGroupSize = 1;
              if(sizeDisplay) sizeDisplay.innerText = currentGroupSize;
              setGroupSize(currentGroupSize);
              if(btnMinus) btnMinus.disabled = true;
          }
      });
  }
  
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
  }"""

js = js.replace(old_logic, new_logic)

# Also update handleContinue to save isGroupBooking
js = js.replace("seatTotal: calculateTotal(),", "seatTotal: calculateTotal(),\n    isGroupBooking: document.getElementById('toggle-group-booking')?.checked || false,")

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js)


# 3. Update checkout.js
with open(checkout_js_file, 'r', encoding='utf-8') as f:
    checkout_js = f.read()

old_hide = """    // Hide Split & Lock if seats < 2
    if (btnSplitPay) {
        const seatsCount = checkoutData && checkoutData.selectedSeats ? checkoutData.selectedSeats.length : 0;
        if (seatsCount < 2) {
            btnSplitPay.style.display = 'none';
        }
    }"""

new_hide = """    // Hide Split & Lock if user didn't turn on group booking OR seats < 2
    if (btnSplitPay) {
        const seatsCount = checkoutData && checkoutData.selectedSeats ? checkoutData.selectedSeats.length : 0;
        const isGroupBooking = checkoutData && checkoutData.isGroupBooking;
        if (!isGroupBooking || seatsCount < 2) {
            btnSplitPay.style.display = 'none';
        }
    }"""

if old_hide in checkout_js:
    checkout_js = checkout_js.replace(old_hide, new_hide)

with open(checkout_js_file, 'w', encoding='utf-8') as f:
    f.write(checkout_js)

print("Toggle implemented.")
