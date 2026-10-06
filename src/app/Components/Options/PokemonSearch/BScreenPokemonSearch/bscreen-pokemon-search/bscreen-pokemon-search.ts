import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, OnDestroy, inject } from '@angular/core';
import { PokemonSelected } from '../../../../../Services/Options/SearchPokemon/PokemonSelected/pokemon-selected';
import { PokemonDetailService,PokemonFullData } from '../../../../../Services/Pokemons/PokemonDetailService/pokemon-detail-service';

@Component({
  selector: 'app-bscreen-pokemon-search',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './bscreen-pokemon-search.html',
  styleUrls: ['./bscreen-pokemon-search.scss']
})
export class BScreenPokemonSearch implements OnInit, OnDestroy {
  private pokemonSelected = inject(PokemonSelected);
  private detailService = inject(PokemonDetailService);

  Ison = true;
  pokemonData: PokemonFullData | null = null;
  get selectedPokemon$() { return this.pokemonSelected.selectedPokemon$; }

  totalPages = 3;
  currentPage = 0;

  ngOnInit() {
    // Resetear al entrar
    this.resetState();

    this.pokemonSelected.selectedPokemon$.subscribe(pokemon => {
      if (pokemon) {
        this.detailService.getPokemonFullData(pokemon.name).subscribe(data => {
          this.pokemonData = data;
        });
      } else {
        this.pokemonData = null;
      }
    });
  }

  ngOnDestroy() {
    // Limpiar al salir de la opción
    this.resetState();
  }

  private resetState() {
    this.pokemonData = null;
    this.currentPage = 0;
  }

  setPage(index: number) {
    this.currentPage = index;
  }

  // ✅ Avanzar / retroceder infinitamente
  nextPage() {
    this.currentPage = (this.currentPage + 1) % this.totalPages;
  }

  prevPage() {
    this.currentPage = (this.currentPage - 1 + this.totalPages) % this.totalPages;
  }

  // ✅ Control por teclado
  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') this.nextPage();
    if (event.key === 'ArrowLeft') this.prevPage();
  }
 private readonly PokemonTypeColors: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD'
};
getPokemonColor(types: string[]): string {
  if (!types || types.length === 0) return '#ccc';
  if (types.length === 1) return this.PokemonTypeColors[types[0]] || '#ccc';

  // Si tiene 2 tipos, hacemos un gradiente
  const color1 = this.PokemonTypeColors[types[0]] || '#ccc';
  const color2 = this.PokemonTypeColors[types[1]] || '#eee';
  return `linear-gradient(135deg, ${color1}, ${color2})`;
}

}
