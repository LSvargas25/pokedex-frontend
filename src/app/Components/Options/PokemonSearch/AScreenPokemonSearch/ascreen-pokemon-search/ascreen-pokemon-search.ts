import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener, inject } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PokemonService,Pokemon } from '../../../../../Services/Pokemons/PokemonService/pokemon-service';
import { PokemonSelected } from '../../../../../Services/Options/SearchPokemon/PokemonSelected/pokemon-selected';

@Component({
  selector: 'app-ascreen-pokemon-search',
  imports: [CommonModule, HttpClientModule, FormsModule],
  standalone: true,
  templateUrl: './ascreen-pokemon-search.html',
  styleUrls: ['./ascreen-pokemon-search.scss']
})
export class AScreenPokemonSearch implements OnInit {
  private pokemonService = inject(PokemonService);

  AScreen = true;
  Targets = true;
  FilterBy = true;

  // Listas de filtros
  generations: number[] = [1,2,3,4,5,6,7,8,9];
  types: string[] = [
    'normal','fire','water','electric','grass','ice','fighting','poison',
    'ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'
  ];

  // Selección actual
  selectedGeneration: number | null = null;
  selectedType: string | null = null;
  searchTerm = '';

  pokemons: Pokemon[] = [];
  filteredPokemons: Pokemon[] = [];
  displayedPokemons: Pokemon[] = [];
  currentIndex = 0;

  loading = false;
  error: string | null = null;

  private scrollInterval?: ReturnType<typeof setInterval>;

  public pokemonSelected: PokemonSelected; // Ensure this is properly initialized in the constructor

  constructor() {
    const pokemonSelected = inject(PokemonSelected);

    this.pokemonSelected = pokemonSelected; // Assigning it to the class property
  }

  ngOnInit(): void {
    this.loadPokemons();
  }

  // Carga desde backend con filtros (generation/type)
loadPokemons(): void {
  this.loading = true;
  this.error = null;
  const limit = 200;
  const offset = 0;

  this.pokemonService.getPokemonsFiltered(limit, offset, {
    generation: this.selectedGeneration,
    type: this.selectedType
  }).subscribe({
    next: (data) => {
      this.pokemons = data || [];
      this.currentIndex = 0;

      // 🔹 Siempre aplicar filtros locales, incluso si no hay searchTerm
      this.applyClientFilters();

      this.loading = false;
    },
    error: (err) => {
      this.error = err?.message || 'Error al cargar pokemons';
      this.pokemons = [];
      this.filteredPokemons = [];
      this.displayedPokemons = [];
      this.loading = false;
    }
  });
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


  // Filtro local por nombre (searchTerm)
  applyClientFilters(): void {
  const term = this.searchTerm.trim().toLowerCase();

  this.filteredPokemons = term
    ? this.pokemons.filter(p => p.name.toLowerCase().includes(term))
    : [...this.pokemons]; // 🔹 siempre clonar el array

  this.currentIndex = 0;
  this.updateDisplayed(); // 🔹 actualizar la vista siempre
}


  updateDisplayed(): void {
    this.displayedPokemons = this.filteredPokemons.slice(
      this.currentIndex,
      this.currentIndex + 10
    );
  }

  onFilterChange(): void {
    this.searchTerm = ''; // 🔧 FIX: Limpiar búsqueda al cambiar filtros
    this.currentIndex = 0;
    this.loadPokemons();
  }

  onSearchTermChange(): void {
    this.currentIndex = 0;
    this.applyClientFilters();
  }

  scrollUp(): void {
    if (this.currentIndex === 0) {
      this.currentIndex = this.filteredPokemons.length - 10; // Wrap around to the last set
    } else {
      this.currentIndex--;
    }
    this.updateDisplayed();
  }

  scrollDown(): void {
    if (this.currentIndex >= this.filteredPokemons.length - 10) {
      this.currentIndex = 0; // Wrap around to the first set
    } else {
      this.currentIndex++;
    }
    this.updateDisplayed();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.scrollUp();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.scrollDown();
    }
  }

  onSelectPokemon(pokemon: Pokemon): void {
    this.pokemonSelected.setSelected(pokemon);
  }

  onMouseMove(event: MouseEvent, container: HTMLElement): void {
    const rect = container.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const height = rect.height;

    if (y < height * 0.25) {
      this.startAutoScroll('up');
    } else if (y > height * 0.75) {
      this.startAutoScroll('down');
    } else {
      this.stopAutoScroll();
    }
  }

  onMouseLeave(): void {
    this.stopAutoScroll();
  }

  private startAutoScroll(direction: 'up' | 'down'): void {
    if (this.scrollInterval) return;
    this.scrollInterval = setInterval(() => {
      if (direction === 'up') this.scrollUp();
      else this.scrollDown();
    }, 200);
  }

  private stopAutoScroll(): void {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = undefined;
    }
  }
}
