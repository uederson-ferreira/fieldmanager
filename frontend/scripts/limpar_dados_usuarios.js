// ===================================================================
// LIMPAR DADOS DE USUÁRIOS - ECOFIELD
// Localização: scripts/limpar_dados_usuarios.js
// ===================================================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Carregar variáveis do backend
const backendEnvPath = join(process.cwd(), '..', 'backend', '.env');
const backendEnvContent = readFileSync(backendEnvPath, 'utf8');

// Parsear variáveis do backend
const backendEnv = {};
backendEnvContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    backendEnv[key.trim()] = value.trim();
  }
});

const supabaseUrl = backendEnv.SUPABASE_URL;
const supabaseServiceKey = backendEnv.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do backend não configuradas');
  process.exit(1);
}

console.log('✅ [LIMPAR] Variáveis de ambiente carregadas do backend');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function limparDadosUsuarios() {
  console.log('🚀 [LIMPAR] Iniciando limpeza de dados de usuários...\n');

  try {
    // Tabelas para limpar (em ordem de dependência)
    const tabelas = [
      'progresso_metas',
      'metas_atribuicoes', 
      'atividades_rotina',
      'termos_fotos',
      'termos_historico',
      'termos_ambientais',
      'lv_residuos_fotos',
      'lv_residuos',
      'lvs_fotos',
      'lvs'
    ];

    let totalLimpos = 0;

    for (const tabela of tabelas) {
      try {
        console.log(`🔄 [LIMPAR] Limpando tabela ${tabela}...`);
        
        // Contar registros antes
        const { count: antes } = await supabase
          .from(tabela)
          .select('*', { count: 'exact', head: true });

        // Limpar tabela
        const { error } = await supabase
          .from(tabela)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar todos

        if (error) {
          console.error(`❌ [LIMPAR] Erro ao limpar ${tabela}:`, error);
        } else {
          console.log(`✅ [LIMPAR] ${tabela} limpa (${antes || 0} registros removidos)`);
          totalLimpos += antes || 0;
        }
      } catch (error) {
        console.error(`💥 [LIMPAR] Erro inesperado ao limpar ${tabela}:`, error);
      }
    }

    // Limpar também a tabela usuarios antiga
    try {
      console.log(`🔄 [LIMPAR] Limpando tabela usuarios...`);
      
      const { count: antes } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true });

      const { error } = await supabase
        .from('usuarios')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.error(`❌ [LIMPAR] Erro ao limpar usuarios:`, error);
      } else {
        console.log(`✅ [LIMPAR] usuarios limpa (${antes || 0} registros removidos)`);
        totalLimpos += antes || 0;
      }
    } catch (error) {
      console.error(`💥 [LIMPAR] Erro inesperado ao limpar usuarios:`, error);
    }

    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 [LIMPAR] RESUMO FINAL');
    console.log('='.repeat(60));
    console.log(`🗑️ Total de registros removidos: ${totalLimpos}`);
    
    if (totalLimpos > 0) {
      console.log('\n🎉 [LIMPAR] Limpeza concluída com sucesso!');
      console.log('🔄 [LIMPAR] Agora você pode testar o app do zero.');
      console.log('📝 [LIMPAR] Todos os dados de usuários foram removidos.');
      console.log('🔍 [LIMPAR] As estatísticas e LVs devem carregar corretamente agora.');
    } else {
      console.log('\n⚠️ [LIMPAR] Nenhum registro foi removido.');
    }

  } catch (error) {
    console.error('💥 [LIMPAR] Erro crítico:', error);
  }
}

// Executar limpeza
limparDadosUsuarios(); 