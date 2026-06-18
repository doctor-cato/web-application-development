import re

html_file = 'src/booking/checkout/split-pay.html'
js_file = 'src/booking/checkout/split-pay.js'

# Update HTML
with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# I will inject some CSS directly to improve the look
css_upgrades = """
        .split-container {
            max-width: 700px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }
        .header-title {
            font-family: 'Oswald', sans-serif;
            text-align: center;
            font-size: 2.5rem;
            color: #fff;
            margin-bottom: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 2px;
            text-shadow: 0 0 20px rgba(229,9,20,0.5);
        }
        .glass-panel {
            background: rgba(20, 20, 20, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .progress-bar-container {
            width: 100%;
            height: 12px;
            background: rgba(255,255,255,0.05);
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 0.5rem;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.1);
        }
        .progress-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #e50914, #ff4b4b);
            width: 0%;
            transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 0 10px rgba(229,9,20,0.8);
        }
        .split-seat-card {
            background: linear-gradient(145deg, rgba(30,30,30,0.8), rgba(15,15,15,0.9));
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 1.5rem 1rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            overflow: hidden;
        }
        .split-seat-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 4px;
            background: rgba(255,255,255,0.1);
        }
        .split-seat-card:hover:not(.paid) {
            transform: translateY(-5px);
            background: linear-gradient(145deg, rgba(229,9,20,0.2), rgba(15,15,15,0.9));
            border-color: rgba(229,9,20,0.5);
            box-shadow: 0 10px 20px rgba(229,9,20,0.2);
        }
        .split-seat-card.selected {
            background: linear-gradient(145deg, rgba(229,9,20,0.8), rgba(229,9,20,0.4));
            border-color: #ff4b4b;
            box-shadow: 0 0 20px rgba(229,9,20,0.5);
            transform: scale(1.05);
        }
        .split-seat-card.paid {
            background: linear-gradient(145deg, rgba(16, 185, 129, 0.2), rgba(15,15,15,0.9));
            border-color: #10b981;
            cursor: not-allowed;
        }
        .split-seat-card.paid::before {
            background: #10b981;
        }
        .split-seat-id {
            font-size: 1.5rem;
            font-family: 'Bebas Neue', sans-serif;
            letter-spacing: 1px;
            margin-bottom: 0.25rem;
        }
        .paid-badge {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
            font-size: 0.7rem;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 600;
            border: 1px solid #10b981;
            backdrop-filter: blur(4px);
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
        }
        .timer-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(229, 9, 20, 0.1);
            border: 1px solid rgba(229, 9, 20, 0.3);
            color: #ff4b4b;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: 700;
            font-family: 'Inter', monospace;
            box-shadow: 0 0 15px rgba(229,9,20,0.2);
        }
"""
html = html.replace('        .split-container {', css_upgrades + '\n        .split-container {')

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

# Update JS to inject better HTML and handle timer
with open(js_file, 'r', encoding='utf-8') as f:
    js = f.read()

old_appHtml = """    const appHtml = `
        <h1 class="header-title">CHIA SẺ THANH TOÁN</h1>
        <p class="subtitle">Đơn hàng: #${orderId}</p>"""

new_appHtml = """    const appHtml = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div>
                <h1 class="header-title" style="text-align: left; margin-bottom: 0;">SPLIT & LOCK</h1>
                <p class="subtitle" style="text-align: left; margin-bottom: 0;">Đơn hàng: <span style="color:var(--primary-red); font-weight:700;">#${orderId}</span></p>
            </div>
            <div class="timer-badge">
                <i class="fas fa-hourglass-half"></i> <span id="split-timer">--:--</span>
            </div>
        </div>"""

js = js.replace(old_appHtml, new_appHtml)

# Add Timer logic
timer_logic = """
    // Start Timer
    const expiresAt = checkoutData.expiresAt || (Date.now() + 15 * 60 * 1000);
    const timerInterval = setInterval(() => {
        const now = Date.now();
        const remain = Math.max(0, Math.floor((expiresAt - now) / 1000));
        
        const m = Math.floor(remain / 60).toString().padStart(2, '0');
        const s = (remain % 60).toString().padStart(2, '0');
        const timerEl = document.getElementById('split-timer');
        if(timerEl) timerEl.innerText = `${m}:${s}`;
        
        if (remain <= 0 && !isFullyPaid) {
            clearInterval(timerInterval);
            showError("Thời gian giữ ghế (15 phút) đã kết thúc. Đơn hàng đã bị huỷ.");
        }
    }, 1000);
"""

# Insert timer_logic after attachEvents() inside renderApp
js = js.replace("        updateTotal();\n    }", "        updateTotal();\n    }\n" + timer_logic)

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js)

print("UI Upgraded.")
