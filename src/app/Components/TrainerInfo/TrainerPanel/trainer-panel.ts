import { CommonModule } from '@angular/common';
import { Component, effect, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../Services/Auth/auth-service';
import { DeviceNavigation, safeReturnUrl } from '../../../Services/Navigation/device-navigation';
import { TeamSelect } from '../TeamSelect/team-select';
import { TrainerProfile } from '../TrainerProfile/trainer-profile';

type View = 'profile' | 'team';

export const TEAM_SAVED_NOTICE = 'Equipo guardado ✓';

/**
 * Contenedor de la opción "Trainer Info" del menú (/trainer, protegida por
 * authGuard). Alterna entre perfil y selección de equipo con una signal interna.
 *
 * Con ?returnUrl=/poked (botón "Ir a Trainer Info" del combate) abre directo
 * la selección de equipo y, al guardar, vuelve al combate.
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
  private readonly router = inject(Router);

  private readonly returnUrl: string | null;

  readonly view = signal<View>('profile');
  readonly notice = signal<string | null>(null);

  constructor() {
    const requested = this.router.parseUrl(this.router.url).queryParamMap.get('returnUrl');
    this.returnUrl = requested ? safeReturnUrl(requested, '/') : null;
    if (this.returnUrl) this.view.set('team');

    // Al cerrar sesión desde el perfil se vuelve al menú.
    effect(() => {
      if (!this.auth.isLoggedIn()) {
        this.nav.home();
      }
    });
  }

  openTeam(): void {
    this.notice.set(null);
    this.view.set('team');
  }

  onTeamSaved(): void {
    if (this.returnUrl) {
      void this.router.navigateByUrl(this.returnUrl);
      return;
    }
    // El perfil se vuelve a crear y pide el entrenador de nuevo: muestra el equipo nuevo.
    this.notice.set(TEAM_SAVED_NOTICE);
    this.view.set('profile');
  }
}
