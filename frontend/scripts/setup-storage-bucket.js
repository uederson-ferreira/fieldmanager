#!/usr/bin/env node

/**
 * Script para criar bucket de fotos de execuções no Supabase Storage
 *
 * Este script cria o bucket 'execucoes-fotos' com políticas públicas de leitura
 * e escrita autenticada.
 *
 * Execução: node scripts/setup-storage-bucket.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// IMPORTANTE: Usar SERVICE_KEY, não ANON_KEY, para bypass de RLS
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_KEY são obrigatórias');
  console.error('   A SERVICE_KEY é necessária para criar buckets (bypass de RLS)');
  console.error('   Verifique se a variável está no arquivo .env');
  process.exit(1);
}

// Criar cliente com service key (bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Nome do bucket (alinhado com o SQL)
const BUCKET_NAME = 'execucoes';

async function setupBucket() {
  console.log('🪣 [STORAGE] Configurando bucket de fotos de execuções...\n');

  try {
    // 1. Verificar se o bucket já existe
    console.log(`🔍 Verificando se bucket '${BUCKET_NAME}' existe...`);
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError.message);
      process.exit(1);
    }

    const bucketExiste = buckets.some(b => b.name === BUCKET_NAME);

    if (bucketExiste) {
      console.log(`✅ Bucket '${BUCKET_NAME}' já existe!\n`);
    } else {
      console.log(`📦 Criando bucket '${BUCKET_NAME}'...`);

      // 2. Criar bucket público
      // Nota: Usando service key para bypass de RLS
      const { data: bucket, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true, // Acesso público para leitura
        fileSizeLimit: 5242880, // 5MB por arquivo (alinhado com SQL)
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      });

      if (createError) {
        console.error('❌ Erro ao criar bucket:', createError.message);
        process.exit(1);
      }

      console.log('✅ Bucket criado com sucesso!\n');
    }

    // 3. Exibir informações do bucket
    console.log('📋 Informações do bucket:');
    console.log(`   Nome: ${BUCKET_NAME}`);
    console.log(`   URL: ${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}`);
    console.log(`   Acesso: Público (leitura) / Autenticado (escrita)`);
    console.log(`   Tamanho máximo: 5MB por arquivo`);
    console.log(`   Tipos permitidos: JPEG, JPG, PNG, WebP\n`);

    // 4. Testar acesso
    console.log('🧪 Testando acesso ao bucket...');
    const { data: testList, error: testError } = await supabase.storage.from(BUCKET_NAME).list();

    if (testError) {
      console.error('❌ Erro ao acessar bucket:', testError.message);
      console.log('\n⚠️  O bucket foi criado, mas há problemas de acesso.');
      console.log('   Verifique as políticas RLS no Supabase Dashboard:\n');
      console.log('   1. Acesse: Storage → Policies');
      console.log(`   2. Adicione política para '${BUCKET_NAME}':\n`);
      console.log('   Política de SELECT (leitura pública):');
      console.log('   - Policy name: "Public read access"');
      console.log('   - Allowed operation: SELECT');
      console.log('   - Target roles: public');
      console.log('   - USING expression: true\n');
      console.log('   Política de INSERT (upload autenticado):');
      console.log('   - Policy name: "Authenticated upload"');
      console.log('   - Allowed operation: INSERT');
      console.log('   - Target roles: authenticated');
      console.log('   - WITH CHECK expression: true\n');
    } else {
      console.log('✅ Acesso ao bucket confirmado!\n');
    }

    console.log('🎉 Setup concluído!\n');
    console.log('📝 Próximos passos:');
    console.log('   1. As políticas RLS já foram criadas pelo SQL (sql/setup/01_criar_buckets_storage.sql)');
    console.log('   2. Se necessário, execute o SQL no Supabase Dashboard para garantir as políticas');
    console.log('   3. Testar upload de foto no FormularioDinamico');
    console.log('   4. Verificar URLs públicas das fotos enviadas\n');
    console.log('💡 Dica: Se o bucket não foi criado, execute o SQL diretamente no Supabase Dashboard:');
    console.log('   sql/setup/01_criar_buckets_storage.sql\n');

  } catch (error) {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  }
}

// Executar
setupBucket();
