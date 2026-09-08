import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  effect,
  signal,
} from '@angular/core';
import { gsap } from 'gsap';
import { BattleService, Fighter } from '../../../../../Services/Battle/battle-service';
import { BattleStateService } from '../../../../../Services/Battle/battle-state';
import { PokedService } from '../../../../../Services/Screens/poked-screen-state';

@Component({
  selector: 'app-bscreen-poked',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bscreen-poked.html',
  styleUrl: './bscreen-poked.scss',
})
export class BScreenPoked implements AfterViewInit {
  @ViewChild('playerHp') playerHpRef?: ElementRef<HTMLDivElement>;
  @ViewChild('opponentHp') opponentHpRef?: ElementRef<HTMLDivElement>;

  readonly attacking = signal(false);
  readonly attackError = signal<string | null>(null);

  constructor(
    readonly battle: BattleStateService,
    private readonly battleService: BattleService,
    private readonly pokedService: PokedService
  ) {
    // Animar las barras de HP con GSAP cuando cambian los pokémon activos.
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
    // Estado inicial de las barras, sin animación.
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
    gsap.to(el, { width: pct + '%', duration: 0.5, ease: 'power2.out' });
  }

  onAttack(): void {
    const id = this.battle.battleId();
    if (!id || this.attacking() || this.battle.isOver()) {
      return;
    }
    this.attacking.set(true);
    this.attackError.set(null);
    // Puente temporal: la selección de movimiento + mini-juego lo agrega el
    // commit siguiente. Por ahora usa el movimiento 0 con outcome "hit".
    this.battleService.attack(id, 0, 'hit').subscribe({
      next: (res) => {
        this.battle.applyAttack(res);
        this.attacking.set(false);
      },
      error: (err) => {
        this.attackError.set(
          err?.error?.message || err?.error?.error || err?.message || 'Falló el ataque.'
        );
        this.attacking.set(false);
      },
    });
  }

  backToMenu(): void {
    this.battle.reset();
    this.pokedService.goToMenu();
  }
}
