import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

/** Pantallas que el Pokédex puede mostrar, cada una con su URL. */
export type DeviceScreen = 'Poked' | 'Pokémon Search' | 'Trainer Info' | 'Settings' | 'Login';

export const SCREEN_PATHS: Record<DeviceScreen, string> = {
  Poked: '/poked',
  'Pokémon Search': '/search',
  'Trainer Info': '/trainer',
  Settings: '/settings',
  Login: '/login',
};

/**
 * Sincroniza el Pokédex con el router: la URL dice qué pantalla se ve
 * (`data.screen` de la ruta) y el menú navega en vez de cambiar estado a mano.
 * Así los guards, el returnUrl y los enlaces directos funcionan.
 */
@Injectable({ providedIn: 'root' })
export class DeviceNavigation {
  private readonly router = inject(Router);

  readonly screen = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.currentScreen())
    ),
    { initialValue: this.currentScreen() }
  );

  open(screen: DeviceScreen): void {
    void this.router.navigateByUrl(SCREEN_PATHS[screen]);
  }

  home(): void {
    void this.router.navigateByUrl('/');
  }

  private currentScreen(): DeviceScreen | null {
    let route: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    let screen: DeviceScreen | null = null;
    while (route) {
      screen = (route.data['screen'] as DeviceScreen | undefined) ?? screen;
      route = route.firstChild;
    }
    return screen;
  }
}

/**
 * Ruta interna segura a la que volver después del login. Rechaza URLs externas
 * (`//otro.sitio`, `https://...`) y la propia pantalla de login.
 */
export const safeReturnUrl = (url: string | null | undefined, fallback = '/trainer'): string => {
  if (!url || !url.startsWith('/') || url.startsWith('//') || url.startsWith('/login')) {
    return fallback;
  }
  return url;
};
