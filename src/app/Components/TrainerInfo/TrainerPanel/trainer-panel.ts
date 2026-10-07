import { CommonModule } from '@angular/common';
import { Component, effect, signal, inject } from '@angular/core';
import { AuthService } from '../../../Services/Auth/auth-service';
import { DeviceNavigation } from '../../../Services/Navigation/device-navigation';
import { TeamSelect } from '../TeamSelect/team-select';
import { TrainerProfile } from '../TrainerProfile/trainer-profile';

type View = 'profile' | 'team';

/**
 * Contenedor de la opción "Trainer Info" del menú (/trainer, protegida por
 * authGuard). Alterna entre perfil y selección de equipo con una signal interna.
 */
@Component({
  selector: 'app-trainer-panel',
  standalone: true,
  imports: [CommonModule, TrainerProfile, TeamSelect],
  templateUrl: './trainer-panel.html',
  styleUrl: './trainer-panel.scss',
})
export class TrainerPanel {
  private readonly auth = inject(AuthService);
  private readonly nav = inject(DeviceNavigation);

  readonly view = signal<View>('profile');

  constructor() {
    // Al cerrar sesión desde el perfil se vuelve al menú.
    effect(() => {
      if (!this.auth.isLoggedIn()) {
        this.nav.home();
      }
    });
  }
}
