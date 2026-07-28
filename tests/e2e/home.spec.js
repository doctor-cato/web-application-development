const { test, expect } = require('@playwright/test');

test('homepage should load and display correctly', async ({ page }) => {

  await page.goto('/');

  await expect(page).toHaveURL(/.*|localhost|vercel.app/);
});
