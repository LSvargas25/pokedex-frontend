import { HttpErrorResponse } from '@angular/common/http';

/**
 * Mensaje para mostrar al usuario a partir de un error HTTP del backend.
 * - 400/403/404: el backend ya manda un mensaje en español pensado para el
 *   usuario (ej. "Primero guarda un equipo de 3 Pokémon"), se muestra tal cual.
 * - 401: el interceptor cierra la sesión y manda al login.
 * - Red caída o 5xx: nunca se muestra el detalle técnico, solo `fallback`.
 */
export const friendlyHttpError = (err: unknown, fallback: string): string => {
  if (!(err instanceof HttpErrorResponse)) return fallback;
  if (err.status === 401) return 'Tu sesión expiró. Inicia sesión de nuevo.';
  if (err.status >= 400 && err.status < 500) {
    const body = err.error as { error?: unknown; message?: unknown } | null;
    const message = body?.error ?? body?.message;
    if (typeof message === 'string' && message) return message;
  }
  return fallback;
};
