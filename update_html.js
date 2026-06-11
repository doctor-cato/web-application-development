const fs = require('fs');

// Read the Fixed Layout header and footer from home-page
const homeHtml = fs.readFileSync('src/explore/home-page/index.html', 'utf8');
const headerMatch = homeHtml.match(/<header class="navbar">[\s\S]*?<\/header>/);
const footerMatch = homeHtml.match(/<footer>[\s\S]*?<\/footer>/);

const fixedHeader = headerMatch ? headerMatch[0] : '';
const fixedFooter = footerMatch ? footerMatch[0] : '';

const filesToUpdate = [
  'src/booking/booking-food/index.html',
  'src/user/loyalty-points/index.html',
  'src/booking/booking-success/index.html'
];

filesToUpdate.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace header
  content = content.replace(/<header class="topbar">[\s\S]*?<\/header>/, fixedHeader);
  
  // Replace footer
  content = content.replace(/<footer class="footer">[\s\S]*?<\/footer>/, fixedFooter);
  
  // Add main.css link if not present
  if(!content.includes('main.css')) {
     content = content.replace('<link rel="stylesheet" href="styles.css">', '<link rel="stylesheet" href="../../shared/css/main.css">\n  <link rel="stylesheet" href="styles.css">');
  }

  // Update relative paths in the injected header/footer for these files
  // These files are 2 levels deep: src/booking/xxx or src/user/xxx
  // So we replace paths to point correctly relative to them.
  content = content.replace(/href="css\//g, 'href="../../shared/css/');
  content = content.replace(/src="js\//g, 'src="../../shared/js/');
  // Replace links in Navbar
  content = content.replace(/href="index.html"/g, 'href="../../explore/home-page/index.html"');
  content = content.replace(/href="movies.html"/g, 'href="../../explore/movie-search/index.html"');
  content = content.replace(/href="cinemas.html"/g, 'href="../../explore/cinema-map/index.html"');

  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});
