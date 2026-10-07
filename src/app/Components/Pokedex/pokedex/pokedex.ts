import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScreenService } from '../../../Services/Pokedex/On-OFF Service/screen-service';
import { LayoutService } from '../../../Services/Layout/layout';
import { AScreen } from '../../Screens/ascreen/ascreen';
import { Bscreen } from '../../Screens/bscreen/bscreen/bscreen';

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule,AScreen,Bscreen],
  templateUrl: './pokedex.html',
  styleUrls: ['./pokedex.scss']
})
export class Pokedex {
  private screenService = inject(ScreenService);
  private layout = inject(LayoutService);

  isOn = false;

constructor() {
    // Suscribirse al estado de la pantalla
    this.screenService.screenState$.subscribe(state => {
      this.isOn = state;
      this.layout.deviceOn.set(state);
      if (this.isOn) {
        this.startScreen();
      } else {
        this.stopScreen();
      }
    });
  }

  powerOn() {
    this.screenService.powerOn();
  }

  powerOff() {
    this.screenService.powerOff();

  }

  startScreen() {
    console.log('Pantalla encendida');
    // Aquí pones tu lógica de video o animación
  }

  stopScreen() {
    console.log('Pantalla apagada');
    // Aquí pones tu lógica de parar video o animación
  }
}
