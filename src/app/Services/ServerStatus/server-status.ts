import { Injectable, signal } from '@angular/core';

export type ServerStatus = 'checking' | 'waking' | 'ready' | 'unreachable';

/** Esperas entre reintentos: ≈ 85 s en total, más que un arranque en frío de Render (~50 s). */
export const WAKEUP_DELAYS_MS = [1000, 2000, 4000, 8000, 10_000, 10_000, 10_000, 10_000, 10_000, 10_000, 10_000];

// Un servidor despierto responde en menos de esto: así el aviso no parpadea en cada carga.
const SHOW_NOTICE_AFTER_MS = 1500;

/**
 * Estado del backend (plan gratuito de Render: se duerme sin tráfico).
 * El interceptor `serverWakeupInterceptor` lo actualiza mientras reintenta
 * las requests al backend, y `ServerWakeup` lo muestra como aviso.
 */
@Injectable({ providedIn: 'root' })
export class ServerStatusService {
  readonly status = signal<ServerStatus>('checking');

  private pending = 0;
  private slowTimer?: ReturnType<typeof setTimeout>;

  /** Una request al backend empezó: si tarda, se avisa que el servidor está despertando. */
  requestStarted(): void {
    this.pending++;
    if (this.status() === 'ready' || this.slowTimer) {
      return;
    }
    this.slowTimer = setTimeout(() => {
      if (this.pending > 0 && this.status() !== 'ready') {
        this.status.set('waking');
      }
    }, SHOW_NOTICE_AFTER_MS);
  }

  requestFinished(): void {
    this.pending = Math.max(0, this.pending - 1);
  }

  /** Falló por red/5xx y se va a reintentar. */
  markWaking(): void {
    this.status.set('waking');
  }

  /** El backend respondió algo (aunque sea un 4xx): está despierto. */
  markReady(): void {
    this.clearTimer();
    this.status.set('ready');
  }

  /** Se agotaron los reintentos. */
  markUnreachable(): void {
    this.clearTimer();
    this.status.set('unreachable');
  }

  private clearTimer(): void {
    clearTimeout(this.slowTimer);
    this.slowTimer = undefined;
  }
}
