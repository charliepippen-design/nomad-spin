import { test, expect } from '@playwright/test';

test('Full Mission Audit - Nomad Spin', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Nomad Spin/);

  const startButton = page.getByRole('button', { name: /Configure Mission/i });
  await expect(startButton).toBeVisible();
  await startButton.click();

  const sliders = page.locator('input[type="range"]');
  if (await sliders.count() > 0) {
    await sliders.first().fill('80');
  }

  const dropButton = page.getByRole('button', { name: /Initiate Drop Sequence/i });
  await expect(dropButton).toBeVisible();
  await dropButton.click();

  const resultCard = page.locator('.rounded-xl.border-primary');
  await expect(resultCard).toBeVisible({ timeout: 10000 });

  console.log('✅ Audit completato con successo: La missione è operativa!');
});
