document.addEventListener('DOMContentLoaded', () => {
    let currentBalance = 1250;
    const balanceDisplay = document.getElementById('balance-amount');
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

    // Fetch and render data
    async function loadCinePredictData() {
        try {
            const response = await fetch('/api/CinePredict');
            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            
            const activeGrid = document.getElementById('active-pools-grid');
            const endedGrid = document.getElementById('ended-pools-grid');
            
            if (activeGrid) activeGrid.innerHTML = '';
            if (endedGrid) endedGrid.innerHTML = '';

            data.forEach(item => {
                const isEnded = item.status === 'ended';
                const cardClass = isEnded ? 'pool-card ended-card' : 'pool-card';
                const buttonClass = isEnded ? 'btn-bet-action disabled' : 'btn-bet-action';
                const buttonText = isEnded ? 'ĐÃ TRẢ THƯỞNG' : 'DỰ ĐOÁN';
                
                let optionsHtml = '';
                item.options.forEach((opt, idx) => {
                    if (isEnded) {
                        const isWinner = item.winnerIndex === idx;
                        optionsHtml += `<button class="option-btn disabled ${isWinner ? 'winner' : ''}" data-option="${opt}">${opt}${isWinner ? ' (KẾT QUẢ)' : ''}</button>`;
                    } else {
                        optionsHtml += `<button class="option-btn" data-option="${opt}">${opt}</button>`;
                    }
                });

                const html = `
                <div class="${cardClass}">
                    <span class="card-badge" style="background-color: ${item.badgeColor}; color: ${item.textColor};">${item.badgeText}</span>
                    <div class="card-image" style="background-image: url('${item.image}')"></div>
                    <div class="card-content">
                        <h3>${item.title}</h3>
                        <p class="card-description">${item.description}</p>
                        <div class="reward-box">
                            <span class="reward-label">PHẦN THƯỞNG</span>
                            <span class="reward-value">${item.reward}</span>
                        </div>
                        <div class="options-row">
                            ${optionsHtml}
                        </div>
                        <div class="card-footer">
                            <span class="price-tag">Phí: ${item.fee} Điểm</span>
                            <button class="${buttonClass}">${buttonText}</button>
                        </div>
                    </div>
                </div>`;
                
                if (isEnded && endedGrid) {
                    endedGrid.insertAdjacentHTML('beforeend', html);
                } else if (!isEnded && activeGrid) {
                    activeGrid.insertAdjacentHTML('beforeend', html);
                }
            });
            
            attachCardEvents();
        } catch (error) {
            console.error('Error loading Cine Predict data:', error);
            showToast('Lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
        }
    }

    function attachCardEvents() {
        const poolCards = document.querySelectorAll('.pool-card:not(.ended-card)');
        poolCards.forEach(card => {
            const optionButtons = card.querySelectorAll('.option-btn');
            const betActionBtn = card.querySelector('.btn-bet-action');
            let selectedValue = null;

            optionButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    optionButtons.forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedValue = btn.getAttribute('data-option');
                });
            });

            if (betActionBtn) {
                betActionBtn.addEventListener('click', () => {
                    const priceText = card.querySelector('.price-tag').textContent;
                    const costMatch = priceText.match(/\d+/);
                    const cost = costMatch ? parseInt(costMatch[0]) : 50;

                    if (!selectedValue) {
                        showToast('Vui lòng chọn phương án dự đoán trước khi đặt cược!');
                        return;
                    }

                    if (currentBalance < cost) {
                        showToast('Số dư tài khoản điểm không đủ để thực hiện lượt dự đoán này!');
                        return;
                    }

                    currentBalance -= cost;
                    animateBalance(currentBalance);

                    // Reset selections
                    optionButtons.forEach(b => b.classList.remove('selected'));
                    selectedValue = null;

                    showToast(`Ghi nhận lượt dự đoán thành công! Đã trừ ${cost} Điểm.`);
                });
            }
        });
    }

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
                    showToast("Thời gian dự đoán đã kết thúc! Sự kiện đã đóng.");
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
            showToast('Lịch sử: Chưa ghi nhận lượt dự đoán gần đây.');
        });
    }
    
    // Initial Load
    loadCinePredictData();
});
