import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../Services/Auth/auth-service';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private readonly auth = inject(AuthService);

  /** Cómo se muestra la sesión actual: correo, "Invitado" o null sin sesión. */
  readonly sessionLabel = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return null;
    return user.is_anonymous ? 'Invitado' : (user.email ?? 'Entrenador');
  });

  signOut(): void {
    void this.auth.signOut();
  }
}
