import { getLastBooking } from '/shared/utils/storage.js';

document.addEventListener('DOMContentLoaded', () => {
    // Views
    const ratingView = document.getElementById('rating-card-view');
    const noMovieView = document.getElementById('no-movie-view');
    const successView = document.getElementById('success-view');
    
    // Elements
    const immersiveBg = document.getElementById('immersive-bg');
    const movieTitleDisplay = document.getElementById('movie-title-display');
    const moviePosterDisplay = document.getElementById('movie-poster-display');
    const stars = document.querySelectorAll('.star');
    const ratingText = document.getElementById('rating-text');
    const submitBtn = document.getElementById('btn-submit-rating');
    const reviewInput = document.getElementById('review-input');
    
    let currentRating = 0;
    
    const ratingLabels = {
        0: 'Chưa đánh giá',
        1: 'Rất tệ',
        2: 'Tạm được',
        3: 'Cũng hay',
        4: 'Rất tuyệt vời',
        5: 'Siêu phẩm xuất sắc'
    };

    // 1. Fetch data and set UI
    const lastBooking = getLastBooking();
    
    if (lastBooking && lastBooking.movieTitle) {
        // Populate real data
        movieTitleDisplay.textContent = lastBooking.movieTitle;
        
        if (lastBooking.poster) {
            moviePosterDisplay.style.backgroundImage = `url('${lastBooking.poster}')`;
            immersiveBg.style.backgroundImage = `url('${lastBooking.poster}')`;
        } else {
            // Fallback poster if missing in data
            immersiveBg.classList.add('fallback');
        }
    } else {
        // No recent booking
        ratingView.style.display = 'none';
        noMovieView.style.display = 'flex';
        immersiveBg.classList.add('fallback');
    }

    // 2. Star Interactions
    const updateStars = (hoverValue) => {
        const val = hoverValue || currentRating;
        stars.forEach(star => {
            if (parseInt(star.dataset.value) <= val) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
                star.classList.remove('pop'); // Reset pop animation
            }
        });
        
        ratingText.textContent = ratingLabels[val];
        
        // Dynamic color for text based on rating
        if (val === 0) {
            ratingText.style.color = 'rgba(255, 255, 255, 0.4)';
            ratingText.style.textShadow = 'none';
        } else if (val <= 2) {
            ratingText.style.color = '#f87171'; // Red-ish for bad
            ratingText.style.textShadow = '0 0 10px rgba(248, 113, 113, 0.5)';
        } else if (val === 3) {
            ratingText.style.color = '#fbbf24'; // Yellow for okay
            ratingText.style.textShadow = '0 0 10px rgba(251, 191, 36, 0.5)';
        } else {
            ratingText.style.color = '#fbbf24'; // Gold for good
            ratingText.style.textShadow = '0 0 15px rgba(251, 191, 36, 0.6)';
        }
    };

    stars.forEach(star => {
        star.addEventListener('mouseenter', (e) => {
            updateStars(parseInt(e.target.dataset.value));
        });
        
        star.addEventListener('mouseleave', () => {
            updateStars(currentRating);
        });
        
        star.addEventListener('click', (e) => {
            const val = parseInt(e.target.dataset.value);
            currentRating = val;
            updateStars(currentRating);
            
            // Add pop animation to all active stars
            stars.forEach(s => {
                if (parseInt(s.dataset.value) <= currentRating) {
                    s.classList.remove('pop');
                    void s.offsetWidth; // Trigger reflow
                    s.classList.add('pop');
                }
            });
        });
    });

    // 3. Submit Logic
    submitBtn.addEventListener('click', () => {
        if (currentRating === 0) {
            // Shake animation on button to indicate error
            submitBtn.style.transform = 'translateX(-5px)';
            setTimeout(() => submitBtn.style.transform = 'translateX(5px)', 100);
            setTimeout(() => submitBtn.style.transform = 'translateX(-5px)', 200);
            setTimeout(() => submitBtn.style.transform = 'translateX(0)', 300);
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG XỬ LÝ...';

        // Simulate API call
        setTimeout(() => {
            // Hide rating card, show success view
            ratingView.style.display = 'none';
            successView.style.display = 'flex';
            
            // Optional: Remove last booking if we only want 1 review per ticket
            // localStorage.removeItem('cinema_last_booking');

            // Redirect after showing success for 2.5 seconds
            setTimeout(() => {
                window.location.href = '/explore/home-page/index.html';
            }, 2500);

        }, 1200);
    });
});
