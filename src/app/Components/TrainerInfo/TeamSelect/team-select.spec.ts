import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { testProviders } from '../../../../testing/test-providers';
import { environment } from '../../../../environments/environment';
import { Trainer } from '../../../Services/Trainer/trainer-service';
import { TeamSelect } from './team-select';

const names = ['bulbasaur', 'charmander', 'squirtle', 'pikachu'];

const trainer = (team: string[]): Trainer => ({
  id: 'u1',
  username: 'Invitado-a1b2',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  wins: 0,
  losses: 0,
  team,
  unlockedPokemon: names,
  nextUnlock: null,
});

const roster = names.map((name, i) => ({
  id: i + 1,
  name,
  types: [],
  sprite: `sprite-${name}.png`,
  statTotal: 300,
  unlockLevel: 1,
}));

describe('TeamSelect', () => {
  let fixture: ComponentFixture<TeamSelect>;
  let backend: HttpTestingController;

  const teamUrl = `${environment.apiBaseUrl}/api/trainer/team`;
  const el = () => fixture.nativeElement as HTMLElement;
  const rows = () => [...el().querySelectorAll<HTMLElement>('li.row')];
  const saveButton = () => el().querySelector<HTMLButtonElement>('button.primary')!;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TeamSelect], providers: testProviders });
    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TeamSelect);
    fixture.detectChanges();
    backend.expectOne(`${environment.apiBaseUrl}/api/trainer/me`).flush(trainer([]));
    backend.expectOne(`${environment.apiBaseUrl}/api/pokemon/roster`).flush(roster);
    fixture.detectChanges();
  });

  afterEach(() => backend.verify());

  // Regresión: el clic en "Guardar equipo" justo después del 3.er Pokémon, antes de que
  // la detección de cambios actualice el DOM, se perdía porque el botón seguía `disabled`.
  it('guarda con el primer clic aunque la vista aún no se haya refrescado tras el 3.er Pokémon', () => {
    const emitted: Trainer[] = [];
    fixture.componentInstance.saved.subscribe((t) => emitted.push(t));

    rows()[0].click();
    rows()[1].click();
    rows()[2].click();
    // Sin fixture.detectChanges(): el DOM todavía refleja 2/3 seleccionados.
    saveButton().click();

    const req = backend.expectOne(teamUrl);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ team: ['bulbasaur', 'charmander', 'squirtle'] });
    const updated = trainer(['bulbasaur', 'charmander', 'squirtle']);
    req.flush(updated);
    expect(emitted).toEqual([updated]);
  });

  it('con menos de 3 no envía nada y pide completar el equipo', () => {
    rows()[0].click();
    fixture.detectChanges();

    expect(saveButton().getAttribute('aria-disabled')).toBe('true');
    saveButton().click();
    fixture.detectChanges();

    backend.expectNone(teamUrl);
    expect(el().querySelector('.msg.error')?.textContent).toContain('Elige 3 Pokémon');
  });

  it('un doble clic mientras guarda envía una sola request', () => {
    rows()[0].click();
    rows()[1].click();
    rows()[2].click();
    saveButton().click();
    saveButton().click();

    backend.expectOne(teamUrl).flush(trainer(['bulbasaur', 'charmander', 'squirtle']));
  });

  it('muestra el botón como deshabilitado (aria) hasta tener 3', () => {
    expect(saveButton().getAttribute('aria-disabled')).toBe('true');
    rows()[0].click();
    rows()[1].click();
    rows()[2].click();
    fixture.detectChanges();
    expect(saveButton().getAttribute('aria-disabled')).toBe('false');
  });
});
