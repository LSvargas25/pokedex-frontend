import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScreenService {

  private screenState = new BehaviorSubject<boolean>(false);
  screenState$ = this.screenState.asObservable();

  // 🔁 Nuevo Subject para notificar un reinicio completo
  private resetSubject = new Subject<void>();
  reset$ = this.resetSubject.asObservable();

  powerOn() {
    this.screenState.next(true);
  }

  powerOff() {
    this.screenState.next(false);

    //  Emitimos el reset cuando se apaga la Pokedex
    this.resetSubject.next();
  }

  // Si quisieras forzar el reinicio desde otro lugar:
  resetApp() {
    this.resetSubject.next();
  }
}
