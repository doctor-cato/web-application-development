const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log(`[CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`));
    
    const res = await fetch('http://localhost:5111/api/movies');
    const movies = await res.json();
    const movieId = movies[0].id;

    const url = `http://localhost:3000/booking/seat-booking/booking.html?id=${movieId}`;
    console.log(`Navigating to ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    const pageData = await page.evaluate(() => {
        return {
            href: window.location.href,
            search: window.location.search
        };
    });
    
    console.log("Window Location:", pageData);
    
    await browser.close();
})();
