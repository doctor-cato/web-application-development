import { lsGet, lsSet, getBookings, saveBookings, KEYS } from '../../shared/utils/storage.js';
import { API_BASE_URL, getHeaders } from '../../shared/utils/apiConfig.js?v=4';

let connection = null;
let currentRoomId = null;
let seatUpdateCallback = null;
let seatBroadcastChannel = null;

const getSignalRUrl = () => {
    try {
        const url = new URL(API_BASE_URL);
        return `${url.protocol}//${url.host}/seatHub`;
    } catch (e) {
        return 'https://localhost:7198/seatHub'; 
    }
};

export function initBroadcastChannel(roomId) {
    if ('BroadcastChannel' in window) {
        if (seatBroadcastChannel) {
            try { seatBroadcastChannel.close(); } catch (e) {}
        }
        seatBroadcastChannel = new BroadcastChannel('cine_seat_channel_' + roomId);
        seatBroadcastChannel.onmessage = (event) => {
            const data = event.data;
            if (!data || data.showtimeId !== roomId) return;
            if (seatUpdateCallback) {
                seatUpdateCallback(data);
            }
        };
    }
}

export function broadcastLocalSeatChange(type, seatId, roomId, userId) {
    if (seatBroadcastChannel) {
        try {
            seatBroadcastChannel.postMessage({
                type,
                seatId,
                showtimeId: roomId,
                userId,
                timestamp: Date.now()
            });
        } catch (e) {}
    }
}

export async function initSignalR(roomId) {
    currentRoomId = roomId;
    initBroadcastChannel(roomId);

    
    const handleUnload = () => {
        closeSeatSyncChannel();
    };
    window.addEventListener('beforeunload', handleUnload, { once: true });
    window.addEventListener('pagehide', handleUnload, { once: true });

    if (!window.signalR) {
        console.warn("SignalR library not present, falling back to BroadcastChannel multi-tab sync only.");
        return;
    }

    connection = new signalR.HubConnectionBuilder()
        .withUrl(getSignalRUrl(), {
            accessTokenFactory: () => localStorage.getItem('jwt_token') || ''
        })
        .withAutomaticReconnect()
        .build();

    connection.on("SeatSelected", (seatId, userId) => {
        if (seatUpdateCallback) {
            seatUpdateCallback({ type: 'seat_locked', seatId, userId, showtimeId: roomId });
        }
    });

    connection.on("SeatReleased", (seatId) => {
        if (seatUpdateCallback) {
            seatUpdateCallback({ type: 'seat_unlocked', seatId, showtimeId: roomId });
        }
    });

    connection.on("SeatBooked", (seatId) => {
        if (seatUpdateCallback) {
            seatUpdateCallback({ type: 'seat_booked', seatId, showtimeId: roomId });
        }
    });

    connection.on("SeatSelectionFailed", (seatId, reason) => {
        alert(`Không thể chọn ghế ${seatId}: ${reason}`);
        if (seatUpdateCallback) {
            seatUpdateCallback({ type: 'seat_unlocked', seatId, showtimeId: roomId });
        }
    });

    try {
        await connection.start();
        await connection.invoke("JoinRoom", roomId);
    } catch (err) {
        console.error("SignalR Connection Error: ", err);
    }
}

export function subscribeSeatUpdates(callback) {
    seatUpdateCallback = callback;
}

export function closeSeatSyncChannel() {
    if (seatBroadcastChannel) {
        try { seatBroadcastChannel.close(); } catch (e) {}
        seatBroadcastChannel = null;
    }
    if (connection && currentRoomId) {
        connection.invoke("LeaveRoom", currentRoomId).then(() => {
            connection.stop();
        }).catch(err => console.error(err));
    }
}

export function getSeatMap(showtimeId) {
    return {}; 
}

export function lockSeat(showtimeId, seatId, userId) {
    broadcastLocalSeatChange('seat_locked', seatId, showtimeId, userId);
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("SelectSeat", showtimeId, seatId, userId).catch(err => console.error(err));
    }
    return true; 
}

export function unlockSeat(showtimeId, seatId, userId) {
    broadcastLocalSeatChange('seat_unlocked', seatId, showtimeId, userId);
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("ReleaseSeat", showtimeId, seatId).catch(err => console.error(err));
    }
    return true;
}

export function releaseExpiredLocks() {
    
}

export async function confirmBooking(checkoutData) {
  try {
    const seatsArr = Array.isArray(checkoutData.seats) ? checkoutData.seats : (checkoutData.seats ? [checkoutData.seats] : []);
    const perSeatTickets = seatsArr.map(s => ({
        seat: s,
        ticketCode: 'TK-' + s + '-' + Math.floor(100000 + Math.random() * 900000)
    }));

    const payload = {
        ShowtimeId: checkoutData.showtimeId,
        MovieId: checkoutData.movieId,
        Seats: seatsArr.join(','),
        ComboId: checkoutData.combo === 'none' ? '' : checkoutData.combo,
        PromoCode: checkoutData.promoCode || '',
        PaymentMethod: checkoutData.paymentMethod || 'payos'
    };

    const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });

    if (response.ok) {
        const data = await response.json();
        
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
            for (const s of seatsArr) {
                await connection.invoke("ConfirmBooking", checkoutData.showtimeId, s);
            }
        }

        return data;
    } else {
        console.error('Booking failed at backend');
        return null;
    }
  } catch (error) {
    console.error('Error in confirmBooking:', error);
    return null;
  }
}

export async function getUserBookings(userId) {
  if (!userId) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.error(err);
  }
  return [];
}
