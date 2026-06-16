/**
 * Xử lý các UI logic của trang Profile như Modals, Accordions, Filters
 */

export function setupProfileUI() {
    setupHistoryFilters();
    setupAccordions();
    setupPasswordModal();
    setupLogoutDeviceModal();
    setupPaymentModals();
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

    document.querySelectorAll('.settings-section').forEach((section, index) => {
        const list = section.querySelector('.settings-list');
        const icon = section.querySelector('.accordion-icon');
        if (index === 0) {
            section.classList.add('expanded');
            if(list) list.style.maxHeight = list.scrollHeight + "px";
            if(icon) icon.style.transform = "rotate(180deg)";
        } else {
            if(list) list.style.maxHeight = "0px";
            if(icon) icon.style.transform = "rotate(0deg)";
        }
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
