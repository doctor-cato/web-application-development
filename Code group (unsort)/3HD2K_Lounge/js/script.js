// ==========================================
// 3HD2K Post-Movie Lounge - Interactive Logic
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatInput = document.getElementById('chat-input-element');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const messagesContainer = document.getElementById('chat-messages-container');
    
    // Movie Details Elements
    const movieDetailsWidget = document.getElementById('movie-details-widget');
    const playTrailerBtn = document.getElementById('btn-play-trailer-inside');
    const trailerModal = document.getElementById('trailer-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const trailerIframe = document.getElementById('trailer-video-frame');
    
    // Booking Elements
    const cinemaSelect = document.getElementById('cinema-select');
    const showtimeChips = document.querySelectorAll('.showtime-chip');
    const submitBookingBtn = document.getElementById('btn-submit-booking');
    
    // Utility Elements
    const bellBtn = document.getElementById('bell-btn');
    const bellBadge = document.getElementById('bell-badge');

    // Responsive elements
    const sidebarMenuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    const mobileTabBtns = document.querySelectorAll('.mobile-nav-tabs .mobile-tab-btn');
    const chatSection = document.getElementById('chat-section');
    const rightPanelSection = document.getElementById('right-panel-section');

    // User details
    const currentUserID = "3HD2K-449";
    const currentUserName = "Thành viên 3HD2K-449";

    // Auto scroll chat to bottom
    const scrollToBottom = () => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };
    
    // Initial scroll
    scrollToBottom();

    // ==========================================
    // CHAT SYSTEM
    // ==========================================
    
    // Send a message function
    const sendMessage = () => {
        const text = chatInput.value.trim();
        if (!text) return;

        // Get current system time formatted HH:MM
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Create user chat bubble
        const messageBubble = document.createElement('div');
        messageBubble.className = 'chat-bubble-wrapper msg-self';
        messageBubble.innerHTML = `
            <span class="bubble-meta-top">${currentUserName}</span>
            <div class="chat-bubble">
                ${escapeHTML(text)}
                <div class="bubble-meta-bottom">${timeStr}</div>
            </div>
        `;

        messagesContainer.appendChild(messageBubble);
        chatInput.value = '';
        scrollToBottom();

        // Trigger a simulated reply after a delay
        simulateReply(text);
    };

    // Helper to prevent HTML injection in chat
    const escapeHTML = (str) => {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    };

    // Simulated responses related to Dune 2
    const simulatedAnswers = [
        {
            name: "Cinephile_Alpha",
            msg: "Phần 2 này Denis làm quá tay luôn! Cách dựng cảnh sa mạc hoành tráng kết hợp tông nhạc nền hùng vĩ đúng nghĩa là bữa tiệc nghe nhìn.",
            isPro: false
        },
        {
            name: "Director_X",
            msg: "Chính xác, ống kính anamorphic đặc tả được chiều sâu không gian Arrakis siêu thực. Việc tương phản sắc độ giữa Arrakis ấm áp và Giedi Prime hồng ngoại đen trắng là thiên tài.",
            isPro: false
        },
        {
            name: "3HD2K_PRO",
            msg: "Đề nghị mọi người không thảo luận những chi tiết quá quan trọng (spoilers) bên ngoài phòng chờ này để tôn trọng người xem sau nhé.",
            isPro: true
        },
        {
            name: "LENS_FLARE_99",
            msg: "Hans Zimmer vẫn đỉnh như mọi khi. Nhạc phim nghe nổi cả da gà, đặc biệt là đoạn Paul thử cưỡi sâu cát khổng lồ lần đầu tiên.",
            isPro: false
        }
    ];

    let answerIndex = 0;

    const simulateReply = (userText) => {
        // Show typing indicator or just reply after 3 seconds
        setTimeout(() => {
            const replyData = simulatedAnswers[answerIndex];
            answerIndex = (answerIndex + 1) % simulatedAnswers.length;

            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            const replyBubble = document.createElement('div');
            replyBubble.className = 'chat-bubble-wrapper';
            
            if (replyData.isPro) {
                replyBubble.innerHTML = `
                    <span class="bubble-meta-top pro-author">${replyData.name} <span class="tag-author-badge">Mod</span></span>
                    <div class="chat-bubble bubble-pro">
                        ${replyData.msg}
                        <div class="bubble-meta-bottom">${timeStr}</div>
                    </div>
                `;
            } else {
                replyBubble.innerHTML = `
                    <span class="bubble-meta-top">${replyData.name}</span>
                    <div class="chat-bubble">
                        ${replyData.msg}
                        <div class="bubble-meta-bottom">${timeStr}</div>
                    </div>
                `;
            }

            messagesContainer.appendChild(replyBubble);
            scrollToBottom();
        }, 3000);
    };

    // Chat Event Listeners
    chatSendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // ==========================================
    // BOOKING SYSTEM INTERACTIVITY
    // ==========================================
    
    // Showtime selection toggle
    showtimeChips.forEach(chip => {
        chip.addEventListener('click', () => {
            showtimeChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        });
    });

    // Submit booking action
    submitBookingBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop click from triggering parent modal
        
        const selectedCinemaText = cinemaSelect.options[cinemaSelect.selectedIndex].text;
        const activeShowtimeChip = document.querySelector('.showtime-chip.active');
        const selectedShowtime = activeShowtimeChip ? activeShowtimeChip.textContent : "18:30";

        showToast(`Vé đã được đặt thành công tại ${selectedCinemaText} lúc ${selectedShowtime}!`);
    });

    // ==========================================
    // TRAILER MODAL
    // ==========================================
    const trailerUrl = "https://www.youtube.com/embed/Way9Dexny3w?autoplay=1";

    const openTrailerModal = (e) => {
        e.stopPropagation(); // Avoid event collision
        trailerModal.classList.add('active');
        trailerIframe.src = trailerUrl;
    };

    // Clicking either poster or explicit play button opens trailer
    playTrailerBtn.addEventListener('click', openTrailerModal);
    movieDetailsWidget.addEventListener('click', openTrailerModal);

    const closeModal = () => {
        trailerModal.classList.remove('active');
        trailerIframe.src = ""; // Stop video playback
    };

    modalCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeModal();
    });
    
    // Close modal when clicking outside content
    trailerModal.addEventListener('click', (e) => {
        if (e.target === trailerModal) {
            closeModal();
        }
    });

    // Escape key press closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && trailerModal.classList.contains('active')) {
            closeModal();
        }
    });

    // ==========================================
    // NOTIFICATION BELL
    // ==========================================
    bellBtn.addEventListener('click', () => {
        // Toggle notification alert
        if (bellBadge.style.display !== 'none') {
            bellBadge.style.display = 'none';
            showToast("Hộp thư thông báo đã được đọc.");
        } else {
            bellBadge.style.display = 'block';
            showToast("Có thông báo mới trong phòng chờ.");
        }
    });

    // Simple Toast alert helper
    const showToast = (message) => {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '24px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.background = 'rgba(20, 20, 25, 0.9)';
        toast.style.border = '1px solid var(--primary-red)';
        toast.style.color = '#fff';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '8px';
        toast.style.fontSize = '0.9rem';
        toast.style.boxShadow = '0 5px 25px rgba(229, 9, 20, 0.2)';
        toast.style.zIndex = '1000';
        toast.style.fontFamily = "'Inter', sans-serif";
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Anim entrance
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.style.opacity = '1', 50);

        // Close after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // ==========================================
    // SIDEBAR & MOBILE TABS NAVIGATION
    // ==========================================
    
    // Desktop Sidebar Links
    sidebarMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            sidebarMenuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            const targetSection = item.getAttribute('data-target');
            if (targetSection === 'chat-section') {
                chatSection.classList.add('active');
                chatInput.focus();
            }
        });
    });

    // Mobile Bottom Tab Buttons
    mobileTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            mobileTabBtns.forEach(tb => tb.classList.remove('active'));
            btn.classList.add('active');

            const targetSection = btn.getAttribute('data-target');
            showSectionMobile(targetSection);
        });
    });

    // Show mobile responsive navigation section
    const showSectionMobile = (target) => {
        // Hide all major areas
        chatSection.classList.remove('active');
        rightPanelSection.classList.remove('active');

        if (target === 'chat-section') {
            chatSection.classList.add('active');
        } else if (target === 'movie-details-widget') {
            rightPanelSection.classList.add('active');
        }
    };
});
