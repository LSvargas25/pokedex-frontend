import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { PrivacyPage } from '../Components/Privacy/privacy-page';
import { AuthService } from '../Services/Auth/auth-service';
import { DeviceNavigation, safeReturnUrl } from '../Services/Navigation/device-navigation';

/** AuthService falso: la sesión se controla con una signal. */
const fakeAuth = (loggedIn: boolean, ready: Promise<void> = Promise.resolve()) => ({
  ready,
  isLoggedIn: signal(loggedIn),
  isAnonymous: signal(false),
  currentUser: signal(null),
});

const setup = (auth: ReturnType<typeof fakeAuth>) => {
  TestBed.configureTestingModule({
    providers: [provideRouter(routes), { provide: AuthService, useValue: auth }],
  });
  return RouterTestingHarness.create();
};

describe('authGuard', () => {
  it('sin sesión, /poked redirige al login con returnUrl', async () => {
    const harness = await setup(fakeAuth(false));
    await harness.navigateByUrl('/poked');

    expect(TestBed.inject(Router).url).toBe('/login?returnUrl=%2Fpoked');
    expect(TestBed.inject(DeviceNavigation).screen()).toBe('Login');
  });

  it('sin sesión, /trainer también pide login', async () => {
    const harness = await setup(fakeAuth(false));
    await harness.navigateByUrl('/trainer');

    expect(TestBed.inject(Router).url).toBe('/login?returnUrl=%2Ftrainer');
  });

  it('con sesión deja entrar a /poked', async () => {
    const harness = await setup(fakeAuth(true));
    await harness.navigateByUrl('/poked');

    expect(TestBed.inject(Router).url).toBe('/poked');
    expect(TestBed.inject(DeviceNavigation).screen()).toBe('Poked');
  });

  it('espera a que se lea la sesión guardada antes de decidir', async () => {
    let finishHydration!: () => void;
    const auth = fakeAuth(false, new Promise<void>((resolve) => (finishHydration = resolve)));
    const harness = await setup(auth);

    const navigation = harness.navigateByUrl('/trainer');
    // La sesión persistida aparece mientras el guard espera.
    auth.isLoggedIn.set(true);
    finishHydration();
    await navigation;

    expect(TestBed.inject(Router).url).toBe('/trainer');
  });

  it('las rutas públicas no piden sesión', async () => {
    const harness = await setup(fakeAuth(false));

    await harness.navigateByUrl('/search');
    expect(TestBed.inject(Router).url).toBe('/search');

    const page = await harness.navigateByUrl('/privacy', PrivacyPage);
    expect(TestBed.inject(Router).url).toBe('/privacy');
    expect(harness.routeNativeElement?.textContent).toContain('stevenvr2017@gmail.com');
    expect(page).toBeTruthy();
  });
});

describe('safeReturnUrl', () => {
  it('acepta rutas internas', () => {
    expect(safeReturnUrl('/poked')).toBe('/poked');
  });

  it('rechaza URLs externas y el propio login', () => {
    expect(safeReturnUrl('https://evil.example')).toBe('/trainer');
    expect(safeReturnUrl('//evil.example')).toBe('/trainer');
    expect(safeReturnUrl('/login?returnUrl=/poked')).toBe('/trainer');
    expect(safeReturnUrl(null, '/')).toBe('/');
  });
});
