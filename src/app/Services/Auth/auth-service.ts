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

  constructor() {
    // Hidratar la sesión al arrancar (por si el usuario ya estaba logueado).
    void supabase.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
    });

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

  signOut() {
    return supabase.auth.signOut();
  }

  /** access_token de la sesión actual, o null. Pensado para el interceptor. */
  getAccessToken(): string | null {
    return this.session()?.access_token ?? null;
  }
}
