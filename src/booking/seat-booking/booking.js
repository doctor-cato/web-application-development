/**
 * pages/booking.js — Trang chọn ghế
 */

import { getSeatMap, lockSeat, unlockSeat, subscribeSeatUpdates } from './bookingService.js';
import { renderSeatGrid, updateSeat, getSelectedSeats } from '../../shared/components/seatGrid.js';
import { lsSet, KEYS } from '../../shared/utils/storage.js';

let countdownTimer = null;
let simulationTimer = null;
let currentShowtimeId = null;
let currentUserId = 'mock_user_123'; // Mock user since we skip Auth
let movieData = { id: 'm_001', title: 'Spider-Man: Across the Spider-Verse' };

function init() {
  const urlParams = new URLSearchParams(window.location.search);
  currentShowtimeId = urlParams.get('showtimeId') || 'st_200';

  renderMovieInfo();
  
  const seatMap = getSeatMap(currentShowtimeId);
  const container = document.getElementById('seatGridContainer');
  
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

  document.getElementById('btnContinue')?.addEventListener('click', handleContinue);

  simulateActivity();
}

function renderMovieInfo() {
  const titleEl = document.getElementById('movieTitle');
  const showtimeEl = document.getElementById('showtimeInfo');
  if (titleEl) titleEl.innerText = movieData.title;
  if (showtimeEl) showtimeEl.innerText = `Suất chiếu: ${currentShowtimeId} | Phòng chiếu: Room 3`;
}

function handleSeatSelect(seatId) {
  const success = lockSeat(currentShowtimeId, seatId, currentUserId);
  if (!success) {
    alert(`Ghế ${seatId} đã có người khác chọn!`);
    updateSeat(seatId, 'locked');
  } else {
    updateSummary();
    if (!countdownTimer) startCountdown(5 * 60);
  }
}

function handleSeatDeselect(seatId) {
  unlockSeat(currentShowtimeId, seatId, currentUserId);
  updateSummary();
  const seats = getSelectedSeats();
  if (seats.length === 0 && countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
    const cdEl = document.getElementById('bookingCountdown');
    if (cdEl) cdEl.innerText = '05:00';
  }
}

function updateSummary() {
  const seats = getSelectedSeats();
  const selectedSeatsEl = document.getElementById('selectedSeats');
  const totalPriceEl = document.getElementById('totalPrice');
  
  if (selectedSeatsEl) selectedSeatsEl.innerText = seats.length ? seats.join(', ') : 'Chưa chọn';
  if (totalPriceEl) totalPriceEl.innerText = (seats.length * 80000).toLocaleString('vi-VN') + ' đ';
}

function startCountdown(seconds) {
  const cdEl = document.getElementById('bookingCountdown');
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
  
  const checkoutData = {
    showtimeId: currentShowtimeId,
    movieTitle: movieData.title,
    room: 'Room 3',
    showtimeText: '19:30',
    selectedSeats: seats,
    seatTotal: seats.length * 80000,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 mins
  };
  
  lsSet(KEYS.PENDING_CHECKOUT, checkoutData);
  window.location.href = '../checkout/checkout.html';
}

document.addEventListener('DOMContentLoaded', init);
