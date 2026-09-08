import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../Services/Auth/auth-service';

type Mode = 'login' | 'register';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-form.html',
  styleUrl: './auth-form.scss',
})
export class AuthForm {
  readonly mode = signal<Mode>('login');
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly infoMsg = signal<string | null>(null);

  username = '';
  email = '';
  password = '';

  constructor(private readonly auth: AuthService) {}

  toggleMode(): void {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
    this.errorMsg.set(null);
    this.infoMsg.set(null);
  }

  async submit(): Promise<void> {
    if (this.loading()) {
      return;
    }
    this.errorMsg.set(null);
    this.infoMsg.set(null);

    const email = this.email.trim();
    const password = this.password;
    const username = this.username.trim();
    const registering = this.mode() === 'register';

    if (!email || !password || (registering && !username)) {
      this.errorMsg.set('Completa todos los campos.');
      return;
    }

    this.loading.set(true);
    try {
      if (registering) {
        const { data, error } = await this.auth.signUp(email, password, username);
        if (error) {
          this.errorMsg.set(error.message);
          return;
        }
        if (!data.session) {
          // Supabase con confirmación de email activada: aún no hay sesión.
          this.infoMsg.set(
            'Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.'
          );
          this.mode.set('login');
        }
        // Si hay sesión, el contenedor detecta isLoggedIn y pasa al perfil.
      } else {
        const { error } = await this.auth.signIn(email, password);
        if (error) {
          this.errorMsg.set(error.message);
          return;
        }
      }
      this.password = '';
    } catch (e) {
      this.errorMsg.set(e instanceof Error ? e.message : 'Error inesperado.');
    } finally {
      this.loading.set(false);
    }
  }
}
