import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Carregar .env da pasta backend (CommonJS compatible)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configurações do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Validação das variáveis de ambiente
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!');
  console.error('SUPABASE_URL:', SUPABASE_URL ? 'OK' : 'FALTANDO');
  console.error('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'OK' : 'FALTANDO');
  process.exit(1);
}

console.log('🔧 Configurações do Supabase:');
console.log('- SUPABASE_URL:', SUPABASE_URL ? 'Definida' : 'NÃO DEFINIDA');
console.log('- SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Definida' : 'NÃO DEFINIDA');
console.log('- SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? 'Definida (Service Role)' : 'NÃO DEFINIDA');

// Validação adicional da Service Key
if (!SUPABASE_SERVICE_KEY) {
  console.error('⚠️ SUPABASE_SERVICE_KEY não configurada - operações administrativas não funcionarão!');
} else {
  console.log('✅ SUPABASE_SERVICE_KEY configurada corretamente');
}

// Cliente para autenticação de usuários (usa anon key)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Cliente para operações administrativas (usa service key)
export const supabaseAdmin = SUPABASE_SERVICE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null;

// Log do status do supabaseAdmin
console.log('🔧 Status do Supabase Admin:', supabaseAdmin ? '✅ Configurado' : '❌ Não configurado');
