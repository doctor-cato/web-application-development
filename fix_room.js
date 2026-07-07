const fs = require('fs');

let content = fs.readFileSync('frontend/src/booking/group-booking/room.html', 'utf8');

// I will just replace the specific broken part (from `// Khôi phục trạng thái khi load trang` to `const progress = (timeLeft / totalTime) * 100;`)
// wait, I need to restore it cleanly.

// Let's use regex to grab the block we want to replace and inject the correct logic.
// The broken section is:
/*
    // Khôi phục trạng thái khi load trang
    let foodStr = localStorage.getItem('selectedFood');
    if (foodStr) {
        try {
            let items = JSON.parse(foodStr);
            if (items && items.length > 0) {
        
        const progress = (timeLeft / totalTime) * 100;
*/

let correctBlock = `    // Khôi phục trạng thái khi load trang
    let foodStr2 = localStorage.getItem('selectedFood');
    if (foodStr2) {
        try {
            let items = JSON.parse(foodStr2);
            if (items && items.length > 0) {
                let id = items[0].id;
                let radio = document.querySelector(\`input[name="group-combo"][value="\${id}"]\`);
                if (radio) {
                    radio.checked = true;
                    document.querySelectorAll('label.combo-card').forEach(x => x.classList.remove('selected'));
                    radio.closest('.combo-card').classList.add('selected');
                }
            }
        } catch(e) {}
    }

    const cancelModalBackdrop = document.getElementById('cancel-modal-backdrop');
    const btnAbortCancel = document.getElementById('btn-abort-cancel');
    const btnProceedCancel = document.getElementById('btn-proceed-cancel');
    const cancelModalSeatId = document.getElementById('cancel-modal-seat-id');
    let pendingCancelSeat = null;

    window.cancelSeat = function(seatToCancel) {
        if (!seatToCancel || seatToCancel !== window.mySeat) return;
        pendingCancelSeat = seatToCancel;
        cancelModalSeatId.textContent = seatToCancel;
        cancelModalBackdrop.classList.add('active');
    };

    if (btnAbortCancel) {
        btnAbortCancel.addEventListener('click', () => {
            cancelModalBackdrop.classList.remove('active');
            pendingCancelSeat = null;
        });
    }

    if (btnProceedCancel) {
        btnProceedCancel.addEventListener('click', async () => {
            if (!pendingCancelSeat) return;
            
            const seatToCancel = pendingCancelSeat;
            cancelModalBackdrop.classList.remove('active');
            
            // Mark as cancelled
            groupData.cancelledSeats.push(seatToCancel);
            groupData.checkoutData.total -= pricePerSeat;
            await saveOrderData();
            
            // Chuyển người dùng thành Observer
            localStorage.setItem('mySeatForOrder_' + orderId, 'CANCELLED');
            
            await loadOrderData(); 
            renderLobby(); 
            
            showToast(\`Đã hủy ghế \${seatToCancel} thành công!\`, 'success');
            
            checkCompletion();
        });
    }

    // --- Countdown Timer Logic ---
    let timeLeft = 14 * 60 + 59;
    const countdownEl = document.getElementById('countdown');
    const progressBar = document.getElementById('progress-bar');
    const totalTime = 15 * 60;

    const updateTimer = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        countdownEl.textContent = \`\${minutes}:\${seconds < 10 ? '0' : ''}\${seconds}\`;
        
        const progress = (timeLeft / totalTime) * 100;`;

// Find the regex from "Khôi phục trạng thái" to "const progress"
const re = /\/\/ Khôi phục trạng thái khi load trang[\s\S]*?const progress = \(timeLeft \/ totalTime\) \* 100;/;
if (re.test(content)) {
    content = content.replace(re, correctBlock);
    fs.writeFileSync('frontend/src/booking/group-booking/room.html', content, 'utf8');
    console.log("Fixed successfully!");
} else {
    console.log("Could not find the broken block!");
}
