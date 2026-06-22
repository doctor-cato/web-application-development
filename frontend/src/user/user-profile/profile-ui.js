/**
 * Xử lý các UI logic của trang Profile như Modals, Accordions, Filters
 */

export function setupProfileUI() {
    setupHistoryFilters();
    setupAccordions();
    setupPasswordModal();
    setupLogoutDeviceModal();
    setupPaymentModals();
    setupMultiSelect();
}

function setupHistoryFilters() {
    const filterBtns = document.querySelectorAll('.history-filters .filter-btn');
    const historyCards = document.querySelectorAll('.history-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filterType = this.getAttribute('data-filter');

            historyCards.forEach(card => {
                const isUpcoming = card.querySelector('.status-upcoming');
                const isCompleted = card.querySelector('.status-completed');

                if (filterType === 'all') {
                    card.style.display = 'flex';
                } else if (filterType === 'upcoming') {
                    card.style.display = isUpcoming ? 'flex' : 'none';
                } else if (filterType === 'completed') {
                    card.style.display = isCompleted ? 'flex' : 'none';
                }
            });
        });
    });
}

function setupAccordions() {
    const accordions = document.querySelectorAll('.accordion-header');
    accordions.forEach(acc => {
        acc.addEventListener('click', function() {
            const section = this.parentElement;
            const list = section.querySelector('.settings-list');
            const icon = this.querySelector('.accordion-icon');
            
            section.classList.toggle('expanded');
            
            if (section.classList.contains('expanded')) {
                list.style.maxHeight = list.scrollHeight + "px";
                if(icon) icon.style.transform = "rotate(180deg)";
            } else {
                list.style.maxHeight = "0px";
                if(icon) icon.style.transform = "rotate(0deg)";
            }
        });
    });

    document.querySelectorAll('.settings-section').forEach((section) => {
        const list = section.querySelector('.settings-list');
        const icon = section.querySelector('.accordion-icon');
        
        section.classList.remove('expanded');
        if(list) list.style.maxHeight = "0px";
        if(icon) icon.style.transform = "rotate(0deg)";
    });
}

function setupPasswordModal() {
    const pwdModal = document.getElementById('pwd-modal');
    if(!pwdModal) return;

    const btnChangePwd = document.getElementById('btn-change-pwd');
    const closePwdModal = document.querySelector('#pwd-modal .close-modal');
    const pwdForm = document.getElementById('pwd-form');
    const pwdError = document.getElementById('pwd-error');
    const pwdSuccess = document.getElementById('pwd-success');

    if(btnChangePwd) {
        btnChangePwd.addEventListener('click', () => {
            pwdModal.style.display = 'flex';
            if(pwdForm) pwdForm.reset();
            if(pwdError) pwdError.style.display = 'none';
            if(pwdSuccess) pwdSuccess.style.display = 'none';
        });
    }

    if(closePwdModal) {
        closePwdModal.addEventListener('click', () => pwdModal.style.display = 'none');
    }

    window.addEventListener('click', (e) => {
        if (e.target == pwdModal) pwdModal.style.display = 'none';
    });

    if(pwdForm) {
        pwdForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Note: Password change logic should ideally go through authService.
            // For now, simulating success as this is UI code.
            if(pwdError) pwdError.style.display = 'none';
            if(pwdSuccess) {
                pwdSuccess.textContent = "Đổi mật khẩu thành công!";
                pwdSuccess.style.display = 'block';
            }
            setTimeout(() => pwdModal.style.display = 'none', 1500);
        });
    }
}

function setupLogoutDeviceModal() {
    const logoutModal = document.getElementById('logout-device-modal');
    if(!logoutModal) return;

    const btnCancelLogout = document.getElementById('btn-cancel-logout');
    const btnConfirmLogout = document.getElementById('btn-confirm-logout');
    const logoutDeviceNameText = document.getElementById('logout-device-name');
    const logoutButtons = document.querySelectorAll('.btn-logout-device');
    let deviceItemToRemove = null;

    logoutButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            deviceItemToRemove = this.closest('.device-item');
            if(logoutDeviceNameText && deviceItemToRemove) {
                logoutDeviceNameText.textContent = deviceItemToRemove.querySelector('.device-name').textContent;
            }
            logoutModal.style.display = 'flex';
        });
    });

    if(btnCancelLogout) btnCancelLogout.addEventListener('click', () => logoutModal.style.display = 'none');

    if(btnConfirmLogout) {
        btnConfirmLogout.addEventListener('click', () => {
            if (deviceItemToRemove) {
                deviceItemToRemove.style.transition = "all 0.3s ease-out";
                deviceItemToRemove.style.opacity = "0";
                deviceItemToRemove.style.transform = "translateX(30px)";
                setTimeout(() => {
                    deviceItemToRemove.remove();
                    logoutModal.style.display = 'none';
                }, 300);
            }
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target == logoutModal) logoutModal.style.display = 'none';
    });
}

function setupPaymentModals() {
    // 1. Remove Payment
    const paymentModal = document.getElementById('remove-payment-modal');
    const btnCancelPayment = document.getElementById('btn-cancel-payment');
    const btnConfirmPayment = document.getElementById('btn-confirm-payment');
    const paymentNameText = document.getElementById('remove-payment-name');
    let paymentItemToRemove = null;

    function attachRemoveEvent(btn) {
        btn.addEventListener('click', function() {
            paymentItemToRemove = this.closest('.settings-item');
            if(paymentNameText && paymentItemToRemove) {
                paymentNameText.textContent = paymentItemToRemove.querySelector('h4').textContent;
            }
            if(paymentModal) paymentModal.style.display = 'flex';
        });
    }

    document.querySelectorAll('.btn-remove-payment').forEach(attachRemoveEvent);

    if(btnCancelPayment && paymentModal) btnCancelPayment.addEventListener('click', () => paymentModal.style.display = 'none');
    
    if(btnConfirmPayment && paymentModal) {
        btnConfirmPayment.addEventListener('click', () => {
            if (paymentItemToRemove) {
                paymentItemToRemove.style.transition = "all 0.3s ease-out";
                paymentItemToRemove.style.opacity = "0";
                paymentItemToRemove.style.transform = "translateX(30px)";
                setTimeout(() => {
                    paymentItemToRemove.remove();
                    paymentModal.style.display = 'none';
                }, 300);
            }
        });
    }

    window.addEventListener('click', (e) => {
        if (paymentModal && e.target == paymentModal) paymentModal.style.display = 'none';
    });

    // 2. Add Payment
    const addPaymentModal = document.getElementById('add-payment-modal');
    const btnAddPayment = document.querySelector('.btn-add-payment');
    const closeAddPayment = document.getElementById('close-add-payment');
    const addPaymentForm = document.getElementById('add-payment-form');

    if(btnAddPayment && addPaymentModal) {
        btnAddPayment.addEventListener('click', () => {
            addPaymentModal.style.display = 'flex';
            if(addPaymentForm) addPaymentForm.reset();
            // Initialize custom dropdown for payment type select (only once)
            const paymentSelect = document.getElementById('new-payment-type');
            if (paymentSelect && !paymentSelect.dataset.customized && typeof initCustomDropdowns === 'function') {
                initCustomDropdowns('#new-payment-type');
            }
        });
    }

    if(closeAddPayment && addPaymentModal) closeAddPayment.addEventListener('click', () => addPaymentModal.style.display = 'none');

    window.addEventListener('click', (e) => {
        if (addPaymentModal && e.target == addPaymentModal) addPaymentModal.style.display = 'none';
    });

    if(addPaymentForm) {
        addPaymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const type = document.getElementById('new-payment-type')?.value;
            const number = document.getElementById('new-payment-number')?.value || '1234';
            
            let iconHtml = '', title = '', desc = '', btnAction = 'Xóa';

            if (type === 'visa') {
                iconHtml = '<div class="payment-icon bg-light"><i class="fab fa-cc-visa" style="color: #1a1f71; font-size: 2rem;"></i></div>';
                title = `Visa kết thúc bằng ${number.slice(-4)}`;
                desc = 'Hết hạn: 12/29';
            } else if (type === 'momo') {
                iconHtml = '<div class="payment-icon"><img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo"></div>';
                title = `Ví điện tử MoMo (${number})`;
                desc = 'Đã liên kết mới';
                btnAction = 'Hủy liên kết';
            } else if (type === 'zalopay') {
                iconHtml = '<div class="payment-icon bg-light"><img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" alt="ZaloPay" style="border-radius: 4px;"></div>';
                title = `Ví ZaloPay (${number})`;
                desc = 'Đã liên kết mới';
                btnAction = 'Hủy liên kết';
            }

            const newItem = document.createElement('div');
            newItem.className = 'settings-item';
            newItem.innerHTML = `
                <div class="settings-info payment-info">
                    ${iconHtml}
                    <div><h4>${title}</h4><p>${desc}</p></div>
                </div>
                <button class="btn-text-danger btn-remove-payment">${btnAction}</button>
            `;

            attachRemoveEvent(newItem.querySelector('.btn-remove-payment'));

            if(btnAddPayment) {
                const container = btnAddPayment.closest('.settings-item');
                container.parentNode.insertBefore(newItem, container);
                
                newItem.style.opacity = '0';
                newItem.style.transform = 'translateY(-10px)';
                newItem.style.transition = 'all 0.4s ease';
                setTimeout(() => {
                    newItem.style.opacity = '1';
                    newItem.style.transform = 'translateY(0)';
                }, 10);

                const section = container.closest('.settings-section');
                if (section && section.classList.contains('expanded')) {
                    const list = section.querySelector('.settings-list');
                    if(list) list.style.maxHeight = list.scrollHeight + "px";
                }
            }
            if(addPaymentModal) addPaymentModal.style.display = 'none';
        });
    }
}

function setupMultiSelect() {
    const tabHistory = document.getElementById('tab-history');
    const btnToggle = document.getElementById('btn-toggle-select');
    const btnDelete = document.getElementById('btn-delete-selected');
    const countSpan = document.getElementById('delete-count');
    
    if (!tabHistory || !btnToggle || !btnDelete) return;

    let isSelectMode = false;

    btnToggle.addEventListener('click', () => {
        isSelectMode = !isSelectMode;
        if (isSelectMode) {
            tabHistory.classList.add('select-mode');
            btnToggle.innerHTML = '<i class="fas fa-times"></i> Hủy chọn';
            btnDelete.style.display = 'inline-block';
            updateCount();
        } else {
            tabHistory.classList.remove('select-mode');
            btnToggle.innerHTML = '<i class="fas fa-check-square"></i> Chọn nhiều';
            btnDelete.style.display = 'none';
            // uncheck all
            document.querySelectorAll('.ticket-cb').forEach(cb => {
                cb.checked = false;
                cb.closest('.history-card').classList.remove('selected');
            });
        }
    });

    // Enhanced UX: Event delegation for clicking anywhere on the card during select mode
    tabHistory.addEventListener('click', (e) => {
        if (!isSelectMode) return;
        
        const card = e.target.closest('.history-card');
        if (!card) return;

        // Intercept all clicks inside the card during select mode
        e.stopPropagation();
        e.preventDefault();

        const cb = card.querySelector('.ticket-cb');
        if (cb) {
            // Toggle the checkbox manually
            cb.checked = !cb.checked;
            
            // Update visual selection state
            if (cb.checked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
            updateCount();
        }
    }, true); // useCapture to intercept before child elements handle it

    function updateCount() {
        const checked = document.querySelectorAll('.ticket-cb:checked');
        if (countSpan) countSpan.innerText = checked.length;
        if (checked.length > 0) {
            btnDelete.style.opacity = '1';
            btnDelete.style.pointerEvents = 'auto';
        } else {
            btnDelete.style.opacity = '0.5';
            btnDelete.style.pointerEvents = 'none';
        }
    }

    btnDelete.addEventListener('click', () => {
        const checked = document.querySelectorAll('.ticket-cb:checked');
        if (checked.length === 0) return;
        
        if (confirm(`Bạn có chắc chắn muốn xóa ${checked.length} vé đã chọn khỏi lịch sử?`)) {
            // Get IDs for local storage removal
            const idsToRemove = [];
            checked.forEach(cb => {
                const id = cb.getAttribute('data-id');
                if (id) idsToRemove.push(id);
                // Remove from UI
                const card = cb.closest('.history-card');
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                setTimeout(() => card.remove(), 300);
            });

            // Update localStorage
            if (idsToRemove.length > 0) {
                try {
                    let bookings = JSON.parse(localStorage.getItem('cinema_bookings') || '[]');
                    bookings = bookings.filter(b => !idsToRemove.includes(b.id));
                    localStorage.setItem('cinema_bookings', JSON.stringify(bookings));
                } catch(e) {
                    console.error('Error updating localStorage bookings', e);
                }
            }

            // reset mode
            setTimeout(() => {
                btnToggle.click();
            }, 300);
        }
    });
}
