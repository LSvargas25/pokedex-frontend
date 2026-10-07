import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './Interceptors/auth-interceptor';
import { serverWakeupInterceptor } from './Interceptors/server-wakeup-interceptor';
import { unauthorizedInterceptor } from './Interceptors/unauthorized-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, unauthorizedInterceptor, serverWakeupInterceptor]))
  ]
};
