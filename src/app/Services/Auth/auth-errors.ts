import type { AuthError } from '@supabase/supabase-js';

type AuthErrorLike = Partial<Pick<AuthError, 'code' | 'status' | 'message'>>;

/** Mensajes en español para los errores de Supabase Auth más comunes. */
const MESSAGES: Record<string, string> = {
  user_already_exists: 'Ese correo ya está registrado. Inicia sesión o usa otro correo.',
  email_exists: 'Ese correo ya está registrado. Inicia sesión o usa otro correo.',
  weak_password: 'La contraseña es muy débil. Usa al menos 6 caracteres y mezcla letras y números.',
  over_request_rate_limit: 'Demasiados intentos. Espera unos minutos y vuelve a probar.',
  over_email_send_rate_limit: 'Demasiados intentos. Espera unos minutos y vuelve a probar.',
  invalid_credentials: 'Correo o contraseña incorrectos.',
  email_not_confirmed: 'Confirma tu correo antes de iniciar sesión (revisa tu bandeja de entrada).',
  validation_failed: 'Revisa el correo: no parece válido.',
  email_address_invalid: 'Revisa el correo: no parece válido.',
  anonymous_provider_disabled:
    'El modo invitado no está disponible ahora. Prueba con Google o con tu correo.',
  signup_disabled: 'El registro está desactivado por ahora.',
};

const GENERIC = 'Algo salió mal. Intenta de nuevo.';

export const translateAuthError = (error: AuthErrorLike | null | undefined): string => {
  if (!error) return GENERIC;
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  if (error.status === 429) return MESSAGES['over_request_rate_limit'];

  // Versiones viejas de GoTrue no mandan `code`: se reconoce por el texto.
  const text = error.message?.toLowerCase() ?? '';
  if (text.includes('already registered')) return MESSAGES['user_already_exists'];
  if (text.includes('password should be')) return MESSAGES['weak_password'];
  if (text.includes('invalid login credentials')) return MESSAGES['invalid_credentials'];
  if (text.includes('email not confirmed')) return MESSAGES['email_not_confirmed'];
  if (text.includes('rate limit')) return MESSAGES['over_request_rate_limit'];
  if (text.includes('failed to fetch') || text.includes('network')) {
    return 'No hay conexión con el servidor de cuentas. Revisa tu internet e intenta de nuevo.';
  }
  return GENERIC;
};
