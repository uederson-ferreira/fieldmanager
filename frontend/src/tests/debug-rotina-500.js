// ===================================================================
// DEBUG ERRO 500 ROTINA - ECOFIELD SYSTEM
// ===================================================================

console.log('🔍 [DEBUG] Iniciando teste para debug do erro 500 na criação de rotinas...');

const testarCriacaoRotina = async () => {
  try {
    console.log('🔄 [DEBUG] Testando criação de rotina...');
    
    // 1. Verificar se a tabela existe
    console.log('🔍 [DEBUG] Verificando se a tabela atividades_rotina existe...');
    const checkTableResponse = await fetch('http://localhost:3001/api/rotinas', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 [DEBUG] Status da verificação da tabela:', checkTableResponse.status);
    
    if (checkTableResponse.ok) {
      console.log('✅ [DEBUG] Tabela atividades_rotina existe e está acessível');
    } else {
      console.log('❌ [DEBUG] Tabela atividades_rotina não existe ou não está acessível');
      return;
    }
    
    // 2. Dados de teste para rotina (usando IDs reais do seu sistema)
    const dadosRotina = {
      data_atividade: '2025-08-28',
      hora_inicio: '16:05:00',
      hora_fim: '17:05:00',
      area_id: '0825e45a-69cc-4049-94e3-b0e8f19eab61', // ID real da área
      atividade: 'TESTE DEBUG',
      descricao: 'Rotina de teste para debug',
      km_percorrido: 0,
      tma_responsavel_id: '59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028', // ID real do usuário
      encarregado_id: '6c8b1610-92c6-42f7-b804-d7936de5a99f', // ID real do encarregado
      empresa_contratada_id: '98fab2f9-f1de-43b0-b0bb-ef8ae898dfa0', // ID real da empresa
      status: 'Planejada',
      latitude: null,
      longitude: null
    };
    
    console.log('📊 [DEBUG] Dados da rotina:', dadosRotina);
    
    // 3. Testar API de rotinas
    const response = await fetch('http://localhost:3001/api/rotinas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosRotina)
    });
    
    console.log('📊 [DEBUG] Status da resposta:', response.status, response.statusText);
    console.log('📊 [DEBUG] Headers da resposta:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ [DEBUG] Rotina criada com sucesso:', data);
    } else {
      console.log('❌ [DEBUG] Erro na criação da rotina:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('📄 [DEBUG] Resposta de erro:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.log('📄 [DEBUG] Erro JSON:', errorJson);
      } catch (e) {
        console.log('📄 [DEBUG] Erro não é JSON válido');
      }
    }
    
  } catch (error) {
    console.error('❌ [DEBUG] Erro no teste:', error);
  }
};

// Executar teste
testarCriacaoRotina();
