// Simple AI Chatbot for 3HD2K Cinema
const chatResponses = {
    greeting: [
        "Xin chào! Tôi là trợ lý ảo của 3HD2K Cinema. Tôi có thể giúp gì cho bạn? 😊",
        "Chào bạn! Bạn cần hỗ trợ gì về đặt vé hay thông tin phim không?"
    ],
    booking: [
        "Để đặt vé, bạn có thể chọn phim trên trang chủ → Chọn suất chiếu → Chọn ghế → Thanh toán. Rất đơn giản! 🎬",
        "Bạn có thể đặt vé online tại trang chủ, chọn phim và suất chiếu phù hợp nhé!"
    ],
    price: [
        "Giá vé dao động từ 80.000đ - 150.000đ tùy suất chiếu và loại ghế (thường/VIP/đôi). Bạn muốn biết giá cụ thể phim nào? 💰"
    ],
    location: [
        "Chúng tôi có 15+ cụm rạp trên toàn quốc. Bạn có thể xem danh sách rạp tại mục 'Cụm Rạp' trên menu. 📍"
    ],
    food: [
        "Chúng tôi có combo bắp nước từ 65.000đ - 95.000đ. Bạn có thể đặt kèm khi thanh toán vé! 🍿"
    ],
    payment: [
        "Chúng tôi chấp nhận thanh toán qua MoMo, VNPay, ZaloPay, và thẻ ngân hàng. An toàn & tiện lợi! 💳"
    ],
    cancel: [
        "Bạn có thể hủy vé trong vòng 2h trước suất chiếu. Vui lòng liên hệ hotline 1900 1234 để được hỗ trợ."
    ],
    vip: [
        "Gói VIP của chúng tôi có 3 hạng: Silver (199k/tháng), Gold (499k/tháng), Platinum (999k/tháng) với nhiều ưu đãi đặc biệt! ⭐"
    ],
    default: [
        "Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể hỏi về: đặt vé, giá vé, rạp chiếu, combo đồ ăn, thanh toán, VIP... hoặc liên hệ hotline 1900 1234.",
        "Tôi có thể giúp bạn về: đặt vé, giá vé, cụm rạp, đồ ăn, thanh toán. Bạn cần hỗ trợ gì?"
    ]
};

function detectIntent(message) {
    const msg = message.toLowerCase().trim();
    
    if (/(xin chào|chào|hi|hello|hey)/i.test(msg)) return 'greeting';
    if (/(đặt vé|book|dat ve|mua vé|chọn ghế)/i.test(msg)) return 'booking';
    if (/(giá|price|bao nhiêu|phí)/i.test(msg)) return 'price';
    if (/(rạp|cinema|địa chỉ|cụm rạp|ở đâu)/i.test(msg)) return 'location';
    if (/(bắp|nước|combo|đồ ăn|thức ăn)/i.test(msg)) return 'food';
    if (/(thanh toán|payment|momo|vnpay|thẻ)/i.test(msg)) return 'payment';
    if (/(hủy|cancel|hoàn|refund)/i.test(msg)) return 'cancel';
    if (/(vip|member|thành viên|gói)/i.test(msg)) return 'vip';
    
    return 'default';
}

function getRandomResponse(intent) {
    const responses = chatResponses[intent] || chatResponses.default;
    return responses[Math.floor(Math.random() * responses.length)];
}

function renderChatWidget() {
    if (document.getElementById('chat-widget')) return;

    const chatHTML = `
    <div class="chat-widget" id="chat-widget">
        <div class="chat-header">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-robot" style="font-size: 1.5rem;"></i>
                <div>
                    <div style="font-weight: 700;">Trợ Lý AI</div>
                    <div style="font-size: 0.75rem; opacity: 0.7;">Trực tuyến 24/7</div>
                </div>
            </div>
            <button class="chat-close" id="chat-close" aria-label="Đóng chat">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="chat-messages" id="chat-messages">
            <div class="chat-message bot">
                <div class="chat-avatar"><i class="fas fa-robot"></i></div>
                <div class="chat-bubble">Xin chào! Tôi là trợ lý ảo của 3HD2K Cinema. Tôi có thể giúp gì cho bạn? 😊</div>
            </div>
        </div>
        
        <div class="chat-quick-actions">
            <button class="quick-btn" data-question="Đặt vé như thế nào?">Đặt vé</button>
            <button class="quick-btn" data-question="Giá vé bao nhiêu?">Giá vé</button>
            <button class="quick-btn" data-question="Có những rạp nào?">Cụm rạp</button>
        </div>
        
        <div class="chat-input-wrapper">
            <input type="text" id="chat-input" class="chat-input" placeholder="Nhập tin nhắn..." autocomplete="off">
            <button class="chat-send" id="chat-send" aria-label="Gửi tin nhắn">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    </div>
    
    <style>
    .chat-widget {
        position: fixed;
        bottom: 100px;
        right: 30px;
        width: 380px;
        max-height: 600px;
        background: #1a1a1a;
        border: 1px solid var(--glass-border, rgba(255,255,255,0.1));
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.7);
        display: none;
        flex-direction: column;
        z-index: 1000;
        animation: slideUp 0.3s ease;
    }
    .chat-widget.active { display: flex; }
    
    @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background: linear-gradient(135deg, rgba(229,9,20,0.15), rgba(229,9,20,0.05));
        border-bottom: 1px solid var(--glass-border, rgba(255,255,255,0.1));
        border-radius: 16px 16px 0 0;
    }
    
    .chat-close {
        background: transparent;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s;
    }
    .chat-close:hover {
        background: rgba(255,255,255,0.1);
        transform: rotate(90deg);
    }
    
    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        max-height: 350px;
    }
    
    .chat-message {
        display: flex;
        gap: 10px;
        animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .chat-message.user {
        flex-direction: row-reverse;
    }
    
    .chat-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--primary-red, #e50914);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 0.9rem;
    }
    
    .chat-message.user .chat-avatar {
        background: #444;
    }
    
    .chat-bubble {
        max-width: 75%;
        padding: 12px 16px;
        border-radius: 16px;
        line-height: 1.5;
        font-size: 0.9rem;
        background: rgba(255,255,255,0.05);
        color: white;
    }
    
    .chat-message.user .chat-bubble {
        background: var(--primary-red, #e50914);
        border-radius: 16px 16px 0 16px;
    }
    
    .chat-message.bot .chat-bubble {
        border-radius: 16px 16px 16px 0;
    }
    
    .chat-quick-actions {
        display: flex;
        gap: 8px;
        padding: 0 20px 15px;
        flex-wrap: wrap;
    }
    
    .quick-btn {
        padding: 8px 14px;
        background: rgba(255,255,255,0.05);
        border: 1px solid var(--glass-border, rgba(255,255,255,0.1));
        border-radius: 20px;
        color: white;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s;
        white-space: nowrap;
    }
    .quick-btn:hover {
        background: rgba(229,9,20,0.2);
        border-color: var(--primary-red, #e50914);
    }
    
    .chat-input-wrapper {
        display: flex;
        gap: 10px;
        padding: 15px 20px;
        border-top: 1px solid var(--glass-border, rgba(255,255,255,0.1));
    }
    
    .chat-input {
        flex: 1;
        background: rgba(255,255,255,0.05);
        border: 1px solid var(--glass-border, rgba(255,255,255,0.1));
        border-radius: 24px;
        padding: 10px 16px;
        color: white;
        font-size: 0.9rem;
        outline: none;
        transition: all 0.3s;
    }
    .chat-input:focus {
        border-color: var(--primary-red, #e50914);
        background: rgba(255,255,255,0.08);
    }
    
    .chat-send {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--primary-red, #e50914);
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
    }
    .chat-send:hover {
        background: #cc0812;
        transform: scale(1.1);
    }
    
    @media (max-width: 768px) {
        .chat-widget {
            right: 16px;
            left: 16px;
            width: auto;
            bottom: 90px;
        }
    }
    </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', chatHTML);
    
    const chatWidget = document.getElementById('chat-widget');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');
    
    chatClose.addEventListener('click', () => {
        chatWidget.classList.remove('active');
    });
    
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
        messageDiv.innerHTML = `
            <div class="chat-avatar"><i class="fas fa-${isUser ? 'user' : 'robot'}"></i></div>
            <div class="chat-bubble">${text}</div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function handleSendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        addMessage(message, true);
        chatInput.value = '';
        
        setTimeout(() => {
            const intent = detectIntent(message);
            const response = getRandomResponse(intent);
            addMessage(response);
        }, 500);
    }
    
    chatSend.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });
    
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.getAttribute('data-question');
            chatInput.value = question;
            handleSendMessage();
        });
    });
}

window.openChatWidget = function() {
    const chatWidget = document.getElementById('chat-widget');
    if (!chatWidget) {
        renderChatWidget();
    }
    setTimeout(() => {
        document.getElementById('chat-widget')?.classList.add('active');
    }, 100);
};

document.addEventListener('DOMContentLoaded', () => {
    renderChatWidget();
});
