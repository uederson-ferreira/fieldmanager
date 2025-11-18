// ===================================================================
// CONFIGURAÇÃO SUPABASE - ECOFIELD SYSTEM
// Localização: src/lib/supabase.ts
// ===================================================================

import { createClient } from "@supabase/supabase-js";

// API URL para backend
export const API_URL = import.meta.env.VITE_API_URL;

// Configurações do Supabase a partir do arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// 🔒 SEGURANÇA: Service Role Key REMOVIDA do frontend
// Operações administrativas devem ser feitas via backend API
// Apenas ANON_KEY é segura para uso no cliente

// Cliente Supabase principal (apenas para autenticação)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  },
  db: {
    schema: "public",
  },
});

// 🔒 REMOVIDO: supabaseAdmin
// Cliente administrativo não deve existir no frontend
// Todas operações admin devem passar pelo backend via API_URL

// Função utilitária para testar conexão (apenas para autenticação)
export const testConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.getUser();
    return !error;
  } catch (error) {
    console.error("❌ Falha na conexão com Supabase:", error);
    return false;
  }
};

// Função para verificar se o usuário está autenticado
export const isUserAuthenticated = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.getUser();
    return !error;
  } catch {
    return false;
  }
};
