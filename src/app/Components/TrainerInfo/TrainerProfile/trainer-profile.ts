import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, computed, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../Services/Auth/auth-service';
import { Trainer, TrainerService } from '../../../Services/Trainer/trainer-service';
import { PokemonService, RosterEntry } from '../../../Services/Pokemons/PokemonService/pokemon-service';
import { friendlyHttpError } from '../../../Services/Http/friendly-error';

export const TEAM_SIZE = 3;

@Component({
  selector: 'app-trainer-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trainer-profile.html',
  styleUrl: './trainer-profile.scss',
})
export class TrainerProfile implements OnInit {
  private readonly trainerService = inject(TrainerService);
  private readonly pokemonService = inject(PokemonService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Mensaje de confirmación tras guardar el equipo (ej. "Equipo guardado ✓"). */
  @Input() notice: string | null = null;

  /** El usuario pidió ir a la pantalla de selección de equipo. */
  @Output() chooseTeam = new EventEmitter<void>();

  readonly trainer = signal<Trainer | null>(null);
  readonly loading = signal(true);
  readonly errorMsg = signal<string | null>(null);

  private readonly roster = signal<RosterEntry[]>([]);

  /** Equipo con sprite: el roster (cacheado) trae el sprite de cada Pokémon. */
  readonly team = computed(() => {
    const byName = new Map(this.roster().map((p) => [p.name, p]));
    return (this.trainer()?.team ?? []).map((name) => ({
      name,
      sprite: byName.get(name)?.sprite ?? null,
    }));
  });

  readonly teamComplete = computed(() => this.team().length === TEAM_SIZE);

  ngOnInit(): void {
    this.load();
    // Si falla, el equipo se muestra solo con nombres.
    this.pokemonService.getRoster().subscribe({
      next: (list) => this.roster.set(list ?? []),
      error: () => undefined,
    });
  }

  load(): void {
    this.loading.set(true);
    this.errorMsg.set(null);
    this.trainerService.getMe().subscribe({
      next: (t) => {
        this.trainer.set(t);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(
          friendlyHttpError(err, 'No pudimos cargar tu entrenador. Intenta de nuevo')
        );
        this.loading.set(false);
      },
    });
  }

  xpPercent(): number {
    const t = this.trainer();
    if (!t || !t.xpToNextLevel) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round((t.xp / t.xpToNextLevel) * 100)));
  }

  goToBattle(): void {
    void this.router.navigateByUrl('/poked');
  }

  signOut(): void {
    void this.auth.signOut();
  }
}
