import { expect, test } from '@playwright/test';

// Regresión: el primer clic en "Guardar equipo" justo después de elegir el 3.er Pokémon
// se perdía si llegaba antes de que Angular refrescara la vista (con eventCoalescing la
// detección de cambios corre en el siguiente frame y el botón seguía `disabled`).
// Los clics de Playwright esperan a que el botón esté habilitado y esconden el problema,
// así que se disparan en el mismo task desde el navegador.
test('el primer clic en Guardar equipo tras el 3.er Pokémon guarda', async ({ page }) => {
  await page.goto('/login?returnUrl=%2Ftrainer');
  await page.getByRole('button', { name: 'Jugar como invitado' }).click();
  await page.getByRole('button', { name: /Elegir equipo|Cambiar equipo/ }).click({ timeout: 30_000 });
  const unlocked = page.locator('app-team-select li.row:not(.locked)');
  await expect(unlocked.first()).toBeVisible({ timeout: 30_000 });

  const put = page.waitForRequest((r) => r.method() === 'PUT' && r.url().endsWith('/api/trainer/team'));
  await page.evaluate(() => {
    const rows = document.querySelectorAll<HTMLElement>('app-team-select li.row:not(.locked)');
    rows[0].click();
    rows[1].click();
    rows[2].click();
    document.querySelector<HTMLButtonElement>('app-team-select button.primary')!.click();
  });

  expect((await put).postDataJSON().team).toHaveLength(3);
  await expect(page.getByText('Equipo guardado ✓')).toBeVisible({ timeout: 30_000 });
});
