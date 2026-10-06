import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, retry, tap, throwError, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { ServerStatusService, WAKEUP_DELAYS_MS } from '../Services/ServerStatus/server-status';

/** Sin respuesta (0) o el proxy de Render mientras el servicio arranca (502/503/504). */
const isWakingError = (error: unknown): boolean =>
  error instanceof HttpErrorResponse && [0, 502, 503, 504].includes(error.status);

/**
 * Requests al backend propio: si el servidor está dormido, reintenta con
 * espera creciente en vez de fallar enseguida, y mantiene `ServerStatusService`
 * al día para que la UI muestre "Despertando el servidor…".
 */
export const serverWakeupInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const server = inject(ServerStatusService);
  server.requestStarted();

  return next(req).pipe(
    retry({
      count: WAKEUP_DELAYS_MS.length,
      delay: (error, attempt) => {
        if (!isWakingError(error)) {
          return throwError(() => error);
        }
        server.markWaking();
        return timer(WAKEUP_DELAYS_MS[attempt - 1]);
      },
    }),
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          server.markReady();
        }
      },
      error: (error) => {
        if (isWakingError(error)) {
          server.markUnreachable();
        } else {
          server.markReady();
        }
      },
    }),
    finalize(() => server.requestFinished())
  );
};
