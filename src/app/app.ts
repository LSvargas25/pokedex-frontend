import { Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { GuestNotice } from './Components/GuestNotice/guest-notice';
import { AuthService } from './Services/Auth/auth-service';
import { OAUTH_RETURN_URL_KEY } from './Components/Auth/AuthForm/auth-form';
import { safeReturnUrl } from './Services/Navigation/device-navigation';
import { Pokedex } from './Components/Pokedex/pokedex/pokedex';
import { Ligths } from './Components/ligths/ligths/ligths';
import { ServerWakeup } from './Components/ServerWakeup/server-wakeup';
import { environment } from '../environments/environment';

/**
 * El Pokédex está maquetado con posiciones absolutas en px. En vez de reescribirlo,
 * se dibuja dentro de un "lienzo" de tamaño fijo que se escala para caber en pantalla.
 * En celular vertical las dos mitades se apilan para que el escalado sea menor.
 */
const SIDE_BY_SIDE = { width: 1260, height: 960 };
const STACKED = { width: 680, height: 1830 };
const STACK_BELOW_PX = 700;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Pokedex, Ligths, ServerWakeup, GuestNotice],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Pokédex');

  private readonly router = inject(Router);

  /** true en páginas normales (ej. /privacy): se muestra la página en vez del Pokédex. */
  protected readonly onPage = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.isPageRoute())
    ),
    { initialValue: false }
  );

  private readonly viewport = signal(this.measure());

  protected readonly stacked = computed(() => {
    const { width, height } = this.viewport();
    return width < STACK_BELOW_PX && height > width;
  });

  protected readonly canvas = computed(() => (this.stacked() ? STACKED : SIDE_BY_SIDE));

  protected readonly scale = computed(() => Math.min(1, this.viewport().width / this.canvas().width));

  constructor() {
    // Despierta el backend apenas carga la app (Render se duerme sin tráfico).
    inject(HttpClient)
      .get(`${environment.apiBaseUrl}/health`)
      .subscribe({ error: () => undefined });

    // Al volver de Google, retomar la pantalla que se pidió antes del login.
    const auth = inject(AuthService);
    effect(() => {
      if (!auth.isLoggedIn()) return;
      const pending = takeOAuthReturnUrl();
      if (pending) void this.router.navigateByUrl(safeReturnUrl(pending));
    });
  }

  @HostListener('window:resize')
  protected onResize(): void {
    this.viewport.set(this.measure());
  }

  private isPageRoute(): boolean {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return route.data['page'] === true;
  }

  private measure() {
    return { width: document.documentElement.clientWidth, height: window.innerHeight };
  }
}

/** Lee y borra el returnUrl guardado antes de ir a Google (null si no hay). */
function takeOAuthReturnUrl(): string | null {
  try {
    const url = sessionStorage.getItem(OAUTH_RETURN_URL_KEY);
    sessionStorage.removeItem(OAUTH_RETURN_URL_KEY);
    return url;
  } catch {
    return null;
  }
}
