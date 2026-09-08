import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  computed,
  effect,
  signal,
} from '@angular/core';
import { gsap } from 'gsap';
import {
  AttackOutcome,
  BattleAttackResponse,
  BattleService,
  Fighter,
  Move,
} from '../../../../../Services/Battle/battle-service';
import { BattleStateService } from '../../../../../Services/Battle/battle-state';
import { PokedService } from '../../../../../Services/Screens/poked-screen-state';
import { SoundService } from '../../../../../Services/Sound/sound-service';
import { MashMinigame } from '../../../../Battle/Minigames/MashMinigame/mash-minigame';
import { ReflexMinigame } from '../../../../Battle/Minigames/ReflexMinigame/reflex-minigame';
import { TimingBarMinigame } from '../../../../Battle/Minigames/TimingBarMinigame/timing-bar-minigame';

type Phase = 'choosing' | 'minigame' | 'resolving' | 'sequence';

const DEFAULT_MOVES: Move[] = [
  { name: 'Golpe rápido', powerMultiplier: 0.8 },
  { name: 'Ataque de tipo', powerMultiplier: 1.0 },
  { name: 'Golpe cargado', powerMultiplier: 1.4 },
];

@Component({
  selector: 'app-bscreen-poked',
  standalone: true,
  imports: [CommonModule, ReflexMinigame, TimingBarMinigame, MashMinigame],
  templateUrl: './bscreen-poked.html',
  styleUrl: './bscreen-poked.scss',
})
export class BScreenPoked implements AfterViewInit {
  @ViewChild('playerHp') playerHpRef?: ElementRef<HTMLDivElement>;
  @ViewChild('opponentHp') opponentHpRef?: ElementRef<HTMLDivElement>;
  @ViewChild('playerSprite') playerSpriteRef?: ElementRef<HTMLImageElement>;
  @ViewChild('opponentSprite') opponentSpriteRef?: ElementRef<HTMLImageElement>;

  readonly phase = signal<Phase>('choosing');
  readonly selectedMoveIndex = signal<number | null>(null);
  readonly attackError = signal<string | null>(null);

  /** Movimientos del estado compartido, con fallback por si faltan. */
  readonly moveList = computed<Move[]>(() =>
    this.battle.moves().length ? this.battle.moves() : DEFAULT_MOVES
  );
  /** true mientras no se puede elegir un movimiento. */
  readonly busy = computed(() => this.phase() !== 'choosing');

  constructor(
    readonly battle: BattleStateService,
    private readonly battleService: BattleService,
    private readonly pokedService: PokedService,
    private readonly sound: SoundService
  ) {
    // Anima las barras de HP con GSAP cuando cambia el HP mostrado.
    effect(() => {
      const player = this.battle.playerActive();
      const opponent = this.battle.opponentActive();
      if (player) {
        this.tweenHp(this.playerHpRef, this.hpPct(player));
      }
      if (opponent) {
        this.tweenHp(this.opponentHpRef, this.hpPct(opponent));
      }
    });
  }

  ngAfterViewInit(): void {
    const player = this.battle.playerActive();
    const opponent = this.battle.opponentActive();
    if (player && this.playerHpRef) {
      gsap.set(this.playerHpRef.nativeElement, { width: this.hpPct(player) + '%' });
    }
    if (opponent && this.opponentHpRef) {
      gsap.set(this.opponentHpRef.nativeElement, { width: this.hpPct(opponent) + '%' });
    }
  }

  hpPct(f: Fighter): number {
    if (!f.maxHp) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round((f.currentHp / f.maxHp) * 100)));
  }

  hpColor(pct: number): string {
    if (pct > 50) {
      return '#7ac74c';
    }
    if (pct > 20) {
      return '#f7d02c';
    }
    return '#e0392f';
  }

  private tweenHp(ref: ElementRef<HTMLDivElement> | undefined, pct: number): void {
    const el = ref?.nativeElement;
    if (!el) {
      return;
    }
    gsap.to(el, { width: pct + '%', duration: 0.4, ease: 'power2.out' });
  }

  selectMove(index: number): void {
    if (this.phase() !== 'choosing' || this.battle.isOver()) {
      return;
    }
    this.sound.playClick();
    this.attackError.set(null);
    this.selectedMoveIndex.set(index);
    this.phase.set('minigame');
  }

  onMinigameOutcome(outcome: AttackOutcome): void {
    const id = this.battle.battleId();
    const moveIndex = this.selectedMoveIndex();
    if (id == null || moveIndex == null) {
      return;
    }
    this.phase.set('resolving');
    this.battleService.attack(id, moveIndex, outcome).subscribe({
      next: (res) => {
        void this.runSequence(res);
      },
      error: (err) => {
        this.attackError.set(
          err?.error?.message || err?.error?.error || err?.message || 'Falló el ataque.'
        );
        this.phase.set('choosing');
        this.selectedMoveIndex.set(null);
      },
    });
  }

  /** Reproduce los eventos del turno en orden, con pausa entre uno y otro. */
  private async runSequence(res: BattleAttackResponse): Promise<void> {
    this.phase.set('sequence');
    const faintedSides = new Set<'player' | 'opponent'>();

    for (const ev of res.events ?? []) {
      const targetSide: 'player' | 'opponent' = ev.actor === 'player' ? 'opponent' : 'player';

      if (ev.isCrit) {
        this.sound.playCrit();
      } else if (ev.outcome === 'miss') {
        this.sound.playMiss();
      } else {
        this.sound.playHit();
      }
      if (ev.targetFainted) {
        setTimeout(() => this.sound.playFaint(), 140);
      }

      if (ev.outcome !== 'miss') {
        this.shakeSprite(targetSide, ev.isCrit);
      }
      if (!faintedSides.has(targetSide) && ev.damage > 0) {
        this.battle.applyEventDamage(targetSide, ev.damage);
      }
      if (ev.targetFainted) {
        faintedSides.add(targetSide);
      }

      await this.delay(600);
    }

    // Estado autoritativo final (equipos, índices activos, log, status, rewards).
    this.battle.applyAttack(res);

    if (this.battle.isOver()) {
      if (this.battle.status() === 'win') {
        this.sound.playVictory();
      } else {
        this.sound.playDefeat();
      }
    } else {
      this.phase.set('choosing');
    }
    this.selectedMoveIndex.set(null);
  }

  private shakeSprite(side: 'player' | 'opponent', strong: boolean): void {
    const el = (side === 'player' ? this.playerSpriteRef : this.opponentSpriteRef)?.nativeElement;
    if (!el) {
      return;
    }
    gsap.fromTo(
      el,
      { x: 0 },
      { x: strong ? 10 : 6, duration: 0.05, repeat: 5, yoyo: true, clearProps: 'x' }
    );
    gsap.fromTo(el, { filter: 'brightness(3)' }, { filter: 'brightness(1)', duration: 0.35 });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  backToMenu(): void {
    this.battle.reset();
    this.phase.set('choosing');
    this.selectedMoveIndex.set(null);
    this.pokedService.goToMenu();
  }
}
