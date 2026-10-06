import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface PokemonFullData {
  id: number;
  name: string;
  image: string;
  types: string[];
  height: number;
  weight: number;
  abilities: { name: string; hidden: boolean }[];
  weaknesses: string[];
  evolution: { name: string; image: string | null }[];
  generation: { name: string | null; number: number | null };
}


@Injectable({
  providedIn: 'root'
})
export class PokemonDetailService {
  private http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiBaseUrl}/api/pokemons`;

  getPokemonFullData(nameOrId: string): Observable<PokemonFullData> {
    return this.http.get<PokemonFullData>(`${this.apiUrl}/${nameOrId}`);
  }
}
