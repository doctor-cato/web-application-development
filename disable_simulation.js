const fs = require('fs');

function fixSimulateActivity() {
    let content = fs.readFileSync('frontend/src/booking/seat-booking/booking.js', 'utf8');

    // Comment out the setInterval in simulateActivity
    content = content.replace(
        /simulationTimer = setInterval\(\(\) => \{[\s\S]*?\}, 10000\);/,
        `// simulationTimer = setInterval(() => { ... }, 10000); // Đã tắt tính năng tự động khóa ghế ảo`
    );

    fs.writeFileSync('frontend/src/booking/seat-booking/booking.js', content, 'utf8');
}

fixSimulateActivity();
