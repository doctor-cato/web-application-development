/**
 * pages/booking.js — Trang chọn ghế
 */

import { getSeatMap, lockSeat, unlockSeat, subscribeSeatUpdates } from './bookingService.js';
import { renderSeatGrid, updateSeat, getSelectedSeats, getSeatType, setGroupSize } from '/shared/components/seatGrid.js';
import { saveCheckout } from '/shared/utils/storage.js';
import { requireAuth } from '/shared/utils/authGuard.js';

// Kiểm tra đăng nhập ngay khi tải trang chọn ghế
if (!requireAuth('Bạn cần đăng nhập để đặt vé xem phim. Hãy đăng nhập hoặc tạo tài khoản để tiếp tục.')) {
    // Chặn toàn bộ giao diện, user sẽ thấy modal
    document.addEventListener('DOMContentLoaded', () => {
        const main = document.querySelector('main');
        if (main) main.style.filter = 'blur(5px)';
    });
}

const PRICING = {
  weekday: { regular: 50000, vip: 65000, couple: 100000 },
  weekend: { regular: 65000, vip: 80000, couple: 150000 }
};

let countdownTimer = null;
let simulationTimer = null;
let currentShowtimeId = null;
let currentUserId = 'mock_user_123'; // Mock user since we skip Auth
let movieData = { 
  id: 'm_001', 
  title: 'Spider-Man: Across the Spider-Verse',
  poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop' // Placeholder cinema poster
};

function init() {
  // Group Seat Logic
  const btnMinus = document.getElementById('btn-group-minus');
  const btnPlus = document.getElementById('btn-group-plus');
  const sizeDisplay = document.getElementById('group-size-display');
  const toggleGroup = document.getElementById('toggle-group-booking');
  const counterUi = document.getElementById('group-counter-ui');
  let currentGroupSize = 1;
  
  if (toggleGroup && counterUi) {
      toggleGroup.addEventListener('change', (e) => {
          if (e.target.checked) {
              counterUi.style.display = 'flex';
              // Default to 2 when turned on
              currentGroupSize = 2;
              if(sizeDisplay) sizeDisplay.innerText = currentGroupSize;
              setGroupSize(currentGroupSize);
              if(btnMinus) btnMinus.disabled = false;
              if(btnPlus) btnPlus.disabled = false;
          } else {
              counterUi.style.display = 'none';
              currentGroupSize = 1;
              if(sizeDisplay) sizeDisplay.innerText = currentGroupSize;
              setGroupSize(currentGroupSize);
              if(btnMinus) btnMinus.disabled = true;
          }
      });
  }
  
  if (btnMinus && btnPlus && sizeDisplay) {
      btnMinus.addEventListener('click', () => {
          if (currentGroupSize > 1) {
              currentGroupSize--;
              sizeDisplay.innerText = currentGroupSize;
              setGroupSize(currentGroupSize);
              btnPlus.disabled = false;
              if (currentGroupSize === 1) btnMinus.disabled = true;
          }
      });
      
      btnPlus.addEventListener('click', () => {
          if (currentGroupSize < 6) {
              currentGroupSize++;
              sizeDisplay.innerText = currentGroupSize;
              setGroupSize(currentGroupSize);
              btnMinus.disabled = false;
              if (currentGroupSize === 6) btnPlus.disabled = true;
          }
      });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('id');
  currentShowtimeId = urlParams.get('showtimeId') || 'st_200';

  if (movieId) {
    const allMovies = [
      ...(typeof heroMovies !== 'undefined' ? heroMovies : []),
      ...(typeof nowShowingMovies !== 'undefined' ? nowShowingMovies : []),
      ...(typeof comingSoonMovies !== 'undefined' ? comingSoonMovies : [])
    ];
    const foundMovie = allMovies.find(m => m.id === movieId);
    if (foundMovie) {
      movieData = {
        id: foundMovie.id,
        title: foundMovie.title,
        poster: foundMovie.poster || foundMovie.bg,
        genre: foundMovie.genre,
        tags: foundMovie.tags
      };
    }
  }

  renderMovieInfo();
  
  const seatMap = getSeatMap(currentShowtimeId);
  const container = document.getElementById('seat-grid');
  
  if (container) {
    renderSeatGrid(container, seatMap, {
      onSelect: handleSeatSelect,
      onDeselect: handleSeatDeselect
    });
  }

  // Subscribe to real-time seat updates
  subscribeSeatUpdates((eventData) => {
    if (eventData.showtimeId !== currentShowtimeId) return;
    
    if (eventData.type === 'seat_locked') {
      updateSeat(eventData.seatId, 'locked', eventData.userId);
    } else if (eventData.type === 'seat_unlocked') {
      updateSeat(eventData.seatId, 'available');
    } else if (eventData.type === 'seat_booked') {
      updateSeat(eventData.seatId, 'booked');
    }
  });

  document.getElementById('btn-continue')?.addEventListener('click', handleContinue);

  updatePricesTable();
  simulateActivity();
}

function renderMovieInfo() {
  const titleEl = document.getElementById('movie-title');
  const showtimeEl = document.getElementById('showtime-datetime');
  const roomEl = document.getElementById('showtime-room');
  const posterEl = document.getElementById('movie-poster');
  
  if (titleEl) titleEl.innerText = movieData.title;
  if (showtimeEl) showtimeEl.innerText = `19:30 | ${currentShowtimeId}`;
  if (roomEl) roomEl.innerText = 'Phòng 3';
  if (posterEl) posterEl.src = movieData.poster;
}

function handleSeatSelect(seatId) {
  const success = lockSeat(currentShowtimeId, seatId, currentUserId);
  if (!success) {
    alert(`Ghế ${seatId} đã có người khác chọn!`);
    updateSeat(seatId, 'locked');
  } else {
    updateSummary();
    if (!countdownTimer) startCountdown(15 * 60);
  }
}

function handleSeatDeselect(seatId) {
  unlockSeat(currentShowtimeId, seatId, currentUserId);
  updateSummary();
  const seats = getSelectedSeats();
  if (seats.length === 0 && countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
    const cdEl = document.getElementById('countdown-header');
    if (cdEl) cdEl.innerText = '15:00';
  }
}

function getDayType() {
  const day = new Date().getDay();
  // 0 is Sunday, 6 is Saturday
  return (day === 0 || day === 6) ? 'weekend' : 'weekday';
}

function calculateTotal() {
  const seats = getSelectedSeats();
  const dayType = getDayType();
  let total = 0;
  seats.forEach(seatId => {
    const type = getSeatType(seatId);
    total += PRICING[dayType][type];
  });
  return total;
}

function updatePricesTable() {
  const dayType = getDayType();
  const prices = PRICING[dayType];
  const pn = document.getElementById('price-normal');
  const pv = document.getElementById('price-vip');
  const pc = document.getElementById('price-couple');
  if (pn) pn.innerText = prices.regular.toLocaleString('vi-VN') + ' đ';
  if (pv) pv.innerText = prices.vip.toLocaleString('vi-VN') + ' đ';
  if (pc) pc.innerText = prices.couple.toLocaleString('vi-VN') + ' đ';
}

function updateSummary() {
  const seats = getSelectedSeats();
  const selectedSeatsEl = document.getElementById('selected-seats-list');
  const totalPriceEl = document.getElementById('total-price');
  const btnContinue = document.getElementById('btn-continue');
  
  if (selectedSeatsEl) {
    if (seats.length) {
      selectedSeatsEl.innerHTML = seats.map(s => `<span class="seat-tag">${s}</span>`).join('');
    } else {
      selectedSeatsEl.innerHTML = `<p class="text-secondary text-xs italic">Chưa chọn ghế nào.</p>`;
    }
  }
  
  if (totalPriceEl) totalPriceEl.innerText = calculateTotal().toLocaleString('vi-VN') + ' đ';
  
  if (btnContinue) {
    btnContinue.disabled = seats.length === 0;
  }
}

function startCountdown(seconds) {
  const cdEl = document.getElementById('countdown-header');
  if (!cdEl) return;
  
  let remain = seconds;
  countdownTimer = setInterval(() => {
    remain--;
    const m = Math.floor(remain / 60).toString().padStart(2, '0');
    const s = (remain % 60).toString().padStart(2, '0');
    cdEl.innerText = `${m}:${s}`;
    
    if (remain <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      alert('Hết thời gian giữ ghế. Vui lòng chọn lại.');
      getSelectedSeats().forEach(seat => unlockSeat(currentShowtimeId, seat, currentUserId));
      window.location.reload();
    }
  }, 1000);
}

function simulateActivity() {
  // Simulate other users randomly locking seats
  simulationTimer = setInterval(() => {
    const rows = ['A','B','C','D','E','F','G'];
    const row = rows[Math.floor(Math.random() * rows.length)];
    const col = Math.floor(Math.random() * 12) + 1;
    const seatId = `${row}${col}`;
    
    const seats = getSelectedSeats();
    if (!seats.includes(seatId)) {
       lockSeat(currentShowtimeId, seatId, 'other_user_' + Math.random());
    }
  }, 10000);
}

function handleContinue() {
  const seats = getSelectedSeats();
  if (seats.length === 0) {
    alert('Vui lòng chọn ít nhất 1 ghế để tiếp tục.');
    return;
  }

  const isGroupToggleOn = document.getElementById('toggle-group-booking')?.checked || false;
  
  if (isGroupToggleOn && seats.length < 2) {
    alert('Vui lòng chọn ít nhất 2 ghế để sử dụng đặt vé nhóm.');
    return;
  }
  
  const isGroup = isGroupToggleOn && seats.length >= 2;

  const checkoutData = {
    movieId: movieData.id,
    showtimeId: currentShowtimeId,
    movieTitle: movieData.title,
    poster: movieData.poster,
    genre: movieData.genre,
    tags: movieData.tags,
    room: 'Phòng 3',
    showtimeText: '19:30',
    selectedSeats: seats,
    seats: seats, // for checkout.js
    seatTotal: calculateTotal(),
    isGroupBooking: isGroup,
    seatAmount: calculateTotal(), // for checkout.js
    total: calculateTotal(), // for checkout.js
    expiresAt: Date.now() + 15 * 60 * 1000 // 15 mins
  };
  
  saveCheckout(checkoutData);

  if (isGroup) {
      // Tự động khởi tạo phiên Split Pay và bay thẳng vào Lobby
      const orderId = 'SPLIT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const splitData = {
          orderId: orderId,
          checkoutData: checkoutData,
          customFood: '[]', // Tạm thời bỏ qua Bắp Nước khi đi thẳng vào Lobby
          status: 'PENDING',
          paidSeats: [],
          cancelledSeats: []
      };
      localStorage.setItem('splitOrder_' + orderId, JSON.stringify(splitData));
      
      // Gán ghế đầu tiên cho Host
      localStorage.setItem('mySeatForOrder_' + orderId, seats[0]);
      
      // Chuyển hướng thẳng vào phòng chờ
      window.location.href = '../group-booking/room.html?order=' + orderId;
  } else {
      // Mua 1 ghế bình thường thì đi qua Checkout để chọn Bắp nước
      window.location.href = '../checkout/checkout.html';
  }
}

document.addEventListener('DOMContentLoaded', init);
