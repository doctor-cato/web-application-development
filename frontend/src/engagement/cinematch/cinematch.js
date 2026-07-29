import { renderNavbar } from '../../shared/components/navbar.js';
import { renderFooter } from '../../shared/components/footer.js';
import { getSession } from '../../auth/auth-services/authService.js';

// ============================================================
// CineMatch Premium - Firebase Real-time Matching
// ============================================================

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDG5N9AUg5pksjgZpRL5PSEmY_xWMUs8YQ",
    authDomain: "cinematch-3hd2k.firebaseapp.com",
    databaseURL: "https://cinematch-3hd2k-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "cinematch-3hd2k",
    storageBucket: "cinematch-3hd2k.firebasestorage.app",
    messagingSenderId: "234989869102",
    appId: "1:234989869102:web:4fdec7b23e11a24b5c27bf",
    measurementId: "G-E6G51ERGQF"
};

// Set to true for local testing (simulates matching without Firebase)
// Set to false when Firebase is configured for real cross-device matching
const DEMO_MODE = false;

// Firebase refs
let database, queueRef, roomRef;

// ============================================================
// STATE
// ============================================================
const state = {
    userId: null,
    userName: null,
    preferences: { mood: 'any', genre: 'all', time: 'any', gender: 'any', cinema: 'any' },
    currentMatch: null,
    roomId: null,
    bothAccepted: false,
    isUser1: false,
    activeNodes: [],
    timers: { radar: null, status: null, demoMatch: null, matchTimer: null }
};

// ============================================================
// DOM ELEMENTS (populated after DOMContentLoaded)
// ============================================================
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

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    // Render navbar & footer
    const navEl = document.getElementById('navbar-placeholder');
    if (navEl) navEl.innerHTML = renderNavbar();
    const footEl = document.getElementById('footer-placeholder');
    if (footEl) footEl.innerHTML = renderFooter();

    // Cache DOM refs
    cacheDom();

    // Load Cinemas
    loadCinemas();

    // Session check
    const session = getSession();
    if (!session && !DEMO_MODE) {
        alert("Bạn cần đăng nhập để tham gia Cine-Match!");
        window.location.href = '../../auth/user-login/login.html?returnUrl=' + encodeURIComponent(window.location.href);
        return;
    }

    state.userId = session?.email || 'demo_' + Math.random().toString(36).substr(2, 6);
    state.userName = session?.fullname || session?.name || session?.username || "Người dùng";

    // Init Firebase if not demo
    if (!DEMO_MODE) initFirebase();

    // Setup interactions
    setupFormSelection();
    setupEventHandlers();

    // Set defaults for pre-selected cards
    document.querySelectorAll('.pref-card.selected').forEach(card => {
        const group = card.dataset.group;
        const value = card.dataset.value;
        if (group && value) state.preferences[group] = value;
    });
});

// ============================================================
// FIREBASE
// ============================================================
function initFirebase() {
    try {
        if (!window.firebase) {
            console.warn("Firebase SDK not loaded");
            return;
        }
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
        database = firebase.database();
        queueRef = database.ref('cinematch-queue');
        console.log("Firebase initialized for CineMatch");
    } catch (e) {
        console.error("Firebase init error:", e);
    }
}

// ============================================================
// API
// ============================================================
async function loadCinemas() {
    try {
        const res = await fetch('/api/cinemas');
        if (res.ok) {
            const data = await res.json();
            const container = document.getElementById('pref-cinema');
            if (!container) return;
            
            data.forEach(cinema => {
                const card = document.createElement('div');
                card.className = 'pref-card';
                card.dataset.group = 'cinema';
                card.dataset.value = cinema.id || cinema.Id;
                card.innerHTML = `
                    <i class="fa-solid fa-building"></i>
                    <span class="label">${cinema.name || cinema.Name}</span>
                `;
                container.appendChild(card);
            });
            
            setupFormSelection();
        }
    } catch (e) {
        console.error("Error loading cinemas:", e);
    }
}

let myQueueRef = null;

function joinFirebaseQueue() {
    if (!database) return;
    myQueueRef = queueRef.child(state.userId.replace(/[.#$\[\]]/g, '_'));
    
    const myData = {
        userId: state.userId,
        userName: state.userName,
        genre: state.preferences.genre,
        mood: state.preferences.mood,
        time: state.preferences.time,
        gender: state.preferences.gender,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    
    myQueueRef.set(myData);

    // Lắng nghe xem có ai ghép đôi với mình không
    myQueueRef.on('value', (snap) => {
        const data = snap.val();
        if (data && data.matchRoomId) {
            state.roomId = data.matchRoomId;
            state.isUser1 = data.isUser1 || false;
            roomRef = database.ref('cinematch-rooms/' + state.roomId);
            setupRoomListeners();
            myQueueRef.off('value'); // Dừng lắng nghe
            queueRef.off('value');
            myQueueRef.remove();
            state.currentMatch = { name: data.partnerData.userName };
            // Note: setupRoomListeners will trigger onBothAccepted because user1Accepted and user2Accepted are both true
        }
    });

    // Lắng nghe lời mời từ người khác
    myQueueRef.child('invites').on('child_added', (snapshot) => {
        const inviteData = snapshot.val();
        const inviteKey = snapshot.key;
        if (inviteData && typeof window.showInvitePopup === 'function') {
            window.showInvitePopup(inviteData, inviteKey);
        }
    });

    // Cập nhật danh sách sảnh chờ
    queueRef.on('value', (snapshot) => {
        const queueObj = snapshot.val() || {};
        const candidates = [];
        
        Object.keys(queueObj).forEach(key => {
            const partner = queueObj[key];
            if (!partner || partner.userId === state.userId || partner.matchRoomId) return;

            const genreMatch = partner.genre === state.preferences.genre || partner.genre === 'all' || state.preferences.genre === 'all';
            const moodMatch = partner.mood === state.preferences.mood || partner.mood === 'any' || state.preferences.mood === 'any';

            if (genreMatch && moodMatch) {
                partner._key = key;
                candidates.push(partner);
            }
        });
        
        if (state.roomId) return;
        if (typeof window.renderLobby === 'function') {
            window.renderLobby(candidates);
        }
    });
}

function leaveFirebaseQueue() {
    if (!database) return;
    if (myQueueRef) {
        myQueueRef.remove();
        myQueueRef.off();
    }
    queueRef?.off('value');
}

function setupRoomListeners() {
    if (!roomRef) return;
    
    roomRef.on('value', (snap) => {
        const room = snap.val();
        if (room && room.user1Accepted && room.user2Accepted && !state.bothAccepted) {
            state.bothAccepted = true;
            onBothAccepted();
        }
    });

    roomRef.child('messages').on('child_added', (snap) => {
        const msg = snap.val();
        if (msg.sender === state.userId) {
            appendChat('Bạn', msg.message, 'me');
        } else {
            appendChat(msg.senderName, msg.message, 'partner');
        }
    });

    roomRef.child('suggestedMovie').on('value', (snap) => {
        const suggested = snap.val();
        if (suggested) {
            highlightSuggestedMovie(suggested.id);
            if (suggested.sender !== state.userId) {
                appendChat(suggested.senderName, `Đã đề xuất phim: <b>${suggested.title}</b>`, 'partner');
            }
        }
    });

    roomRef.child('agreedMovie').on('value', (snap) => {
        const agreed = snap.val();
        if (agreed) {
            executeAgreeMovie(agreed.id);
        }
    });
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

// ============================================================
// EVENT HANDLERS
// ============================================================
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

    // Emoji buttons
    DOM.room.emojiBar?.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            sendChatMessage(btn.textContent.trim());
        });
    });

    window.addEventListener('beforeunload', cleanup);
}

// ============================================================
// STEP SWITCHING
// ============================================================
function switchStep(stepName) {
    Object.values(DOM.steps).forEach(step => {
        if (step) step.style.display = 'none';
    });
    if (DOM.steps[stepName]) {
        DOM.steps[stepName].style.display = 'block';
        DOM.steps[stepName].style.animation = 'popIn 0.5s ease-out';
    }
}

// ============================================================
// MATCHING
// ============================================================
function startMatching() {
    // Reset previous states to prevent stuck match
    state.roomId = null;
    state.bothAccepted = false;
    state.currentMatch = null;
    state.isUser1 = false;
    window.currentInviteData = null;
    window.currentInviteKey = null;
    
    if (roomRef) {
        roomRef.off();
        roomRef = null;
    }
    if (myQueueRef) {
        myQueueRef.off();
        myQueueRef = null;
    }

    switchStep('radar');

    // Radar animation
    clearInterval(state.timers.radar);
    state.timers.radar = setInterval(spawnRadarNode, 800);
    if (DOM.radar.statusText) DOM.radar.statusText.innerText = "Đang tìm kiếm sảnh chờ phù hợp...";

    if (DEMO_MODE) {
        setTimeout(() => {
            switchStep('candidates');
            window.renderLobby([
                { userId: 'demo_1', userName: 'Trần B (Demo)', genre: 'Hành Động', mood: 'chill' },
                { userId: 'demo_2', userName: 'Hoàng C (Demo)', genre: 'Tình Cảm', mood: 'romantic' }
            ]);
        }, 1500);
    } else {
        setTimeout(() => {
            if (!state.roomId) switchStep('candidates');
        }, 1500);
        joinFirebaseQueue();
    }
}

function cancelSearch() {
    clearTimers();
    if (!DEMO_MODE) leaveFirebaseQueue();
    switchStep('form');
}

// ============================================================
// RADAR ANIMATION
// ============================================================
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

// ============================================================
// MATCH FOUND
// ============================================================
// ============================================================
// LOBBY RENDERING & INVITATIONS
// ============================================================
window.renderLobby = function(candidates) {
    if (!DOM.candidates.container) return;
    
    if (candidates.length === 0) {
        DOM.candidates.container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fa-solid fa-ghost" style="font-size: 3rem; margin-bottom: 20px; color: rgba(255,255,255,0.2);"></i>
                <p>Hiện chưa có ai trong sảnh chờ phù hợp với tiêu chí của bạn.</p>
                <p>Vui lòng đợi thêm hoặc thử mở rộng sở thích!</p>
            </div>
        `;
        return;
    }

    DOM.candidates.container.innerHTML = candidates.map(data => {
        const matchPercent = Math.floor(Math.random() * 15) + 85;
        const anonName = data.userName;
        
        return `
            <div class="candidate-card" style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); border-radius: 16px; padding: 20px; text-align: center; animation: fadeSlideUp 0.5s ease-out;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple)); display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                    <i class="fas fa-user" style="font-size: 2rem; color: rgba(255,255,255,0.8);"></i>
                </div>
                <div style="display: inline-block; background: rgba(0,240,255,0.1); color: var(--neon-cyan); padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; margin-bottom: 10px; border: 1px solid var(--neon-cyan);">
                    ${matchPercent}% Phù Hợp
                </div>
                <h3 style="color: white; font-size: 1.2rem; margin-bottom: 5px;">${anonName}</h3>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 20px;">
                    <i class="fa-solid fa-film"></i> ${data.genre !== 'all' ? data.genre : 'Bất kỳ thể loại'}
                </p>
                <button onclick="window.sendInvite('${data._key || data.userId}', '${anonName}')" style="width: 100%; padding: 12px; border-radius: 25px; border: none; background: var(--neon-red); color: white; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 15px rgba(255,42,95,0.4);">
                    <i class="fa-solid fa-paper-plane" style="margin-right: 8px;"></i> Mời Xem Phim
                </button>
            </div>
        `;
    }).join('');
};

window.sendInvite = function(partnerKey, partnerName) {
    if (DEMO_MODE) {
        switchStep('sync');
        if (DOM.sync.partnerName) DOM.sync.partnerName.innerText = partnerName;
        state.currentMatch = { name: partnerName };
        setTimeout(onBothAccepted, 2000);
        return;
    }

    if (!database || !queueRef) return;

    state.currentMatch = { name: partnerName };
    switchStep('sync');
    if (DOM.sync.partnerName) DOM.sync.partnerName.innerText = partnerName;

    const myData = {
        userId: state.userId,
        userName: state.userName,
        genre: state.preferences.genre,
        mood: state.preferences.mood,
        time: state.preferences.time,
        gender: state.preferences.gender,
        cinema: state.preferences.cinema
    };

    queueRef.child(partnerKey.replace(/[.#$\[\]]/g, '_')).child('invites').push({
        from: myData,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
};

window.showInvitePopup = function(inviteData, inviteKey) {
    window.currentInviteData = inviteData;
    window.currentInviteKey = inviteKey;
    const modal = document.getElementById('invite-modal');
    const senderName = document.getElementById('invite-sender-name');
    if (modal && senderName) {
        senderName.innerText = inviteData.from.userName;
        modal.style.display = 'flex';
        modal.style.animation = 'popIn 0.3s ease-out';
    }
};

window.declineInvite = function() {
    const modal = document.getElementById('invite-modal');
    if (modal) modal.style.display = 'none';

    if (window.currentInviteKey && myQueueRef) {
        myQueueRef.child('invites').child(window.currentInviteKey).remove();
    }
    window.currentInviteData = null;
    window.currentInviteKey = null;
};

window.acceptInvite = function() {
    const modal = document.getElementById('invite-modal');
    if (modal) modal.style.display = 'none';

    if (!window.currentInviteData) return;
    
    const partner = window.currentInviteData.from;
    const partnerKey = partner.userId.replace(/[.#$\[\]]/g, '_');
    
    const roomId = 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    
    database.ref('cinematch-rooms/' + roomId).set({
        user1: { userId: state.userId, userName: state.userName },
        user2: { userId: partner.userId, userName: partner.userName },
        user1Accepted: true,
        user2Accepted: true,
        createdAt: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        if (window.currentInviteKey && myQueueRef) {
            myQueueRef.child('invites').child(window.currentInviteKey).remove();
        }

        queueRef.child(partnerKey).update({
            matchRoomId: roomId,
            isUser1: false,
            partnerData: {
                userId: state.userId,
                userName: state.userName
            }
        });

        myQueueRef.update({
            matchRoomId: roomId,
            isUser1: true,
            partnerData: partner
        });
        
        state.currentMatch = { name: partner.userName };
    });
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

// ============================================================
// SHARED MOVIES
// ============================================================
async function loadSharedMovies() {
    let movies = [];

    if (DOM.room.moviesContainer) {
        DOM.room.moviesContainer.innerHTML = '<div style="color: white; text-align: center; grid-column: 1 / -1; padding: 20px;"><i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>Đang tải danh sách phim từ hệ thống...</div>';
    }

    // 1. Lấy dữ liệu phim thật từ API
    try {
        const response = await fetch('/api/movies');
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                // Trộn ngẫu nhiên danh sách phim để mỗi lần match có phim khác nhau (tùy chọn)
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

    // 2. Dự phòng lấy từ localStorage nếu API lỗi
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
    if (DEMO_MODE) {
        highlightSuggestedMovie(movieId);
        appendChat('Bạn', `Đã đề xuất phim: <b>${title}</b>`, 'me');
        setTimeout(() => {
            appendChat(state.currentMatch.name, `Phim "${title}" hay đấy! Mình đồng ý luôn nhé! 🎬`, 'partner');
        }, 2000 + Math.random() * 1000);
    } else if (roomRef) {
        appendChat('Bạn', `Đã đề xuất phim: <b>${title}</b>`, 'me');
        roomRef.child('suggestedMovie').set({
            id: movieId,
            title: title,
            sender: state.userId,
            senderName: state.userName
        });
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
    if (DEMO_MODE) {
        executeAgreeMovie(movieId);
    } else if (roomRef) {
        roomRef.child('agreedMovie').set({ id: movieId });
    }
};

function executeAgreeMovie(movieId) {
    appendChat('Hệ thống', 'Cả hai đã đồng ý! Đang chuyển đến trang phim...', 'system');
    localStorage.setItem('cinematch_active', 'true');

    setTimeout(() => {
        window.location.href = `../../explore/movie-details/index.html?id=${movieId}&cinematch=true`;
    }, 1500);
};

// ============================================================
// CHAT
// ============================================================
function sendChatMessage(textOverride) {
    const text = textOverride || (DOM.room.chatInput ? DOM.room.chatInput.value.trim() : '');
    if (!text) return;
    if (DOM.room.chatInput && !textOverride) DOM.room.chatInput.value = '';

    if (DEMO_MODE) {
        appendChat('Bạn', text, 'me');
        setTimeout(() => {
            const replies = ["Tuyệt vời!", "Mình cũng nghĩ vậy", "Hay đấy!", "Ok luôn!", "😊", "👍", "Nghe hay đó!", "Mình thích ý tưởng này!"];
            const reply = textOverride ? "👍" : replies[Math.floor(Math.random() * replies.length)];
            appendChat(state.currentMatch.name, reply, 'partner');
        }, 1000 + Math.random() * 1500);
    } else if (roomRef) {
        roomRef.child('messages').push({
            sender: state.userId,
            senderName: state.userName,
            message: text,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
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

// ============================================================
// ROOM TIMER
// ============================================================
function startRoomTimer() {
    let timeLeft = 3 * 60; // 3 minutes

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

// ============================================================
// CLEANUP
// ============================================================
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
    if (!DEMO_MODE) leaveFirebaseQueue();
}
