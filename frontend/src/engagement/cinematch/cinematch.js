import { renderNavbar } from '../../shared/components/navbar.js';
import { renderFooter } from '../../shared/components/footer.js';
import { getSession } from '../../auth/auth-services/authService.js';

document.addEventListener('DOMContentLoaded', async () => {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        navbarPlaceholder.innerHTML = renderNavbar();
    }
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = renderFooter();
    }

    const session = getSession();
    if (!session) {
        alert("Bạn cần đăng nhập để tham gia Cine-Match. Hãy kết nối để gặp gỡ những người bạn mới!");
        window.location.href = '../../auth/user-login/login.html?returnUrl=' + encodeURIComponent(window.location.href);
        return;
    }

    const btnStart = document.getElementById('btn-start');
    const stepForm = document.getElementById('step-form');
    const stepRadar = document.getElementById('step-radar');
    const stepCandidates = document.getElementById('step-candidates');
    const stepSync = document.getElementById('step-sync');
    const stepSharedRoom = document.getElementById('step-shared-room');
    
    const prefGenre = document.getElementById('pref-genre');
    const statusText = document.getElementById('radar-status-text');

    let activeNodes = [];
    let currentRoomId = null;
    let partnerInfo = null;

    // -- SIGNALR SETUP --
    const API_URL = "/cinematchHub"; 
    const connection = new signalR.HubConnectionBuilder()
        .withUrl(API_URL)
        .withAutomaticReconnect()
        .build();

    const mockMovies = [
        { id: '44abd72e-b280-4888-ad96-cd14248e38ee', title: 'Your Name (Tên cậu là gì?)', poster: '../../shared/images/f1_movie.jpg' },
        { id: '72c59b71-4fe1-4358-a850-90216c6a62af', title: 'Kẻ Kiến Tạo (The Creator)', poster: '../../shared/images/f2_movie.jpg' },
        { id: '85e4d92b-8a8b-4a5c-9c71-c918341275d6', title: 'Oppenheimer', poster: '../../shared/images/f4_movie.jpg' }
    ];

    try {
        await connection.start();
        console.log("CineMatch Real-time Connected!");
    } catch (err) {
        console.error("SignalR Connection Error: ", err);
        alert("Không thể kết nối đến máy chủ Ghép đôi thời gian thực. Hãy chắc chắn Backend đang chạy!");
    }

    // --- SIGNALR EVENTS ---
    
    connection.on("OnMatchFound", (data) => {
        // Stop radar
        stepRadar.style.display = 'none';
        statusText.style.display = 'none';
        activeNodes.forEach(n => n.remove());

        // Prepare data
        currentRoomId = data.roomId;
        partnerInfo = {
            id: data.partnerId,
            name: data.partnerName || 'Ẩn danh',
            matchPercent: data.matchPercent,
            connections: data.connections,
            rating: data.rating
        };

        // Render Candidates (Real match)
        stepCandidates.style.display = 'block';
        renderCandidates([partnerInfo]); // Trong thực tế hệ thống hiện chỉ ghép 1-1, ta coi list chỉ có 1 ứng viên
    });

    connection.on("OnBothAccepted", () => {
        stepSync.style.display = 'none';
        stepSharedRoom.style.display = 'block';

        document.getElementById('room-partner-name').innerText = partnerInfo.name;
        document.getElementById('room-partner-avatar-name').innerText = partnerInfo.name.substring(0, 1) + '***';

        renderSharedMovies();
        appendChat('Hệ thống', 'Kết nối thành công! Hãy thảo luận để chọn phim.', 'system');
    });

    connection.on("OnMovieSuggested", (senderId, movieId, movieTitle) => {
        if (senderId !== session.userId) {
            appendChat(partnerInfo.name, `Mình rất thích xem phim <b>${movieTitle}</b>. Bạn thấy sao?`, 'partner');
            highlightMovie(movieId);
        }
    });

    connection.on("OnMessageReceived", (senderId, senderName, message) => {
        if (senderId !== session.userId) {
            appendChat(senderName, message, 'partner');
        }
    });

    connection.on("OnMovieAgreed", (movieId) => {
        appendChat('Hệ thống', `Hai bạn đã cùng thống nhất xem chung bộ phim này! Đang chuyển hướng...`, 'system');
        localStorage.setItem('cinematch_active', 'true');
        localStorage.setItem('cinematch_genre', prefGenre.value); 
        
        setTimeout(() => {
            window.location.href = `../../explore/movie-details/index.html?id=${movieId}&cinematch=true`;
        }, 1500);
    });

    connection.on("OnPartnerDisconnected", () => {
        alert("Đối tác đã ngắt kết nối hoặc rời khỏi phòng.");
        window.location.reload();
    });

    // --- UI ACTIONS ---

    btnStart.addEventListener('click', async () => {
        stepForm.style.display = 'none';
        stepRadar.style.display = 'flex';
        statusText.style.display = 'block';

        statusText.innerText = "Đang kết nối Real-time & Chờ đối tác...";
        setInterval(spawnNode, 800);

        try {
            await connection.invoke("FindMatch", session.userId, session.username || "User", prefGenre.value);
        } catch (err) {
            console.error(err);
            statusText.innerText = "Lỗi kết nối!";
        }
    });

    function renderCandidates(candidates) {
        const container = document.getElementById('candidates-container');
        container.innerHTML = '';

        candidates.forEach(cand => {
            const card = document.createElement('div');
            card.className = 'match-card';
            card.style.margin = '0';
            card.style.cursor = 'pointer';
            
            card.innerHTML = `
                <div class="mc-avatar-wrapper" style="width: 100px; height: 100px;">
                    <div class="mc-avatar" style="font-size: 2.5rem;"><i class="fas fa-user"></i></div>
                    <div class="mc-badge" style="font-size: 0.7rem;">${cand.matchPercent}% Hợp</div>
                </div>
                <h3 style="color: white; font-size: 1.4rem; margin-bottom: 5px;">${cand.name} (Ẩn danh)</h3>
                <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 15px;"><i class="fas fa-map-marker-alt" style="color:var(--neon-red);"></i> Cùng thành phố</p>
                
                <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin-bottom: 15px; text-align: left; font-size: 0.9rem;">
                    <div style="margin-bottom: 8px;"><i class="fas fa-link" style="color:#4CAF50; width: 20px;"></i> Đã kết nối: <b style="color:white;">${cand.connections} lần</b></div>
                    <div><i class="fas fa-star" style="color:#FFD700; width: 20px;"></i> Đánh giá: <b style="color:white;">${cand.rating}</b></div>
                </div>

                <button class="btn-neon btn-choose" style="padding: 10px 20px; font-size: 1rem;">Đồng Ý Kết Nối</button>
            `;

            card.querySelector('.btn-choose').addEventListener('click', (e) => {
                e.stopPropagation();
                acceptMatch();
            });
            card.addEventListener('click', () => acceptMatch());

            container.appendChild(card);
        });
    }

    async function acceptMatch() {
        stepCandidates.style.display = 'none';
        stepSync.style.display = 'block';
        document.getElementById('sync-partner-name').innerText = partnerInfo.name;

        try {
            await connection.invoke("AcceptMatch", currentRoomId);
        } catch (err) {
            console.error(err);
        }
    }

    function renderSharedMovies() {
        const container = document.getElementById('shared-movies-container');
        container.innerHTML = '';
        
        mockMovies.forEach(m => {
            const mCard = document.createElement('div');
            mCard.id = `movie-card-${m.id}`;
            mCard.style.background = 'rgba(255,255,255,0.05)';
            mCard.style.border = '1px solid rgba(255,255,255,0.1)';
            mCard.style.borderRadius = '12px';
            mCard.style.padding = '10px';
            mCard.style.textAlign = 'center';
            mCard.innerHTML = `
                <img src="${m.poster}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
                <h4 style="color: white; font-size: 1rem; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${m.title}</h4>
                <button class="btn-suggest" style="background: rgba(255,42,95,0.2); color: var(--neon-red); border: 1px solid var(--neon-red); padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; transition: 0.3s; width: 100%;">Đề xuất phim này</button>
                <button class="btn-agree-movie" style="display:none; background: linear-gradient(45deg, #4CAF50, #2E7D32); color: white; border: none; padding: 8px 15px; border-radius: 20px; font-size: 0.9rem; cursor: pointer; font-weight: bold; width: 100%; margin-top:5px; box-shadow: 0 4px 10px rgba(76, 175, 80, 0.4);">
                    <i class="fas fa-check"></i> ĐỒNG Ý
                </button>
            `;

            mCard.querySelector('.btn-suggest').addEventListener('click', async () => {
                await connection.invoke("SuggestMovie", currentRoomId, m.id, m.title);
                appendChat('Bạn', `Đã đề xuất phim: <b>${m.title}</b>`, 'me');
                highlightMovie(m.id);
            });

            mCard.querySelector('.btn-agree-movie').addEventListener('click', async () => {
                await connection.invoke("AgreeMovie", currentRoomId, m.id);
            });

            container.appendChild(mCard);
        });
    }

    function highlightMovie(movieId) {
        document.querySelectorAll('#shared-movies-container > div').forEach(card => {
            card.style.borderColor = 'rgba(255,255,255,0.1)';
            card.style.boxShadow = 'none';
            card.querySelector('.btn-agree-movie').style.display = 'none';
        });

        const card = document.getElementById(`movie-card-${movieId}`);
        if (card) {
            card.style.borderColor = 'var(--neon-red)';
            card.style.boxShadow = '0 0 20px rgba(255,42,95,0.4)';
            card.querySelector('.btn-agree-movie').style.display = 'block';
        }
    }

    function appendChat(name, msg, type) {
        const chatLog = document.getElementById('chat-log');
        let color = '#aaa';
        if (type === 'partner') color = 'var(--neon-red)';
        if (type === 'me') color = '#4CAF50';
        if (type === 'system') color = '#FFD700';

        const div = document.createElement('div');
        div.style.marginBottom = '8px';
        div.innerHTML = `<strong style="color: ${color};">${name}:</strong> <span style="color: white;">${msg}</span>`;
        chatLog.appendChild(div);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    function spawnNode() {
        const radarCircle = document.querySelector('.radar-circle');
        if (!radarCircle) return;
        
        const node = document.createElement('div');
        node.className = 'match-avatar-node';
        const icons = ['fa-user', 'fa-user-secret', 'fa-mask', 'fa-smile'];
        const icon = icons[Math.floor(Math.random() * icons.length)];
        node.innerHTML = `<i class="fas ${icon}"></i>`;

        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 120;
        const x = 150 + radius * Math.cos(angle) - 20;
        const y = 150 + radius * Math.sin(angle) - 20;

        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        
        radarCircle.appendChild(node);
        activeNodes.push(node);

        setTimeout(() => { node.style.opacity = '0.6'; node.style.transform = 'scale(1)'; }, 50);
        setTimeout(() => {
            node.style.opacity = '0';
            node.style.transform = 'scale(0)';
            setTimeout(() => {
                if (radarCircle.contains(node)) radarCircle.removeChild(node);
            }, 500);
        }, 2000 + Math.random() * 1000);
    }
});
