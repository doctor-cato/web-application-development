const { test, expect } = require('@playwright/test');

test('booking flow should work from homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/3HD2K/i);

  const bookNowBtn = page.locator('#btn-book-now');
  await expect(bookNowBtn).toBeVisible({ timeout: 10000 });
  await bookNowBtn.click();

  await expect(page).toHaveURL(/.*\/booking\/seat-booking\/booking\.html.*/, { timeout: 10000 });
  await expect(page.locator('#seat-map')).toBeVisible();
});
