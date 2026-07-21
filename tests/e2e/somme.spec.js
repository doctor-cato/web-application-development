const { test, expect } = require('@playwright/test');

test('somme.com should load correctly', async ({ page }) => {
  // Navigate directly to somme.com
  await page.goto('https://somme.com');

  // Verify that the page has loaded by checking if the URL contains 'somme.com'
  await expect(page).toHaveURL(/.*somme\.com.*/);

  // Example: Check if a title or a specific element exists (you can customize this later)
  // await expect(page).toHaveTitle(/Somme/i);
});
