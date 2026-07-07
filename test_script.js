
        let currentCancelId = null;
        let cancelBasePrice = 0;
        let cancelSeatList = [];

        function openCancelModal(name, time, seats, price, idStr) {
            currentCancelId = idStr || null;
            console.log('[CANCEL] openCancelModal called, id =', currentCancelId);
            document.getElementById('cancel-movie-name').innerText = name;
            document.getElementById('cancel-movie-time').innerText = time;
            
            // Calculate base price
            cancelBasePrice = parseInt(price.replace(/\./g, '').replace('đ', ''));
            cancelSeatList = seats.split(',').map(s => s.trim()).filter(s => s);
            
            const seatsContainer = document.getElementById('cancel-movie-seats');
            seatsContainer.innerHTML = ''; // clear
            
            if (cancelSeatList.length > 1) {
                // Render checkboxes
                const span = document.createElement('span');
                span.innerText = 'Chọn ghế muốn huỷ: ';
                span.style.display = 'block';
                span.style.marginBottom = '0.5rem';
                seatsContainer.appendChild(span);
                
                const grid = document.createElement('div');
                grid.style.display = 'flex';
                grid.style.gap = '0.5rem';
                grid.style.flexWrap = 'wrap';
                
                cancelSeatList.forEach(seat => {
                    const label = document.createElement('label');
                    label.style.display = 'flex';
                    label.style.alignItems = 'center';
                    label.style.gap = '0.25rem';
                    label.style.cursor = 'pointer';
                    label.style.background = 'rgba(255,255,255,0.1)';
                    label.style.padding = '0.25rem 0.5rem';
                    label.style.borderRadius = '4px';
                    
                    const cb = document.createElement('input');
                    cb.type = 'checkbox';
                    cb.value = seat;
                    cb.checked = true; // checked by default to cancel
                    cb.className = 'cancel-seat-cb';
                    cb.onchange = updateCancelRefund;
                    
                    label.appendChild(cb);
                    label.appendChild(document.createTextNode(seat));
                    grid.appendChild(label);
                });
                seatsContainer.appendChild(grid);
            } else {
                seatsContainer.innerText = seats;
            }
            
            updateCancelRefund();
            
            const modal = document.getElementById('cancel-modal');
            modal.style.display = 'flex';
            modal.style.animation = 'fadeIn 0.3s ease';
        }
        
        function updateCancelRefund() {
            let seatsToCancelCount = cancelSeatList.length;
            if (cancelSeatList.length > 1) {
                const cbs = document.querySelectorAll('.cancel-seat-cb:checked');
                seatsToCancelCount = cbs.length;
            }
            
            const btn = document.querySelector('#cancel-modal .glass-panel button:last-child');
            if (seatsToCancelCount === 0) {
                document.getElementById('cancel-refund-amount').innerText = '0đ';
                if(btn) { btn.disabled = true; btn.style.opacity = '0.5'; }
                return;
            } else {
                if(btn) { btn.disabled = false; btn.style.opacity = '1'; }
            }
            
            const frac = seatsToCancelCount / cancelSeatList.length;
            let refundNum = Math.round((cancelBasePrice * frac) * 0.8);
            document.getElementById('cancel-refund-amount').innerText = refundNum.toLocaleString('vi-VN') + 'đ';
        }

        function closeCancelModal() {
            const modal = document.getElementById('cancel-modal');
            modal.style.display = 'none';
        }

        function confirmCancel() {
            // Read selected seats
            let seatsToCancel = cancelSeatList;
            if (cancelSeatList.length > 1) {
                const cbs = document.querySelectorAll('.cancel-seat-cb:checked');
                seatsToCancel = Array.from(cbs).map(cb => cb.value);
            }
            if (seatsToCancel.length === 0) return;

            // Show loading state
            const btn = document.querySelector('#cancel-modal .glass-panel button:last-child');
            if (!btn) return;
            const originalText = btn.innerText;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG XỬ LÝ...';
            btn.style.pointerEvents = 'none';
            
            setTimeout(function() {
                closeCancelModal();
                btn.innerHTML = originalText;
                btn.style.pointerEvents = 'auto';
                
                if (!currentCancelId) return;

                var BOOKINGS_KEY = 'cinema_bookings';
                var raw = localStorage.getItem(BOOKINGS_KEY);
                if (!raw) return;

                try {
                    var bookings = JSON.parse(raw);
                    var found = false;
                    for (var i = 0; i < bookings.length; i++) {
                        if (bookings[i].id === currentCancelId) {
                            found = true;
                            
                            if (seatsToCancel.length === bookings[i].seats.length) {
                                // Cancel all
                                bookings[i].status = 'Cancelled';
                            } else {
                                // Partial cancel
                                const frac = seatsToCancel.length / bookings[i].seats.length;
                                const originalTotal = bookings[i].total;
                                
                                // Create new cancelled booking
                                const newCancelledBooking = JSON.parse(JSON.stringify(bookings[i]));
                                newCancelledBooking.id = bookings[i].id + '-C' + Date.now();
                                newCancelledBooking.seats = seatsToCancel;
                                newCancelledBooking.status = 'Cancelled';
                                newCancelledBooking.total = Math.round(originalTotal * frac);
                                
                                // Update original booking
                                bookings[i].seats = bookings[i].seats.filter(function(s) { return seatsToCancel.indexOf(s) === -1; });
                                bookings[i].total = Math.round(originalTotal * (1 - frac));
                                
                                bookings.push(newCancelledBooking);
                            }
                            break;
                        }
                    }
                    
                    if (found) {
                        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
                    }
                } catch(e) {
                    console.error('[CANCEL] error:', e);
                }
                
                location.reload();
            }, 1000);
        }
    