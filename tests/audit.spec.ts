import { test, expect } from '@playwright/test';

test('Full Mission Audit - Nomad Spin', async ({ page }) => {
  await page.goto('/');

  // Verify the page title
  await expect(page).toHaveTitle(/Nomad Spin/);

  // Verify key content is visible on the homepage
  await expect(page.locator('body')).toContainText(/nomad/i, { timeout: 10000 });

  // Navigate to guides and verify it loads
  await page.goto('/guides');
  await expect(page.locator('body')).toContainText(/guide/i, { timeout: 10000 });

  console.log('✅ Audit completed successfully: Mission is operational!');
});
