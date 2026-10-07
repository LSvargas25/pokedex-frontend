import { Injectable, computed, signal } from '@angular/core';

/**
 * Modo teléfono: en un celular vertical el Pokédex entero escalado deja los
 * controles en ~18 px. Con el dispositivo encendido, las pantallas A y B se
 * "acoplan" fuera del lienzo escalado y se ven a tamaño real (ver PhoneDock).
 */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  /** Celular vertical (lo decide App con el tamaño del viewport). */
  readonly phone = signal(false);
  /** El Pokédex está encendido. */
  readonly deviceOn = signal(false);

  /** Pantallas acopladas a tamaño real y Pokédex oculto. */
  readonly docked = computed(() => this.phone() && this.deviceOn());
}
