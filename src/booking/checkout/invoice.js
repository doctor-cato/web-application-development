import { getLastBooking } from '/shared/utils/storage.js';
import { formatPrice } from '/explore/home-page/movieService.js';

function renderBookingInfo(booking) {
  if (!booking) return;

  const poster = document.getElementById('invoice-poster');
  if (poster && booking.poster) poster.src = booking.poster;

  const movie = document.getElementById('invoice-movie');
  if (movie && booking.movieTitle) movie.textContent = booking.movieTitle;

  const txId = document.getElementById('invoice-id');
  if (txId && booking.transactionId) txId.textContent = booking.transactionId;

  const showtime = document.getElementById('invoice-showtime');
  if (showtime && booking.showtimeText) showtime.textContent = booking.showtimeText;

  const room = document.getElementById('invoice-room');
  if (room && booking.room) room.textContent = booking.room;

  const seats = document.getElementById('invoice-seats');
  if (seats && booking.seats) seats.textContent = booking.seats.join(', ');

  const combo = document.getElementById('invoice-combo');
  if (combo) {
    if (booking.combo === 'single') combo.textContent = 'Combo 1 Người';
    else if (booking.combo === 'double') combo.textContent = 'Combo 2 Người';
    else combo.textContent = 'Không';
  }

  const total = document.getElementById('invoice-total');
  if (total && booking.total) total.textContent = formatPrice(booking.total);
}

function init() {
  const booking = getLastBooking();
  renderBookingInfo(booking);
}

document.addEventListener('DOMContentLoaded', init);
