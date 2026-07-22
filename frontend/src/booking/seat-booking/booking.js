/**
 * pages/booking.js — Trang chọn ghế
 */

import { getSeatMap, lockSeat, unlockSeat, subscribeSeatUpdates } from './bookingService.js';
import { renderSeatGrid, updateSeat, getSelectedSeats, getSeatType, setGroupSize, setCineMatchMode, getCineMatchAdjacentSeat } from '../../shared/components/seatGrid.js';
import { saveCheckout } from '../../shared/utils/storage.js';
import { requireAuth } from '../../shared/utils/authGuard.js';

// Kiểm tra đăng nhập ngay khi tải trang chọn ghế
if (!requireAuth('Bạn cần đăng nhập để đặt vé xem phim. Hãy đăng nhập hoặc tạo tài khoản để tiếp tục.')) {
    // Chặn toàn bộ giao diện, user sẽ thấy modal
    document.addEventListener('DOMContentLoaded', () => {
        const main = document.querySelector('main');
        if (main) main.style.filter = 'blur(5px)';
    });
}

let currentBasePrice = 80000;

let countdownTimer = null;
let simulationTimer = null;
let currentShowtimeId = null;
let currentUserId = localStorage.getItem('user_id') || localStorage.getItem('currentUserId') || null;
let movieData = null;

async function init() {
  if (window.fetchMoviesPromise) {
      await window.fetchMoviesPromise;
  }
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

  // Cine-Match Logic
  const toggleCineMatch = document.getElementById('toggle-cine-match');
  const cineMatchPrefUi = document.getElementById('cine-match-pref-ui');
  if (toggleCineMatch) {
      toggleCineMatch.addEventListener('change', (e) => {
          const isActive = e.target.checked;
          if (isActive) {
              if (toggleGroup && toggleGroup.checked) {
                  toggleGroup.click(); // Turn off group booking
              }
              cineMatchPrefUi.style.display = 'flex';
          } else {
              cineMatchPrefUi.style.display = 'none';
          }
          setCineMatchMode(isActive);
      });
  }

  // Prevent both toggles from being on simultaneously
  if (toggleGroup && toggleCineMatch) {
      toggleGroup.addEventListener('change', (e) => {
          if (e.target.checked && toggleCineMatch.checked) {
              toggleCineMatch.click(); // Turn off CineMatch
          }
      });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('id');
  currentShowtimeId = urlParams.get('showtimeId') || 'st_200';
  
  if ((urlParams.get('cinematch') === 'true' || localStorage.getItem('cinematch_active') === 'true') && toggleCineMatch) {
      toggleCineMatch.checked = true;
      toggleCineMatch.dispatchEvent(new Event('change'));
  }
  
  console.log("[DEBUG] movieId from URL:", movieId);

  if (movieId) {
    // Fetch all movies directly from API — guaranteed to work, no race conditions
    try {
      console.log("[DEBUG] Starting fetch...");
      const response = await fetch('/api/movies');
      if (response.ok) {
        const allMovies = await response.json();
        const foundMovie = allMovies.find(m => m.id === movieId);
        if (foundMovie) {
          console.log("[DEBUG] Found movie:", foundMovie.title);
          const imgUrl = foundMovie.posterUrl
            ? `${foundMovie.posterUrl}`
            : `/images/movies/placeholder.jpg`;
          movieData = {
            id: foundMovie.id,
            title: foundMovie.title,
            poster: imgUrl,
            genre: foundMovie.genre,
            tags: ["2D", "IMAX"]
          };
          console.log("[DEBUG] movieData updated:", movieData.title);
        } else {
          console.log("[DEBUG] Movie not found for id:", movieId);
        }
      }
    } catch (e) {
      console.error("Failed to fetch movie from API:", e);
    }
  }

  console.log("[DEBUG] Calling renderMovieInfo with:", movieData.title);

  renderMovieInfo();
  
  const seatMap = getSeatMap(currentShowtimeId);
  const container = document.getElementById('seat-grid');
  
  // Lấy giá vé cơ bản từ localStorage showtimes
  try {
      const showtimesStr = localStorage.getItem('3hd2k_showtimes');
      if (showtimesStr) {
          const showtimesList = JSON.parse(showtimesStr);
          const st = showtimesList.find(s => s.id === currentShowtimeId);
          if (st && st.price) {
              currentBasePrice = st.price;
          }
      }
  } catch (e) {
      console.warn("Lỗi khi tải giá vé:", e);
  }

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

function calculateTotal() {
  const seats = getSelectedSeats();
  let total = 0;
  seats.forEach(seatId => {
    const type = getSeatType(seatId);
    if (type === 'couple') {
        total += currentBasePrice * 2;
    } else if (type === 'vip') {
        total += currentBasePrice * 1.3;
    } else {
        total += currentBasePrice;
    }
  });
  return total;
}

function updatePricesTable() {
  const pn = document.getElementById('price-normal');
  const pv = document.getElementById('price-vip');
  const pc = document.getElementById('price-couple');
  if (pn) pn.innerText = currentBasePrice.toLocaleString('vi-VN') + ' đ';
  if (pv) pv.innerText = (currentBasePrice * 1.3).toLocaleString('vi-VN') + ' đ';
  if (pc) pc.innerText = (currentBasePrice * 2).toLocaleString('vi-VN') + ' đ';
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
  // simulationTimer = setInterval(() => { ... }, 10000); // Đã tắt tính năng tự động khóa ghế ảo
}

function handleContinue() {
  const seats = getSelectedSeats();
  if (seats.length === 0) {
    alert('Vui lòng chọn ít nhất 1 ghế để tiếp tục.');
    return;
  }

  const isGroupToggleOn = document.getElementById('toggle-group-booking')?.checked || false;
  const isCineMatchToggleOn = document.getElementById('toggle-cine-match')?.checked || false;
  
  if (isGroupToggleOn && seats.length < 2) {
    alert('Vui lòng chọn ít nhất 2 ghế để sử dụng đặt vé nhóm.');
    return;
  }
  
  const isGroup = isGroupToggleOn && seats.length >= 2;
  
  // Lấy thông tin adjacent seat nếu là CineMatch
  let cineMatchAdjacentSeat = null;
  let cineMatchPreference = 'any';
  if (isCineMatchToggleOn && seats.length > 0) {
      cineMatchAdjacentSeat = getCineMatchAdjacentSeat(seats[0]);
      cineMatchPreference = document.getElementById('cine-match-preference')?.value || 'any';
  }

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
    isCineMatch: isCineMatchToggleOn,
    cineMatchAdjacentSeat: cineMatchAdjacentSeat,
    cineMatchPreference: cineMatchPreference,
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
