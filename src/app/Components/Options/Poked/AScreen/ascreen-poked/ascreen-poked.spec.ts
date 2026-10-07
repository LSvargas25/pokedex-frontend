import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { testProviders } from '../../../../../../testing/test-providers';
import { environment } from '../../../../../../environments/environment';
import { BattleStateService } from '../../../../../Services/Battle/battle-state';

import { AscreenPoked, TRAINER_LOAD_ERROR } from './ascreen-poked';

describe('AscreenPoked', () => {
  let component: AscreenPoked;
  let fixture: ComponentFixture<AscreenPoked>;
  let backend: HttpTestingController;

  const meUrl = `${environment.apiBaseUrl}/api/trainer/me`;
  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AscreenPoked],
      providers: testProviders
    })
    .compileComponents();

    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AscreenPoked);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('un 500 al cargar el entrenador muestra un error amable con Reintentar', () => {
    backend.expectOne(meUrl).flush({ error: 'stack trace' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(text()).toContain(TRAINER_LOAD_ERROR);
    expect(text()).not.toContain('stack trace');
    // La pantalla B deja de decir "Preparando combate…".
    expect(TestBed.inject(BattleStateService).loadError()).toBe(TRAINER_LOAD_ERROR);

    const retry = (fixture.nativeElement as HTMLElement).querySelector('button.retry') as HTMLButtonElement;
    retry.click();
    expect(TestBed.inject(BattleStateService).loadError()).toBeNull();
    backend.expectOne(meUrl);
  });

  it('sin equipo completo pide armarlo en Trainer Info', () => {
    backend.expectOne(meUrl).flush({ team: ['pikachu'] });
    fixture.detectChanges();

    expect(text()).toContain('Primero arma tu equipo en Trainer Info');
  });

  it('"Ir a Trainer Info" abre /trainer con returnUrl=/poked', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    backend.expectOne(meUrl).flush({ team: [] });
    fixture.detectChanges();

    const button = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')].find(
      (b) => b.textContent?.includes('Ir a Trainer Info')
    ) as HTMLButtonElement;
    button.click();

    expect(router.navigate).toHaveBeenCalledWith(['/trainer'], { queryParams: { returnUrl: '/poked' } });
  });
});
