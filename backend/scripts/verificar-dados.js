#!/usr/bin/env node

/**
 * Script para verificar dados no Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 VERIFICANDO DADOS NO SUPABASE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Verificar configurações
  console.log('📋 CONFIGURAÇÕES:');
  console.log('─────────────────────────────────────────\n');

  const { data: configs, error: configError } = await supabase
    .from('configuracoes')
    .select('*')
    .order('chave');

  if (configError) {
    console.error('❌ Erro ao buscar configurações:', configError.message);
  } else if (!configs || configs.length === 0) {
    console.log('⚠️  Nenhuma configuração encontrada');
    console.log('ℹ️  Vou inserir as configurações padrão...\n');

    // Inserir configurações padrão
    const { error: insertError } = await supabase
      .from('configuracoes')
      .insert([
        { chave: 'app.nome', valor: 'EcoField', descricao: 'Nome da aplicação', tipo: 'string', categoria: 'sistema', editavel: false },
        { chave: 'app.versao', valor: '1.4.0', descricao: 'Versão da aplicação', tipo: 'string', categoria: 'sistema', editavel: false },
        { chave: 'app.ambiente', valor: 'development', descricao: 'Ambiente de execução', tipo: 'string', categoria: 'sistema', editavel: true },
        { chave: 'backup.automatico', valor: 'true', descricao: 'Habilitar backup automático', tipo: 'boolean', categoria: 'sistema', editavel: true },
        { chave: 'backup.frequencia_horas', valor: '24', descricao: 'Frequência de backup em horas', tipo: 'number', categoria: 'sistema', editavel: true },
        { chave: 'notificacoes.email.habilitado', valor: 'false', descricao: 'Habilitar notificações por email', tipo: 'boolean', categoria: 'notificacoes', editavel: true },
        { chave: 'notificacoes.push.habilitado', valor: 'true', descricao: 'Habilitar notificações push', tipo: 'boolean', categoria: 'notificacoes', editavel: true }
      ]);

    if (insertError) {
      console.error('❌ Erro ao inserir configurações:', insertError.message);
    } else {
      console.log('✅ Configurações padrão inseridas com sucesso!\n');

      // Buscar novamente para exibir
      const { data: newConfigs } = await supabase
        .from('configuracoes')
        .select('*')
        .order('chave');

      if (newConfigs) {
        newConfigs.forEach(c => {
          console.log(`✓ ${c.chave}`);
          console.log(`  Valor: ${c.valor}`);
          console.log(`  Tipo: ${c.tipo} | Categoria: ${c.categoria} | Editável: ${c.editavel ? 'Sim' : 'Não'}`);
          console.log(`  Descrição: ${c.descricao}\n`);
        });
      }
    }
  } else {
    console.log(`✅ ${configs.length} configurações encontradas:\n`);
    configs.forEach(c => {
      console.log(`✓ ${c.chave}`);
      console.log(`  Valor: ${c.valor}`);
      console.log(`  Tipo: ${c.tipo} | Categoria: ${c.categoria} | Editável: ${c.editavel ? 'Sim' : 'Não'}`);
      console.log(`  Descrição: ${c.descricao}\n`);
    });
  }

  // Verificar perfis
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 PERFIS DE USUÁRIO:');
  console.log('─────────────────────────────────────────\n');

  const { data: perfis, error: perfisError } = await supabase
    .from('perfis')
    .select('*')
    .eq('ativo', true)
    .order('nome');

  if (perfisError) {
    console.error('❌ Erro ao buscar perfis:', perfisError.message);
  } else {
    console.log(`✅ ${perfis.length} perfis ativos:\n`);
    perfis.forEach(p => {
      console.log(`✓ ${p.nome}`);
      console.log(`  Descrição: ${p.descricao}`);
      console.log(`  ID: ${p.id}\n`);
    });
  }

  // Verificar áreas
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📍 ÁREAS:');
  console.log('─────────────────────────────────────────\n');

  const { data: areas, error: areasError } = await supabase
    .from('areas')
    .select('*')
    .eq('ativo', true)
    .order('nome');

  if (areasError) {
    console.error('❌ Erro ao buscar áreas:', areasError.message);
  } else if (!areas || areas.length === 0) {
    console.log('⚠️  Nenhuma área encontrada');
  } else {
    console.log(`✅ ${areas.length} áreas ativas:\n`);
    areas.forEach(a => {
      console.log(`✓ ${a.nome}`);
      if (a.descricao) console.log(`  Descrição: ${a.descricao}`);
      console.log(`  ID: ${a.id}\n`);
    });
  }

  // Verificar categorias LV
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 CATEGORIAS DE VERIFICAÇÃO:');
  console.log('─────────────────────────────────────────\n');

  const { data: categorias, error: categoriasError } = await supabase
    .from('categorias_lv')
    .select('*')
    .eq('ativo', true)
    .order('nome');

  if (categoriasError) {
    console.error('❌ Erro ao buscar categorias:', categoriasError.message);
  } else if (!categorias || categorias.length === 0) {
    console.log('⚠️  Nenhuma categoria encontrada');
  } else {
    console.log(`✅ ${categorias.length} categorias ativas:\n`);
    categorias.forEach(c => {
      console.log(`✓ ${c.nome}`);
      if (c.descricao) console.log(`  Descrição: ${c.descricao}`);
      console.log(`  ID: ${c.id}\n`);
    });
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ VERIFICAÇÃO CONCLUÍDA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main();
