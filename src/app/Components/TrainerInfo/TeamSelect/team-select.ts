import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, computed, signal, inject } from '@angular/core';
import {
  PokemonService,
  RosterEntry,
} from '../../../Services/Pokemons/PokemonService/pokemon-service';
import { TrainerService } from '../../../Services/Trainer/trainer-service';
import { friendlyHttpError } from '../../../Services/Http/friendly-error';

const TEAM_SIZE = 3;

@Component({
  selector: 'app-team-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-select.html',
  styleUrl: './team-select.scss',
})
export class TeamSelect implements OnInit {
  private readonly pokemonService = inject(PokemonService);
  private readonly trainerService = inject(TrainerService);

  /** Equipo guardado (o cancelado): volver al perfil. */
  @Output() done = new EventEmitter<void>();

  readonly teamSize = TEAM_SIZE;

  readonly pokemons = signal<RosterEntry[]>([]);
  readonly unlockedNames = signal<Set<string>>(new Set());
  readonly selected = signal<string[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly canSave = computed(() => this.selected().length === TEAM_SIZE);

  ngOnInit(): void {
    // Prellenar con el equipo actual y saber qué está desbloqueado.
    this.trainerService.getMe().subscribe({
      next: (t) => {
        this.selected.set((t.team ?? []).slice(0, TEAM_SIZE));
        this.unlockedNames.set(new Set((t.unlockedPokemon ?? []).map((n) => n.toLowerCase())));
      },
      error: () => {
        /* sin prefill si falla; no es bloqueante */
      },
    });

    this.pokemonService.getRoster().subscribe({
      next: (list) => {
        this.pokemons.set(list ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(friendlyHttpError(err, 'No pudimos cargar los Pokémon. Intenta de nuevo'));
        this.loading.set(false);
      },
    });
  }

  isUnlocked(name: string): boolean {
    return this.unlockedNames().has(name.toLowerCase());
  }

  isSelected(name: string): boolean {
    return this.selected().includes(name);
  }

  isDisabled(name: string): boolean {
    return (
      !this.isUnlocked(name) || (!this.isSelected(name) && this.selected().length >= TEAM_SIZE)
    );
  }

  toggle(name: string): void {
    if (!this.isUnlocked(name)) {
      return;
    }
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
          friendlyHttpError(err, 'No pudimos guardar tu equipo. Intenta de nuevo')
        );
        this.saving.set(false);
      },
    });
  }

  cancel(): void {
    this.done.emit();
  }
}
