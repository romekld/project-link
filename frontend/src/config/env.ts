// Type-safe accessors for all VITE_* environment variables.
// Declare new vars here before using them elsewhere in the codebase.
export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  maptilerApiKey: import.meta.env.VITE_MAPTILER_API_KEY as string,
  /** Set VITE_DISABLE_AUTH=true in .env.local to bypass auth guards during local development. */
  disableAuth: import.meta.env.VITE_DISABLE_AUTH === 'true',
  /** Role to use when VITE_DISABLE_AUTH=true. Change VITE_DEV_ROLE in .env to test as a different role. */
  devRole: (import.meta.env.VITE_DEV_ROLE || 'system_admin') as import('@/types').UserRole,
} as const
