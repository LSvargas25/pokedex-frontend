import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { testProviders } from '../../../../testing/test-providers';
import { environment } from '../../../../environments/environment';
import { Trainer } from '../../../Services/Trainer/trainer-service';
import { TrainerProfile } from './trainer-profile';

const trainer = (team: string[]): Trainer => ({
  id: 'u1',
  username: 'Invitado-a1b2',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  wins: 0,
  losses: 0,
  team,
  unlockedPokemon: [],
  nextUnlock: null,
});

const roster = ['bulbasaur', 'charmander', 'squirtle'].map((name, i) => ({
  id: i + 1,
  name,
  types: [],
  sprite: `sprite-${name}.png`,
  statTotal: 300,
  unlockLevel: 1,
}));

describe('TrainerProfile', () => {
  let fixture: ComponentFixture<TrainerProfile>;
  let backend: HttpTestingController;

  const render = (team: string[]) => {
    TestBed.configureTestingModule({ imports: [TrainerProfile], providers: testProviders });
    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TrainerProfile);
    fixture.detectChanges();
    backend.expectOne(`${environment.apiBaseUrl}/api/trainer/me`).flush(trainer(team));
    backend.expectOne(`${environment.apiBaseUrl}/api/pokemon/roster`).flush(roster);
    fixture.detectChanges();
  };

  const el = () => fixture.nativeElement as HTMLElement;
  const button = (label: string) =>
    [...el().querySelectorAll('button')].find((b) => b.textContent?.includes(label)) as
      | HTMLButtonElement
      | undefined;

  it('muestra los 3 Pokémon del equipo con sprite y nombre', () => {
    render(['bulbasaur', 'charmander', 'squirtle']);

    const members = [...el().querySelectorAll('.member')];
    expect(members.map((m) => m.textContent?.trim())).toEqual(['bulbasaur', 'charmander', 'squirtle']);
    expect(members[1].querySelector('img')?.getAttribute('src')).toBe('sprite-charmander.png');
    expect(button('¡A combatir!')).toBeTruthy();
    expect(button('Cambiar equipo')).toBeTruthy();
  });

  it('sin equipo muestra "Aún no tienes equipo" junto a "Elegir equipo"', () => {
    render([]);

    expect(el().textContent).toContain('Aún no tienes equipo');
    expect(button('Elegir equipo')).toBeTruthy();
    expect(button('¡A combatir!')).toBeUndefined();
  });

  it('"¡A combatir!" navega a /poked', () => {
    render(['bulbasaur', 'charmander', 'squirtle']);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);

    button('¡A combatir!')!.click();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/poked');
  });

  it('muestra el aviso de equipo guardado', () => {
    render(['bulbasaur', 'charmander', 'squirtle']);
    fixture.componentRef.setInput('notice', 'Equipo guardado ✓');
    fixture.detectChanges();

    expect(el().textContent).toContain('Equipo guardado ✓');
  });
});
