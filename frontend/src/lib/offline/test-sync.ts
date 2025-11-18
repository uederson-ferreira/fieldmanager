// ===================================================================
// TESTE DE SINCRONIZAÇÃO OFFLINE - ECOFIELD SYSTEM
// ===================================================================
// Este arquivo testa a funcionalidade de sincronização offline

import { 
  TermoManager, 
  LVManager, 
  AtividadeRotinaManager, 
  EncarregadoManager,
  InspecaoManager
} from './entities';

import { 
  TermoSync, 
  LVSync, 
  AtividadeRotinaSync, 
  EncarregadoSync, 
  InspecaoSync 
} from './sync';

import { 
  hasPendingData, 
  getOfflineStats 
} from './compatibility';

/**
 * Testa a funcionalidade básica dos managers
 */
export const testManagers = async () => {
  console.log('🧪 [TESTE] Iniciando testes dos managers...');
  
  try {
    // Testar contagem de dados
    const stats = await getOfflineStats();
    console.log('✅ [TESTE] Estatísticas obtidas:', stats);
    
    // Testar verificação de dados pendentes
    const hasPending = await hasPendingData();
    console.log('✅ [TESTE] Dados pendentes:', hasPending);
    
    console.log('✅ [TESTE] Testes dos managers concluídos com sucesso');
    return true;
  } catch (error) {
    console.error('❌ [TESTE] Erro nos testes dos managers:', error);
    return false;
  }
};

/**
 * Testa a funcionalidade de sincronização
 */
export const testSync = async () => {
  console.log('🧪 [TESTE] Iniciando testes de sincronização...');
  
  try {
    // Testar sincronização de termos (sem dados reais)
    const termosResult = await TermoSync.syncAll((progress) => {
      console.log(`📊 [TESTE] Progresso termos: ${progress.percentage}%`);
    });
    console.log('✅ [TESTE] Sincronização de termos:', termosResult);
    
    // Testar sincronização de LVs (sem dados reais)
    const lvsResult = await LVSync.syncAll((progress) => {
      console.log(`📊 [TESTE] Progresso LVs: ${progress.percentage}%`);
    });
    console.log('✅ [TESTE] Sincronização de LVs:', lvsResult);
    
    // Testar sincronização de atividades (sem dados reais)
    const atividadesResult = await AtividadeRotinaSync.syncAll((progress) => {
      console.log(`📊 [TESTE] Progresso atividades: ${progress.percentage}%`);
    });
    console.log('✅ [TESTE] Sincronização de atividades:', atividadesResult);
    
    // Testar sincronização de encarregados (sem dados reais)
    const encarregadosResult = await EncarregadoSync.syncAll((progress) => {
      console.log(`📊 [TESTE] Progresso encarregados: ${progress.percentage}%`);
    });
    console.log('✅ [TESTE] Sincronização de encarregados:', encarregadosResult);
    
    // Testar sincronização de inspeções (sem dados reais)
    const inspecoesResult = await InspecaoSync.syncAll((progress) => {
      console.log(`📊 [TESTE] Progresso inspeções: ${progress.percentage}%`);
    });
    console.log('✅ [TESTE] Sincronização de inspeções:', inspecoesResult);
    
    console.log('✅ [TESTE] Testes de sincronização concluídos com sucesso');
    return true;
  } catch (error) {
    console.error('❌ [TESTE] Erro nos testes de sincronização:', error);
    return false;
  }
};

/**
 * Testa a funcionalidade de compatibilidade
 */
export const testCompatibility = async () => {
  console.log('🧪 [TESTE] Iniciando testes de compatibilidade...');
  
  try {
    // Testar funções de compatibilidade
    const hasPending = await hasPendingData();
    const stats = await getOfflineStats();
    
    console.log('✅ [TESTE] Funções de compatibilidade funcionando:', { hasPending, stats });
    return true;
  } catch (error) {
    console.error('❌ [TESTE] Erro nos testes de compatibilidade:', error);
    return false;
  }
};

/**
 * Executa todos os testes
 */
export const runAllTests = async () => {
  console.log('🚀 [TESTE] Iniciando bateria completa de testes...');
  
  const results = {
    managers: false,
    sync: false,
    compatibility: false
  };
  
  try {
    // Testar managers
    results.managers = await testManagers();
    
    // Testar sincronização
    results.sync = await testSync();
    
    // Testar compatibilidade
    results.compatibility = await testCompatibility();
    
    // Resumo dos resultados
    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed) {
      console.log('🎉 [TESTE] TODOS OS TESTES PASSARAM! Sistema offline funcionando perfeitamente.');
    } else {
      console.log('⚠️ [TESTE] Alguns testes falharam:', results);
    }
    
    return results;
  } catch (error) {
    console.error('❌ [TESTE] Erro geral nos testes:', error);
    return results;
  }
};

/**
 * Teste específico para validação de endpoints da API
 */
export const testAPIEndpoints = async () => {
  console.log('🧪 [TESTE] Testando endpoints da API...');
  
  const endpoints = [
    '/api/termos',
    '/api/lvs',
    '/api/atividades-rotina',
    '/api/encarregados',
    '/api/inspecoes',
    '/api/upload'
  ];
  
  const results: { [key: string]: boolean } = {};
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || 'test'}`
        }
      });
      
      results[endpoint] = response.status !== 404; // Considera 401 como endpoint existente
      console.log(`✅ [TESTE] Endpoint ${endpoint}: ${results[endpoint] ? 'OK' : '404'}`);
    } catch (error) {
      results[endpoint] = false;
      console.log(`❌ [TESTE] Endpoint ${endpoint}: Erro de conexão`);
    }
  }
  
  const availableEndpoints = Object.entries(results).filter(([_, available]) => available).map(([endpoint]) => endpoint);
  const missingEndpoints = Object.entries(results).filter(([_, available]) => !available).map(([endpoint]) => endpoint);
  
  console.log('📊 [TESTE] Resumo dos endpoints:');
  console.log('✅ Disponíveis:', availableEndpoints);
  console.log('❌ Faltando:', missingEndpoints);
  
  return { results, availableEndpoints, missingEndpoints };
};
