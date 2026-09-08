import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Cliente único de Supabase para toda la app.
 * Se usa tanto en AuthService como en cualquier consumidor que necesite
 * la sesión actual (por ejemplo, el interceptor HTTP).
 */
export const supabase: SupabaseClient = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey
);
