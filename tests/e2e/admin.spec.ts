import { test, expect } from '@playwright/test';

test('admin: login correto abre o painel', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByText('Acessar Painel')).toBeVisible();
  await page.fill('input[type=password]', 'moleta@2026');
  await page.click('button[type=submit]');
  await expect(page.getByText(/Estoque/).first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Cadastrar Veículo').first()).toBeVisible();
});

test('admin: senha errada não entra', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.goto('/admin');
  await page.fill('input[type=password]', 'senha-errada');
  await page.click('button[type=submit]');
  await expect(page.getByText('Acessar Painel')).toBeVisible();
});

test('segurança: escrita sem login retorna 401', async ({ request }) => {
  const res = await request.post('/api/admin/vehicles', {
    data: { titulo: 'invasor teste', preco: 1, categoria: 'venda', status: 'disponivel', fotos: [] },
  });
  expect(res.status()).toBe(401);
});
