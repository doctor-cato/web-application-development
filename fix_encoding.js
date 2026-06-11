const fs = require('fs');
const path = require('path');

const srcDir = 'Code group (unsort)/Fixed layout';
const destExplore = 'src/explore';

// 1. Fix Explore files
const exploreMap = {
    'index.html': 'home-page/index.html',
    'movies.html': 'movie-search/index.html',
    'cinemas.html': 'cinema-map/index.html'
};

for (const [srcFile, destRelative] of Object.entries(exploreMap)) {
    const srcPath = path.join(srcDir, srcFile);
    const destPath = path.join(destExplore, destRelative);
    
    let content = fs.readFileSync(srcPath, 'utf8');
    
    // Fix asset paths
    content = content.replace(/href="css\//g, 'href="../../shared/css/');
    content = content.replace(/src="js\//g, 'src="../../shared/js/');
    content = content.replace(/url\('images\//g, 'url(\'../../shared/images/');
    content = content.replace(/url\("images\//g, 'url("../../shared/images/');
    content = content.replace(/src="images\//g, 'src="../../shared/images/');

    // Fix HTML links (very simple replace)
    content = content.replace(/href="index\.html/g, 'href="../home-page/index.html');
    content = content.replace(/href="movies\.html/g, 'href="../movie-search/index.html');
    content = content.replace(/href="cinemas\.html/g, 'href="../cinema-map/index.html');

    fs.writeFileSync(destPath, content, 'utf8');
    console.log('Fixed', destPath);
}

// 2. Extract good header and footer from the newly generated home-page
const homeHtml = fs.readFileSync('src/explore/home-page/index.html', 'utf8');
const headerMatch = homeHtml.match(/<header class="navbar">[\s\S]*?<\/header>/);
const footerMatch = homeHtml.match(/<footer>[\s\S]*?<\/footer>/);

const goodHeader = headerMatch ? headerMatch[0] : '';
const goodFooter = footerMatch ? footerMatch[0] : '';

// 3. Fix features that got corrupted headers
const featureFiles = [
    'src/booking/booking-food/index.html',
    'src/user/loyalty-points/index.html',
    'src/booking/booking-success/index.html',
    'src/user/user-profile/profile.html' // Just to be safe, update profile.html too
];

for (const file of featureFiles) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace current header (navbar or topbar)
    content = content.replace(/<header class="(navbar|topbar)">[\s\S]*?<\/header>/, goodHeader);
    
    // Replace current footer
    content = content.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/, goodFooter);
    
    // For the features (depth 2 from src), the links in goodHeader/goodFooter are '../home-page/index.html'
    // But features are in 'src/booking/booking-food' which means we need '../../explore/home-page/index.html'
    // So we need to adjust the header and footer specifically for depth 2.
    // Let's do a simple fix after injecting:
    // goodHeader/goodFooter has '../home-page' etc, we change it to '../../explore/home-page'
    
    let depthAdjustedContent = content;
    
    // Because the injected header/footer might have `../home-page` we need to replace it.
    // Actually it's safer to just replace them carefully:
    // This script knows the files in featureFiles are 2 levels deep (e.g. src/booking/xxx)
    // The good header has: `href="../home-page/index.html"` -> `href="../../explore/home-page/index.html"`
    
    depthAdjustedContent = depthAdjustedContent.replace(/href="\.\.\/home-page\//g, 'href="../../explore/home-page/');
    depthAdjustedContent = depthAdjustedContent.replace(/href="\.\.\/movie-search\//g, 'href="../../explore/movie-search/');
    depthAdjustedContent = depthAdjustedContent.replace(/href="\.\.\/cinema-map\//g, 'href="../../explore/cinema-map/');

    fs.writeFileSync(file, depthAdjustedContent, 'utf8');
    console.log('Fixed header/footer in', file);
}
