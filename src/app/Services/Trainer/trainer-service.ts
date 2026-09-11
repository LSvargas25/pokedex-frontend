import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NextUnlock {
  level: number;
  pokemonNames: string[];
}

export interface Trainer {
  id: string;
  username: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  wins: number;
  losses: number;
  team: string[];
  unlockedPokemon: string[];
  nextUnlock: NextUnlock | null;
}

@Injectable({
  providedIn: 'root',
})
export class TrainerService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/trainer`;

  constructor(private readonly http: HttpClient) {}

  /** GET /api/trainer/me — perfil del entrenador autenticado. */
  getMe(): Observable<Trainer> {
    return this.http.get<Trainer>(`${this.apiUrl}/me`);
  }

  /** PUT /api/trainer/team — reemplaza el equipo (exactamente 3 nombres). */
  updateTeam(team: string[]): Observable<Trainer> {
    return this.http.put<Trainer>(`${this.apiUrl}/team`, { team });
  }
}
