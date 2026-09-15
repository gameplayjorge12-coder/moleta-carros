import { test, expect } from '@playwright/test';

test('detalhe: card abre a galeria do carro', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Ver fotos e detalhes').first().click();
  await expect(page).toHaveURL(/\/carro\//);
  await expect(page.getByRole('link', { name: /Voltar/i })).toBeVisible();
  await expect(page.getByText(/Falar com Marcelo no WhatsApp/i)).toBeVisible();
});
