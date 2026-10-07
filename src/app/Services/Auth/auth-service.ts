import { Injectable, computed, signal } from '@angular/core';
import type {
  AuthResponse,
  AuthTokenResponsePassword,
  Session,
  User,
} from '@supabase/supabase-js';
import { supabase } from './supabase-client';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** Sesión actual de Supabase, cacheada de forma síncrona. */
  private readonly session = signal<Session | null>(null);

  /** Usuario autenticado actual, o null si no hay sesión. */
  readonly currentUser = computed<User | null>(() => this.session()?.user ?? null);

  /** true cuando hay una sesión activa. */
  readonly isLoggedIn = computed<boolean>(() => this.session() !== null);

  /** true si la sesión es de un invitado (inicio anónimo de Supabase). */
  readonly isAnonymous = computed<boolean>(() => this.currentUser()?.is_anonymous ?? false);

  /** Se resuelve cuando ya se leyó la sesión guardada; el guard lo espera antes de decidir. */
  readonly ready: Promise<void>;

  constructor() {
    // Hidratar la sesión al arrancar (por si el usuario ya estaba logueado).
    this.ready = supabase.auth
      .getSession()
      .then(({ data }) => this.session.set(data.session))
      .catch(() => this.session.set(null));

    // Mantener la sesión cacheada al día ante cualquier cambio de estado.
    supabase.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
    });
  }

  signUp(email: string, password: string, username: string): Promise<AuthResponse> {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
  }

  signIn(email: string, password: string): Promise<AuthTokenResponsePassword> {
    return supabase.auth.signInWithPassword({ email, password });
  }

  /** Login con Google vía el proveedor OAuth de Supabase; redirige fuera de la app. */
  signInWithGoogle() {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  }

  /** Inicio de sesión anónimo: entra al juego sin cuenta. */
  signInAsGuest() {
    return supabase.auth.signInAnonymously();
  }

  signOut() {
    return supabase.auth.signOut();
  }

  /**
   * Borra solo la sesión de este navegador, sin llamar al servidor.
   * Se usa cuando el backend responde 401 (token vencido o revocado).
   */
  async signOutLocal(): Promise<void> {
    await supabase.auth.signOut({ scope: 'local' });
    this.session.set(null);
  }

  /** access_token de la sesión actual, o null. Pensado para el interceptor. */
  getAccessToken(): string | null {
    return this.session()?.access_token ?? null;
  }
}
