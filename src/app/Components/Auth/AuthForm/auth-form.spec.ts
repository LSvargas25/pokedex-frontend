import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthService } from '../../../Services/Auth/auth-service';
import { translateAuthError } from '../../../Services/Auth/auth-errors';
import { AuthForm } from './auth-form';

describe('AuthForm (flujo sin sesión)', () => {
  let fixture: ComponentFixture<AuthForm>;
  let auth: {
    isLoggedIn: ReturnType<typeof signal<boolean>>;
    signInAsGuest: jasmine.Spy;
    signUp: jasmine.Spy;
    signIn: jasmine.Spy;
    signInWithGoogle: jasmine.Spy;
  };
  let router: Router;

  const render = async (url: string) => {
    auth = {
      isLoggedIn: signal(false),
      signInAsGuest: jasmine.createSpy('signInAsGuest').and.callFake(async () => {
        auth.isLoggedIn.set(true);
        return { error: null };
      }),
      signUp: jasmine.createSpy('signUp'),
      signIn: jasmine.createSpy('signIn'),
      signInWithGoogle: jasmine.createSpy('signInWithGoogle'),
    };
    TestBed.configureTestingModule({
      imports: [AuthForm],
      providers: [provideRouter([{ path: '**', children: [] }]), { provide: AuthService, useValue: auth }],
    });
    router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);

    fixture = TestBed.createComponent(AuthForm);
    fixture.detectChanges();
    await fixture.whenStable();
  };

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';
  const button = (label: string) =>
    [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find((b) =>
      b.textContent?.includes(label)
    ) as HTMLButtonElement;

  it('muestra "Inicia sesión para jugar" cuando viene del guard', async () => {
    await render('/login?returnUrl=%2Fpoked');
    expect(text()).toContain('Inicia sesión para jugar');
    expect(button('Jugar como invitado')).toBeTruthy();
    expect(button('Continuar con Google')).toBeTruthy();
  });

  it('"Jugar como invitado" inicia sesión anónima y vuelve a returnUrl', async () => {
    await render('/login?returnUrl=%2Fpoked');

    button('Jugar como invitado').click();
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(auth.signInAsGuest).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/poked');
  });

  it('registro sin sesión pide confirmar el correo', async () => {
    await render('/login');
    auth.signUp.and.resolveTo({
      data: { user: { identities: [{}] }, session: null },
      error: null,
    });
    const component = fixture.componentInstance;
    component.toggleMode();
    component.username = 'ash';
    component.email = 'ash@example.com';
    component.password = 'pikachu123';

    await component.submit();
    fixture.detectChanges();

    expect(text()).toContain('Revisa tu correo para confirmar la cuenta');
  });

  it('registro con correo ya usado muestra el error en español', async () => {
    await render('/login');
    auth.signUp.and.resolveTo({ data: { user: { identities: [] }, session: null }, error: null });
    const component = fixture.componentInstance;
    component.toggleMode();
    component.username = 'ash';
    component.email = 'ash@example.com';
    component.password = 'pikachu123';

    await component.submit();
    fixture.detectChanges();

    expect(text()).toContain('Ese correo ya está registrado');
  });
});

describe('translateAuthError', () => {
  it('traduce los errores comunes de Supabase', () => {
    expect(translateAuthError({ code: 'weak_password' })).toContain('contraseña es muy débil');
    expect(translateAuthError({ code: 'user_already_exists' })).toContain('ya está registrado');
    expect(translateAuthError({ status: 429, message: 'Too many requests' })).toContain('Demasiados intentos');
    expect(translateAuthError({ message: 'Invalid login credentials' })).toBe('Correo o contraseña incorrectos.');
  });
});
