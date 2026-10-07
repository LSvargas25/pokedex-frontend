import { signal } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { routes } from '../../../app.routes';
import { AuthService } from '../../../Services/Auth/auth-service';
import { ScreenService } from '../../../Services/Pokedex/On-OFF Service/screen-service';
import { AScreen } from './ascreen';

describe('AScreen: encendido automático', () => {
  let screen: ScreenService;

  const openAt = (url: string) => {
    TestBed.configureTestingModule({
      imports: [AScreen],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: { ready: Promise.resolve(), isLoggedIn: signal(true), isAnonymous: signal(false), currentUser: signal(null) },
        },
      ],
    });
    screen = TestBed.inject(ScreenService);
    // Sin encender de verdad (GSAP + videos): solo se observa la llamada.
    spyOn(screen, 'powerOn');

    void TestBed.inject(Router).navigateByUrl(url);
    tick();
    const fixture = TestBed.createComponent(AScreen);
    fixture.detectChanges();
    tick();
  };

  for (const url of ['/search', '/poked', '/trainer', '/login?returnUrl=%2Fpoked']) {
    it(`en ${url} se enciende solo, en modo rápido`, fakeAsync(() => {
      openAt(url);
      expect(screen.powerOn).toHaveBeenCalledOnceWith({ quick: true });
    }));
  }

  it('en / queda apagado esperando el ON', fakeAsync(() => {
    openAt('/');
    expect(screen.powerOn).not.toHaveBeenCalled();
  }));
});
