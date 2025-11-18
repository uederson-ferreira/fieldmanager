// ===================================================================
// LIMPAR BUCKETS DE STORAGE - ECOFIELD
// Localização: scripts/limpar_buckets.js
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

console.log('✅ [BUCKETS] Variáveis de ambiente carregadas do backend');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function limparBuckets() {
  console.log('🚀 [BUCKETS] Iniciando limpeza dos buckets de storage...\n');

  try {
    // Buckets para limpar
    const buckets = [
      'fotos-termos',
      'fotos-lvs',
      'fotos-lv-residuos',
      'assinaturas'
    ];

    let totalArquivosRemovidos = 0;

    for (const bucket of buckets) {
      try {
        console.log(`🔄 [BUCKETS] Limpando bucket ${bucket}...`);
        
        // Listar todos os arquivos no bucket
        const { data: arquivos, error: listError } = await supabase.storage
          .from(bucket)
          .list('', {
            limit: 1000,
            offset: 0
          });

        if (listError) {
          console.error(`❌ [BUCKETS] Erro ao listar arquivos do bucket ${bucket}:`, listError);
          continue;
        }

        if (!arquivos || arquivos.length === 0) {
          console.log(`✅ [BUCKETS] Bucket ${bucket} já está vazio`);
          continue;
        }

        console.log(`📁 [BUCKETS] Encontrados ${arquivos.length} arquivos em ${bucket}`);

        // Criar lista de caminhos para deletar
        const caminhosParaDeletar = arquivos.map(arquivo => arquivo.name);

        // Deletar arquivos em lotes (máximo 100 por vez)
        const tamanhoLote = 100;
        for (let i = 0; i < caminhosParaDeletar.length; i += tamanhoLote) {
          const lote = caminhosParaDeletar.slice(i, i + tamanhoLote);
          
          const { error: deleteError } = await supabase.storage
            .from(bucket)
            .remove(lote);

          if (deleteError) {
            console.error(`❌ [BUCKETS] Erro ao deletar lote do bucket ${bucket}:`, deleteError);
          } else {
            console.log(`✅ [BUCKETS] Lote deletado do bucket ${bucket} (${lote.length} arquivos)`);
            totalArquivosRemovidos += lote.length;
          }
        }

        console.log(`✅ [BUCKETS] Bucket ${bucket} limpo (${arquivos.length} arquivos removidos)`);

      } catch (error) {
        console.error(`💥 [BUCKETS] Erro inesperado ao limpar bucket ${bucket}:`, error);
      }
    }

    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 [BUCKETS] RESUMO FINAL');
    console.log('='.repeat(60));
    console.log(`🗑️ Total de arquivos removidos: ${totalArquivosRemovidos}`);
    
    if (totalArquivosRemovidos > 0) {
      console.log('\n🎉 [BUCKETS] Limpeza dos buckets concluída com sucesso!');
      console.log('🔄 [BUCKETS] Agora o storage também está limpo.');
      console.log('📝 [BUCKETS] Todos os arquivos de fotos foram removidos.');
    } else {
      console.log('\n⚠️ [BUCKETS] Nenhum arquivo foi removido (buckets já estavam vazios).');
    }

  } catch (error) {
    console.error('💥 [BUCKETS] Erro crítico:', error);
  }
}

// Executar limpeza
limparBuckets(); 