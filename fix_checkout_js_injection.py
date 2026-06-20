import re

js_file = 'src/booking/checkout/checkout.js'

with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

split_js = """
    // SPLIT & LOCK LOGIC
    const btnSplitPay = document.getElementById('btn-split-pay');
    const splitModal = document.getElementById('split-modal');
    const closeSplitModal = document.getElementById('close-split-modal');
    const splitLinkInput = document.getElementById('split-link-input');
    const btnCopyLink = document.getElementById('btn-copy-link');
    const checkoutSessionData = getCheckout();

    // Hide Split & Lock if user didn't turn on group booking OR seats < 2
    if (btnSplitPay) {
        const seatsCount = checkoutSessionData && checkoutSessionData.seats ? checkoutSessionData.seats.length : 0;
        const isGroupBooking = checkoutSessionData && checkoutSessionData.isGroupBooking;
        if (!isGroupBooking || seatsCount < 2) {
            btnSplitPay.style.display = 'none';
        }
    }

    if (btnSplitPay) {
        btnSplitPay.addEventListener('click', () => {
            const orderId = 'SPLIT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            
            const baseUrl = window.location.href.split('?')[0].replace('checkout.html', 'split-pay.html');
            const splitLink = baseUrl + '?order=' + orderId;
            splitLinkInput.value = splitLink;
            
            const splitData = {
                orderId: orderId,
                checkoutData: checkoutSessionData,
                customFood: localStorage.getItem('selectedFood'),
                status: 'PENDING'
            };
            localStorage.setItem('splitOrder_' + orderId, JSON.stringify(splitData));
            
            splitModal.style.display = 'flex';
        });
    }

    if (closeSplitModal) {
        closeSplitModal.addEventListener('click', () => {
            splitModal.style.display = 'none';
        });
    }

    if (btnCopyLink) {
        btnCopyLink.addEventListener('click', () => {
            splitLinkInput.select();
            document.execCommand('copy');
            
            const icon = btnCopyLink.querySelector('i');
            icon.className = 'fas fa-check';
            btnCopyLink.style.color = '#10b981';
            
            setTimeout(() => {
                icon.className = 'fas fa-copy';
                btnCopyLink.style.color = 'var(--primary-red)';
            }, 2000);
        });
    }
"""

if 'btnSplitPay.addEventListener' not in js:
    # Insert right before renderCheckout() inside init()
    js = js.replace("  // render data from session", split_js + "\n  // render data from session")
    
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(js)
    print("checkout.js updated properly.")
else:
    print("Code already exists.")
