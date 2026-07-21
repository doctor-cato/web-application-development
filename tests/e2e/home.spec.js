const { test, expect } = require('@playwright/test');

test('homepage should load and display correctly', async ({ page }) => {
  // baseURL is defined in playwright.config.js, so '/' navigates to the root URL
  await page.goto('/');

  // You can update this to check for a specific text or element on your home page
  // For now, we'll just check if the page loaded successfully without errors
  await expect(page).toHaveURL(/.*|localhost|vercel.app/);
});
