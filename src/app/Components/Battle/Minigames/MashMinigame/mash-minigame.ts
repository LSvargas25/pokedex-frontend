import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  computed,
  signal,
} from '@angular/core';
import { AttackOutcome } from '../../../../Services/Battle/battle-service';

const LIMIT_MS = 2500;
const PER_CLICK = 9;
const PERFECT_AT = 120;
const HIT_AT = 70;

/**
 * Mini-juego de machaque: cada click suma ~9% (±1) a la carga.
 * Al acabar el tiempo (o al llegar al máximo útil):
 *   >= 120% -> perfect
 *   >= 70%  -> hit
 *   resto   -> miss
 */
@Component({
  selector: 'app-mash-minigame',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mash-minigame.html',
  styleUrl: './mash-minigame.scss',
})
export class MashMinigame implements OnInit, OnDestroy {
  @Output() outcome = new EventEmitter<AttackOutcome>();

  readonly charge = signal(0);
  readonly barWidth = computed(() => Math.min(100, this.charge()));

  private limitTimer?: ReturnType<typeof setTimeout>;
  private done = false;

  ngOnInit(): void {
    this.limitTimer = setTimeout(() => this.finish(), LIMIT_MS);
  }

  ngOnDestroy(): void {
    clearTimeout(this.limitTimer);
  }

  mash(): void {
    if (this.done) {
      return;
    }
    this.charge.update((c) => Math.max(0, c + PER_CLICK + (Math.random() * 2 - 1)));
    // Ya no hace falta seguir clickeando: cerrar en cuanto se asegura "perfect".
    if (this.charge() >= PERFECT_AT) {
      this.finish();
    }
  }

  private finish(): void {
    if (this.done) {
      return;
    }
    this.done = true;
    clearTimeout(this.limitTimer);
    const c = this.charge();
    const result: AttackOutcome = c >= PERFECT_AT ? 'perfect' : c >= HIT_AT ? 'hit' : 'miss';
    this.outcome.emit(result);
  }

  round(n: number): number {
    return Math.round(n);
  }
}
