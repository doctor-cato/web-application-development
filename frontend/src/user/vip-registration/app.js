import { getCurrentUser, setCurrentUser, getUsers, saveUsers } from '../../auth/auth-services/storage.js';

document.addEventListener('DOMContentLoaded', () => {

    const session = getCurrentUser();
    if (!session) {

        alert('Vui lòng đăng nhập tài khoản trước khi đăng ký thành viên VIP!');
        window.location.href = '/auth/user-login/login.html';
        return;
    }

    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    const users = getUsers() || [];
    const fullUser = users.find(u => u.email === session.email) || {};

    if (fullnameInput && (fullUser.fullname || session.name)) fullnameInput.value = fullUser.fullname || session.name;
    if (emailInput && session.email) {
        emailInput.value = session.email;
        emailInput.readOnly = true;
    }

    const phone = fullUser.phone || session.phone || localStorage.getItem('userPhone') || '0987654321';
    if (phoneInput && phone) phoneInput.value = phone;

    let selectedPlan = null;
    const planDisplay = document.getElementById('selected-plan-display');

    const plans = {
        silver: 'VIP Silver (Nâng cấp từ 4000 điểm)',
        gold: 'VIP Gold (199.000đ/tháng)',
        platinum: 'VIP Platinum (499.000đ/tháng)'
    };

    if (planDisplay && !selectedPlan) {
        planDisplay.textContent = 'Chưa chọn';
    }

    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach(card => {
        card.addEventListener('click', () => {
            const planType = card.getAttribute('data-plan');
            selectedPlan = planType;

            if (planDisplay) {
                planDisplay.textContent = plans[planType];
            }

            planCards.forEach(c => {
                c.classList.remove('selected-plan-border');
                const btn = c.querySelector('.btn-select-plan');
                if (btn) {
                    btn.classList.remove('active');
                    btn.textContent = getButtonText(c.getAttribute('data-plan'));
                }
            });

            card.classList.add('selected-plan-border');
            const activeBtn = card.querySelector('.btn-select-plan');
            if (activeBtn) {
                activeBtn.classList.add('active');
                activeBtn.textContent = 'ĐÃ CHỌN';
            }
        });
    });

    function getButtonText(plan) {
        if (plan === 'silver') return 'CHỌN GÓI BẠC';
        if (plan === 'gold') return 'CHỌN GÓI VÀNG';
        if (plan === 'platinum') return 'CHỌN GÓI BẠCH KIM';
        return 'CHỌN GÓI';
    }

    const payOptions = document.querySelectorAll('.pay-option');
    const cardDetails = document.getElementById('card-details');
    const cardInputs = cardDetails ? cardDetails.querySelectorAll('input') : [];

    payOptions.forEach(option => {
        option.addEventListener('click', () => {
            payOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            const radio = option.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;

            if (radio && radio.value === 'card') {
                if (cardDetails) cardDetails.style.display = 'block';
                cardInputs.forEach(input => input.required = true);
            } else {
                if (cardDetails) cardDetails.style.display = 'none';
                cardInputs.forEach(input => input.required = false);
            }
        });
    });

    const form = document.getElementById('vipRegisterForm');
    const btnSubmit = form ? form.querySelector('.btn-vip-submit') : null;
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const successModal = document.getElementById('success-modal');

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        const plan = urlParams.get('plan') || 'gold';
        selectedPlan = plan;

        if (session && session.email) {
            import('../../shared/utils/apiConfig.js?v=4').then(({ API_BASE_URL, getHeaders }) => {
                fetch(`${API_BASE_URL}/auth/upgrade-vip`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify({ email: session.email, plan: selectedPlan })
                }).catch(err => console.error("Lỗi khi nâng cấp VIP:", err));
            });
        }

        const users = getUsers() || [];
        const userIndex = users.findIndex(u => u.email === session.email);

        if (userIndex !== -1) {
            users[userIndex].role = 'vip';
            users[userIndex].vip_plan = selectedPlan;
            users[userIndex].vip_date = new Date().toISOString();
            saveUsers(users);
        }

        session.role = 'vip';
        session.vip_plan = selectedPlan;
        setCurrentUser(session);

        localStorage.setItem('is_vip', 'true');
        localStorage.setItem('vip_plan', selectedPlan);

        const successUser = document.getElementById('success-user-name');
        const successPlan = document.getElementById('success-plan-name');
        const cardUser = document.getElementById('card-user-label');
        const cardTier = document.getElementById('card-tier-label');

        const finalUserName = fullnameInput.value.trim() || session.name || session.fullname || session.email || 'KHÁCH HÀNG';
        if (successUser) successUser.textContent = finalUserName;
        if (successPlan) successPlan.textContent = 'VIP ' + selectedPlan.toUpperCase();
        if (cardUser) cardUser.textContent = finalUserName.toUpperCase();
        if (cardTier) cardTier.textContent = 'VIP ' + selectedPlan.toUpperCase();

        if (successModal) {
            successModal.classList.add('show');
        }

        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!selectedPlan) {
                alert('Vui lòng chọn một gói VIP trước khi thanh toán!');
                return;
            }

            const selectedPayOption = document.querySelector('input[name="payment"]:checked');
            const payMethod = selectedPayOption ? selectedPayOption.value : 'momo';

            let priceValue = 99000;
            const priceMatch = plans[selectedPlan].match(/(\d{1,3}(?:\.\d{3})*)đ/);
            if (priceMatch) {
                priceValue = parseInt(priceMatch[1].replace(/\./g, ''));
            }

            if (btnSubmit) btnSubmit.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnSpinner) btnSpinner.style.display = 'block';

            const txId = `VIP_${Date.now()}`;

            const returnUrl = encodeURIComponent(`../../user/vip-registration/index.html?success=true&plan=${selectedPlan}`);

            window.location.href = `../../booking/checkout/payment_simulation.html?provider=${payMethod}&txId=${txId}&amount=${priceValue}&returnUrl=${returnUrl}`;
        });
    }

    const btnCloseModal = document.getElementById('btn-close-modal');
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', () => {
            if (successModal) successModal.classList.remove('show');
            window.location.href = '../../explore/home-page/index.html';
        });
    }
});
