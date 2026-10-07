import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../Services/Auth/auth-service';
import { translateAuthError } from '../../../Services/Auth/auth-errors';
import { safeReturnUrl } from '../../../Services/Navigation/device-navigation';

type Mode = 'login' | 'register';

/** Clave donde se guarda el returnUrl mientras el navegador va y vuelve de Google. */
export const OAUTH_RETURN_URL_KEY = 'pokedex.returnUrl';

/**
 * Pantalla de login (/login). "Jugar como invitado" es la opción principal para
 * visitantes; también hay Google y correo + contraseña. Al iniciar sesión vuelve
 * a la ruta que pidió el guard (?returnUrl=...).
 */
@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-form.html',
  styleUrl: './auth-form.scss',
})
export class AuthForm {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly mode = signal<Mode>('login');
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly infoMsg = signal<string | null>(null);

  /** A dónde ir después del login; null si se llegó al login directamente. */
  readonly returnUrl: string | null;

  username = '';
  email = '';
  password = '';

  constructor() {
    const requested = this.router.parseUrl(this.router.url).queryParamMap.get('returnUrl');
    this.returnUrl = requested ? safeReturnUrl(requested) : null;

    // Con sesión (cuenta, invitado o ya logueado de antes) se sale del login.
    effect(() => {
      if (this.auth.isLoggedIn()) {
        void this.router.navigateByUrl(this.returnUrl ?? '/trainer');
      }
    });
  }

  toggleMode(): void {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
    this.errorMsg.set(null);
    this.infoMsg.set(null);
  }

  async playAsGuest(): Promise<void> {
    await this.run(async () => {
      const { error } = await this.auth.signInAsGuest();
      if (error) this.errorMsg.set(translateAuthError(error));
    });
  }

  async continueWithGoogle(): Promise<void> {
    await this.run(async () => {
      // Google redirige fuera de la app; al volver, App retoma este returnUrl.
      try {
        sessionStorage.setItem(OAUTH_RETURN_URL_KEY, this.returnUrl ?? '/trainer');
      } catch {
        // sin sessionStorage (modo privado estricto): se vuelve al menú
      }
      const { error } = await this.auth.signInWithGoogle();
      if (error) this.errorMsg.set(translateAuthError(error));
    });
  }

  async submit(): Promise<void> {
    const email = this.email.trim();
    const password = this.password;
    const username = this.username.trim();
    const registering = this.mode() === 'register';

    if (!email || !password || (registering && !username)) {
      this.errorMsg.set('Completa todos los campos.');
      return;
    }

    await this.run(async () => {
      if (registering) {
        const { data, error } = await this.auth.signUp(email, password, username);
        if (error) {
          this.errorMsg.set(translateAuthError(error));
          return;
        }
        // Con confirmación de correo activa, Supabase no avisa que el correo ya
        // existe: devuelve un usuario sin identidades.
        if (data.user && data.user.identities?.length === 0) {
          this.errorMsg.set(translateAuthError({ code: 'user_already_exists' }));
          return;
        }
        if (!data.session) {
          this.infoMsg.set('Revisa tu correo para confirmar la cuenta.');
          this.mode.set('login');
        }
        // Con sesión, el effect del constructor entra directo.
      } else {
        const { error } = await this.auth.signIn(email, password);
        if (error) {
          this.errorMsg.set(translateAuthError(error));
          return;
        }
      }
      this.password = '';
    });
  }

  /** Ejecuta una acción de auth con estado de carga; los errores inesperados se traducen. */
  private async run(action: () => Promise<void>): Promise<void> {
    if (this.loading()) return;
    this.errorMsg.set(null);
    this.infoMsg.set(null);
    this.loading.set(true);
    try {
      await action();
    } catch (e) {
      this.errorMsg.set(translateAuthError(e instanceof Error ? { message: e.message } : null));
    } finally {
      this.loading.set(false);
    }
  }
}
