const { test, expect } = require('@playwright/test');

test.describe('Cine-Match Feature E2E Verification', () => {

  test('Cine-Match page loads properly and interactive preferences work', async ({ page }) => {
    // Set mock user session
    await page.addInitScript(() => {
      const user = { id: 1, fullname: 'Test User', email: 'test@example.com' };
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', 'Test User');
      localStorage.setItem('userEmail', 'test@example.com');
      sessionStorage.setItem('cinema_current_user', JSON.stringify(user));
      try {
        const token = btoa(encodeURIComponent(JSON.stringify(user)));
        localStorage.setItem('auth_token', token);
      } catch (e) {}
    });

    // Navigate to Cine-Match page
    await page.goto('/engagement/cinematch/index.html');
    
    // Check page title & title heading
    await expect(page).toHaveTitle(/Cine-Match/i);
    await expect(page.locator('.gradient-title')).toHaveText('CINE-MATCH');

    // Verify Preference Cards exist
    const prefCards = page.locator('.pref-card');
    await expect(prefCards.first()).toBeVisible();

    // Select mood preference card
    const romanticCard = page.locator('.pref-card[data-group="mood"][data-value="romantic"]');
    if (await romanticCard.isVisible()) {
      await romanticCard.click();
      await expect(romanticCard).toHaveClass(/selected/);
    }

    // Verify Start Match button exists and is clickable
    const startBtn = page.locator('#btn-start');
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // Verify transition to Radar searching step
    const radarStep = page.locator('#step-radar');
    await expect(radarStep).toBeVisible();

    // Verify radar status text
    const statusText = page.locator('#radar-status-text');
    await expect(statusText).toContainText('Đang tìm kiếm');

    // Cancel search
    const cancelBtn = page.locator('#btn-cancel-search');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    // Verify returning to form step
    const formStep = page.locator('#step-form');
    await expect(formStep).toBeVisible();
  });

  test('Cine-Match layout renders properly on mobile viewport (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.addInitScript(() => {
      const user = { id: 1, fullname: 'Mobile User', email: 'mobile@example.com' };
      localStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('cinema_current_user', JSON.stringify(user));
    });

    await page.goto('/engagement/cinematch/index.html');
    await expect(page.locator('.gradient-title')).toBeVisible();

    // Check Start button takes full width on mobile without overflowing
    const startBtn = page.locator('#btn-start');
    await expect(startBtn).toBeVisible();

    // Ensure no horizontal scrollbar overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

});
