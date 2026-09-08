import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

interface PokedScreenState {
  aScreenContent: string | null;
  bScreenContent: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PokedService {
  // Estado inicial: nada visible
  private state = new BehaviorSubject<PokedScreenState>({
    aScreenContent: null,
    bScreenContent: null
  });

  // Observable público
  state$ = this.state.asObservable();

  // Emite cuando otra pantalla (ej. la B durante la batalla) pide volver al menú principal.
  private menuSubject = new Subject<void>();
  menu$ = this.menuSubject.asObservable();

  // Cambiar contenido de ambas pantallas
  setScreens(aScreenContent: string | null, bScreenContent: string | null) {
    this.state.next({ aScreenContent, bScreenContent });
  }

  // Cambiar solo una pantalla
  setAScreen(content: string | null) {
    const current = this.state.value;
    this.state.next({ ...current, aScreenContent: content });
  }

  setBScreen(content: string | null) {
    const current = this.state.value;
    this.state.next({ ...current, bScreenContent: content });
  }

  // Resetear ambas pantallas
  reset() {
    this.state.next({ aScreenContent: null, bScreenContent: null });
  }

  // Pedir volver al menú principal (lo maneja AScreen con su goBack()).
  goToMenu() {
    this.menuSubject.next();
  }
}
