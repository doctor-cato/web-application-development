/**
 * seatSocket.js
 * Lightweight wrapper for socket.io client. The page should include socket.io client:
 * <script src="/socket.io/socket.io.js"></script>
 * or a CDN variant if a server is available.
 */

let socket = null;

export function connect(showtimeId) {
  if (typeof io === 'undefined') {
    console.warn('Socket.io client (io) not available. Real-time features disabled.');
    return null;
  }
  if (socket && socket.connected) return socket;
  try {
    socket = io(); // connect to current origin
    if (showtimeId) socket.emit('join_showtime', { showtimeId });
  } catch (e) {
    console.warn('Socket.io connect failed', e);
    socket = null;
  }
  return socket;
}

export function on(event, cb) {
  if (!socket) return;
  socket.on(event, cb);
}

export function emit(event, data) {
  if (!socket) return;
  socket.emit(event, data);
}

export function leave(showtimeId) {
  if (!socket) return;
  socket.emit('leave_showtime', { showtimeId });
}

export function disconnect() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}
