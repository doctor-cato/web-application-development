document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.notif-filter-btn');
    const notifCards = document.querySelectorAll('.notif-card');
    const deleteBtns = document.querySelectorAll('.notif-btn-delete');
    const markAllBtn = document.getElementById('notif-page-mark-all');
    const emptyState = document.getElementById('notif-empty');

    // Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterType = btn.getAttribute('data-filter');
            let visibleCount = 0;

            notifCards.forEach(card => {
                if (filterType === 'all') {
                    card.style.display = 'flex';
                    visibleCount++;
                } else if (filterType === 'unread') {
                    if (card.classList.contains('unread')) {
                        card.style.display = 'flex';
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                } else {
                    if (card.getAttribute('data-category') === filterType) {
                        card.style.display = 'flex';
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                }
            });

            // Toggle empty state
            if (visibleCount === 0) {
                emptyState.style.display = 'block';
            } else {
                emptyState.style.display = 'none';
            }
        });
    });

    // Delete Logic
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent clicking the card
            const card = btn.closest('.notif-card');
            
            // Add a quick fade out animation before removing
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                card.remove();
                checkIfEmpty();
            }, 200);
        });
    });

    // Mark all as read
    if (markAllBtn) {
        markAllBtn.addEventListener('click', () => {
            notifCards.forEach(card => {
                card.classList.remove('unread');
            });
            // Also update the badge count in sidebar
            const unreadBadge = document.querySelector('.notif-filter-btn[data-filter="unread"] .badge');
            if (unreadBadge) {
                unreadBadge.textContent = '0';
                unreadBadge.style.display = 'none';
            }
        });
    }

    function checkIfEmpty() {
        const remainingCards = document.querySelectorAll('.notif-card');
        let visibleCount = 0;
        remainingCards.forEach(card => {
            if (card.style.display !== 'none') visibleCount++;
        });

        if (visibleCount === 0) {
            emptyState.style.display = 'block';
        }
    }
});
