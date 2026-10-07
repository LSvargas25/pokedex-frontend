import { Injectable, computed, signal } from '@angular/core';
import {
  BattleAttackResponse,
  BattleRewards,
  BattleStartResponse,
  BattleStatus,
  Fighter,
  Move,
} from './battle-service';

/**
 * Estado de batalla compartido entre las dos pantallas de la opción "Poked":
 * la pantalla A (consola de log) y la pantalla B (arena visual).
 * Mismo rol que poked-screen-state.ts, pero con signals.
 */
@Injectable({
  providedIn: 'root',
})
export class BattleStateService {
  readonly battleId = signal<string | null>(null);
  readonly playerTeam = signal<Fighter[]>([]);
  readonly opponentTeam = signal<Fighter[]>([]);
  readonly playerActiveIndex = signal(0);
  readonly opponentActiveIndex = signal(0);
  readonly log = signal<string[]>([]);
  readonly moves = signal<Move[]>([]);
  readonly status = signal<BattleStatus>('ongoing');
  readonly rewards = signal<BattleRewards | null>(null);
  /** Mensaje de bloqueo para la pantalla A (ej. equipo incompleto). */
  readonly notice = signal<string | null>(null);
  /** No se pudo cargar el entrenador o iniciar el combate (A muestra Reintentar). */
  readonly loadError = signal<string | null>(null);

  readonly playerActive = computed<Fighter | null>(
    () => this.playerTeam()[this.playerActiveIndex()] ?? null
  );
  readonly opponentActive = computed<Fighter | null>(
    () => this.opponentTeam()[this.opponentActiveIndex()] ?? null
  );
  readonly isOver = computed(() => this.status() !== 'ongoing');

  /** Vuelve al estado inicial. Se llama al (re)entrar a "Poked". */
  reset(): void {
    this.battleId.set(null);
    this.playerTeam.set([]);
    this.opponentTeam.set([]);
    this.playerActiveIndex.set(0);
    this.opponentActiveIndex.set(0);
    this.log.set([]);
    this.moves.set([]);
    this.status.set('ongoing');
    this.rewards.set(null);
    this.notice.set(null);
    this.loadError.set(null);
  }

  setStart(res: BattleStartResponse): void {
    this.battleId.set(res.battleId);
    this.playerTeam.set(res.playerTeam);
    this.opponentTeam.set(res.opponentTeam);
    this.playerActiveIndex.set(res.playerActiveIndex);
    this.opponentActiveIndex.set(res.opponentActiveIndex);
    this.log.set([...res.log]);
    this.moves.set(res.moves ?? []);
    this.status.set('ongoing');
    this.rewards.set(null);
  }

  /**
   * Baja el HP del pokémon activo de un lado, durante la reproducción de la
   * secuencia de eventos de un turno. El estado final autoritativo lo fija
   * applyAttack() al terminar la secuencia.
   */
  applyEventDamage(targetSide: 'player' | 'opponent', damage: number): void {
    const teamSignal = targetSide === 'player' ? this.playerTeam : this.opponentTeam;
    const activeIndex = (
      targetSide === 'player' ? this.playerActiveIndex : this.opponentActiveIndex
    )();
    teamSignal.update((team) =>
      team.map((f, i) =>
        i === activeIndex ? { ...f, currentHp: Math.max(0, f.currentHp - damage) } : f
      )
    );
  }

  /** Aplica la respuesta de un turno. El log nuevo se concatena, no reemplaza. */
  applyAttack(res: BattleAttackResponse): void {
    this.playerTeam.set(res.playerTeam);
    this.opponentTeam.set(res.opponentTeam);
    this.playerActiveIndex.set(res.playerActiveIndex);
    this.opponentActiveIndex.set(res.opponentActiveIndex);
    this.log.update((prev) => [...prev, ...res.log]);
    this.status.set(res.status);
    this.rewards.set(res.rewards);
  }

  setNotice(message: string): void {
    this.notice.set(message);
  }
}
