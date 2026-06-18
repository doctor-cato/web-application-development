import re

html_file = 'src/booking/checkout/payment_simulation.html'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

old_body = """        <div class="sim-body">
            <div class="sim-spinner" id="sim-spinner"></div>
            <p style="color: #666; font-size: 0.875rem;">Đang xử lý giao dịch cho đơn hàng</p>
            <div class="sim-amount" id="sim-amount">0 đ</div>
            <p style="font-weight: 500; font-size: 1.125rem;">3HD2K Cinema</p>
            
            <button class="sim-btn" id="sim-btn" disabled>Đang xử lý...</button>
        </div>"""

new_body = """        <div class="sim-body">
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 12px; display: inline-block; margin-bottom: 1.5rem; border: 1px solid #e9ecef; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <img id="qr-code-img" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=3HD2K-Cinema-Simulation" alt="QR Code" style="width: 180px; height: 180px; display: block;">
            </div>
            
            <p style="color: #666; font-size: 0.875rem; margin-bottom: 0.5rem;">Dùng ứng dụng để quét mã QR</p>
            
            <div class="sim-amount" id="sim-amount" style="margin-top: 0.5rem; margin-bottom: 0;">0 đ</div>
            <p style="font-weight: 600; font-size: 1rem; color: #333; margin-top: 0.25rem; margin-bottom: 1.5rem;">3HD2K Cinema</p>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem; background: #f8f9fa; padding: 0.5rem; border-radius: 8px;">
                <div class="sim-spinner" id="sim-spinner" style="margin: 0; width: 16px; height: 16px; border-width: 2px;"></div>
                <span style="font-size: 0.85rem; color: #666;">Đang chờ thanh toán... <strong class="countdown-warning" style="color: #e50914;">05:00</strong></span>
            </div>
            
            <button class="sim-btn" id="sim-btn" disabled>XÁC NHẬN ĐÃ QUÉT MÃ</button>
        </div>"""

html = html.replace(old_body, new_body)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

print("QR code added to payment_simulation.html")
