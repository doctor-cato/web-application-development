document.addEventListener('DOMContentLoaded', () => {
    let currentBalance = 1250;
    const balanceDisplay = document.getElementById('balance-amount');
    const poolCards = document.querySelectorAll('.pool-card');
    const toastElement = document.getElementById('toast');

    // Toast Notification System
    function showToast(message) {
        if (!toastElement) {
            alert(message);
            return;
        }
        toastElement.textContent = message;
        toastElement.classList.add('show');
        
        setTimeout(() => {
            toastElement.classList.remove('show');
        }, 3000);
    }

    // Card Selection and Betting Logic
    poolCards.forEach(card => {
        const optionButtons = card.querySelectorAll('.option-btn');
        const selectBox = card.querySelector('.custom-select');
        const betActionBtn = card.querySelector('.btn-bet-action');
        let selectedValue = null;

        optionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                optionButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedValue = btn.getAttribute('data-option');
            });
        });

        if (selectBox) {
            selectBox.addEventListener('change', () => {
                selectedValue = selectBox.value;
            });
        }

        if (betActionBtn) {
            betActionBtn.addEventListener('click', () => {
                const isExpert = card.querySelector('.card-badge.expert') !== null;
                const cost = isExpert ? 75 : 50;

                if (!selectedValue) {
                    showToast('Vui lòng chọn phương án dự đoán trước khi đặt cược!');
                    return;
                }

                if (currentBalance < cost) {
                    showToast('Số dư tài khoản điểm không đủ để thực hiện lượt cược này!');
                    return;
                }

                currentBalance -= cost;
                animateBalance(currentBalance);

                // Reset selections
                if (selectBox) selectBox.value = "";
                optionButtons.forEach(b => b.classList.remove('selected'));
                selectedValue = null;

                showToast(`Ghi nhận lượt dự đoán thành công! Đã trừ ${cost} Điểm.`);
            });
        }
    });

    // Balance Animation helper
    function animateBalance(target) {
        if (!balanceDisplay) return;
        const start = parseInt(balanceDisplay.textContent.replace(/,/g, ''));
        const duration = 500; // ms
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(start + (target - start) * progress);
            balanceDisplay.textContent = value.toLocaleString('en-US');

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                balanceDisplay.textContent = target.toLocaleString('en-US');
            }
        }
        requestAnimationFrame(update);
    }

    // Timer logic: Countdown from 14:54
    const timerElement = document.getElementById('main-timer');
    if (timerElement) {
        let timeParts = timerElement.textContent.split(':');
        let minutes = parseInt(timeParts[0]) || 14;
        let seconds = parseInt(timeParts[1]) || 54;

        const interval = setInterval(() => {
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(interval);
                    timerElement.textContent = "00:00";
                    showToast("Thời gian dự đoán đã kết thúc! Trận đấu bắt đầu.");
                    return;
                }
                minutes--;
                seconds = 59;
            } else {
                seconds--;
            }
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    // Deposit simulator (+1000 Points)
    const depositBtn = document.getElementById('btn-deposit');
    if (depositBtn) {
        depositBtn.addEventListener('click', () => {
            currentBalance += 1000;
            animateBalance(currentBalance);
            showToast('Nạp điểm thành công! +1,000 Điểm.');
        });
    }

    // History simulator
    const historyBtn = document.getElementById('btn-history');
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            showToast('Lịch sử: Chưa ghi nhận lượt đặt cược gần đây.');
        });
    }
});
