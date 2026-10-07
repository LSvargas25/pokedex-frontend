import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, signal, inject } from '@angular/core';
import { AuthService } from '../../../Services/Auth/auth-service';
import { Trainer, TrainerService } from '../../../Services/Trainer/trainer-service';
import { friendlyHttpError } from '../../../Services/Http/friendly-error';

@Component({
  selector: 'app-trainer-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trainer-profile.html',
  styleUrl: './trainer-profile.scss',
})
export class TrainerProfile implements OnInit {
  private readonly trainerService = inject(TrainerService);
  private readonly auth = inject(AuthService);

  /** El usuario pidió ir a la pantalla de selección de equipo. */
  @Output() chooseTeam = new EventEmitter<void>();

  readonly trainer = signal<Trainer | null>(null);
  readonly loading = signal(true);
  readonly errorMsg = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
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

  signOut(): void {
    void this.auth.signOut();
  }
}
