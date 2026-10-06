import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { Pokedex } from './Components/Pokedex/pokedex/pokedex';
import { Ligths } from './Components/ligths/ligths/ligths';
import { ServerWakeup } from './Components/ServerWakeup/server-wakeup';
import { environment } from '../environments/environment';

/**
 * El Pokédex está maquetado con posiciones absolutas en px. En vez de reescribirlo,
 * se dibuja dentro de un "lienzo" de tamaño fijo que se escala para caber en pantalla.
 * En celular vertical las dos mitades se apilan para que el escalado sea menor.
 */
const SIDE_BY_SIDE = { width: 1260, height: 960 };
const STACKED = { width: 680, height: 1830 };
const STACK_BELOW_PX = 700;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Pokedex, Ligths, ServerWakeup],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Pokédex');

  private readonly viewport = signal(this.measure());

  protected readonly stacked = computed(() => {
    const { width, height } = this.viewport();
    return width < STACK_BELOW_PX && height > width;
  });

  protected readonly canvas = computed(() => (this.stacked() ? STACKED : SIDE_BY_SIDE));

  protected readonly scale = computed(() => Math.min(1, this.viewport().width / this.canvas().width));

  constructor() {
    // Despierta el backend apenas carga la app (Render se duerme sin tráfico).
    inject(HttpClient)
      .get(`${environment.apiBaseUrl}/health`)
      .subscribe({ error: () => undefined });
  }

  @HostListener('window:resize')
  protected onResize(): void {
    this.viewport.set(this.measure());
  }

  private measure() {
    return { width: document.documentElement.clientWidth, height: window.innerHeight };
  }
}
