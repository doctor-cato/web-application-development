import { getCurrentUser, setCurrentUser, getUsers, saveUsers } from '../../auth/auth-services/storage.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const session = getCurrentUser();
    if (!session) {
        // Not logged in, redirect to login page
        alert('Vui lòng đăng nhập tài khoản trước khi đăng ký thành viên VIP!');
        window.location.href = '../../auth/user-login/login.html';
        return;
    }

    // Prefill form details
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    if (fullnameInput && session.name) fullnameInput.value = session.name;
    if (emailInput && session.email) {
        emailInput.value = session.email;
        emailInput.readOnly = true; // Email cannot be modified for upgrades
    }
    if (phoneInput && session.phone) phoneInput.value = session.phone;

    // Track selected plan
    let selectedPlan = 'gold'; // Default select is Gold
    const planDisplay = document.getElementById('selected-plan-display');

    const plans = {
        silver: 'VIP Silver (Nâng cấp từ 100 PTS)',
        gold: 'VIP Gold (99.000đ/tháng)',
        platinum: 'VIP Platinum (199.000đ/tháng)'
    };

    // Plan selection logic
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach(card => {
        card.addEventListener('click', () => {
            const planType = card.getAttribute('data-plan');
            selectedPlan = planType;

            // Update plan display text
            if (planDisplay) {
                planDisplay.textContent = plans[planType];
            }

            // Update cards selection styling
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

    // Payment method conditional fields
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

    // Form submission
    const form = document.getElementById('vipRegisterForm');
    const btnSubmit = form ? form.querySelector('.btn-vip-submit') : null;
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const successModal = document.getElementById('success-modal');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Disable submit button and show loading state
            if (btnSubmit) btnSubmit.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnSpinner) btnSpinner.style.display = 'block';

            // Simulate payment gateway delay
            setTimeout(() => {
                // Perform local storage database upgrade
                const users = getUsers();
                const userIndex = users.findIndex(u => u.email === session.email);
                
                if (userIndex !== -1) {
                    users[userIndex].role = 'vip';
                    users[userIndex].vip_plan = selectedPlan;
                    users[userIndex].vip_date = new Date().toISOString();
                    saveUsers(users);
                }

                // Update current session payload
                session.role = 'vip';
                session.vip_plan = selectedPlan;
                setCurrentUser(session);

                // Set local flag for quick checks
                localStorage.setItem('is_vip', 'true');
                localStorage.setItem('vip_plan', selectedPlan);

                // Populate success modal details
                const successUser = document.getElementById('success-user-name');
                const successPlan = document.getElementById('success-plan-name');
                const cardUser = document.getElementById('card-user-label');
                const cardTier = document.getElementById('card-tier-label');

                if (successUser) successUser.textContent = fullnameInput.value.trim() || session.name;
                if (successPlan) successPlan.textContent = 'VIP ' + selectedPlan.toUpperCase();
                if (cardUser) cardUser.textContent = (fullnameInput.value.trim() || session.name).toUpperCase();
                if (cardTier) cardTier.textContent = 'VIP ' + selectedPlan.toUpperCase();

                // Re-enable button
                if (btnSubmit) btnSubmit.disabled = false;
                if (btnText) btnText.style.display = 'block';
                if (btnSpinner) btnSpinner.style.display = 'none';

                // Display success modal
                if (successModal) {
                    successModal.classList.add('show');
                }
            }, 2000); // 2 seconds delay
        });
    }

    // Close success modal and return home
    const btnCloseModal = document.getElementById('btn-close-modal');
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', () => {
            if (successModal) successModal.classList.remove('show');
            window.location.href = '../../explore/home-page/index.html';
        });
    }
});
