import re

html_file = 'src/booking/checkout/checkout.html'
js_file = 'src/booking/checkout/checkout.js'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Replace Checkout Button
old_btn = '''                    <button id="btn-pay" class="btn btn-primary btn-continue" style="margin-top: 1rem;">
                        THANH TOÁN NGAY
                    </button>'''
new_btns = '''                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <button id="btn-split-pay" class="btn btn-outline" style="flex: 1; border-color: var(--primary-red); color: var(--primary-red); padding: 0.75rem; font-weight: 700;">
                            <i class="fas fa-users"></i> SPLIT & LOCK
                        </button>
                        <button id="btn-pay" class="btn btn-primary btn-continue" style="flex: 1; margin-top: 0;">
                            THANH TOÁN
                        </button>
                    </div>'''
if old_btn in html:
    html = html.replace(old_btn, new_btns)

# 2. Add Modal
modal_html = '''
    <!-- SPLIT & LOCK MODAL -->
    <div id="split-modal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 9999; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
        <div class="glass-panel" style="width: 90%; max-width: 450px; padding: 2rem; position: relative; text-align: center; box-shadow: 0 10px 30px rgba(229,9,20,0.2); border: 1px solid rgba(229,9,20,0.3);">
            <i class="fas fa-times" id="close-split-modal" style="position: absolute; top: 1rem; right: 1rem; cursor: pointer; font-size: 1.25rem; color: var(--text-muted); transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='var(--text-muted)'"></i>
            
            <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(229, 9, 20, 0.1); border: 1px solid rgba(229, 9, 20, 0.4); color: var(--primary-red); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 1.25rem;">
                <i class="fas fa-link"></i>
            </div>
            
            <h2 style="font-family: 'Oswald', sans-serif; font-size: 1.75rem; margin-bottom: 0.5rem; letter-spacing: 1px; color: #fff;">CHIA SẺ THANH TOÁN</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem; line-height: 1.5;">
                Gửi link này cho bạn bè. Ghế của bạn sẽ được giữ trong vòng <strong style="color: var(--primary-red);">15 phút</strong> để mọi người tự thanh toán phần của mình.
            </p>
            
            <div style="display: flex; align-items: center; background: rgba(0,0,0,0.6); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); margin-bottom: 1.5rem;">
                <input type="text" id="split-link-input" readonly value="" style="background: transparent; border: none; color: #fff; width: 100%; outline: none; font-size: 0.9rem; font-family: 'Inter', monospace;">
                <button id="btn-copy-link" style="background: transparent; border: none; color: var(--primary-red); cursor: pointer; padding: 0.25rem 0.5rem; font-size: 1.1rem; transition: transform 0.2s;" title="Sao chép Link">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
            
            <a href="split-pay.html" class="btn btn-primary" style="width: 100%; display: block; padding: 0.8rem; font-size: 1rem; text-decoration: none;">MỞ TRANG THEO DÕI</a>
        </div>
    </div>
'''

if '<!-- SPLIT & LOCK MODAL -->' not in html:
    html = html.replace('    <div id="footer-placeholder"></div>', modal_html + '\n    <div id="footer-placeholder"></div>')

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

split_js = """
    // SPLIT & LOCK LOGIC
    const btnSplitPay = document.getElementById('btn-split-pay');
    const splitModal = document.getElementById('split-modal');
    const closeSplitModal = document.getElementById('close-split-modal');
    const splitLinkInput = document.getElementById('split-link-input');
    const btnCopyLink = document.getElementById('btn-copy-link');

    if (btnSplitPay) {
        btnSplitPay.addEventListener('click', () => {
            const orderId = 'SPLIT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            
            // Generate link (we assume split-pay.html will be created in the same dir)
            const baseUrl = window.location.href.split('?')[0].replace('checkout.html', 'split-pay.html');
            const splitLink = baseUrl + '?order=' + orderId;
            splitLinkInput.value = splitLink;
            
            // Save state for the split order
            const splitData = {
                orderId: orderId,
                checkoutData: checkoutData,
                customFood: localStorage.getItem('selectedFood'),
                status: 'PENDING'
            };
            localStorage.setItem('splitOrder_' + orderId, JSON.stringify(splitData));
            
            // Open modal
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
    # Append inside DOMContentLoaded
    js = js.replace("const btnPay = document.getElementById('btn-pay');", split_js + "\n    const btnPay = document.getElementById('btn-pay');")
    
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(js)

print("Checkout JS and HTML updated with Split & Lock Step 1.")
