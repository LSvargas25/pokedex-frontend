import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from '../Services/Auth/auth-service';

/**
 * Añade `Authorization: Bearer <access_token>` a las requests dirigidas
 * al backend propio (environment.apiBaseUrl). Cualquier otra request
 * (Supabase, assets, terceros) pasa sin tocar.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const token = inject(AuthService).getAccessToken();
  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    })
  );
};
