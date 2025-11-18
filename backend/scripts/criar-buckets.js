#!/usr/bin/env node

/**
 * Script para criar buckets no Supabase Storage
 * Execução: node scripts/criar-buckets.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_KEY devem estar configurados no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const buckets = [
  {
    id: 'execucoes',
    name: 'execucoes',
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  },
  {
    id: 'termos',
    name: 'termos',
    public: true,
    fileSizeLimit: 5242880,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  },
  {
    id: 'acoes-corretivas',
    name: 'acoes-corretivas',
    public: true,
    fileSizeLimit: 5242880,
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  },
  {
    id: 'documentos',
    name: 'documentos',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
  }
];

async function criarBuckets() {
  console.log('🚀 Iniciando criação de buckets...\n');
  console.log(`📡 Conectando a: ${supabaseUrl}\n`);

  let sucessos = 0;
  let erros = 0;

  for (const bucket of buckets) {
    try {
      console.log(`📦 Criando bucket: ${bucket.name}...`);

      const { data, error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Bucket "${bucket.name}" já existe (pulando)`);
        } else {
          console.error(`❌ Erro ao criar "${bucket.name}":`, error.message);
          erros++;
        }
      } else {
        console.log(`✅ Bucket "${bucket.name}" criado com sucesso`);
        sucessos++;
      }

      console.log(`   - Público: ${bucket.public ? 'Sim' : 'Não'}`);
      console.log(`   - Tamanho máximo: ${bucket.fileSizeLimit / 1024 / 1024}MB`);
      console.log(`   - Tipos permitidos: ${bucket.allowedMimeTypes.length} tipos\n`);

    } catch (err) {
      console.error(`❌ Erro inesperado ao criar "${bucket.name}":`, err.message);
      erros++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMO DA CRIAÇÃO');
  console.log('='.repeat(50));
  console.log(`✅ Buckets criados com sucesso: ${sucessos}`);
  console.log(`⚠️  Buckets já existentes: ${buckets.length - sucessos - erros}`);
  console.log(`❌ Erros: ${erros}`);
  console.log('='.repeat(50) + '\n');

  // Listar todos os buckets
  console.log('📋 Listando todos os buckets...\n');
  const { data: allBuckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('❌ Erro ao listar buckets:', listError.message);
  } else {
    console.log('Buckets encontrados:');
    allBuckets.forEach(b => {
      console.log(`  - ${b.name} (${b.public ? 'público' : 'privado'})`);
    });
  }

  console.log('\n✅ Script finalizado!\n');
}

// Executar
criarBuckets().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
