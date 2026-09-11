import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { AttackOutcome } from '../../../../Services/Battle/battle-service';

const MIN_WAIT_MS = 800;
const MAX_WAIT_MS = 2000;
const REACT_LIMIT_MS = 1500;
const PERFECT_MS = 300;
const HIT_MS = 600;

/**
 * Mini-juego de semáforo (reacción): el panel arranca en "espera" (rojo).
 * Tras un delay random de 800-2000ms cambia a "ya" (verde).
 *   click antes del cambio           -> miss (falsa salida, inmediato)
 *   click < 300ms tras el cambio      -> perfect
 *   click 300-600ms tras el cambio    -> hit
 *   click > 600ms, o sin click en 1.5s -> miss
 */
@Component({
  selector: 'app-semaphore-minigame',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './semaphore-minigame.html',
  styleUrl: './semaphore-minigame.scss',
})
export class SemaphoreMinigame implements OnInit, OnDestroy {
  @Output() outcome = new EventEmitter<AttackOutcome>();

  readonly go = signal(false);

  private changedAt = 0;
  private done = false;
  private waitTimer?: ReturnType<typeof setTimeout>;
  private missTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    const wait = MIN_WAIT_MS + Math.random() * (MAX_WAIT_MS - MIN_WAIT_MS);
    this.waitTimer = setTimeout(() => this.turnGreen(), wait);
  }

  ngOnDestroy(): void {
    clearTimeout(this.waitTimer);
    clearTimeout(this.missTimer);
  }

  react(): void {
    if (this.done) {
      return;
    }
    if (!this.go()) {
      // Falsa salida: reaccionó antes de que cambiara a verde.
      this.finish('miss');
      return;
    }
    const elapsed = performance.now() - this.changedAt;
    if (elapsed < PERFECT_MS) {
      this.finish('perfect');
    } else if (elapsed <= HIT_MS) {
      this.finish('hit');
    } else {
      this.finish('miss');
    }
  }

  private turnGreen(): void {
    if (this.done) {
      return;
    }
    this.go.set(true);
    this.changedAt = performance.now();
    this.missTimer = setTimeout(() => this.finish('miss'), REACT_LIMIT_MS);
  }

  private finish(result: AttackOutcome): void {
    if (this.done) {
      return;
    }
    this.done = true;
    clearTimeout(this.waitTimer);
    clearTimeout(this.missTimer);
    this.outcome.emit(result);
  }
}
