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

/**
 * Mini-juego de reflejos: tras un retraso random aparece un objetivo en una
 * posición random; hay 700ms para hacerle click.
 *   < 250ms  -> perfect
 *   250-700  -> hit
 *   sin click -> miss
 */
@Component({
  selector: 'app-reflex-minigame',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reflex-minigame.html',
  styleUrl: './reflex-minigame.scss',
})
export class ReflexMinigame implements OnInit, OnDestroy {
  @Output() outcome = new EventEmitter<AttackOutcome>();

  readonly visible = signal(false);
  readonly position = signal<{ top: number; left: number }>({ top: 50, left: 50 });

  private shownAt = 0;
  private done = false;
  private appearTimer?: ReturnType<typeof setTimeout>;
  private missTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    const delay = 400 + Math.random() * 500; // 400-900ms
    this.appearTimer = setTimeout(() => this.show(), delay);
  }

  ngOnDestroy(): void {
    clearTimeout(this.appearTimer);
    clearTimeout(this.missTimer);
  }

  hit(): void {
    if (this.done || !this.visible()) {
      return;
    }
    const elapsed = performance.now() - this.shownAt;
    this.finish(elapsed <= 250 ? 'perfect' : 'hit');
  }

  private show(): void {
    this.position.set({
      top: 8 + Math.random() * 64, // 8-72%
      left: 6 + Math.random() * 74, // 6-80%
    });
    this.visible.set(true);
    this.shownAt = performance.now();
    this.missTimer = setTimeout(() => this.finish('miss'), 700);
  }

  private finish(result: AttackOutcome): void {
    if (this.done) {
      return;
    }
    this.done = true;
    clearTimeout(this.missTimer);
    this.visible.set(false);
    this.outcome.emit(result);
  }
}
