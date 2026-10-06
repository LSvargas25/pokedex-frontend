import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, effect, signal, inject } from '@angular/core';
import { BattleService } from '../../../../../Services/Battle/battle-service';
import { BattleStateService } from '../../../../../Services/Battle/battle-state';
import { TrainerService } from '../../../../../Services/Trainer/trainer-service';

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

  @ViewChild('consoleBox') consoleBox?: ElementRef<HTMLDivElement>;

  readonly loading = signal(true);
  readonly errorMsg = signal<string | null>(null);

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
    this.battle.reset();
    this.loading.set(true);
    this.errorMsg.set(null);

    this.trainerService.getMe().subscribe({
      next: (trainer) => {
        if (!trainer.team || trainer.team.length < 3) {
          this.battle.setNotice('Primero arma tu equipo en Trainer Info');
          this.loading.set(false);
          return;
        }
        this.battleService.startBattle().subscribe({
          next: (res) => {
            this.battle.setStart(res);
            this.loading.set(false);
          },
          error: (err) => {
            this.errorMsg.set(this.readError(err, 'No se pudo iniciar la batalla.'));
            this.loading.set(false);
          },
        });
      },
      error: (err) => {
        this.errorMsg.set(this.readError(err, 'No se pudo cargar tu entrenador.'));
        this.loading.set(false);
      },
    });
  }

  private readError(
    err: { error?: { message?: string; error?: string }; message?: string } | null,
    fallback: string
  ): string {
    return err?.error?.message || err?.error?.error || err?.message || fallback;
  }
}
