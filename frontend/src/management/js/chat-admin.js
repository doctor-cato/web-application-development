let activeUsers = new Map();
let currentChatId = null;
let database;
let chatsRef;
let currentMessagesRef = null;
let currentMessagesListener = null;

document.addEventListener('DOMContentLoaded', () => {
    initFirebase();
    document.getElementById('admin-chat-send').addEventListener('click', handleSendMessage);
    document.getElementById('admin-chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });
});

async function initFirebase() {
    const statusEl = document.getElementById('conn-status');
    const token = localStorage.getItem('jwt_token');
    
    if (!token) {
        statusEl.textContent = "Chưa đăng nhập (Admin)";
        statusEl.style.color = "red";
        alert("Bạn phải đăng nhập tài khoản Admin để truy cập trang này.");
        window.location.href = "/src/auth/login.html";
        return;
    }
    
    // Check if firebase is initialized
    if (!window.firebase) {
        statusEl.textContent = "Thiếu thư viện Firebase!";
        statusEl.style.color = "red";
        return;
    }

    try {
        database = firebase.database();
        chatsRef = database.ref('support_chats');

        // Listen for new or updated chats
        chatsRef.on('child_added', (snapshot) => {
            handleChatUpdate(snapshot.key, snapshot.val());
        });
        chatsRef.on('child_changed', (snapshot) => {
            handleChatUpdate(snapshot.key, snapshot.val());
        });

        statusEl.textContent = "Online";
        statusEl.style.color = "#0df286";
    } catch (err) {
        console.error("Firebase Connection Error:", err);
        statusEl.textContent = "Lỗi kết nối";
        statusEl.style.color = "red";
    }
}

function handleChatUpdate(chatId, data) {
    if (!data) return;
    
    let userState = activeUsers.get(chatId) || { messages: [] };
    userState.email = data.userEmail || chatId;
    userState.unread = data.unreadByAdmin || false;
    userState.lastActivity = data.lastActivity || 0;
    
    // Convert messages object to array if needed, but we prefer listening specifically when chat is selected
    if (!activeUsers.has(chatId)) {
        activeUsers.set(chatId, userState);
    }
    
    if (currentChatId === chatId && userState.unread) {
        // If we are looking at this chat, mark it as read
        chatsRef.child(chatId).update({ unreadByAdmin: false });
        userState.unread = false;
    }
    
    renderUsersList();
}

function renderUsersList() {
    const container = document.getElementById('users-container');
    const countEl = document.getElementById('online-count');
    container.innerHTML = '';
    
    // Sort users by last activity descending
    const sortedUsers = Array.from(activeUsers.entries()).sort((a, b) => b[1].lastActivity - a[1].lastActivity);
    
    countEl.textContent = activeUsers.size;
    
    sortedUsers.forEach(([chatId, data]) => {
        const div = document.createElement('div');
        div.className = `user-item ${currentChatId === chatId ? 'active' : ''} ${data.unread ? 'unread' : ''}`;
        
        let displayId = chatId.substring(0, 8);
        if (chatId.includes('@')) {
            displayId = 'User';
        }

        div.innerHTML = `
            <div class="email">${data.email}</div>
            <div class="conn-id">${displayId}...</div>
        `;
        div.onclick = () => selectUser(chatId);
        container.appendChild(div);
    });
}

function selectUser(chatId) {
    if (currentChatId === chatId) return;
    
    currentChatId = chatId;
    const userState = activeUsers.get(chatId);
    
    if (userState) {
        userState.unread = false;
        chatsRef.child(chatId).update({ unreadByAdmin: false });
        document.getElementById('current-chat-name').textContent = userState.email;
    }
    
    document.getElementById('admin-chat-input').disabled = false;
    document.getElementById('admin-chat-send').disabled = false;
    
    document.getElementById('messages-container').innerHTML = '';
    
    // Detach previous listener
    if (currentMessagesRef && currentMessagesListener) {
        currentMessagesRef.off('child_added', currentMessagesListener);
    }
    
    // Listen to messages for the selected chat
    currentMessagesRef = chatsRef.child(chatId).child('messages');
    currentMessagesListener = currentMessagesRef.on('child_added', (snapshot) => {
        const msg = snapshot.val();
        appendMessage(msg.sender, msg.text, msg.time);
    });
    
    renderUsersList();
}

function appendMessage(sender, text, time) {
    const container = document.getElementById('messages-container');
    const div = document.createElement('div');
    div.className = `msg ${sender}`;
    div.innerHTML = `
        <div>${text}</div>
        <div class="msg-time">${time}</div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

async function handleSendMessage() {
    if (!currentChatId) return;
    const input = document.getElementById('admin-chat-input');
    const message = input.value.trim();
    if (!message) return;
    
    try {
        const timestamp = firebase.database.ServerValue.TIMESTAMP;
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        
        await chatsRef.child(currentChatId).child('messages').push({
            sender: 'admin',
            text: message,
            time: timeStr,
            timestamp: timestamp
        });
        
        await chatsRef.child(currentChatId).update({
            lastActivity: timestamp,
            unreadByUser: true
        });
        
        input.value = '';
    } catch (err) {
        console.error("Lỗi gửi:", err);
        alert("Lỗi gửi tin nhắn");
    }
}