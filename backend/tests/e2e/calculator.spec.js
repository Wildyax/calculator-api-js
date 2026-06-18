import { test, expect } from '@playwright/test';

test.describe('Calculatrice E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('doit afficher 0 par défaut', async ({ page }) => {
    const display = page.locator('#current-operand');
    await expect(display).toHaveText('0');
  });

  test('doit effectuer une addition simple (12 + 5 = 17)', async ({ page }) => {
    // Cliquer sur 1, 2
    await page.getByRole('button', { name: '1', exact: true }).click();
    await page.getByRole('button', { name: '2', exact: true }).click();
    
    // Cliquer sur +
    await page.getByRole('button', { name: '+', exact: true }).click();
    
    // Cliquer sur 5
    await page.getByRole('button', { name: '5', exact: true }).click();
    
    // Cliquer sur =
    await page.getByRole('button', { name: '=', exact: true }).click();
    
    // Vérifier le résultat
    const display = page.locator('#current-operand');
    await expect(display).toHaveText('17');
  });

  test('doit gérer la division par zéro', async ({ page }) => {
    await page.getByRole('button', { name: '8', exact: true }).click();
    await page.getByRole('button', { name: '÷', exact: true }).click();
    await page.getByRole('button', { name: '0', exact: true }).click();
    
    // On s'attend à une alerte (le script.js actuel utilise alert())
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Division par zéro impossible');
      await dialog.dismiss();
    });
    
    await page.getByRole('button', { name: '=', exact: true }).click();
  });

  test('doit effacer l\'écran avec AC', async ({ page }) => {
    await page.getByRole('button', { name: '9' }).click();
    await page.getByRole('button', { name: 'AC' }).click();
    
    const display = page.locator('#current-operand');
    await expect(display).toHaveText('0');
  });
});
