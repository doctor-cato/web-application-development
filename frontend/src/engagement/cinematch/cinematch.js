import { renderNavbar } from '../../shared/components/navbar.js';
import { renderFooter } from '../../shared/components/footer.js';
import { getSession } from '../../auth/auth-services/authService.js';
import { API_BASE_URL } from '../../shared/utils/apiConfig.js?v=4';







const getSignalRUrl = () => {
    try {
        const url = new URL(API_BASE_URL);
        return `${url.protocol}//${url.host}/cinematchHub`;
    } catch (e) {
        return 'https://localhost:7198/cinematchHub'; 
    }
};



const DEMO_MODE = false;


let connection = null;




const state = {
    userId: null,
    userName: null,
    preferences: { mood: 'any', genre: 'all', time: 'any', gender: 'any', cinema: 'any' },
    currentMatch: null,
    roomId: null,
    bothAccepted: false,
    isUser1: false,
    activeNodes: [],
    timers: { radar: null, status: null, demoMatch: null, matchTimer: null, searchTimeout: null }
};




let DOM = {};

function cacheDom() {
    DOM = {
        steps: {
            form: document.getElementById('step-form'),
            radar: document.getElementById('step-radar'),
            candidates: document.getElementById('step-candidates'),
            sync: document.getElementById('step-sync'),
            room: document.getElementById('step-shared-room')
        },
        radar: {
            circle: document.querySelector('.radar-circle'),
            statusText: document.getElementById('radar-status-text'),
            timer: document.getElementById('radar-timer')
        },
        candidates: {
            container: document.getElementById('candidates-container')
        },
        sync: {
            title: document.getElementById('sync-title'),
            partnerName: document.getElementById('sync-partner-name')
        },
        room: {
            partnerName: document.getElementById('room-partner-name'),
            partnerAvatarName: document.getElementById('room-partner-avatar-name'),
            moviesContainer: document.getElementById('shared-movies-container'),
            chatLog: document.getElementById('chat-log'),
            chatInput: document.getElementById('chat-input'),
            matchTimer: document.getElementById('match-timer'),
            emojiBar: document.getElementById('emoji-bar')
        },
        buttons: {
            start: document.getElementById('btn-start'),
            cancelSearch: document.getElementById('btn-cancel-search'),
            leaveLobby: document.getElementById('btn-leave-lobby'),
            sendChat: document.getElementById('btn-send-chat')
        }
    };
}




document.addEventListener('DOMContentLoaded', async () => {
    
    const navEl = document.getElementById('navbar-placeholder');
    if (navEl) navEl.innerHTML = renderNavbar();
    const footEl = document.getElementById('footer-placeholder');
    if (footEl) footEl.innerHTML = renderFooter();

    
    cacheDom();

    
    loadCinemas();

    
    const session = getSession();
    const jwtToken = localStorage.getItem('jwt_token') || localStorage.getItem('auth_token');
    if ((!session || !jwtToken) && !DEMO_MODE) {
        alert("Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại để tham gia Cine-Match!");
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user_info');
        window.location.href = '../../auth/user-login/login.html?returnUrl=' + encodeURIComponent(window.location.href);
        return;
    }

    state.userId = session?.email || session?.id || 'demo_' + Math.random().toString(36).slice(2, 8);
    state.userName = session?.fullname || session?.name || session?.username || "Người dùng";

    if (!DEMO_MODE) initSignalR();

    setupFormSelection();
    setupEventHandlers();

    document.querySelectorAll('.pref-card.selected').forEach(card => {
        const group = card.dataset.group;
        const value = card.dataset.value;
        if (group && value) state.preferences[group] = value;
    });
});

async function initSignalR() {
    if (!window.signalR) {
        console.warn("SignalR SDK not loaded");
        return;
    }

    if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
        return;
    }

    connection = new signalR.HubConnectionBuilder()
        .withUrl(getSignalRUrl(), {
            accessTokenFactory: () => localStorage.getItem('jwt_token') || localStorage.getItem('auth_token') || ''
        })
        .withAutomaticReconnect()
        .build();

    connection.on("OnMatchFound", (data) => {
        clearTimers();
        state.roomId = data.roomId;
        state.currentMatch = { name: data.partnerName };
        state.isUser1 = true;

        switchStep('sync');
        if (DOM.sync.partnerName) DOM.sync.partnerName.innerText = data.partnerName;

        setTimeout(() => {
            if (connection && connection.state === signalR.HubConnectionState.Connected) {
                connection.invoke("AcceptMatch", state.roomId).catch(err => console.error(err));
            }
        }, 1500);
    });

    connection.on("OnBothAccepted", () => {
        state.bothAccepted = true;
        onBothAccepted();
    });

    connection.on("OnMessageReceived", (senderId, senderName, message) => {
        if (senderId === state.userId) {
            appendChat('Bạn', message, 'me');
        } else {
            appendChat(senderName, message, 'partner');
        }
    });

    connection.on("OnMovieSuggested", (senderId, movieId, movieTitle) => {
        highlightSuggestedMovie(movieId);
        if (senderId !== state.userId) {
            appendChat(state.currentMatch?.name || 'Đối tác', `Đã đề xuất phim: <b>${movieTitle}</b>`, 'partner');
        }
    });

    connection.on("OnMovieAgreed", (movieId) => {
        executeAgreeMovie(movieId);
    });

    connection.on("OnPartnerDisconnected", () => {
        appendChat('Hệ thống', 'Đối tác đã ngắt kết nối. Vui lòng tải lại trang để tìm người mới.', 'system');
    });

    connection.onreconnecting(error => {
        console.warn("SignalR reconnecting due to Vercel proxy timeout...", error);
    });

    connection.onreconnected(async (connectionId) => {
        console.log("SignalR reconnected automatically:", connectionId);
        try {
            if (state.roomId) {
                console.log("Rejoining active room:", state.roomId);
                await connection.invoke("RejoinRoom", state.roomId, state.userId);
            } else if (DOM.steps.radar && DOM.steps.radar.style.display !== 'none') {
                console.log("Rejoining matchmaking queue...");
                await joinSignalRQueue();
            }
        } catch (err) {
            console.error("Error during reconnect recovery:", err);
        }
    });

    try {
        await connection.start();
        console.log("SignalR initialized for CineMatch");
    } catch (e) {
        console.error("SignalR init error:", e);
    }
}

async function loadCinemas() {
    try {
        const res = await fetch('/api/cinemas');
        if (res.ok) {
            const data = await res.json();
            const container = document.getElementById('pref-cinema');
            if (!container) return;
            
            data.forEach(cinema => {
                const cId = cinema.id || cinema.Id;
                if (container.querySelector(`.pref-card[data-value="${cId}"]`)) return;
                
                const card = document.createElement('div');
                card.className = 'pref-card';
                card.dataset.group = 'cinema';
                card.dataset.value = cId;
                const address = cinema.address || cinema.Address || '';
                card.innerHTML = `
                    <i class="fa-solid fa-building"></i>
                    <span class="label">${cinema.name || cinema.Name}</span>
                    <span class="sublabel" style="font-size:0.7rem; text-align:center;">${address.split(',')[0]}</span>
                `;
                container.appendChild(card);
            });
            
            setupFormSelection();
        }
    } catch (e) {
        console.error("Error loading cinemas (fallback will be used):", e);
    }
}

async function joinSignalRQueue() {
    try {
        if (!connection || connection.state === signalR.HubConnectionState.Disconnected) {
            await initSignalR();
        }
        let attempts = 0;
        while (connection && connection.state === signalR.HubConnectionState.Connecting && attempts < 15) {
            await new Promise(r => setTimeout(r, 200));
            attempts++;
        }
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
            console.log("Joined CineMatch queue:", state.userId, state.userName, state.preferences.genre);
            await connection.invoke("FindMatch", state.userId, state.userName, state.preferences.genre);
        } else {
            console.error("SignalR connection not ready, state:", connection?.state);
        }
    } catch (err) {
        console.error("Error joining SignalR queue:", err);
    }
}

function leaveSignalRQueue() {
    // Keep connection alive
}

// ============================================================
// FORM SELECTION (Card-based UI)
// ============================================================
function setupFormSelection() {
    const groups = ['mood', 'genre', 'time', 'gender', 'cinema'];
    groups.forEach(group => {
        const cards = document.querySelectorAll(`.pref-card[data-group="${group}"]`);
        cards.forEach(card => {
            card.addEventListener('click', () => {
                cards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                state.preferences[group] = card.dataset.value;
            });
        });
    });
}




function setupEventHandlers() {
    DOM.buttons.start?.addEventListener('click', startMatching);
    DOM.buttons.cancelSearch?.addEventListener('click', cancelSearch);
    DOM.buttons.leaveLobby?.addEventListener('click', cancelSearch);
    DOM.buttons.sendChat?.addEventListener('click', () => sendChatMessage());

    document.getElementById('btn-decline-invite')?.addEventListener('click', () => window.declineInvite());
    document.getElementById('btn-accept-invite')?.addEventListener('click', () => window.acceptInvite());

    DOM.room.chatInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    
    DOM.room.emojiBar?.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            sendChatMessage(btn.textContent.trim());
        });
    });

    window.addEventListener('beforeunload', cleanup);
}




function switchStep(stepName) {
    Object.values(DOM.steps).forEach(step => {
        if (step) step.style.display = 'none';
    });
    if (DOM.steps[stepName]) {
        DOM.steps[stepName].style.display = 'block';
        DOM.steps[stepName].style.animation = 'popIn 0.5s ease-out';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}




window.startMatching = async function startMatching() {
    clearTimers();

    state.roomId = null;
    state.bothAccepted = false;
    state.currentMatch = null;
    state.isUser1 = false;
    window.currentInviteData = null;
    window.currentInviteKey = null;

    switchStep('radar');

    state.timers.radar = setInterval(spawnRadarNode, 800);

    let searchTimeLeft = 45;
    if (DOM.radar.timer) DOM.radar.timer.innerText = `00:${searchTimeLeft < 10 ? '0' : ''}${searchTimeLeft}`;
    if (DOM.radar.statusText) DOM.radar.statusText.innerText = "Đang tìm kiếm sảnh chờ phù hợp (45s)...";

    state.timers.status = setInterval(() => {
        searchTimeLeft--;
        if (searchTimeLeft >= 0) {
            const secs = searchTimeLeft;
            if (DOM.radar.timer) DOM.radar.timer.innerText = `00:${secs < 10 ? '0' : ''}${secs}`;
        } else {
            if (state.timers.status) {
                clearInterval(state.timers.status);
                state.timers.status = null;
            }
        }
    }, 1000);

    const onTimeoutComplete = () => {
        clearTimers();
        if (!state.roomId) {
            switchStep('candidates');
            window.renderLobby([]);
        }
    };

    if (DEMO_MODE) {
        state.timers.searchTimeout = setTimeout(() => {
            clearTimers();
            switchStep('candidates');
            window.renderLobby([
                { userId: 'demo_1', userName: 'Trần B (Demo)', genre: 'Hành Động', mood: 'chill' },
                { userId: 'demo_2', userName: 'Hoàng C (Demo)', genre: 'Tình Cảm', mood: 'romantic' }
            ]);
        }, 15000);
    } else {
        state.timers.searchTimeout = setTimeout(onTimeoutComplete, 45000);
        await joinSignalRQueue();
    }
};

window.cancelSearch = function cancelSearch() {
    clearTimers();
    if (!DEMO_MODE) leaveSignalRQueue();
    switchStep('form');
};




function spawnRadarNode() {
    if (!DOM.radar.circle) return;

    const node = document.createElement('div');
    node.className = 'match-avatar-node';
    const icons = ['fa-user', 'fa-user-secret', 'fa-mask', 'fa-smile', 'fa-heart'];
    const icon = icons[Math.floor(Math.random() * icons.length)];
    node.innerHTML = `<i class="fas ${icon}"></i>`;

    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 40 + 5;
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    node.style.left = `${x}%`;
    node.style.top = `${y}%`;

    DOM.radar.circle.appendChild(node);
    state.activeNodes.push(node);

    setTimeout(() => { node.style.opacity = '0.7'; node.style.transform = 'scale(1)'; }, 50);
    setTimeout(() => {
        node.style.opacity = '0';
        node.style.transform = 'scale(0)';
        setTimeout(() => {
            if (DOM.radar.circle.contains(node)) DOM.radar.circle.removeChild(node);
        }, 500);
    }, 2000 + Math.random() * 1000);
}




window.renderLobby = function(candidates) {
    if (!DOM.candidates.container) return;

    if (candidates && candidates.length > 0) {
        DOM.candidates.container.innerHTML = candidates.map(c => `
            <div class="candidate-card" style="background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 15px;">
                <div style="font-size: 2rem; color: var(--neon-cyan); margin-bottom: 10px;"><i class="fas fa-user-circle"></i></div>
                <h3 style="color: white; margin: 0 0 5px 0;">${c.userName}</h3>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 15px;">Mood: ${c.mood || 'Chill'} • Thể loại: ${c.genre || 'Tất cả'}</p>
                <button onclick="window.sendInvite('${c.userId}', '${c.userName.replace(/'/g, "\\'")}')" class="neon-btn" style="padding: 8px 25px; font-size: 0.9rem; margin: 0 auto;">
                    <i class="fas fa-heart"></i> Ghép đôi ngay
                </button>
            </div>
        `).join('');
    } else {
        DOM.candidates.container.innerHTML = `
            <div class="empty-lobby-card" style="background: rgba(255,255,255,0.03); border: 1px dashed var(--glass-border); border-radius: 20px; padding: 40px 20px; text-align: center;">
                <div style="font-size: 3rem; color: var(--neon-cyan); margin-bottom: 15px; opacity: 0.8;">
                    <i class="fa-solid fa-user-slash"></i>
                </div>
                <h3 style="color: white; font-size: 1.3rem; margin-bottom: 10px;">Không tìm thấy người cùng trực tuyến</h3>
                <p style="color: var(--text-muted); font-size: 0.95rem; max-width: 450px; margin: 0 auto 25px auto; line-height: 1.5;">
                    Hệ thống đã quét 15 giây nhưng hiện chưa có người dùng nào phù hợp với tiêu chí của bạn trong sảnh chờ.
                </p>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="window.startMatching()" class="neon-btn" style="padding: 12px 25px; font-size: 0.95rem; justify-content: center;">
                        <i class="fa-solid fa-rotate-right"></i> Quét Tìm Lại (15s)
                    </button>
                    <button onclick="window.cancelSearch()" class="cancel-btn" style="padding: 12px 25px; font-size: 0.95rem;">
                        <i class="fa-solid fa-sliders"></i> Thay Đổi Tiêu Chí
                    </button>
                </div>
            </div>
        `;
    }
};

window.sendInvite = function(partnerKey, partnerName) {
    switchStep('sync');
    if (DOM.sync.partnerName) DOM.sync.partnerName.innerText = partnerName;
    state.currentMatch = { name: partnerName };
    state.isDemoSession = true;
    setTimeout(onBothAccepted, 2000);
};

function onBothAccepted() {
    switchStep('room');
    const name = state.currentMatch.name;
    if (DOM.room.partnerName) DOM.room.partnerName.innerText = name;
    if (DOM.room.partnerAvatarName) DOM.room.partnerAvatarName.innerText = name;

    appendChat('Hệ thống', `Kết nối thành công với ${name}! Hãy cùng chọn phim để xem nhé.`, 'system');
    loadSharedMovies();
    startRoomTimer();
}




async function loadSharedMovies() {
    let movies = [];

    if (DOM.room.moviesContainer) {
        DOM.room.moviesContainer.innerHTML = '<div style="color: white; text-align: center; grid-column: 1 / -1; padding: 20px;"><i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>Đang tải danh sách phim từ hệ thống...</div>';
    }

    
    try {
        const response = await fetch('/api/movies');
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                
                const shuffled = data.sort(() => 0.5 - Math.random());
                movies = shuffled.slice(0, 8).map(m => ({
                    id: m.id || m.Id || m.movieId,
                    title: m.title || m.Title || '',
                    genre: m.genre || m.Genre || 'Phim rạp',
                    poster: m.posterUrl || m.poster || m.Poster || m.imageUrl || m.image || 'https://via.placeholder.com/300x450'
                }));
            }
        }
    } catch (e) {
        console.error('Lỗi khi tải phim từ API:', e);
    }

    
    if (!movies || movies.length === 0) {
        try {
            const localData = localStorage.getItem('3hd2k_movies');
            if (localData) {
                const parsed = JSON.parse(localData);
                movies = parsed.slice(0, 8).map(m => ({
                    id: m.id,
                    title: m.title || m.Title,
                    genre: m.genre || m.Genre || '',
                    poster: m.posterUrl || m.poster || m.Poster || ''
                }));
            }
        } catch (e) {}
    }

    // 3. Dự phòng dữ liệu tĩnh nếu tất cả đều lỗi
    if (!movies || movies.length === 0) {
        movies = [
            { id: 'mov1', title: 'Lật Mặt 7', genre: 'Hành Động', poster: 'https://image.tmdb.org/t/p/w300/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg' },
            { id: 'mov2', title: 'Mai', genre: 'Tình Cảm', poster: 'https://image.tmdb.org/t/p/w300/dsGwCAlCjt8JaGrf6FrzWqXRuRK.jpg' },
            { id: 'mov3', title: 'Quật Mộ Trùng Ma', genre: 'Kinh Dị', poster: 'https://image.tmdb.org/t/p/w300/bi2cRf8YN1MdWsBGXLBNsB8AiMx.jpg' },
            { id: 'mov4', title: 'Deadpool & Wolverine', genre: 'Hành Động', poster: 'https://image.tmdb.org/t/p/w300/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg' },
            { id: 'mov5', title: 'Inside Out 2', genre: 'Hoạt Hình', poster: 'https://image.tmdb.org/t/p/w300/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg' },
            { id: 'mov6', title: 'Kung Fu Panda 4', genre: 'Hoạt Hình', poster: 'https://image.tmdb.org/t/p/w300/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg' },
            { id: 'mov7', title: 'Godzilla x Kong', genre: 'Hành Động', poster: 'https://image.tmdb.org/t/p/w300/z1p34vh7dEOnLDV7zlFnHk9RLbv.jpg' },
            { id: 'mov8', title: 'Dune: Part Two', genre: 'Viễn Tưởng', poster: 'https://image.tmdb.org/t/p/w300/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg' }
        ];
    }

    renderMovieGrid(movies);
}

function renderMovieGrid(movies) {
    if (!DOM.room.moviesContainer) return;

    DOM.room.moviesContainer.innerHTML = movies.map(m => `
        <div class="shared-movie-card" id="movie-card-${m.id}" style="background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); border-radius: 12px; padding: 10px; text-align: center; transition: all 0.3s;">
            <img src="${m.poster}" alt="${m.title}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" onerror="this.src='https://via.placeholder.com/150x225/222/fff?text=${encodeURIComponent(m.title)}'">
            <h4 style="color: white; font-size: 0.9rem; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${m.title}</h4>
            <p style="color: var(--text-muted); font-size: 0.75rem; margin-bottom: 10px;">${m.genre}</p>
            <button class="btn-suggest-movie" onclick="window.suggestMovie('${m.id}', '${m.title.replace(/'/g, "\\'")}')" style="width: 100%; padding: 8px; border-radius: 20px; border: 1px solid var(--neon-red); background: rgba(255,42,95,0.15); color: var(--neon-red); font-size: 0.8rem; cursor: pointer; font-family: 'Outfit', sans-serif; transition: all 0.3s;">
                <i class="fas fa-hand-point-up"></i> Đề xuất
            </button>
            <button class="btn-agree-movie" onclick="window.agreeMovie('${m.id}')" style="display: none; width: 100%; padding: 8px; border-radius: 20px; border: none; background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; font-size: 0.9rem; font-weight: 700; cursor: pointer; font-family: 'Outfit', sans-serif; margin-top: 6px; box-shadow: 0 4px 15px rgba(76,175,80,0.4);">
                <i class="fas fa-check"></i> ĐỒNG Ý
            </button>
        </div>
    `).join('');
}

// ============================================================
// MOVIE SUGGEST / AGREE
// ============================================================
window.suggestMovie = function(movieId, title) {
    if (DEMO_MODE || state.isDemoSession) {
        highlightSuggestedMovie(movieId);
        appendChat('Bạn', `Đã đề xuất phim: <b>${title}</b>`, 'me');
        setTimeout(() => {
            appendChat(state.currentMatch?.name || 'Đối tác', `Phim "${title}" hay đấy! Mình đồng ý luôn nhé! 🎬`, 'partner');
        }, 1500);
    } else if (connection && connection.state === signalR.HubConnectionState.Connected) {
        appendChat('Bạn', `Đã đề xuất phim: <b>${title}</b>`, 'me');
        connection.invoke("SuggestMovie", state.roomId, movieId, title).catch(err => console.error(err));
    }
};

function highlightSuggestedMovie(movieId) {
    document.querySelectorAll('.shared-movie-card').forEach(card => {
        card.style.borderColor = 'var(--glass-border)';
        card.style.boxShadow = 'none';
        const agreeBtn = card.querySelector('.btn-agree-movie');
        if (agreeBtn) agreeBtn.style.display = 'none';
    });

    const card = document.getElementById(`movie-card-${movieId}`);
    if (card) {
        card.style.borderColor = 'var(--neon-red)';
        card.style.boxShadow = '0 0 25px rgba(255,42,95,0.4)';
        const agreeBtn = card.querySelector('.btn-agree-movie');
        if (agreeBtn) agreeBtn.style.display = 'block';
    }
}

window.agreeMovie = function(movieId) {
    if (DEMO_MODE || state.isDemoSession) {
        executeAgreeMovie(movieId);
    } else if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("AgreeMovie", state.roomId, movieId).catch(err => console.error(err));
    }
};

function executeAgreeMovie(movieId) {
    appendChat('Hệ thống', 'Cả hai đã đồng ý! Đang chuyển đến trang phim...', 'system');
    localStorage.setItem('cinematch_active', 'true');

    setTimeout(() => {
        window.location.href = `../../explore/movie-details/index.html?id=${movieId}&cinematch=true`;
    }, 1500);
};




function sendChatMessage(textOverride) {
    const text = textOverride || (DOM.room.chatInput ? DOM.room.chatInput.value.trim() : '');
    if (!text) return;
    if (DOM.room.chatInput && !textOverride) DOM.room.chatInput.value = '';

    if (DEMO_MODE || state.isDemoSession) {
        appendChat('Bạn', text, 'me');
        setTimeout(() => {
            const replies = ["Tuyệt vời!", "Mình cũng nghĩ vậy", "Hay đấy!", "Ok luôn!", "😊", "👍", "Nghe hay đó!", "Mình thích ý tưởng này!"];
            const reply = textOverride ? "👍" : replies[Math.floor(Math.random() * replies.length)];
            appendChat(state.currentMatch?.name || 'Đối tác', reply, 'partner');
        }, 1000 + Math.random() * 1000);
    } else if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("SendMessage", state.roomId, text).catch(err => console.error(err));
    }
}

function appendChat(sender, message, type) {
    if (!DOM.room.chatLog) return;

    const div = document.createElement('div');
    div.style.marginBottom = '10px';
    div.style.animation = 'fadeSlideUp 0.3s ease-out';

    if (type === 'system') {
        div.style.textAlign = 'center';
        div.innerHTML = `<span style="color: #FFD700; font-size: 0.85rem; font-style: italic;">${message}</span>`;
    } else if (type === 'me') {
        div.style.textAlign = 'right';
        div.innerHTML = `
            <div style="display: inline-block; background: rgba(13, 242, 134, 0.15); border: 1px solid rgba(13, 242, 134, 0.2); padding: 8px 14px; border-radius: 16px 16px 4px 16px; max-width: 80%; text-align: left;">
                <div style="font-size: 0.75rem; color: var(--neon-green); margin-bottom: 3px; font-weight: 600;">${sender}</div>
                <div style="color: white; font-size: 0.9rem;">${message}</div>
            </div>
        `;
    } else {
        div.style.textAlign = 'left';
        div.innerHTML = `
            <div style="display: inline-block; background: rgba(255, 42, 95, 0.12); border: 1px solid rgba(255, 42, 95, 0.2); padding: 8px 14px; border-radius: 16px 16px 16px 4px; max-width: 80%; text-align: left;">
                <div style="font-size: 0.75rem; color: var(--neon-red); margin-bottom: 3px; font-weight: 600;">${sender}</div>
                <div style="color: white; font-size: 0.9rem;">${message}</div>
            </div>
        `;
    }

    DOM.room.chatLog.appendChild(div);
    DOM.room.chatLog.scrollTop = DOM.room.chatLog.scrollHeight;
}




function startRoomTimer() {
    let timeLeft = 3 * 60; 

    clearInterval(state.timers.matchTimer);

    state.timers.matchTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft < 0) {
            clearInterval(state.timers.matchTimer);
            appendChat('Hệ thống', 'Đã hết thời gian phòng chung! Hãy bắt đầu lại.', 'system');
            return;
        }
        if (DOM.room.matchTimer) {
            const m = Math.floor(timeLeft / 60);
            const s = timeLeft % 60;
            DOM.room.matchTimer.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
            if (timeLeft <= 30) {
                DOM.room.matchTimer.style.color = '#ff4444';
                DOM.room.matchTimer.style.animation = 'heartbeat 1s infinite';
            }
        }
    }, 1000);
}




function clearTimers() {
    Object.keys(state.timers).forEach(key => {
        if (state.timers[key]) {
            clearInterval(state.timers[key]);
            clearTimeout(state.timers[key]);
            state.timers[key] = null;
        }
    });
}

function cleanup() {
    clearTimers();
    if (!DEMO_MODE) leaveSignalRQueue();
}
