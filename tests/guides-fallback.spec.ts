import { expect, test } from '@playwright/test';

test('Chiang Mai guide renders its body without waiting on the live database', async ({ page }) => {
  await page.goto('/guides/living-in-chiang-mai');

  // Visible as soon as the app hydrates. A hung Supabase read must not leave this on a spinner.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 8_000 });
  await expect(page.getByText('404: MISSING')).toHaveCount(0);
  await expect(page.locator('article p').first()).toBeVisible();
  await expect(page.locator('.animate-spin')).toHaveCount(0);
});

test('guides index shows cached guides and does not warn that the live database is down', async ({ page }) => {
  await page.goto('/guides');

  await expect(page.locator('a[href="/guides/living-in-chiang-mai"]')).toBeVisible({ timeout: 8_000 });
  await expect(page.getByText(/could not reach the live guide database/i)).toHaveCount(0);
  await expect(page.locator('.animate-spin')).toHaveCount(0);
});
