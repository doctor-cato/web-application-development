import re

with open('src/booking/booking-food/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Add shakeSummary function
shake_fn = """
  function shakeSummary() {
    const card = document.querySelector('.summary-card');
    if (card) {
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
    }
  }

  function applySearchFilter(query) {"""
js = js.replace('  function applySearchFilter(query) {', shake_fn)

# 2. Add card.classList.toggle('active', current.added) inside renderCard
render_card_update = """
    if (addLabel) {
      addLabel.setAttribute('aria-pressed', String(current.added));
      addLabel.textContent = current.added ? 'ĐÃ THÊM VÀO ĐƠN' : 'THÊM VÀO ĐƠN';
      addLabel.style.background = current.added ? 'rgba(255,255,255,0.05)' : '';
      addLabel.style.color = current.added ? 'var(--muted)' : '';
      addLabel.style.border = current.added ? '1px solid rgba(255,255,255,0.1)' : '';
      addLabel.style.boxShadow = current.added ? 'none' : '';
    }
    
    if (current.added) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
"""
js = re.sub(r'    if \(addLabel\) \{[\s\S]*?boxShadow = current.added \? \'none\' : \'\';\n    \}', render_card_update, js)

# 3. Trigger shakeSummary on addLabel or qtyLabel + click
click_update = """
    if (addLabel) {
      state[id].added = !state[id].added;
      if (state[id].added) shakeSummary();
    } else if (qtyLabel) {
      const step = qtyLabel.textContent.trim() === '+' ? 1 : -1;
      state[id].qty = Math.max(1, Math.min(10, state[id].qty + step));
      if (step === 1 && state[id].added) shakeSummary();
    }
"""
js = re.sub(r'    if \(addLabel\) \{\n      state\[id\]\.added = !state\[id\]\.added;\n    \} else if \(qtyLabel\) \{\n      const step = qtyLabel\.textContent\.trim\(\) === \'\+\' \? 1 : -1;\n      state\[id\]\.qty = Math\.max\(1, Math\.min\(10, state\[id\]\.qty \+ step\)\);\n    \}', click_update, js)

with open('src/booking/booking-food/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
