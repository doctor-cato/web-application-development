const fs = require('fs');

let content = fs.readFileSync('frontend/src/booking/group-booking/room.html', 'utf8');

// Replace loadOrderData
const newLoadOrderData = `
    async function loadOrderData() {
        let rawData = null;
        let isValid = false;
        
        try {
            // Fetch from backend API directly
            const response = await fetch('/api/groupbooking/' + orderId);
            if (response.ok) {
                rawData = await response.json();
            }
        } catch (e) {
            console.error("Lỗi fetch API:", e);
        }
        
        try {
            if (rawData) {
                groupData = rawData;
                if (groupData && groupData.checkoutData && Array.isArray(groupData.checkoutData.seats)) {
                    isValid = true;
                }
            }
        } catch(e) {
            console.error("Lỗi parse data:", e);
        }
        
        if (!isValid) {
            alert('Phiên giao dịch không tồn tại hoặc đã hết hạn.');
            window.location.href = "/explore/home-page/index.html";
            return false;
        }
        
        if (!groupData.paidSeats) groupData.paidSeats = [];
        if (!groupData.cancelledSeats) groupData.cancelledSeats = [];

        // ---------------------------------
        // Capture Return from Payment Gateway
        // ---------------------------------
        const paidSeatFromUrl = urlParams.get('paidSeat');
        const clearFood = urlParams.get('clearFood');
        if (paidSeatFromUrl && !groupData.paidSeats.includes(paidSeatFromUrl)) {
            groupData.paidSeats.push(paidSeatFromUrl);
            if (orderId) {
                await saveOrderData();
            }
            // Clean URL
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete('paidSeat');
            if (clearFood) {
                localStorage.removeItem('selectedFood');
                cleanUrl.searchParams.delete('clearFood');
            }
            window.history.replaceState({}, '', cleanUrl.toString());
        }

        // Load food data
        let foodStr = localStorage.getItem('selectedFood');
        let customFoodArr = [];
        try {
            const checkoutFoodStr = localStorage.getItem('checkoutFood');
            if (checkoutFoodStr) {
                customFoodArr = JSON.parse(checkoutFoodStr);
                if (customFoodArr.length > 0) {
                    foodStr = checkoutFoodStr;
                }
            }
        } catch(e) {}

        myFoodTotal = 0;
        myFoodText = '';
        if (foodStr) {
            try {
                const items = JSON.parse(foodStr);
                myFoodTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
                myFoodText = items.map(f => \`\${f.qty}x \${f.name}\`).join(', ');
            } catch(e) {}
        }
        window.customFoodArr = customFoodArr; // Expose for renderLobby

        // Calculate price per seat
        const activeSeatsCount = groupData.checkoutData.seats.length - groupData.cancelledSeats.length;
        if (activeSeatsCount > 0) {
            pricePerSeat = Math.floor(groupData.checkoutData.total / activeSeatsCount);
        } else {
            pricePerSeat = 0;
        }

        // ---------------------------------
        // Xác định "Ghế Của Tôi" (My Seat)
        // ---------------------------------
        let mySeat = localStorage.getItem('mySeatForOrder_' + orderId);
        
        if (mySeat === 'CANCELLED') {
            window.mySeat = null;
        } else {
            // Find assigned seat from groupData.assignments if available
            let assignedSeat = null;
            const currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).username : null;
            if (currentUser && groupData.assignments) {
                const myAssignment = groupData.assignments.find(a => a.username === currentUser);
                if (myAssignment) assignedSeat = myAssignment.seat;
            }

            if (!mySeat || !groupData.checkoutData.seats.includes(mySeat) || groupData.cancelledSeats.includes(mySeat)) {
                if (assignedSeat && !groupData.cancelledSeats.includes(assignedSeat) && !groupData.paidSeats.includes(assignedSeat)) {
                    mySeat = assignedSeat;
                } else {
                    const activeUnpaidSeats = (groupData?.checkoutData?.seats || []).filter(s => 
                        !groupData.cancelledSeats.includes(s) && !groupData.paidSeats.includes(s)
                    );
                    if (activeUnpaidSeats.length > 0) {
                        mySeat = activeUnpaidSeats[0];
                    } else {
                        mySeat = null; // Hết ghế
                    }
                }
                if (mySeat) localStorage.setItem('mySeatForOrder_' + orderId, mySeat);
            }
            window.mySeat = mySeat;
        }
        return true;
    }

    async function saveOrderData() {
        try {
            await fetch('/api/groupbooking/' + orderId, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(groupData)
            });
        } catch(e) {
            console.error("Lỗi khi lưu dữ liệu nhóm lên máy chủ", e);
        }
    }
`;

// Replace loadOrderData definition
content = content.replace(/function loadOrderData\(\) \{[\s\S]*?return true;\n    \}/, newLoadOrderData.split('async function saveOrderData')[0].trim());

// Replace saveOrderData definition
content = content.replace(/function saveOrderData\(\) \{\s*localStorage.setItem\('splitOrder_' \+ orderId, JSON.stringify\(groupData\)\);\s*\}/, newLoadOrderData.match(/async function saveOrderData\(\) \{[\s\S]*?\}/)[0]);

// Replace init execution
const initOld = `// Init
    if (loadOrderData()) {
        renderLobby();
        
        document.getElementById('btn-go-food')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = \`/booking/booking-food/index.html?returnToLobby=\${orderId}\`;
        });
        
        // Check if returning from a successful payment caused the order to complete
        checkCompletion();
    }`;

const initNew = `// Init
    async function init() {
        const success = await loadOrderData();
        if (success) {
            renderLobby();
            
            document.getElementById('btn-go-food')?.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = \`/booking/booking-food/index.html?returnToLobby=\${orderId}\`;
            });
            
            checkCompletion();
        }
    }
    init();`;

content = content.replace(initOld, initNew);

// Replace saveOrderData() calls inside cancelSeat logic to await saveOrderData()
// Note: btnProceedCancel click is already async
content = content.replace(/saveOrderData\(\);/g, 'await saveOrderData();');
content = content.replace(/loadOrderData\(\);/g, 'await loadOrderData();');


fs.writeFileSync('frontend/src/booking/group-booking/room.html', content);
console.log('Patched room.html');
