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

const CYCLE_MS = 1200;
const TOTAL_LIMIT_MS = 3000;

/**
 * Mini-juego de timing: un marcador oscila 0-100 en un ciclo de ~1.2s.
 *   42-58  -> perfect
 *   30-70  -> hit
 *   resto  -> miss
 * Límite total de 3s: sin click a tiempo -> miss.
 */
@Component({
  selector: 'app-timing-bar-minigame',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timing-bar-minigame.html',
  styleUrl: './timing-bar-minigame.scss',
})
export class TimingBarMinigame implements OnInit, OnDestroy {
  @Output() outcome = new EventEmitter<AttackOutcome>();

  readonly position = signal(0);

  private startedAt = 0;
  private rafId = 0;
  private limitTimer?: ReturnType<typeof setTimeout>;
  private done = false;

  ngOnInit(): void {
    this.startedAt = performance.now();
    const loop = () => {
      const elapsed = performance.now() - this.startedAt;
      const phase = (elapsed % CYCLE_MS) / CYCLE_MS; // 0..1
      const pos = phase < 0.5 ? phase * 2 : 2 - phase * 2; // triángulo 0..1..0
      this.position.set(Math.round(pos * 100));
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
    this.limitTimer = setTimeout(() => this.finish('miss'), TOTAL_LIMIT_MS);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    clearTimeout(this.limitTimer);
  }

  stop(): void {
    if (this.done) {
      return;
    }
    const p = this.position();
    let result: AttackOutcome = 'miss';
    if (p >= 42 && p <= 58) {
      result = 'perfect';
    } else if (p >= 30 && p <= 70) {
      result = 'hit';
    }
    this.finish(result);
  }

  private finish(result: AttackOutcome): void {
    if (this.done) {
      return;
    }
    this.done = true;
    cancelAnimationFrame(this.rafId);
    clearTimeout(this.limitTimer);
    this.outcome.emit(result);
  }
}
