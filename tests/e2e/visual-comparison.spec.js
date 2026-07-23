const { test, expect } = require('@playwright/test');

test.describe('Visual Regression Testing (Playwright Visual Comparison)', () => {
  test('Homepage visual snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take screenshot of the entire viewport / main container
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05
    });
  });

  test('Movie Explore grid visual snapshot', async ({ page }) => {
    await page.goto('/explore/movie-search/index.html');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('movies-explore.png', {
      maxDiffPixelRatio: 0.05
    });
  });

  test('Booking seat selection visual snapshot', async ({ page }) => {
    await page.goto('/booking/seat-booking/booking.html?id=1');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('booking-seat-selection.png', {
      maxDiffPixelRatio: 0.05
    });
  });
});
