import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Pokemon {
[x: string]: any;
  id: number;
  name: string;
  image: string;
  types: string[];
}

/** Entrada del roster: los 151 Kanto con su nivel de desbloqueo por tramo. */
export interface RosterEntry {
  id: number;
  name: string;
  types: string[];
  sprite: string | null;
  statTotal: number;
  unlockLevel: number;
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  // Ajusta la URL a la que expone tu backend
  private readonly apiUrl = 'http://localhost:3000/api/pokemons';
  private readonly rosterUrl = `${environment.apiBaseUrl}/api/pokemon/roster`;

  /** El roster no cambia durante la sesión: se pide una sola vez y se comparte. */
  private roster$?: Observable<RosterEntry[]>;

  constructor(private http: HttpClient) {}

  /** GET /api/pokemon/roster — los 151 Kanto con unlockLevel, cacheado en memoria. */
  getRoster(): Observable<RosterEntry[]> {
    if (!this.roster$) {
      this.roster$ = this.http.get<RosterEntry[]>(this.rosterUrl).pipe(shareReplay(1));
    }
    return this.roster$;
  }

  // 🔧 FIX: Usar la ruta /filter cuando hay filtros
  getPokemonsFiltered(
    limit = 20,
    offset = 0,
    filters?: { generation?: number | string | null; type?: number | string | null }
  ): Observable<Pokemon[]> {
    let params = new HttpParams()
      .set('limit', String(limit))
      .set('offset', String(offset));

    // Solo agregar parámetros si tienen valor
    if (filters?.generation != null && filters.generation !== '') {
      params = params.set('generation', String(filters.generation));
    }
    if (filters?.type != null && filters.type !== '') {
      params = params.set('type', String(filters.type).toLowerCase());
    }

    // 🔧 FIX: Usar /filter cuando hay filtros activos
    const hasFilters = (filters?.generation != null && filters.generation !== '') ||
                       (filters?.type != null && filters.type !== '');

    const url = hasFilters ? `${this.apiUrl}/filter` : this.apiUrl;

    console.log('🔍 Petición:', url, 'Params:', params.toString());

    return this.http.get<any>(url, { params }).pipe(
      map(res => {
        const pokemons = this.mapToPokemons(res);
        console.log('✅ Pokemons recibidos:', pokemons.length);
        return pokemons;
      }),
      catchError(err => {
        console.error('❌ Error fetching pokemons (filtered)', err);
        return throwError(() => err);
      })
    );
  }


  getPokemons(limit = 10, offset = 0): Observable<Pokemon[]> {
    const params = new HttpParams()
      .set('limit', String(limit))
      .set('offset', String(offset));

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(res => this.mapToPokemons(res)),
      catchError(err => {
        console.error('Error fetching pokemons', err);
        return throwError(() => err);
      })
    );
  }




  // Helper para mapear la respuesta del backend o PokeAPI
    private mapToPokemons(res: any): Pokemon[] {
      if (Array.isArray(res)) return res as Pokemon[];
      if (res && Array.isArray(res.pokemons)) return res.pokemons as Pokemon[];
      if (res && res.results) {
        return res.results.map((p: any) => ({
          id: p.id ?? null,
          name: p.name,
          image: p.image ?? (p.sprites?.front_default ?? null),
          types: p.types ?? []
        })) as Pokemon[];
      }
      return [];
    }
}
