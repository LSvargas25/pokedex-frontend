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

const LETTERS_TO_WIN = 5;
const PER_LETTER_MS = 1800;
const PERFECT_TOTAL_MS = 7000;
const HIT_TOTAL_MS = 12000;

/**
 * Mini-juego de letras (el difícil): aparece una letra A-Z; hay que pulsarla
 * en el teclado físico dentro de 1800ms. Cada acierto muestra otra letra
 * distinta a la anterior.
 *   tecla incorrecta, o se agota la ventana de 1800ms -> miss (sin reintentos)
 *   5 aciertos en <= 7s totales   -> perfect
 *   5 aciertos entre 7s y 12s     -> hit
 *   no llega a 5 en 12s totales    -> miss (el tiempo total manda)
 *
 * El listener de teclado se registra a nivel de documento en ngOnInit y se
 * quita explícitamente tanto en finish() (apenas se decide el resultado) como
 * en ngOnDestroy(), para no dejar listeners huérfanos.
 */
@Component({
  selector: 'app-keyboard-letters-minigame',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './keyboard-letters-minigame.html',
  styleUrl: './keyboard-letters-minigame.scss',
})
export class KeyboardLettersMinigame implements OnInit, OnDestroy {
  @Output() outcome = new EventEmitter<AttackOutcome>();

  readonly letter = signal('');
  readonly hits = signal(0);
  readonly pips = Array.from({ length: LETTERS_TO_WIN });

  private startedAt = 0;
  private done = false;
  private letterTimer?: ReturnType<typeof setTimeout>;
  private totalTimer?: ReturnType<typeof setTimeout>;

  private readonly onKeydown = (event: KeyboardEvent): void => {
    if (this.done) {
      return;
    }
    // Sólo cuentan teclas de un carácter; ignoramos modificadores y atajos.
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    event.preventDefault();
    if (event.key.toUpperCase() !== this.letter()) {
      this.finish('miss');
      return;
    }
    this.hits.update((n) => n + 1);
    if (this.hits() >= LETTERS_TO_WIN) {
      const elapsed = performance.now() - this.startedAt;
      this.finish(
        elapsed <= PERFECT_TOTAL_MS ? 'perfect' : elapsed <= HIT_TOTAL_MS ? 'hit' : 'miss'
      );
      return;
    }
    this.nextLetter();
  };

  ngOnInit(): void {
    this.startedAt = performance.now();
    document.addEventListener('keydown', this.onKeydown);
    this.totalTimer = setTimeout(() => this.finish('miss'), HIT_TOTAL_MS);
    this.nextLetter();
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.onKeydown);
    clearTimeout(this.letterTimer);
    clearTimeout(this.totalTimer);
  }

  private nextLetter(): void {
    const prev = this.letter();
    let next = prev;
    while (next === prev) {
      next = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
    this.letter.set(next);
    clearTimeout(this.letterTimer);
    this.letterTimer = setTimeout(() => this.finish('miss'), PER_LETTER_MS);
  }

  private finish(result: AttackOutcome): void {
    if (this.done) {
      return;
    }
    this.done = true;
    document.removeEventListener('keydown', this.onKeydown);
    clearTimeout(this.letterTimer);
    clearTimeout(this.totalTimer);
    this.outcome.emit(result);
  }
}
