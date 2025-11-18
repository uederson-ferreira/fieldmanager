// ===================================================================
// CONFIGURAÇÃO TEMPORÁRIA PARA MIGRAÇÃO
// ===================================================================
// 
// IMPORTANTE: Substitua os valores abaixo pelos dados reais do seu projeto Supabase
// Você pode encontrar essas informações no painel do Supabase:
// 1. Vá para https://supabase.com/dashboard
// 2. Selecione seu projeto
// 3. Vá para Settings > API
// 4. Copie a URL e as chaves

export const config = {
  // URL do seu projeto Supabase (usando variáveis de ambiente)
  supabaseUrl: process.env.VITE_SUPABASE_URL || '',
  
  // Chave anônima (pública)
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || '',
  
  // Chave de serviço (privada - para contornar RLS)
  // IMPORTANTE: Esta chave tem permissões administrativas
  supabaseServiceKey: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
};

// ===================================================================
// INSTRUÇÕES PARA CONFIGURAR:
// ===================================================================
// 
// 1. Vá para https://supabase.com/dashboard
// 2. Selecione seu projeto EcoField
// 3. Vá para Settings > API
// 4. Copie os valores:
//    - Project URL → supabaseUrl
//    - anon public → supabaseAnonKey  
//    - service_role secret → supabaseServiceKey
// 5. Substitua os valores acima
// 6. Execute: pnpm run migrate:perguntas
//
// =================================================================== 