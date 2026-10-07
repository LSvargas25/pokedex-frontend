import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../Services/Auth/auth-service';
import { safeReturnUrl } from '../Services/Navigation/device-navigation';

/**
 * Si el backend responde 401 (token vencido o revocado), la sesión local ya no
 * sirve: se borra y se manda al login, volviendo después a donde estaba.
 */
export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        const returnUrl = safeReturnUrl(router.url, '/');
        void auth.signOutLocal().then(() =>
          router.navigate(['/login'], { queryParams: { returnUrl } })
        );
      }
      return throwError(() => error);
    })
  );
};
