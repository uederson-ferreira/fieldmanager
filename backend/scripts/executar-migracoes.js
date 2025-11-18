#!/usr/bin/env node

/**
 * Script para executar migrações do banco de dados FieldManager
 * Execução: node scripts/executar-migracoes.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

const migrationsDir = path.join(__dirname, '../../sql/migrations');

const migrations = [
  {
    file: '01_criar_sistema_multidominio.sql',
    name: 'Criar estrutura multi-domínio',
    description: 'Cria tabelas: tenants, dominios, modulos_sistema, execucoes, etc.'
  },
  {
    file: '02_popular_dados_iniciais.sql',
    name: 'Popular dados iniciais',
    description: 'Insere 6 domínios, tenant padrão e módulo NR-35'
  }
];

async function executarSQL(sql, nomeArquivo) {
  try {
    console.log(`\n📝 Executando: ${nomeArquivo}...`);

    // Dividir o SQL em statements individuais (removendo comentários)
    const statements = sql
      .split(/;[\s]*\n/)
      .filter(stmt => {
        const trimmed = stmt.trim();
        return trimmed.length > 0 && !trimmed.startsWith('--');
      })
      .map(stmt => stmt.trim() + ';');

    console.log(`   📊 Total de statements: ${statements.length}`);

    // Executar cada statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];

      // Pular statements vazios ou apenas comentários
      if (stmt.trim() === ';' || stmt.trim().startsWith('--')) {
        continue;
      }

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: stmt });

        if (error) {
          // Se não tiver a função exec_sql, tentar executar diretamente
          if (error.message.includes('exec_sql')) {
            console.log('   ⚠️  Usando método alternativo de execução...');
            // Tentar executar via API do Supabase (limitado)
            throw new Error('Método direto não disponível. Execute o SQL manualmente no Supabase SQL Editor.');
          }
          throw error;
        }
      } catch (err) {
        // Ignorar erros "already exists"
        if (err.message && (
          err.message.includes('already exists') ||
          err.message.includes('duplicate key') ||
          err.message.includes('ON CONFLICT')
        )) {
          // Silencioso - é esperado
        } else {
          console.error(`   ❌ Erro no statement ${i + 1}:`, err.message);
        }
      }
    }

    console.log(`   ✅ Concluído!`);
    return true;

  } catch (error) {
    console.error(`   ❌ Erro ao executar ${nomeArquivo}:`, error.message);

    if (error.message.includes('Método direto não disponível')) {
      console.log('\n' + '='.repeat(60));
      console.log('⚠️  ATENÇÃO: Execute manualmente no Supabase');
      console.log('='.repeat(60));
      console.log(`\n1. Acesse: ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/sql`);
      console.log(`2. Copie o conteúdo de: sql/migrations/${nomeArquivo}`);
      console.log('3. Cole no SQL Editor e clique em "Run"\n');
      throw error;
    }

    return false;
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 EXECUTANDO MIGRAÇÕES - FIELDMANAGER');
  console.log('='.repeat(60));
  console.log(`\n📡 Conectando a: ${supabaseUrl}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const migration of migrations) {
    const filePath = path.join(migrationsDir, migration.file);

    console.log('─'.repeat(60));
    console.log(`📄 Migração: ${migration.name}`);
    console.log(`📝 Descrição: ${migration.description}`);
    console.log(`📁 Arquivo: ${migration.file}`);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Arquivo não encontrado: ${filePath}`);
      errorCount++;
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf8');

    try {
      await executarSQL(sql, migration.file);
      successCount++;
    } catch (err) {
      errorCount++;
      console.error(`❌ Falha na migração: ${migration.file}`);

      // Se falhar na execução automática, mostrar instruções manuais
      console.log('\n' + '='.repeat(60));
      console.log('📋 EXECUÇÃO MANUAL NECESSÁRIA');
      console.log('='.repeat(60));
      console.log(`\n⚠️  A API do Supabase não permite execução direta de SQL complexo.`);
      console.log(`\n✅ SOLUÇÃO: Execute manualmente no Supabase SQL Editor\n`);
      console.log(`1. Acesse: https://supabase.com/dashboard/project/${process.env.PROJECT_ID}/sql`);
      console.log(`\n2. Execute as migrações na ordem:\n`);

      migrations.forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.file}`);
        console.log(`      Caminho: sql/migrations/${m.file}`);
      });

      console.log('\n' + '='.repeat(60) + '\n');
      process.exit(1);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DA EXECUÇÃO');
  console.log('='.repeat(60));
  console.log(`✅ Migrações bem-sucedidas: ${successCount}`);
  console.log(`❌ Migrações com erro: ${errorCount}`);
  console.log('='.repeat(60) + '\n');

  if (errorCount === 0) {
    console.log('🎉 Todas as migrações foram executadas com sucesso!\n');

    // Verificar dados criados
    console.log('🔍 Verificando dados criados...\n');

    const checks = [
      { table: 'dominios', label: 'Domínios' },
      { table: 'tenants', label: 'Tenants' },
      { table: 'tenant_dominios', label: 'Domínios ativos' },
      { table: 'modulos_sistema', label: 'Módulos' },
      { table: 'perguntas_modulos', label: 'Perguntas' }
    ];

    for (const check of checks) {
      const { data, error } = await supabase
        .from(check.table)
        .select('id', { count: 'exact', head: true });

      if (error) {
        console.log(`   ❌ ${check.label}: Erro ao verificar`);
      } else {
        console.log(`   ✅ ${check.label}: ${data?.length || 0} registros`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🚀 PRÓXIMOS PASSOS');
    console.log('='.repeat(60));
    console.log('\n1. ✅ Banco de dados configurado');
    console.log('2. ⏳ Implementar APIs backend (/api/dominios, /api/execucoes)');
    console.log('3. ⏳ Implementar DominioContext no frontend');
    console.log('4. ⏳ Criar componentes genéricos (ModuloContainer, ModuloForm)');
    console.log('5. ⏳ Testar sistema com 2 domínios\n');

  } else {
    console.log('⚠️  Algumas migrações falharam. Verifique os erros acima.\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
