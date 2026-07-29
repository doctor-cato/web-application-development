import { lsGet, lsSet, getBookings, saveBookings, KEYS } from '../../shared/utils/storage.js';
import { API_BASE_URL, getHeaders } from '../../shared/utils/apiConfig.js?v=4';

let connection = null;
let currentRoomId = null;
let seatUpdateCallback = null;

const getSignalRUrl = () => {
    try {
        const url = new URL(API_BASE_URL);
        return `${url.protocol}//${url.host}/seatHub`;
    } catch (e) {
        return 'https://localhost:7198/seatHub'; // Fallback
    }
};

export async function initSignalR(roomId) {
    if (!window.signalR) {
        console.error("SignalR is not loaded!");
        return;
    }

    currentRoomId = roomId;

    connection = new signalR.HubConnectionBuilder()
        .withUrl(getSignalRUrl())
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
        console.log("SignalR Connected.");
        await connection.invoke("JoinRoom", roomId);
    } catch (err) {
        console.error("SignalR Connection Error: ", err);
    }
}

export function subscribeSeatUpdates(callback) {
    seatUpdateCallback = callback;
}

export function closeSeatSyncChannel() {
    if (connection && currentRoomId) {
        connection.invoke("LeaveRoom", currentRoomId).then(() => {
            connection.stop();
        }).catch(err => console.error(err));
    }
}

export function getSeatMap(showtimeId) {
    return {}; // Rely on SignalR or separate API fetch for initial state
}

export function lockSeat(showtimeId, seatId, userId) {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("SelectSeat", showtimeId, seatId, userId).catch(err => console.error(err));
    }
    return true; // Optimistic UI update
}

export function unlockSeat(showtimeId, seatId, userId) {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("ReleaseSeat", showtimeId, seatId).catch(err => console.error(err));
    }
    return true;
}

export function releaseExpiredLocks() {
    // Handled by backend SeatCleanupService
}

export async function confirmBooking(checkoutData) {
  try {
    const seatsArr = Array.isArray(checkoutData.seats) ? checkoutData.seats : (checkoutData.seats ? [checkoutData.seats] : []);
    const perSeatTickets = seatsArr.map(s => ({
        seat: s,
        ticketCode: 'TK-' + s + '-' + Math.floor(100000 + Math.random() * 900000)
    }));

    const payload = {
        Email: checkoutData.userId || 'guest@example.com',
        ShowtimeId: checkoutData.showtimeId || 1,
        MovieId: checkoutData.movieId || 1,
        Seats: seatsArr.join(','),
        Tickets: perSeatTickets,
        TotalPrice: checkoutData.total || checkoutData.amount || 0,
        PaymentMethod: checkoutData.paymentMethod || 'Credit Card'
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
