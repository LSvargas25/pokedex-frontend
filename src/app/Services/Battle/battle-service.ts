import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Fighter {
  name: string;
  types: string[];
  attack: number;
  defense: number;
  speed: number;
  maxHp: number;
  currentHp: number;
  sprite: string;
}

export type BattleStatus = 'ongoing' | 'win' | 'lose';

/** Resultado del mini-juego de habilidad que precede a cada ataque. */
export type AttackOutcome = 'miss' | 'hit' | 'perfect';

export interface Move {
  name: string;
  powerMultiplier: number;
}

export interface BattleEvent {
  actor: 'player' | 'opponent';
  move: string;
  outcome: AttackOutcome;
  damage: number;
  isCrit: boolean;
  targetFainted: boolean;
}

export interface BattleRewards {
  xpGained: number;
  newLevel: number;
  leveledUp: boolean;
  unlockedPokemon?: string[];
}

export interface BattleStartResponse {
  battleId: string;
  playerTeam: Fighter[];
  opponentTeam: Fighter[];
  playerActiveIndex: number;
  opponentActiveIndex: number;
  log: string[];
  moves: Move[];
}

export interface BattleAttackResponse {
  battleId: string;
  log: string[];
  events: BattleEvent[];
  playerTeam: Fighter[];
  opponentTeam: Fighter[];
  playerActiveIndex: number;
  opponentActiveIndex: number;
  status: BattleStatus;
  rewards: BattleRewards | null;
}

@Injectable({
  providedIn: 'root',
})
export class BattleService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiBaseUrl}/api/battle`;

  /** POST /api/battle/start — crea una batalla nueva para el trainer autenticado. */
  startBattle(): Observable<BattleStartResponse> {
    return this.http.post<BattleStartResponse>(`${this.apiUrl}/start`, {});
  }

  /** POST /api/battle/:battleId/attack — resuelve un turno con el movimiento
   * elegido y el resultado del mini-juego. */
  attack(
    battleId: string,
    moveIndex: number,
    outcome: AttackOutcome
  ): Observable<BattleAttackResponse> {
    return this.http.post<BattleAttackResponse>(`${this.apiUrl}/${battleId}/attack`, {
      moveIndex,
      outcome,
    });
  }
}
