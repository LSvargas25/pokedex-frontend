import { expect, test } from '@playwright/test';

// Recorrido de un visitante sin cuenta: link directo al combate → invitado →
// armar equipo → vuelve al combate → un turno.
test('invitado → armar equipo → combatir', async ({ page }) => {
  // Link directo: el Pokédex se enciende solo y el guard pide sesión.
  await page.goto('/poked');
  await expect(page).toHaveURL(/\/login\?returnUrl=%2Fpoked$/);
  await expect(page.getByText('Inicia sesión para jugar')).toBeVisible();

  await page.getByRole('button', { name: 'Jugar como invitado' }).click();
  await expect(page).toHaveURL(/\/poked$/);
  await expect(page.getByText('Estás jugando como invitado')).toBeVisible();

  // Sin equipo: el combate ofrece ir a Trainer Info.
  await expect(page.locator('app-ascreen-poked').getByText('Primero arma tu equipo en Trainer Info')).toBeVisible({
    timeout: 30_000,
  });
  await page.getByRole('button', { name: 'Ir a Trainer Info' }).click();
  await expect(page).toHaveURL(/\/trainer\?returnUrl=%2Fpoked$/);

  // Elegir los 3 primeros Pokémon desbloqueados y guardar.
  const unlocked = page.locator('app-team-select li.row:not(.locked)');
  await expect(unlocked.first()).toBeVisible({ timeout: 30_000 });
  for (let i = 0; i < 3; i++) {
    await unlocked.nth(i).click();
  }
  await expect(page.getByText('3 / 3')).toBeVisible();
  await page.getByRole('button', { name: 'Guardar equipo' }).click();

  // returnUrl: de vuelta al combate, que ahora sí arranca.
  await expect(page).toHaveURL(/\/poked$/);
  const moves = page.locator('app-bscreen-poked button.move');
  await expect(moves).toHaveCount(3, { timeout: 30_000 });
  const logLines = page.locator('app-ascreen-poked .line');
  const linesBefore = await logLines.count();

  // Un turno con el primer movimiento (minijuego del semáforo).
  await moves.first().click();
  await expect(page.locator('.semaphore.is-go')).toBeVisible({ timeout: 10_000 });
  await page.locator('.semaphore .react-btn').click();
  await expect.poll(() => logLines.count(), { timeout: 30_000 }).toBeGreaterThan(linesBefore);

  // El perfil muestra el equipo guardado y el botón para combatir.
  await page.goto('/trainer');
  await expect(page.locator('app-trainer-profile .member')).toHaveCount(3, { timeout: 30_000 });
  await expect(page.getByRole('button', { name: '¡A combatir!' })).toBeVisible();
});
