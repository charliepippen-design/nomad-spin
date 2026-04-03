import { test, expect } from '@playwright/test';

test('homepage loads with correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Nomad Spin/);
});

test('guides page loads', async ({ page }) => {
  await page.goto('/guides');
  await expect(page.getByRole('heading', { name: /Guides/i })).toBeVisible();
});
