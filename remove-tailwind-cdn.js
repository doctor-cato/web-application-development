const fs = require('fs');
const path = require('path');

const files = [
    'src/booking/booking-food/index.html',
    'src/booking/checkout/booking_invoice.html',
    'src/booking/checkout/checkout.html',
    'src/booking/checkout/payment_simulation.html',
    'src/booking/seat-booking/booking.html',
    'src/user/loyalty-points/index.html'
];

for (const file of files) {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Remove CDN
        content = content.replace(/<script src="https:\/\/cdn\.tailwindcss\.com.*"><\/script>/g, '');
        
        // Remove Tailwind Config Script Block
        content = content.replace(/<script id="tailwind-config">[\s\S]*?<\/script>/g, '');
        
        // Add compiled CSS link right before </head> if not already there
        if (!content.includes('tailwind-legacy.css')) {
            content = content.replace('</head>', '  <link rel="stylesheet" href="/shared/css/tailwind-legacy.css">\n</head>');
        }
        
        fs.writeFileSync(fullPath, content);
        console.log(`Processed: ${file}`);
    } else {
        console.warn(`File not found: ${file}`);
    }
}
console.log('CDN removal complete.');
