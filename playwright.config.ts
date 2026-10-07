import { defineConfig } from '@playwright/test';

/**
 * E2E contra el entorno local (no corre en CI: necesita el backend con su .env
 * y el proyecto de Supabase con inicios anónimos activos).
 *
 *   # terminal 1, en pokedex-backend
 *   npm start
 *   # terminal 2, aquí
 *   npm run e2e
 *
 * Usa el Chrome instalado (channel: 'chrome'), sin descargar navegadores.
 * Cada corrida crea un usuario invitado en Supabase.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  use: {
    baseURL: process.env['E2E_BASE_URL'] ?? 'http://localhost:4200',
    channel: 'chrome',
    viewport: { width: 1300, height: 980 },
    screenshot: 'only-on-failure',
  },
  // Con E2E_BASE_URL se usa ese servidor; si no, se levanta (o reutiliza) ng serve.
  webServer: process.env['E2E_BASE_URL']
    ? undefined
    : {
        command: 'npx ng serve --port 4200',
        url: 'http://localhost:4200',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
