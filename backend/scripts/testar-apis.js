#!/usr/bin/env node

/**
 * Script para testar as APIs do FieldManager v2.0
 * Execução: node scripts/testar-apis.js
 *
 * IMPORTANTE: O backend deve estar rodando (pnpm dev)
 */

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testarAPI(metodo, endpoint, descricao, body = null) {
  try {
    const opcoes = {
      method: metodo,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      opcoes.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, opcoes);
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ ${descricao}`);
      console.log(`   Status: ${response.status}`);
      if (Array.isArray(data)) {
        console.log(`   Resultados: ${data.length} items`);
      } else if (data.data && Array.isArray(data.data)) {
        console.log(`   Resultados: ${data.data.length} items (total: ${data.total || data.data.length})`);
      }
      return { sucesso: true, data };
    } else {
      console.log(`❌ ${descricao}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Erro: ${data.error || data.message}`);
      return { sucesso: false, data };
    }
  } catch (error) {
    console.log(`❌ ${descricao}`);
    console.log(`   Erro: ${error.message}`);
    return { sucesso: false, error };
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TESTE DAS APIs - FIELDMANAGER v2.0');
  console.log('='.repeat(60));
  console.log(`\n📡 URL Base: ${API_URL}\n`);

  let sucessos = 0;
  let falhas = 0;

  // ===================================================================
  // 1. HEALTH CHECK
  // ===================================================================
  console.log('─'.repeat(60));
  console.log('📋 1. HEALTH CHECK & INFO');
  console.log('─'.repeat(60) + '\n');

  let result = await testarAPI('GET', '/', 'Informações da API');
  result.sucesso ? sucessos++ : falhas++;

  result = await testarAPI('GET', '/api/health', 'Health Check');
  result.sucesso ? sucessos++ : falhas++;

  // ===================================================================
  // 2. DOMÍNIOS
  // ===================================================================
  console.log('\n' + '─'.repeat(60));
  console.log('📋 2. DOMÍNIOS');
  console.log('─'.repeat(60) + '\n');

  result = await testarAPI('GET', '/api/dominios', 'Listar todos os domínios');
  const dominios = result.data;
  result.sucesso ? sucessos++ : falhas++;

  if (dominios && dominios.length > 0) {
    const dominioId = dominios[0].id;
    const dominioNome = dominios[0].nome;

    result = await testarAPI('GET', `/api/dominios/${dominioId}`, `Buscar domínio: ${dominioNome}`);
    result.sucesso ? sucessos++ : falhas++;

    result = await testarAPI('GET', `/api/dominios/${dominioId}/modulos`, `Listar módulos do domínio: ${dominioNome}`);
    result.sucesso ? sucessos++ : falhas++;
  }

  // ===================================================================
  // 3. TENANT DOMÍNIOS
  // ===================================================================
  console.log('\n' + '─'.repeat(60));
  console.log('📋 3. DOMÍNIOS POR TENANT');
  console.log('─'.repeat(60) + '\n');

  // Buscar tenant padrão
  const tenantResult = await fetch(`${API_URL}/api/dominios`, {
    headers: { 'Content-Type': 'application/json' }
  });

  if (tenantResult.ok) {
    // Usar ID fixo do tenant padrão ou buscar via query
    // Por enquanto vamos usar um ID de exemplo
    console.log('   ℹ️  Para testar com tenant real, forneça tenant_id\n');
  }

  // ===================================================================
  // 4. MÓDULOS DO SISTEMA
  // ===================================================================
  console.log('─'.repeat(60));
  console.log('📋 4. MÓDULOS DO SISTEMA');
  console.log('─'.repeat(60) + '\n');

  result = await testarAPI('GET', '/api/modulos-sistema', 'Listar todos os módulos (templates)');
  const modulos = result.data;
  result.sucesso ? sucessos++ : falhas++;

  result = await testarAPI('GET', '/api/modulos-sistema?template=true', 'Listar apenas templates');
  result.sucesso ? sucessos++ : falhas++;

  if (modulos && modulos.length > 0) {
    const moduloId = modulos[0].id;
    const moduloNome = modulos[0].nome;

    result = await testarAPI('GET', `/api/modulos-sistema/${moduloId}`, `Buscar módulo: ${moduloNome}`);
    result.sucesso ? sucessos++ : falhas++;

    result = await testarAPI('GET', `/api/modulos-sistema/${moduloId}/perguntas`, `Listar perguntas do módulo: ${moduloNome}`);
    const perguntas = result.data;
    result.sucesso ? sucessos++ : falhas++;

    if (perguntas && perguntas.length > 0) {
      console.log(`   📝 ${perguntas.length} perguntas encontradas`);
    }

    result = await testarAPI('GET', `/api/modulos-sistema/${moduloId}/categorias`, `Listar categorias do módulo: ${moduloNome}`);
    result.sucesso ? sucessos++ : falhas++;
  }

  // ===================================================================
  // 5. EXECUÇÕES
  // ===================================================================
  console.log('\n' + '─'.repeat(60));
  console.log('📋 5. EXECUÇÕES (Inspeções/Checklists)');
  console.log('─'.repeat(60) + '\n');

  result = await testarAPI('GET', '/api/execucoes', 'Listar execuções');
  result.sucesso ? sucessos++ : falhas++;

  result = await testarAPI('GET', '/api/execucoes?limit=10&offset=0', 'Listar execuções (paginado)');
  result.sucesso ? sucessos++ : falhas++;

  // ===================================================================
  // RESUMO
  // ===================================================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(60));
  console.log(`\n✅ Testes bem-sucedidos: ${sucessos}`);
  console.log(`❌ Testes com falha: ${falhas}`);
  console.log(`📊 Total de testes: ${sucessos + falhas}`);
  console.log(`📈 Taxa de sucesso: ${((sucessos / (sucessos + falhas)) * 100).toFixed(1)}%\n`);

  if (falhas === 0) {
    console.log('🎉 Todos os testes passaram! APIs funcionando corretamente!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique os erros acima.\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
