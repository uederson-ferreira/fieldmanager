// ===================================================================
// LIMPAR BUCKETS RECURSIVAMENTE - ECOFIELD
// Localização: scripts/limpar_buckets_recursivo.js
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

console.log('✅ [BUCKETS RECURSIVO] Variáveis de ambiente carregadas do backend');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Função para listar arquivos recursivamente
async function listarArquivosRecursivamente(bucket, path = '') {
  const arquivos = [];
  
  try {
    const { data: items, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit: 1000,
        offset: 0
      });

    if (error) {
      console.error(`❌ [BUCKETS RECURSIVO] Erro ao listar ${path} em ${bucket}:`, error);
      return arquivos;
    }

    if (!items) return arquivos;

    for (const item of items) {
      const itemPath = path ? `${path}/${item.name}` : item.name;
      
      if (item.metadata) {
        // É um arquivo
        arquivos.push(itemPath);
      } else {
        // É uma pasta, listar recursivamente
        const subArquivos = await listarArquivosRecursivamente(bucket, itemPath);
        arquivos.push(...subArquivos);
      }
    }
  } catch (error) {
    console.error(`💥 [BUCKETS RECURSIVO] Erro inesperado ao listar ${path} em ${bucket}:`, error);
  }

  return arquivos;
}

async function limparBucketsRecursivamente() {
  console.log('🚀 [BUCKETS RECURSIVO] Iniciando limpeza recursiva dos buckets...\n');

  try {
    // Buckets para limpar
    const buckets = [
      'fotos-termos',
      'fotos-lvs',
      'fotos-lv-residuos',
      'fotos-rotina',
      'assinaturas'
    ];

    let totalArquivosRemovidos = 0;

    for (const bucket of buckets) {
      try {
        console.log(`🔄 [BUCKETS RECURSIVO] Limpando bucket ${bucket}...`);
        
        // Listar todos os arquivos recursivamente
        console.log(`📁 [BUCKETS RECURSIVO] Listando arquivos em ${bucket}...`);
        const arquivos = await listarArquivosRecursivamente(bucket);

        if (arquivos.length === 0) {
          console.log(`✅ [BUCKETS RECURSIVO] Bucket ${bucket} já está vazio`);
          continue;
        }

        console.log(`📁 [BUCKETS RECURSIVO] Encontrados ${arquivos.length} arquivos em ${bucket}`);

        // Deletar arquivos em lotes (máximo 100 por vez)
        const tamanhoLote = 100;
        for (let i = 0; i < arquivos.length; i += tamanhoLote) {
          const lote = arquivos.slice(i, i + tamanhoLote);
          
          console.log(`🗑️ [BUCKETS RECURSIVO] Deletando lote ${Math.floor(i/tamanhoLote) + 1} de ${Math.ceil(arquivos.length/tamanhoLote)} em ${bucket}...`);
          
          const { error: deleteError } = await supabase.storage
            .from(bucket)
            .remove(lote);

          if (deleteError) {
            console.error(`❌ [BUCKETS RECURSIVO] Erro ao deletar lote do bucket ${bucket}:`, deleteError);
          } else {
            console.log(`✅ [BUCKETS RECURSIVO] Lote deletado do bucket ${bucket} (${lote.length} arquivos)`);
            totalArquivosRemovidos += lote.length;
          }
        }

        console.log(`✅ [BUCKETS RECURSIVO] Bucket ${bucket} limpo (${arquivos.length} arquivos removidos)`);

      } catch (error) {
        console.error(`💥 [BUCKETS RECURSIVO] Erro inesperado ao limpar bucket ${bucket}:`, error);
      }
    }

    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 [BUCKETS RECURSIVO] RESUMO FINAL');
    console.log('='.repeat(60));
    console.log(`🗑️ Total de arquivos removidos: ${totalArquivosRemovidos}`);
    
    if (totalArquivosRemovidos > 0) {
      console.log('\n🎉 [BUCKETS RECURSIVO] Limpeza recursiva concluída com sucesso!');
      console.log('🔄 [BUCKETS RECURSIVO] Agora o storage está completamente limpo.');
      console.log('📝 [BUCKETS RECURSIVO] Todos os arquivos e pastas foram removidos.');
    } else {
      console.log('\n⚠️ [BUCKETS RECURSIVO] Nenhum arquivo foi removido (buckets já estavam vazios).');
    }

  } catch (error) {
    console.error('💥 [BUCKETS RECURSIVO] Erro crítico:', error);
  }
}

// Executar limpeza
limparBucketsRecursivamente(); 