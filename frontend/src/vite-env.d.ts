/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY?: string
  readonly VITE_API_URL?: string
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_APP_ENV?: string
  readonly VITE_MAX_FILE_SIZE?: string
  readonly VITE_ALLOWED_FILE_TYPES?: string
  readonly VITE_DEMO_ADMIN_EMAIL?: string
  readonly VITE_DEMO_ADMIN_PASSWORD?: string
  readonly VITE_DEMO_TECNICO_EMAIL?: string
  readonly VITE_DEMO_TECNICO_PASSWORD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}