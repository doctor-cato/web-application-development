import re

path = r'c:\Users\PC KHANH\web-application-development\src\booking\checkout\checkout.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace combo radio behavior
combo_old = '''  // combo radio behavior
  document.querySelectorAll('label.combo-card').forEach(l => {
    l.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('label.combo-card').forEach(x => x.classList.remove('selected'));
      l.classList.add('selected');
      const radio = l.querySelector('input[name="combo"]');
      if (radio) radio.checked = true;
      updateTotal();
    });
  });'''

combo_new = '''  // combo radio behavior
  document.querySelectorAll('input[name="combo"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('label.combo-card').forEach(x => x.classList.remove('selected'));
      const card = e.target.closest('.combo-card');
      if (card) card.classList.add('selected');
      updateTotal();
    });
  });'''

content = content.replace(combo_old, combo_new)

# Replace payment radio behavior
payment_old = '''  // payment radio behavior
  document.querySelectorAll('label.payment-card').forEach(l => {
    l.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('label.payment-card').forEach(x => {
        x.classList.remove('selected-momo', 'selected-vnpay');
        const icon = x.querySelector('i');
        if (icon) icon.style.display = 'none';
      });

      const radio = l.querySelector('input[name="payment"]');
      if (radio) {
        radio.checked = true;
        if (radio.value === 'momo') l.classList.add('selected-momo');
        if (radio.value === 'vnpay') l.classList.add('selected-vnpay');
      }
      
      const icon = l.querySelector('i');
      if (icon) icon.style.display = 'block';
    });
  });'''

payment_new = '''  // payment radio behavior
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('label.payment-card').forEach(x => {
        x.classList.remove('selected-momo', 'selected-vnpay');
        const icon = x.querySelector('i');
        if (icon) icon.style.display = 'none';
      });

      const selectedRadio = e.target;
      const card = selectedRadio.closest('.payment-card');
      if (card) {
        if (selectedRadio.value === 'momo') card.classList.add('selected-momo');
        if (selectedRadio.value === 'vnpay') card.classList.add('selected-vnpay');
        const icon = card.querySelector('i');
        if (icon) icon.style.display = 'block';
      }
    });
  });'''

content = content.replace(payment_old, payment_new)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Replaced behaviors in checkout.js')
