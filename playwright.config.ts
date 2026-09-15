import { defineConfig } from '@playwright/test';

// E2E contra a produção (ou TEST_URL). Valida os fluxos reais do usuário.
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45000,
  fullyParallel: true,
  retries: 1,
  use: {
    baseURL: process.env.TEST_URL || 'https://moleta-carros.vercel.app',
    headless: true,
  },
  reporter: [['list']],
});
