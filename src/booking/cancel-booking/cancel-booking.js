/**
 * cancel-booking.js
 * Tính năng Hủy vé & Đổi suất chiếu + Lịch sử giao dịch
 * Domain: booking/cancel-booking
 */

import { getBookings, saveBookings, lsGet, KEYS, getTransactions, addTransaction } from '/shared/utils/storage.js';

// ---------- Helpers ----------

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  // ISO string (e.g. "2026-06-12T14:30:00.000Z" hoặc "2026-06-12")
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  return dateStr;
}

function formatCurrency(amount) {
  return Number(amount).toLocaleString('vi-VN') + 'đ';
}

// ---------- Lấy danh sách phim/suất chiếu từ storage ----------
function getAvailableShowtimes() {
  // Lấy từ cinema_movies nếu có, fallback dữ liệu mẫu
  const movies = lsGet(KEYS.MOVIES, null);
  if (movies && Array.isArray(movies)) {
    const showtimes = [];
    movies.forEach(movie => {
      (movie.showtimes || []).forEach(st => {
        showtimes.push({
          id: st.id || st.showtimeId,
          movie: movie.title,
          movieId: movie.id,
          date: st.date,
          time: st.time,
          room: st.room || st.hall || 'Phòng chiếu',
        });
      });
    });
    if (showtimes.length > 0) return showtimes;
  }

  // Fallback mẫu nếu chưa có dữ liệu
  return [
    { id: 'st_sample_1', movie: 'Avengers: Hồi Kết', date: '2026-06-15', time: '14:30', room: 'Rạp 3' },
    { id: 'st_sample_2', movie: 'Avengers: Hồi Kết', date: '2026-06-15', time: '17:00', room: 'Rạp 5' },
    { id: 'st_sample_3', movie: 'Dune: Part Two', date: '2026-06-16', time: '19:00', room: 'Rạp 1' },
    { id: 'st_sample_4', movie: 'Spider-Man: No Way Home', date: '2026-06-17', time: '20:00', room: 'Rạp 2' },
    { id: 'st_sample_5', movie: 'Inception', date: '2026-06-18', time: '16:00', room: 'Rạp 7' },
  ];
}

// ---------- Render danh sách vé ----------

function renderTickets() {
  const container = document.getElementById('ticketContainer');
  const bookings = getBookings();

  // Chỉ hiển thị vé đã confirmed
  const confirmedBookings = bookings.filter(b => !b.status || b.status === 'confirmed');

  if (confirmedBookings.length === 0) {
    container.innerHTML = `
      <div class="empty-message">
        <i class="fa-regular fa-ticket"></i>
        Bạn chưa có vé nào. <a href="/explore/home-page/index.html">Đặt vé ngay!</a>
      </div>`;
    return;
  }

  container.innerHTML = confirmedBookings.map(booking => `
    <div class="ticket-card" data-booking-id="${booking.id}">
      <div class="ticket-info">
        <div class="movie-title">
          <i class="fa-solid fa-film"></i>
          ${escapeHtml(booking.movieTitle || 'Không rõ tên phim')}
        </div>
        <div class="detail-row">
          <span class="detail-item"><i class="fa-regular fa-calendar"></i> ${formatDate(booking.createdAt)}</span>
          <span class="detail-item"><i class="fa-regular fa-clock"></i> ${escapeHtml(booking.showtimeText || booking.time || '')}</span>
          <span class="detail-item"><i class="fa-solid fa-door-open"></i> ${escapeHtml(booking.room || '')}</span>
          <span class="detail-item"><i class="fa-solid fa-couch"></i> Ghế: ${(booking.seats || []).join(', ')}</span>
          ${booking.total ? `<span class="detail-item"><i class="fa-solid fa-tag"></i> ${formatCurrency(booking.total)}</span>` : ''}
        </div>
        <div class="ticket-status status--confirmed">
          <i class="fa-solid fa-circle-check"></i> Đã xác nhận
        </div>
      </div>
      <div class="ticket-actions">
        <button class="btn btn-danger cancel-ticket-btn" data-id="${booking.id}">
          <i class="fa-solid fa-xmark"></i> Hủy vé
        </button>
        <button class="btn btn-change change-showtime-btn" data-id="${booking.id}">
          <i class="fa-solid fa-rotate"></i> Đổi suất chiếu
        </button>
      </div>
    </div>
  `).join('');

  // Gắn sự kiện
  document.querySelectorAll('.cancel-ticket-btn').forEach(btn => {
    btn.addEventListener('click', handleCancelTicket);
  });
  document.querySelectorAll('.change-showtime-btn').forEach(btn => {
    btn.addEventListener('click', handleOpenChangeModal);
  });
}

// ---------- Hủy vé ----------

function handleCancelTicket(e) {
  const bookingId = e.currentTarget.getAttribute('data-id');
  const bookings = getBookings();
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return;

  const confirmed = window.confirm(
    `Bạn có chắc muốn hủy vé xem "${booking.movieTitle}"?\n` +
    `Suất chiếu: ${booking.showtimeText || ''} - ${booking.room || ''}\n` +
    `Ghế: ${(booking.seats || []).join(', ')}\n\nHành động này không thể hoàn tác.`
  );

  if (confirmed) {
    const updated = bookings.map(b =>
      b.id === bookingId ? { ...b, status: 'cancelled', cancelledAt: new Date().toISOString() } : b
    );
    saveBookings(updated);
    addTransaction('cancel', booking, 'Đã hủy vé');
    renderTickets();
    renderHistory();
    closeChangeModal();
    showToast('✅ Đã hủy vé thành công.', 'success');
  }
}

// ---------- Modal đổi suất chiếu ----------

let currentEditingBookingId = null;
let selectedShowtimeId = null;

const modalOverlay = document.getElementById('changeShowtimeModal');
const showtimeOptionsDiv = document.getElementById('showtimeOptions');
const cancelChangeBtn = document.getElementById('cancelChangeBtn');
const confirmChangeBtn = document.getElementById('confirmChangeBtn');

function handleOpenChangeModal(e) {
  const bookingId = e.currentTarget.getAttribute('data-id');
  const bookings = getBookings();
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return;

  currentEditingBookingId = bookingId;
  renderShowtimeOptions(booking.showtimeId);
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function renderShowtimeOptions(currentShowtimeId) {
  selectedShowtimeId = null;
  const showtimes = getAvailableShowtimes();

  showtimeOptionsDiv.innerHTML = showtimes.map(st => {
    const isCurrent = st.id === currentShowtimeId;
    return `
      <div class="showtime-option${isCurrent ? ' current' : ''}" data-showtime-id="${st.id}" tabindex="0" role="radio" aria-checked="${isCurrent}">
        <div class="showtime-info">
          <strong>${escapeHtml(st.movie)}</strong>
          <small><i class="fa-regular fa-calendar"></i> ${formatDate(st.date)} &nbsp; <i class="fa-regular fa-clock"></i> ${st.time} &nbsp; <i class="fa-solid fa-door-open"></i> ${escapeHtml(st.room)}</small>
        </div>
        ${isCurrent ? '<span class="badge-current">Hiện tại</span>' : ''}
      </div>`;
  }).join('');

  document.querySelectorAll('.showtime-option').forEach(opt => {
    const select = function() {
      document.querySelectorAll('.showtime-option').forEach(el => {
        el.classList.remove('selected');
        el.setAttribute('aria-checked', 'false');
      });
      opt.classList.add('selected');
      opt.setAttribute('aria-checked', 'true');
      selectedShowtimeId = opt.getAttribute('data-showtime-id');
    };
    opt.addEventListener('click', select);
    opt.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') select(); });
  });

  // Tự chọn suất hiện tại
  const currentOpt = document.querySelector(`.showtime-option[data-showtime-id="${currentShowtimeId}"]`);
  if (currentOpt) {
    currentOpt.classList.add('selected');
    currentOpt.setAttribute('aria-checked', 'true');
    selectedShowtimeId = currentShowtimeId;
  }
}

function closeChangeModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
  currentEditingBookingId = null;
  selectedShowtimeId = null;
}

function handleConfirmChange() {
  if (!currentEditingBookingId) {
    showToast('Không tìm thấy vé đang chỉnh sửa.', 'error');
    return;
  }
  if (!selectedShowtimeId) {
    showToast('Vui lòng chọn một suất chiếu.', 'error');
    return;
  }

  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.id === currentEditingBookingId);
  if (idx === -1) {
    showToast('Vé không còn tồn tại.', 'error');
    closeChangeModal();
    renderTickets();
    return;
  }

  const booking = bookings[idx];
  if (selectedShowtimeId === booking.showtimeId) {
    showToast('Bạn đang chọn suất chiếu hiện tại. Hãy chọn suất khác.', 'warning');
    return;
  }

  const newSt = getAvailableShowtimes().find(st => st.id === selectedShowtimeId);
  if (!newSt) {
    showToast('Suất chiếu không hợp lệ.', 'error');
    return;
  }

  bookings[idx] = {
    ...booking,
    movieTitle: newSt.movie,
    showtimeId: newSt.id,
    showtimeText: `${newSt.time} – ${formatDate(newSt.date)}`,
    room: newSt.room,
    rescheduledAt: new Date().toISOString(),
  };

  saveBookings(bookings);
  addTransaction('reschedule', bookings[idx], `Đổi từ "${booking.movieTitle}" (${booking.showtimeText || ''}) sang "${newSt.movie}" lúc ${newSt.time} ngày ${formatDate(newSt.date)}`);
  renderTickets();
  renderHistory();
  closeChangeModal();
  showToast(`✅ Đã đổi sang suất "${newSt.movie}" lúc ${newSt.time} ngày ${formatDate(newSt.date)}.`, 'success');
}

// ---------- Toast notification ----------

function showToast(message, type = 'info') {
  // Dùng toast component của project nếu có, fallback alert
  const existing = document.getElementById('cb-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'cb-toast';
  toast.className = `cb-toast cb-toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('cb-toast--visible'), 10);
  setTimeout(() => {
    toast.classList.remove('cb-toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ---------- Event listeners & init ----------

cancelChangeBtn.addEventListener('click', closeChangeModal);
confirmChangeBtn.addEventListener('click', handleConfirmChange);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeChangeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeChangeModal();
});

// ---------- Lịch sử giao dịch ----------

function formatCurrencyHistory(amount) {
  if (!amount) return '';
  return Number(amount).toLocaleString('vi-VN') + 'đ';
}

function renderHistory() {
  const container = document.getElementById('historyContainer');
  if (!container) return;

  const transactions = getTransactions();
  if (transactions.length === 0) {
    container.innerHTML = '<div class="empty-message"><i class="fa-solid fa-clock-rotate-left"></i> Chưa có giao dịch nào.</div>';
    return;
  }

  const BADGE_MAP = {
    booking:    { cls: 'badge-booking',    icon: 'fa-circle-check', label: 'Đặt vé' },
    cancel:     { cls: 'badge-cancel',     icon: 'fa-xmark-circle', label: 'Hủy vé' },
    reschedule: { cls: 'badge-reschedule', icon: 'fa-rotate',       label: 'Đổi suất chiếu' },
  };

  container.innerHTML = transactions.map(tx => {
    const meta = BADGE_MAP[tx.type] || { cls: 'badge-booking', icon: 'fa-circle-check', label: tx.type };
    const seatsStr = Array.isArray(tx.seats) && tx.seats.length ? tx.seats.join(', ') : '';
    const timeStr = tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : '';
    return `
      <div class="history-card">
        <div class="history-info">
          <div class="history-badge-row">
            <span class="badge ${meta.cls}"><i class="fa-solid ${meta.icon}"></i> ${escapeHtml(meta.label)}</span>
          </div>
          ${tx.movieTitle ? `<div class="movie-title" style="font-size:1.05rem;"><i class="fa-solid fa-film"></i> ${escapeHtml(tx.movieTitle)}</div>` : ''}
          <div class="detail-row">
            ${tx.showtimeText ? `<span class="detail-item"><i class="fa-regular fa-clock"></i> ${escapeHtml(tx.showtimeText)}</span>` : ''}
            ${tx.room ? `<span class="detail-item"><i class="fa-solid fa-door-open"></i> ${escapeHtml(tx.room)}</span>` : ''}
            ${seatsStr ? `<span class="detail-item"><i class="fa-solid fa-couch"></i> Ghế: ${escapeHtml(seatsStr)}</span>` : ''}
            ${tx.total ? `<span class="detail-item"><i class="fa-solid fa-tag"></i> ${formatCurrencyHistory(tx.total)}</span>` : ''}
          </div>
          ${tx.details ? `<div class="history-details">${escapeHtml(tx.details)}</div>` : ''}
          <div class="history-meta"><i class="fa-regular fa-clock"></i> ${escapeHtml(timeStr)}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ---------- Tab switching ----------

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    this.classList.add('active');
    this.setAttribute('aria-selected', 'true');
    const tab = this.dataset.tab;
    document.getElementById(tab === 'tickets' ? 'tabTickets' : 'tabHistory').classList.add('active');
  });
});

renderTickets();
renderHistory();
