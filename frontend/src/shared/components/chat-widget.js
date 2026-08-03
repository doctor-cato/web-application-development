// Live Support Chat for 3HD2K Cinema

let chatHistory = [];
let connection = null;

function renderChatWidget() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    const chatHTML = `
    <div class="chat-widget" id="chat-widget">
        <div class="chat-header">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-headset" style="font-size: 1.5rem;"></i>
                <div>
                    <div style="font-weight: 700;">Hỗ Trợ Khách Hàng</div>
                    <div style="font-size: 0.75rem; opacity: 0.7;" id="chat-status">Đang kết nối...</div>
                </div>
            </div>
            <button class="chat-close" id="chat-close" aria-label="Đóng chat">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="chat-messages" id="chat-messages">
            <div class="chat-message bot">
                <div class="chat-avatar"><i class="fas fa-headset"></i></div>
                <div class="chat-bubble">
                    Xin chào! Bạn cần hỗ trợ gì ạ?
                </div>
            </div>
            ${!isLoggedIn ? `
            <div class="chat-message bot">
                <div class="chat-avatar"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="chat-bubble" style="background: rgba(229,9,20,0.2); border: 1px solid var(--primary-red);">
                    Vui lòng <a href="/src/auth/login.html" style="color: white; text-decoration: underline;">Đăng nhập</a> để sử dụng tính năng chat trực tuyến.
                </div>
            </div>` : ''}
        </div>
        
        <div class="chat-input-wrapper">
            <input type="text" id="chat-input" class="chat-input" placeholder="Nhập tin nhắn..." autocomplete="off" ${!isLoggedIn ? 'disabled' : ''}>
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
        max-height: 600px;
        background: #1a1a1a;
        border: 1px solid var(--glass-border);
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
        border-bottom: 1px solid var(--glass-border);
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
        transition: transform 0.2s ease, background-color 0.2s ease;
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
        background: var(--primary-red);
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
        background: var(--primary-red);
        border-radius: 16px 16px 0 16px;
    }
    
    .chat-message.bot .chat-bubble {
        border-radius: 16px 16px 16px 0;
    }
    
    .chat-input-wrapper {
        display: flex;
        gap: 10px;
        padding: 15px 20px;
        border-top: 1px solid var(--glass-border);
    }
    
    .chat-input {
        flex: 1;
        background: rgba(255,255,255,0.05);
        border: 1px solid var(--glass-border);
        border-radius: 24px;
        padding: 10px 16px;
        color: white;
        font-size: 0.9rem;
        outline: none;
        transition: border-color 0.2s ease, background-color 0.2s ease;
    }
    .chat-input:focus {
        border-color: var(--primary-red);
        background: rgba(255,255,255,0.08);
    }
    
    .chat-send {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--primary-red);
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease, transform 0.2s ease;
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
    const chatStatus = document.getElementById('chat-status');
    
    chatClose.addEventListener('click', () => {
        chatWidget.classList.remove('active');
    });
    
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
        messageDiv.innerHTML = `
            <div class="chat-avatar"><i class="fas fa-${isUser ? 'user' : 'headset'}"></i></div>
            <div class="chat-bubble">${text}</div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    async function initSignalR() {
        if (!isLoggedIn) {
            chatStatus.textContent = "Chưa đăng nhập";
            return;
        }

        if (!window.signalR) {
            console.error("SignalR library not found!");
            chatStatus.textContent = "Lỗi kết nối (Thiếu thư viện)";
            return;
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        let host = window.location.host;
        if (host.includes('3000')) {
            host = host.replace('3000', '5282'); 
        } else if (host.includes('5000') || host.includes('5001')) {
            host = 'localhost:5282';
        }
        
        let signalRUrl = '';
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
             signalRUrl = `http://localhost:5282/supportChatHub`;
        } else {
             // Production backend URL
             signalRUrl = `https://cine-backend-c6c7gugffeb2cuhk.southeastasia-01.azurewebsites.net/supportChatHub`;
        }

        connection = new signalR.HubConnectionBuilder()
            .withUrl(signalRUrl, {
                accessTokenFactory: () => localStorage.getItem('jwt_token') || ''
            })
            .withAutomaticReconnect()
            .build();

        connection.on("ReceiveMessage", (adminEmail, message, timestamp) => {
            addMessage(message, false);
        });

        try {
            await connection.start();
            chatStatus.textContent = "Trực tuyến 24/7";
            chatStatus.style.color = "#00ff88";
        } catch (err) {
            console.error("SignalR Connection Error:", err);
            chatStatus.textContent = "Mất kết nối";
            chatStatus.style.color = "red";
        }
    }

    async function handleSendMessage() {
        if (!isLoggedIn) return;
        const message = chatInput.value.trim();
        if (!message) return;
        
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
            addMessage(message, true);
            chatInput.value = '';
            
            try {
                await connection.invoke("SendMessageToAdmin", message);
            } catch (err) {
                console.error("Lỗi gửi tin nhắn:", err);
                addMessage("Lỗi gửi tin nhắn, vui lòng thử lại sau.", false);
            }
        } else {
            addMessage("Đang mất kết nối với máy chủ, vui lòng chờ trong giây lát...", false);
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
