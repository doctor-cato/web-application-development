module.exports = {
  ci: {
    collect: {
      startServerCommand: 'python3 -m http.server 3000 -d ./frontend/src',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/auth/user-login/login.html',
        'http://localhost:3000/explore/movie-search/index.html',
        'http://localhost:3000/booking/seat-booking/booking.html?id=1'
      ],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['warn', { minScore: 0.8 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        // Allow flexible assertion rules for static dev environment
        'service-worker': 'off',
        'works-offline': 'off',
        'viewport': 'off',
        'uses-long-cache-ttl': 'off'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
