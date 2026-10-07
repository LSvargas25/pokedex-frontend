import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthService } from '../../../Services/Auth/auth-service';
import { TEAM_SAVED_NOTICE, TrainerPanel } from './trainer-panel';

describe('TrainerPanel', () => {
  const create = async (url: string) => {
    TestBed.configureTestingModule({
      imports: [TrainerPanel],
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { isLoggedIn: signal(true), signOut: () => Promise.resolve() } },
      ],
    });
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    const fixture = TestBed.createComponent(TrainerPanel);
    return { panel: fixture.componentInstance, router };
  };

  it('desde el combate (?returnUrl=/poked) abre la selección de equipo y vuelve al guardar', async () => {
    const { panel, router } = await create('/trainer?returnUrl=%2Fpoked');
    expect(panel.view()).toBe('team');

    panel.onTeamSaved();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/poked');
  });

  it('sin returnUrl, al guardar vuelve al perfil con "Equipo guardado ✓"', async () => {
    const { panel, router } = await create('/trainer');
    expect(panel.view()).toBe('profile');

    panel.openTeam();
    panel.onTeamSaved();

    expect(panel.view()).toBe('profile');
    expect(panel.notice()).toBe(TEAM_SAVED_NOTICE);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
