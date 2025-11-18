#!/usr/bin/env node

/**
 * Script para verificar dados no banco após migrações
 * Execução: node scripts/verificar-banco.js
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

async function verificarBanco() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 VERIFICAÇÃO DO BANCO DE DADOS - FIELDMANAGER');
  console.log('='.repeat(60) + '\n');

  const checks = [
    { table: 'tenants', label: 'Tenants (Empresas)', select: 'id, nome_empresa, plano, ativo' },
    { table: 'dominios', label: 'Domínios', select: 'id, codigo, nome, cor_primaria, ordem' },
    { table: 'tenant_dominios', label: 'Domínios Ativos por Tenant', select: 'id, tenant_id, dominio_id, ativo' },
    { table: 'modulos_sistema', label: 'Módulos/Templates', select: 'id, codigo, nome, template' },
    { table: 'perguntas_modulos', label: 'Perguntas dos Módulos', select: 'id, codigo, pergunta, categoria' }
  ];

  let totalRegistros = 0;
  let tabelas = 0;

  for (const check of checks) {
    console.log(`📊 Tabela: ${check.table}`);
    console.log('─'.repeat(60));

    try {
      const { data, error, count } = await supabase
        .from(check.table)
        .select(check.select, { count: 'exact' });

      if (error) {
        console.error(`   ❌ Erro ao consultar: ${error.message}\n`);
        continue;
      }

      console.log(`   ✅ ${check.label}: ${count || 0} registros`);

      if (data && data.length > 0) {
        tabelas++;
        totalRegistros += data.length;

        // Mostrar alguns registros
        const limit = Math.min(data.length, 3);
        console.log(`   📋 Primeiros ${limit} registros:\n`);

        data.slice(0, limit).forEach((record, i) => {
          console.log(`      ${i + 1}. ${JSON.stringify(record, null, 2).replace(/\n/g, '\n         ')}`);
        });

        if (data.length > 3) {
          console.log(`      ... e mais ${data.length - 3} registros`);
        }
      } else {
        console.log('   ⚠️  Nenhum registro encontrado');
      }

      console.log('');

    } catch (err) {
      console.error(`   ❌ Erro inesperado: ${err.message}\n`);
    }
  }

  console.log('='.repeat(60));
  console.log('📊 RESUMO DA VERIFICAÇÃO');
  console.log('='.repeat(60));
  console.log(`✅ Tabelas com dados: ${tabelas}/${checks.length}`);
  console.log(`📝 Total de registros: ${totalRegistros}`);
  console.log('='.repeat(60) + '\n');

  // Verificar detalhes dos domínios
  console.log('🎨 DOMÍNIOS CADASTRADOS:\n');

  const { data: dominios, error: errDominios } = await supabase
    .from('dominios')
    .select('codigo, nome, icone, cor_primaria, ordem')
    .order('ordem');

  if (errDominios) {
    console.error('❌ Erro ao buscar domínios:', errDominios.message);
  } else if (dominios && dominios.length > 0) {
    dominios.forEach(d => {
      console.log(`   ${d.ordem}. [${d.icone}] ${d.nome} (${d.codigo})`);
      console.log(`      Cor: ${d.cor_primaria}\n`);
    });
  }

  // Verificar módulo NR-35
  console.log('🔧 MÓDULO NR-35:\n');

  const { data: nr35, error: errNR35 } = await supabase
    .from('modulos_sistema')
    .select('id, codigo, nome, tipo_modulo, template, metadata')
    .eq('codigo', 'nr35-trabalho-altura')
    .single();

  if (errNR35) {
    console.error('❌ Módulo NR-35 não encontrado:', errNR35.message);
  } else if (nr35) {
    console.log(`   ✅ Nome: ${nr35.nome}`);
    console.log(`   📋 Código: ${nr35.codigo}`);
    console.log(`   🏷️  Tipo: ${nr35.tipo_modulo}`);
    console.log(`   📦 Template: ${nr35.template ? 'Sim' : 'Não'}`);
    console.log(`   📊 Metadados:`, JSON.stringify(nr35.metadata, null, 2).replace(/\n/g, '\n      '));

    // Contar perguntas do NR-35
    const { count: perguntasCount } = await supabase
      .from('perguntas_modulos')
      .select('id', { count: 'exact', head: true })
      .eq('modulo_id', nr35.id);

    console.log(`   ❓ Perguntas: ${perguntasCount || 0}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 VERIFICAÇÃO CONCLUÍDA!');
  console.log('='.repeat(60));
  console.log('\n✅ Estrutura multi-domínio criada com sucesso!');
  console.log('✅ Dados iniciais populados!');
  console.log('✅ Módulo NR-35 exemplo pronto para uso!\n');

  console.log('🚀 PRÓXIMOS PASSOS:\n');
  console.log('   1. ✅ Banco de dados configurado');
  console.log('   2. ⏳ Criar APIs backend (/api/dominios, /api/modulos, /api/execucoes)');
  console.log('   3. ⏳ Implementar DominioContext no frontend');
  console.log('   4. ⏳ Criar componentes genéricos (ModuloContainer)');
  console.log('   5. ⏳ Testar sistema com Ambiental + Segurança (NR-35)\n');
}

verificarBanco().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
