import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, computed, signal } from '@angular/core';
import {
  Pokemon,
  PokemonService,
} from '../../../Services/Pokemons/PokemonService/pokemon-service';
import { TrainerService } from '../../../Services/Trainer/trainer-service';

const TEAM_SIZE = 3;

@Component({
  selector: 'app-team-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-select.html',
  styleUrl: './team-select.scss',
})
export class TeamSelect implements OnInit {
  /** Equipo guardado (o cancelado): volver al perfil. */
  @Output() done = new EventEmitter<void>();

  readonly teamSize = TEAM_SIZE;

  readonly pokemons = signal<Pokemon[]>([]);
  readonly selected = signal<string[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly canSave = computed(() => this.selected().length === TEAM_SIZE);

  constructor(
    private readonly pokemonService: PokemonService,
    private readonly trainerService: TrainerService
  ) {}

  ngOnInit(): void {
    // Prellenar con el equipo actual, si lo hay.
    this.trainerService.getMe().subscribe({
      next: (t) => this.selected.set((t.team ?? []).slice(0, TEAM_SIZE)),
      error: () => {
        /* sin prefill si falla; no es bloqueante */
      },
    });

    this.pokemonService.getPokemonsFiltered(200, 0, {}).subscribe({
      next: (list) => {
        this.pokemons.set(list ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.message || 'No se pudieron cargar los pokémon.');
        this.loading.set(false);
      },
    });
  }

  isSelected(name: string): boolean {
    return this.selected().includes(name);
  }

  isDisabled(name: string): boolean {
    return !this.isSelected(name) && this.selected().length >= TEAM_SIZE;
  }

  toggle(name: string): void {
    const current = this.selected();
    if (current.includes(name)) {
      this.selected.set(current.filter((n) => n !== name));
    } else if (current.length < TEAM_SIZE) {
      this.selected.set([...current, name]);
    }
  }

  save(): void {
    if (!this.canSave() || this.saving()) {
      return;
    }
    this.saving.set(true);
    this.errorMsg.set(null);
    this.trainerService.updateTeam(this.selected()).subscribe({
      next: () => {
        this.saving.set(false);
        this.done.emit();
      },
      error: (err) => {
        this.errorMsg.set(
          err?.error?.message || err?.message || 'No se pudo guardar el equipo.'
        );
        this.saving.set(false);
      },
    });
  }

  cancel(): void {
    this.done.emit();
  }
}
