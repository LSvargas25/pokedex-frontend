import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, effect, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BattleService } from '../../../../../Services/Battle/battle-service';
import { BattleStateService } from '../../../../../Services/Battle/battle-state';
import { TrainerService } from '../../../../../Services/Trainer/trainer-service';
import { friendlyHttpError } from '../../../../../Services/Http/friendly-error';

export const TRAINER_LOAD_ERROR = 'No pudimos cargar tu entrenador. Intenta de nuevo';
export const BATTLE_START_ERROR = 'No pudimos iniciar el combate. Intenta de nuevo';

@Component({
  selector: 'app-ascreen-poked',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './ascreen-poked.html',
  styleUrl: './ascreen-poked.scss',
})
export class AscreenPoked implements OnInit {
  readonly battle = inject(BattleStateService);
  private readonly battleService = inject(BattleService);
  private readonly trainerService = inject(TrainerService);
  private readonly router = inject(Router);

  @ViewChild('consoleBox') consoleBox?: ElementRef<HTMLDivElement>;

  readonly loading = signal(true);
  /** El entrenador no tiene 3 Pokémon: se ofrece ir a armar el equipo. */
  readonly needsTeam = signal(false);

  constructor() {
    // Autoscroll hacia la línea más nueva cada vez que el log cambia.
    effect(() => {
      this.battle.log();
      queueMicrotask(() => {
        const el = this.consoleBox?.nativeElement;
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      });
    });
  }

  ngOnInit(): void {
    this.start();
  }

  /** Carga el entrenador y arranca el combate. También es el "Reintentar". */
  start(): void {
    this.battle.reset();
    this.loading.set(true);
    this.needsTeam.set(false);

    this.trainerService.getMe().subscribe({
      next: (trainer) => {
        if (!trainer.team || trainer.team.length < 3) {
          this.battle.setNotice('Primero arma tu equipo en Trainer Info');
          this.needsTeam.set(true);
          this.loading.set(false);
          return;
        }
        this.battleService.startBattle().subscribe({
          next: (res) => {
            this.battle.setStart(res);
            this.loading.set(false);
          },
          error: (err) => this.fail(friendlyHttpError(err, BATTLE_START_ERROR)),
        });
      },
      error: (err) => this.fail(friendlyHttpError(err, TRAINER_LOAD_ERROR)),
    });
  }

  /** Abre la selección de equipo y, al guardar, vuelve aquí (patrón returnUrl). */
  goToTrainerInfo(): void {
    void this.router.navigate(['/trainer'], { queryParams: { returnUrl: '/poked' } });
  }

  private fail(message: string): void {
    // La pantalla B también lo ve: deja de mostrar "Preparando combate…".
    this.battle.loadError.set(message);
    this.loading.set(false);
  }
}
