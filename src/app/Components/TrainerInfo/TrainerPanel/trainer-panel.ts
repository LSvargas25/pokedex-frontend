import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { AuthService } from '../../../Services/Auth/auth-service';
import { AuthForm } from '../../Auth/AuthForm/auth-form';
import { TrainerProfile } from '../TrainerProfile/trainer-profile';

type View = 'login' | 'profile' | 'team';

/**
 * Contenedor de la opción "Trainer Info" del menú.
 * Alterna entre login/registro, perfil y selección de equipo con una
 * signal interna, sin Angular Router.
 */
@Component({
  selector: 'app-trainer-panel',
  standalone: true,
  imports: [CommonModule, AuthForm, TrainerProfile],
  templateUrl: './trainer-panel.html',
  styleUrl: './trainer-panel.scss',
})
export class TrainerPanel {
  readonly view = signal<View>('login');

  constructor(private readonly auth: AuthService) {
    let wasLoggedIn = false;
    effect(() => {
      const loggedIn = this.auth.isLoggedIn();
      if (loggedIn && !wasLoggedIn) {
        this.view.set('profile');
      } else if (!loggedIn) {
        this.view.set('login');
      }
      wasLoggedIn = loggedIn;
    });
  }
}
