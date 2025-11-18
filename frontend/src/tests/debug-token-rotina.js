// ===================================================================
// DEBUG TOKEN E ROTINA - ECOFIELD SYSTEM
// ===================================================================

console.log('🔍 [DEBUG] Iniciando teste para debug do token e criação de rotinas...');

const testarTokenERotina = async () => {
  try {
    console.log('🔄 [DEBUG] Testando token e criação de rotina...');
    
    // 1. Verificar token no localStorage
    console.log('🔑 [DEBUG] Verificando token no localStorage...');
    const token = localStorage.getItem('ecofield_auth_token');
    
    if (!token) {
      console.log('❌ [DEBUG] Token não encontrado no localStorage');
      return;
    }
    
    console.log('✅ [DEBUG] Token encontrado:', token.substring(0, 20) + '...');
    console.log('📊 [DEBUG] Tamanho do token:', token.length);
    
    // 2. Verificar se o token é válido (JWT)
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('✅ [DEBUG] Token JWT válido');
        console.log('📊 [DEBUG] Payload do token:', {
          exp: new Date(payload.exp * 1000),
          iat: new Date(payload.iat * 1000),
          email: payload.email || 'N/A'
        });
        
        // Verificar se não expirou
        const now = Math.floor(Date.now() / 1000);
        if (now > payload.exp) {
          console.log('❌ [DEBUG] Token EXPIRADO!');
          return;
        } else {
          console.log('✅ [DEBUG] Token NÃO expirou');
        }
      } else {
        console.log('❌ [DEBUG] Token não é JWT válido');
        return;
      }
    } catch (e) {
      console.log('❌ [DEBUG] Erro ao decodificar token:', e);
      return;
    }
    
    // 3. Testar API com token
    console.log('🌐 [DEBUG] Testando API com token...');
    const response = await fetch('http://localhost:3001/api/rotinas', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data_atividade: '2025-08-28',
        hora_inicio: '16:05:00',
        hora_fim: '17:05:00',
        area_id: '0825e45a-69cc-4049-94e3-b0e8f19eab61',
        atividade: 'TESTE DEBUG TOKEN',
        descricao: 'Rotina de teste para debug do token',
        km_percorrido: 0,
        tma_responsavel_id: '59fbfd49-b8d6-4fb1-aa5c-f2ec0a3ee028',
        encarregado_id: '6c8b1610-92c6-42f7-b804-d7936de5a99f',
        empresa_contratada_id: '98fab2f9-f1de-43b0-b0bb-ef8ae898dfa0',
        status: 'Planejada',
        latitude: null,
        longitude: null
      })
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
testarTokenERotina();
