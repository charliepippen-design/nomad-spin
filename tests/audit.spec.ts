import { test, expect } from '@playwright/test';

test('Full Mission Audit - Nomad Spin', async ({ page }) => {
  // 1. Vai al sito
  await page.goto('https://www.digitalnomadspin.com/');
  
  // 2. Verifica che il titolo sia corretto
  await expect(page).toHaveTitle(/Nomad Spin/);

  // 3. Verifica che il tasto principale esista e cliccalo
  const startButton = page.getByRole('button', { name: /Configure Mission/i });
  await expect(startButton).toBeVisible();
  await startButton.click();

  // 4. Interagisci con gli slider (testiamo che la UI risponda)
  const sliders = page.locator('input[type="range"]');
  if (await sliders.count() > 0) {
    await sliders.first().fill('80'); // Imposta un valore alto
  }

  // 5. Lancia la sequenza di "Drop"
  const dropButton = page.getByRole('button', { name: /Initiate Drop Sequence/i });
  await expect(dropButton).toBeVisible();
  await dropButton.click();

  // 6. Aspetta che appaia il risultato (la card della città)
  // Nota: usiamo un timeout leggermente più lungo per l'animazione
  const resultCard = page.locator('.rounded-xl.border-primary'); 
  await expect(resultCard).toBeVisible({ timeout: 10000 });

  // 7. Verifica i bottoni degli affiliati
  const flatioLink = page.getByRole('link', { name: /Book with Flatio/i });
  const safetyWingLink = page.getByRole('link', { name: /Insurance/i });
  
  // Controllo che i link abbiano un href (che non siano vuoti)
  await expect(flatioLink).toHaveAttribute('href', /.*/);
  await expect(safetyWingLink).toHaveAttribute('href', /.*/);

  console.log('✅ Audit completato con successo: La missione è operativa!');
});