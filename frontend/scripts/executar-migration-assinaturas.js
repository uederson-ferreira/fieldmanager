#!/usr/bin/env node

/**
 * Script para executar migration da tabela de assinaturas digitais
 *
 * Este script executa o SQL de criação da tabela assinaturas_execucoes
 * com todas as políticas RLS, índices e funções necessárias.
 *
 * Execução: node scripts/executar-migration-assinaturas.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Obter __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do backend
dotenv.config({ path: path.join(__dirname, '../../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias');
  console.error('   Verifique se as variáveis estão no arquivo backend/.env');
  process.exit(1);
}

// Criar cliente com service key (bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executarMigration() {
  console.log('🚀 [MIGRATION] Executando migration de assinaturas digitais...\n');

  try {
    // Verificar se a tabela já existe
    console.log('🔍 Verificando se tabela já existe...');
    const { data: tables, error: checkError } = await supabase
      .from('assinaturas_execucoes')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('⚠️  Tabela assinaturas_execucoes já existe!');
      console.log('   Migration já foi executada.\n');
      return;
    }

    console.log('📝 Tabela não existe. Instruções para criar:\n');
    console.log('=' .repeat(70));
    console.log('EXECUTE MANUALMENTE NO SUPABASE DASHBOARD:');
    console.log('=' .repeat(70));
    console.log('\n1. Acesse: https://supabase.com/dashboard/project/ysvyfdzczfxwhuyajzre');
    console.log('2. Vá em: SQL Editor');
    console.log('3. Clique em: New Query');
    console.log('4. Cole o conteúdo do arquivo:');
    console.log('   sql/migrations/03_criar_tabela_assinaturas.sql');
    console.log('5. Clique em: Run');
    console.log('\nApós executar, rode este script novamente para verificar.\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  }
}

// Executar
executarMigration();
