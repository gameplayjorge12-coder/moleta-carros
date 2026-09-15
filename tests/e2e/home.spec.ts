import { test, expect } from '@playwright/test';

test('home: hero + vitrine com carros', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /combina com você/i })).toBeVisible();
  await expect(page.getByText('Ver fotos e detalhes').first()).toBeVisible();
  // vitrine é showcase -> preço "Sob consulta"
  await expect(page.getByText('Sob consulta').first()).toBeVisible();
});

test('home: veículo em destaque (RAV4) no hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/Destaque/).first()).toBeVisible();
  await expect(page.getByText(/RAV4/).first()).toBeVisible();
});

test('home: filtro locadora funciona', async ({ page }) => {
  await page.goto('/?categoria=aluguel');
  await expect(page.getByText('Ver fotos e detalhes').first()).toBeVisible();
});
