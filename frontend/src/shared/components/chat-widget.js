// Live Support Chat for 3HD2K Cinema

let chatHistory = [];
let connection = null;
let isReconnecting = false;

function renderChatWidget() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // Prevent duplicate rendering
    if (document.getElementById('chat-widget')) return;

    const chatHTML = `
    <div class="chat-widget" id="chat-widget">
        <div class="chat-header">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div class="chat-header-icon"><i class="fas fa-headset"></i></div>
                <div>
                    <div style="font-weight: 700; font-size: 0.95rem; line-height: 1.2;">Hỗ Trợ Khách Hàng</div>
                    <div id="chat-status-container" style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; margin-top: 2px;">
                        <span id="chat-status-dot" class="status-dot offline"></span>
                        <span id="chat-status" style="opacity: 0.85;">Chế độ AI (Offline)</span>
                        <button id="chat-reconnect-btn" class="chat-reconnect-btn" title="Thử kết nối lại CSKH trực tiếp">
                            <i class="fas fa-sync-alt"></i> Thử lại
                        </button>
                    </div>
                </div>
            </div>
            <button class="chat-close" id="chat-close" aria-label="Đóng chat">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="chat-messages" id="chat-messages">
            <div class="chat-message bot">
                <div class="chat-avatar"><i class="fas fa-robot"></i></div>
                <div class="chat-bubble">
                    Xin chào! Tôi là **Trợ lý AI 3HD2K Cinema**. Rất vui được hỗ trợ bạn! 👋
                </div>
            </div>
            
            ${!isLoggedIn ? `
            <div class="chat-message bot">
                <div class="chat-avatar"><i class="fas fa-exclamation-circle"></i></div>
                <div class="chat-bubble login-warning-bubble">
                    Vui lòng <a href="/src/auth/login.html">Đăng nhập</a> để kết nối trực tiếp với nhân viên tư vấn.
                </div>
            </div>` : ''}
        </div>

        <div class="chat-quick-chips" id="chat-quick-chips">
            <button class="chip-btn" data-query="Lịch chiếu phim">🎬 Lịch chiếu</button>
            <button class="chip-btn" data-query="Giá vé & Ưu đãi">🍿 Giá vé</button>
            <button class="chip-btn" data-query="Combo Bắp Nước">🥤 Bắp nước</button>
            <button class="chip-btn" data-query="Hotline hỗ trợ">📞 Hotline</button>
        </div>
        
        <div class="chat-input-wrapper">
            <input type="text" id="chat-input" class="chat-input" placeholder="Nhập câu hỏi hoặc chọn gợi ý..." autocomplete="off" ${!isLoggedIn ? 'disabled' : ''}>
            <button class="chat-send" id="chat-send" aria-label="Gửi tin nhắn" ${!isLoggedIn ? 'disabled style="opacity: 0.5"' : ''}>
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
        height: 520px;
        max-height: 80vh;
        background: #141414;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 20px rgba(229, 9, 20, 0.15);
        display: none;
        flex-direction: column;
        z-index: 10000;
        animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        overflow: hidden;
        font-family: inherit;
    }
    .chat-widget.active { display: flex; }
    
    @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }
    
    .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 18px;
        background: linear-gradient(135deg, rgba(229,9,20,0.25), rgba(20,20,20,0.95));
        border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .chat-header-icon {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: linear-gradient(135deg, #e50914, #b20710);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.1rem;
        box-shadow: 0 4px 12px rgba(229,9,20,0.3);
    }
    
    .chat-close {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        color: #ccc;
        font-size: 1rem;
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
    }
    .chat-close:hover {
        background: rgba(255,255,255,0.2);
        color: white;
        transform: rotate(90deg);
    }

    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
    }
    .status-dot.online { background: #00ff88; box-shadow: 0 0 8px #00ff88; }
    .status-dot.reconnecting { background: #ffaa00; box-shadow: 0 0 8px #ffaa00; animation: blink 1s infinite; }
    .status-dot.offline { background: #ff4d4d; box-shadow: 0 0 6px #ff4d4d; }

    @keyframes blink { 50% { opacity: 0.4; } }

    .chat-reconnect-btn {
        background: rgba(255,255,255,0.1);
        border: none;
        color: #fff;
        padding: 2px 7px;
        border-radius: 10px;
        font-size: 0.68rem;
        cursor: pointer;
        transition: background 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 3px;
    }
    .chat-reconnect-btn:hover {
        background: var(--primary-red, #e50914);
    }
    
    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #181818;
        scroll-behavior: smooth;
    }

    .chat-messages::-webkit-scrollbar {
        width: 4px;
    }
    .chat-messages::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.15);
        border-radius: 4px;
    }
    
    .chat-message {
        display: flex;
        gap: 10px;
        animation: fadeIn 0.25s ease-out;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .chat-message.user {
        flex-direction: row-reverse;
    }
    
    .chat-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #e50914;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 0.8rem;
        color: white;
    }
    
    .chat-message.user .chat-avatar {
        background: #333;
        color: #bbb;
    }
    
    .chat-bubble {
        max-width: 78%;
        padding: 10px 14px;
        border-radius: 14px;
        line-height: 1.45;
        font-size: 0.88rem;
        background: rgba(255,255,255,0.06);
        color: #e5e5e5;
        word-break: break-word;
    }
    
    .chat-message.user .chat-bubble {
        background: #e50914;
        color: white;
        border-radius: 14px 14px 2px 14px;
    }
    
    .chat-message.bot .chat-bubble {
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 14px 14px 14px 2px;
    }

    .login-warning-bubble {
        background: rgba(229,9,20,0.15) !important;
        border: 1px solid rgba(229,9,20,0.4) !important;
    }
    .login-warning-bubble a {
        color: #ff4d4d;
        text-decoration: underline;
        font-weight: 600;
    }

    .chat-quick-chips {
        display: flex;
        gap: 6px;
        padding: 8px 14px;
        overflow-x: auto;
        background: #141414;
        border-top: 1px solid rgba(255,255,255,0.05);
        white-space: nowrap;
    }
    .chat-quick-chips::-webkit-scrollbar { display: none; }
    
    .chip-btn {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        color: #ccc;
        padding: 4px 11px;
        border-radius: 20px;
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .chip-btn:hover {
        background: rgba(229, 9, 20, 0.2);
        border-color: #e50914;
        color: white;
    }
    
    .chat-input-wrapper {
        display: flex;
        gap: 10px;
        padding: 12px 14px;
        background: #141414;
        border-top: 1px solid rgba(255,255,255,0.08);
    }
    
    .chat-input {
        flex: 1;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 20px;
        padding: 9px 14px;
        color: white;
        font-size: 0.88rem;
        outline: none;
        transition: all 0.2s ease;
    }
    .chat-input:focus {
        border-color: #e50914;
        background: rgba(255,255,255,0.09);
        box-shadow: 0 0 10px rgba(229, 9, 20, 0.2);
    }
    
    .chat-send {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: #e50914;
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.95rem;
        transition: all 0.2s ease;
        flex-shrink: 0;
    }
    .chat-send:hover {
        background: #cc0812;
        transform: scale(1.08);
    }
    
    @media (max-width: 768px) {
        .chat-widget {
            right: 12px;
            left: 12px;
            width: auto;
            bottom: 80px;
            height: 480px;
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
    const chatStatus = document.getElementById('chat-status');
    const chatStatusDot = document.getElementById('chat-status-dot');
    const chatReconnectBtn = document.getElementById('chat-reconnect-btn');
    const quickChips = document.getElementById('chat-quick-chips');
    
    chatClose.addEventListener('click', () => {
        chatWidget.classList.remove('active');
    });

    // Handle Quick Action Chips
    if (quickChips) {
        quickChips.addEventListener('click', (e) => {
            const btn = e.target.closest('.chip-btn');
            if (btn && btn.dataset.query) {
                chatInput.value = btn.dataset.query;
                handleSendMessage();
            }
        });
    }

    if (chatReconnectBtn) {
        chatReconnectBtn.addEventListener('click', () => {
            initSignalR(true);
        });
    }
    
    function addMessage(text, isUser = false, iconClass = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
        
        let avatarIcon = isUser ? 'fa-user' : (iconClass || 'fa-robot');
        // Simple line break to BR formatting
        const formattedText = text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        messageDiv.innerHTML = `
            <div class="chat-avatar"><i class="fas ${avatarIcon}"></i></div>
            <div class="chat-bubble">${formattedText}</div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function setStatus(state, message) {
        chatStatusDot.className = `status-dot ${state}`;
        chatStatus.textContent = message;
        if (state === 'online') {
            chatReconnectBtn.style.display = 'none';
        } else {
            chatReconnectBtn.style.display = 'inline-flex';
        }
    }
    
    async function initSignalR(isManualRetry = false) {
        if (!isLoggedIn) {
            setStatus('offline', 'Chưa đăng nhập');
            chatReconnectBtn.style.display = 'none';
            return;
        }

        if (!window.signalR) {
            console.error("SignalR library not found!");
            setStatus('offline', 'Thiếu thư viện');
            return;
        }

        if (isManualRetry) {
            setStatus('reconnecting', 'Đang thử lại...');
        }

        let signalRUrl = '';
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
             if (window.location.port === '5111' || window.location.port === '5282') {
                 signalRUrl = `${window.location.origin}/supportChatHub`;
             } else {
                 signalRUrl = `http://localhost:5111/supportChatHub`;
             }
        } else {
             signalRUrl = `https://cine-backend-c6c7gugffeb2cuhk.southeastasia-01.azurewebsites.net/supportChatHub`;
        }


        if (!connection) {
            connection = new signalR.HubConnectionBuilder()
                .withUrl(signalRUrl, {
                    accessTokenFactory: () => localStorage.getItem('jwt_token') || ''
                })
                .withAutomaticReconnect()
                .build();

            connection.on("ReceiveMessage", (adminEmail, message, timestamp) => {
                addMessage(message, false, 'fa-headset');
            });

            connection.onreconnecting(() => {
                setStatus('reconnecting', 'Đang kết nối lại...');
            });

            connection.onreconnected(() => {
                setStatus('online', 'Trực tuyến 24/7');
            });

            connection.onclose(() => {
                setStatus('offline', 'Chế độ AI (Offline)');
            });
        }

        try {
            if (connection.state === signalR.HubConnectionState.Disconnected) {
                await connection.start();
            }
            setStatus('online', 'Trực tuyến 24/7');
        } catch (err) {
            console.warn("SignalR Connection warning (falling back to AI Assistant):", err);
            setStatus('offline', 'Chế độ AI (Offline)');
        }
    }

    function generateAIBotResponse(query) {
        const text = query.toLowerCase();

        if (text.includes('lịch') || text.includes('chiếu') || text.includes('phim')) {
            return "🎬 **Lịch Chiếu Phim**: Bạn có thể xem danh sách phim hot và lịch chiếu trực tiếp tại trang **Lịch Chiếu** hoặc chọn cụm rạp yêu thích trên trang chủ. Rạp luôn cập nhật suất chiếu mỗi ngày!";
        }
        if (text.includes('giá') || text.includes('vé') || text.includes('tiền') || text.includes('ghế')) {
            return "🍿 **Bảng Giá Vé Standard**:\n• Ghế Thường: 75.000đ - 90.000đ\n• Ghế VIP: +15.000đ\n• Ghế Sweetbox (Đôi): +30.000đ\n✨ Thành viên **VIP** được giảm thêm **10% - 15%** cho mọi suất chiếu!";
        }
        if (text.includes('bắp') || text.includes('nước') || text.includes('combo') || text.includes('ăn')) {
            return "🥤 **Combo Bắp Nước Hấp Dẫn**:\n• Combo Solo: 1 Bắp Rang (Vị Ngọt/Phô Mai) + 1 Nước (500ml)\n• Combo Couple: 1 Bắp Rang Lớn + 2 Nước (700ml)\nBạn có thể chọn đặt bắp nước ngay ở bước đặt vé trực tuyến nhé!";
        }
        if (text.includes('ưu đãi') || text.includes('khuyến mãi') || text.includes('vip') || text.includes('điểm')) {
            return "🎁 **Đặc Quyền Thành Viên**:\n• Tích lũy điểm thưởng 10% giá trị đơn hàng.\n• Đổi vé miễn phí & nhận quà sinh nhật đặc biệt.\n• Xem chi tiết tại mục **Tích Điểm VIP** trong tài khoản!";
        }
        if (text.includes('hủy') || text.includes('đổi') || text.includes('hoàn') || text.includes('trả')) {
            return "⚠️ **Chính Sách Vé**:\nTheo quy định, vé đã mua thành công không thể hủy trực tiếp trên website. Vui lòng liên hệ Hotline **1900-3HD2K** trước giờ chiếu 60 phút để được nhân viên kiểm tra hỗ trợ.";
        }
        if (text.includes('hotline') || text.includes('liên hệ') || text.includes('sđt') || text.includes('tổng đài')) {
            return "📞 **Thông Tin Liên Hệ CSKH**:\n• Hotline: **1900-3HD2K** (1900 34325)\n• Email: **support@3hd2kcinema.vn**\n• Thời gian làm việc: 8:00 - 22:00 (Tất cả các ngày trong tuần).";
        }
        if (text.includes('chào') || text.includes('hi') || text.includes('hello') || text.includes('alo')) {
            return "Xin chào! Rất vui được hỗ trợ bạn. Bạn cần tư vấn thông tin phim, đặt vé hay dịch vụ rạp 3HD2K Cinema ạ?";
        }
        return "Cảm ơn bạn đã gửi tin nhắn! Máy chủ CSKH trực tiếp hiện đang bận hoặc offline. **Trợ lý AI 3HD2K** đã ghi nhận câu hỏi của bạn. Nếu cần hỗ trợ khẩn cấp, vui lòng gọi Hotline **1900-3HD2K**!";
    }

    async function handleSendMessage() {
        if (!isLoggedIn) return;
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Show user's message
        addMessage(message, true);
        chatInput.value = '';

        // If connected to SignalR live admin, send to admin
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
            try {
                await connection.invoke("SendMessageToAdmin", message);
            } catch (err) {
                console.error("Lỗi gửi tin nhắn admin:", err);
                // Fallback to AI bot
                const aiReply = generateAIBotResponse(message);
                setTimeout(() => addMessage(aiReply, false, 'fa-robot'), 400);
            }
        } else {
            // Try quiet reconnection in background
            initSignalR(false);

            // Respond immediately with AI Bot Assistant instead of repetitive error spam!
            setTimeout(() => {
                const aiReply = generateAIBotResponse(message);
                addMessage(aiReply, false, 'fa-robot');
            }, 300);
        }
    }
    
    chatSend.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });

    // Load SignalR script dynamically if not present
    if (!window.signalR) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/8.0.0/signalr.min.js";
        script.onload = () => {
            initSignalR();
        };
        document.head.appendChild(script);
    } else {
        initSignalR();
    }
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

