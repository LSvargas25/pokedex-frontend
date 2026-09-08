import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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

export interface BattleRewards {
  xpGained: number;
  newLevel: number;
  leveledUp: boolean;
}

export interface BattleStartResponse {
  battleId: string;
  playerTeam: Fighter[];
  opponentTeam: Fighter[];
  playerActiveIndex: number;
  opponentActiveIndex: number;
  log: string[];
}

export interface BattleAttackResponse {
  battleId: string;
  log: string[];
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
  private readonly apiUrl = `${environment.apiBaseUrl}/api/battle`;

  constructor(private readonly http: HttpClient) {}

  /** POST /api/battle/start — crea una batalla nueva para el trainer autenticado. */
  startBattle(): Observable<BattleStartResponse> {
    return this.http.post<BattleStartResponse>(`${this.apiUrl}/start`, {});
  }

  /** POST /api/battle/:battleId/attack — resuelve un turno. */
  attack(battleId: string): Observable<BattleAttackResponse> {
    return this.http.post<BattleAttackResponse>(`${this.apiUrl}/${battleId}/attack`, {});
  }
}
