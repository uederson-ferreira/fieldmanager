#!/usr/bin/env node

/**
 * Script para executar seed de módulos multi-domínio no Supabase
 * Executa: sql/seeds/02_modulos_multidominio.sql
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vzfcqiwghcivlxbmjdnk.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY não encontrada no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executarSeed() {
  try {
    console.log('📦 [SEED] Iniciando seed de módulos multi-domínio...\n');

    // Ler arquivo SQL
    const sqlPath = path.join(__dirname, '../../sql/seeds/02_modulos_multidominio.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir em comandos individuais (separados por ';')
    // Remover comentários e linhas vazias
    const commands = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n')
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.match(/^SELECT\s+'/i)); // Ignorar SELECTs de info

    console.log(`📋 Total de comandos SQL: ${commands.length}\n`);

    let sucessos = 0;
    let erros = 0;

    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];

      // Identificar tipo de comando
      let tipo = 'UNKNOWN';
      if (command.toUpperCase().includes('INSERT INTO MODULOS_SISTEMA')) tipo = '📦 MÓDULO';
      else if (command.toUpperCase().includes('INSERT INTO PERGUNTAS_MODULOS')) tipo = '❓ PERGUNTAS';

      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: command });

        if (error) {
          // Ignorar erros de "already exists" (idempotência)
          if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
            console.log(`⚠️  ${tipo} - Já existe (pulando)`);
          } else {
            console.error(`❌ ${tipo} - Erro:`, error.message);
            erros++;
          }
        } else {
          console.log(`✅ ${tipo} - OK`);
          sucessos++;
        }
      } catch (err) {
        console.error(`❌ ${tipo} - Exceção:`, err.message);
        erros++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 RESUMO:`);
    console.log(`   ✅ Sucessos: ${sucessos}`);
    console.log(`   ❌ Erros: ${erros}`);
    console.log('='.repeat(50));

    // Verificar módulos criados
    console.log('\n🔍 Verificando módulos no banco...\n');

    const { data: modulos, error: modulosError } = await supabase
      .from('modulos_sistema')
      .select('codigo, nome, template')
      .eq('template', true)
      .order('nome');

    if (modulosError) {
      console.error('❌ Erro ao buscar módulos:', modulosError.message);
    } else {
      console.log(`📦 Total de módulos templates: ${modulos.length}\n`);
      modulos.forEach((mod, idx) => {
        console.log(`   ${idx + 1}. ${mod.nome} (${mod.codigo})`);
      });
    }

    // Verificar total de perguntas
    const { data: totalPerguntas, error: perguntasError } = await supabase
      .from('perguntas_modulos')
      .select('id', { count: 'exact', head: true });

    if (!perguntasError) {
      console.log(`\n❓ Total de perguntas: ${totalPerguntas || 0}`);
    }

    console.log('\n✅ Seed executado com sucesso!\n');

  } catch (error) {
    console.error('\n❌ Erro fatal ao executar seed:', error);
    process.exit(1);
  }
}

// Executar
executarSeed();
