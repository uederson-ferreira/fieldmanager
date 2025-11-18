#!/usr/bin/env node

/**
 * Script para executar migrações SQL no Supabase
 * Uso: node backend/scripts/executar-migrations.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_KEY devem estar definidos no .env');
  process.exit(1);
}

// Cliente com service role key para executar SQL
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executarSQL(descricao, sql) {
  console.log(`\n🔄 ${descricao}...`);

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Tentar via REST API diretamente
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql_query: sql })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      console.log(`✅ ${descricao} - Concluído`);
      return await response.json();
    }

    console.log(`✅ ${descricao} - Concluído`);
    return data;
  } catch (error) {
    console.error(`❌ Erro ao ${descricao.toLowerCase()}:`, error.message);
    throw error;
  }
}

async function verificarTabela(nomeTabela) {
  console.log(`\n🔍 Verificando se tabela "${nomeTabela}" existe...`);

  const { data, error } = await supabase
    .from(nomeTabela)
    .select('*')
    .limit(1);

  if (error && error.code === '42P01') {
    console.log(`⚠️  Tabela "${nomeTabela}" não existe`);
    return false;
  }

  if (error) {
    console.log(`⚠️  Erro ao verificar tabela: ${error.message}`);
    return false;
  }

  console.log(`✅ Tabela "${nomeTabela}" existe`);
  return true;
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 EXECUTANDO MIGRAÇÕES SQL NO SUPABASE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📦 Projeto: ${supabaseUrl}`);

  try {
    // ============================================
    // 1. CRIAR TABELA DE CONFIGURAÇÕES
    // ============================================
    const tabelaConfigExiste = await verificarTabela('configuracoes');

    if (!tabelaConfigExiste) {
      const sqlConfigPath = path.join(__dirname, '../../frontend/sql/migrations/criar_tabela_configuracoes.sql');
      const sqlConfig = fs.readFileSync(sqlConfigPath, 'utf8');

      await executarSQL('Criando tabela de configurações', sqlConfig);
    } else {
      console.log('⏭️  Pulando criação da tabela configuracoes (já existe)');
    }

    // ============================================
    // 2. VERIFICAR E CRIAR PERFIS
    // ============================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 VERIFICANDO PERFIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const { data: perfis, error: perfisError } = await supabase
      .from('perfis')
      .select('*')
      .eq('ativo', true);

    if (perfisError) {
      console.error('❌ Erro ao verificar perfis:', perfisError.message);
    } else {
      console.log(`✅ Encontrados ${perfis.length} perfis ativos`);

      if (perfis.length === 0) {
        console.log('\n🔄 Criando perfis padrão...');

        const sqlPerfis = `
INSERT INTO perfis (nome, descricao, permissoes, ativo) VALUES
  ('Administrador', 'Acesso total ao sistema', '{
    "lvs": ["read", "write", "delete"],
    "termos": ["read", "write", "delete"],
    "rotinas": ["read", "write", "delete"],
    "metas": ["read", "write", "delete"],
    "fotos": ["upload", "view", "delete"],
    "relatorios": ["view", "export", "admin"],
    "usuarios": ["view", "create", "edit", "delete"],
    "perfis": ["view", "create", "edit", "delete"],
    "sistema": ["config", "backup", "logs"],
    "admin": true,
    "demo": false
  }'::jsonb, true),
  ('Supervisor', 'Supervisão e relatórios', '{
    "lvs": ["read"],
    "termos": ["read"],
    "rotinas": ["read"],
    "metas": ["read"],
    "fotos": ["view"],
    "relatorios": ["view", "export"],
    "usuarios": ["view"],
    "perfis": [],
    "sistema": [],
    "admin": false,
    "demo": false
  }'::jsonb, true),
  ('Técnico', 'Execução de atividades', '{
    "lvs": ["read", "write"],
    "termos": ["read", "write"],
    "rotinas": ["read", "write"],
    "metas": ["read"],
    "fotos": ["upload", "view"],
    "relatorios": ["view"],
    "usuarios": [],
    "perfis": [],
    "sistema": [],
    "admin": false,
    "demo": false
  }'::jsonb, true)
ON CONFLICT (nome) DO NOTHING;
        `;

        await executarSQL('Inserindo perfis padrão', sqlPerfis);
      }
    }

    // ============================================
    // 3. VERIFICAR POLÍTICAS RLS
    // ============================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔒 VERIFICANDO POLÍTICAS RLS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const sqlVerificarPolicies = `
SELECT
  tablename,
  policyname
FROM pg_policies
WHERE tablename IN ('configuracoes', 'perfis')
ORDER BY tablename, policyname;
    `;

    // Como não temos RPC configurado, vamos apenas informar
    console.log('ℹ️  Para verificar as políticas RLS, execute no SQL Editor:');
    console.log(sqlVerificarPolicies);

    // ============================================
    // VALIDAÇÃO FINAL
    // ============================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ VALIDAÇÃO FINAL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const { data: configs, error: configsError } = await supabase
      .from('configuracoes')
      .select('*')
      .limit(5);

    if (!configsError && configs) {
      console.log(`✅ Configurações: ${configs.length} registros encontrados`);
      configs.forEach(c => {
        console.log(`   - ${c.chave}: ${c.valor}`);
      });
    }

    const { data: perfisFinais } = await supabase
      .from('perfis')
      .select('nome, descricao')
      .eq('ativo', true);

    if (perfisFinais) {
      console.log(`\n✅ Perfis ativos: ${perfisFinais.length}`);
      perfisFinais.forEach(p => {
        console.log(`   - ${p.nome}: ${p.descricao}`);
      });
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 MIGRAÇÕES CONCLUÍDAS COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERRO DURANTE AS MIGRAÇÕES');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(error);
    process.exit(1);
  }
}

main();
