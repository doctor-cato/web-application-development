const { test, expect } = require('@playwright/test');

test('booking flow should work from homepage', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify({ id: 1, name: 'Test User', email: 'test@example.com' }));
  });

  await page.goto('/');
  await expect(page).toHaveTitle(/3HD2K/i);

  const bookNowBtn = page.locator('#btn-book-now');
  await expect(bookNowBtn).toBeVisible({ timeout: 10000 });
  await expect(bookNowBtn).toBeEnabled({ timeout: 5000 });
  await bookNowBtn.waitFor({ state: 'attached' });

  await bookNowBtn.click();

  await expect(page).toHaveURL(/.*\/booking\/seat-booking\/booking\.html.*/, { timeout: 10000 });
  await expect(page.locator('#seat-map')).toBeVisible();
});



