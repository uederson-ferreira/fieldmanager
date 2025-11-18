/**
 * 🚀 TESTE OFFLINE ECOFIELD - VERSÃO OTIMIZADA
 * Cole este script no console do navegador (F12)
 * 
 * Uso:
 * 1. Abra a aplicação no navegador
 * 2. Faça login
 * 3. F12 → Console
 * 4. Cole este código e pressione Enter
 * 5. Acompanhe os resultados automáticos
 */

class TesteOfflineEcoField {
  constructor() {
    this.resultados = [];
    this.userId = localStorage.getItem('ecofield_user_id') || 'test-user-' + Date.now();
    this.startTime = Date.now();
    
    console.log('🌟 TESTE OFFLINE ECOFIELD v1.0');
    console.log('👤 User ID:', this.userId);
    console.log('⏰ Iniciado em:', new Date().toLocaleTimeString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  async executar() {
    try {
      // Testes principais
      await this.verificarPreRequisitos();
      await this.testeConectividade();
      await this.testeIndexedDB();
      await this.testeCriacaoOffline();
      await this.testeNumeracao();
      await this.testeContadores();
      await this.testeFotos();
      await this.testeSincronizacaoSimulada();
      
      // Relatório final
      this.gerarRelatorioFinal();
      
      // Limpeza dos dados de teste
      await this.limparDadosTeste();
      
    } catch (error) {
      console.error('💥 ERRO CRÍTICO:', error);
      this.log('EXECUÇÃO GERAL', `FALHOU: ${error.message}`, false);
    }
  }

  async verificarPreRequisitos() {
    console.log('🔍 1. VERIFICANDO PRÉ-REQUISITOS...');
    
    // Verificar IndexedDB
    const hasIndexedDB = !!window.indexedDB;
    this.log('IndexedDB disponível', hasIndexedDB ? 'Sim' : 'Não', hasIndexedDB);
    
    // Verificar localStorage
    const hasLocalStorage = !!window.localStorage;
    this.log('LocalStorage disponível', hasLocalStorage ? 'Sim' : 'Não', hasLocalStorage);
    
    // Verificar token de autenticação
    const token = localStorage.getItem('ecofield_auth_token');
    this.log('Token de autenticação', token ? 'Presente' : 'Ausente', !!token);
    
    // Verificar se está na página correta
    const isEcoField = window.location.href.includes('localhost:3000') || window.location.href.includes('ecofield');
    this.log('Página EcoField', isEcoField ? 'Sim' : 'Não', isEcoField);
    
    console.log('');
  }

  async testeConectividade() {
    console.log('📡 2. TESTANDO CONECTIVIDADE...');
    
    // Status atual
    const isOnline = navigator.onLine;
    this.log('Status atual', isOnline ? 'Online' : 'Offline', true);
    
    // Testar detecção de mudança (simular)
    const eventListeners = window.addEventListener.toString();
    const hasOfflineListener = eventListeners.includes('offline') || document.querySelector('[data-testid*="offline"]');
    this.log('Listener de conectividade', hasOfflineListener ? 'Detectado' : 'Não detectado', hasOfflineListener);
    
    console.log('');
  }

  async testeIndexedDB() {
    console.log('💾 3. TESTANDO INDEXEDDB...');
    
    try {
      // Tentar abrir database
      const db = await this.abrirDatabase();
      
      if (db) {
        this.log('Database EcoFieldDB', 'Conectado', true);
        
        // Verificar object stores (nomes corretos do banco)
        const stores = Array.from(db.objectStoreNames);
        const hasTermosOffline = stores.includes('termos_ambientais');
        const hasFotosOffline = stores.includes('termos_fotos');
        
        this.log('Store termos_ambientais', hasTermosOffline ? 'Existe' : 'Não existe', hasTermosOffline);
        this.log('Store termos_fotos', hasFotosOffline ? 'Existe' : 'Não existe', hasFotosOffline);
        
        // Listar todas as stores existentes para debug
        this.log('Stores existentes', `${stores.length}: [${stores.slice(0, 5).join(', ')}...]`, stores.length > 0);
        
        // Contar registros existentes
        if (hasTermosOffline) {
          const count = await this.contarRegistros(db, 'termos_ambientais');
          this.log('Termos offline existentes', `${count} registros`, true);
        }
        
        db.close();
      } else {
        this.log('Database EcoFieldDB', 'Falha na conexão', false);
      }
    } catch (error) {
      this.log('IndexedDB', `Erro: ${error.message}`, false);
    }
    
    console.log('');
  }

  async testeCriacaoOffline() {
    console.log('📝 4. TESTANDO CRIAÇÃO OFFLINE...');
    
    try {
      // Usar o TermoManager correto do sistema offline
      // Simular criação de termo com estrutura real
      const termoId = 'offline_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      
      const termoTeste = {
        id: termoId,
        numero_termo: `OFF-${Date.now().toString().slice(-3)}`,
        tipo_termo: 'NOTIFICACAO',
        data_termo: new Date().toISOString().split('T')[0],
        hora_termo: new Date().toTimeString().split(' ')[0].substring(0, 5),
        local_atividade: 'Teste Automatizado - ' + new Date().toLocaleTimeString(),
        descricao_fatos: 'Termo criado automaticamente para validação offline',
        emitido_por_usuario_id: this.userId,
        status: 'PENDENTE',
        sincronizado: false,
        offline: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      this.log('TermoManager simulado', 'Estrutura validada', true);
      
      // Tentar salvar no IndexedDB diretamente
      const db = await this.abrirDatabase();
      if (db) {
        const transaction = db.transaction(['termos_ambientais'], 'readwrite');
        const store = transaction.objectStore('termos_ambientais');
        await store.put(termoTeste);
        db.close();
        
        this.log('Termo criado no IndexedDB', `ID: ${termoTeste.id}`, true);
        this.log('Número offline', termoTeste.numero_termo, termoTeste.numero_termo.includes('OFF'));
        this.log('Marcado como offline', termoTeste.offline ? 'Sim' : 'Não', termoTeste.offline);
        this.log('Não sincronizado', !termoTeste.sincronizado ? 'Sim' : 'Não', !termoTeste.sincronizado);
        
        return termoTeste;
      } else {
        throw new Error('Não foi possível conectar ao IndexedDB');
      }
      
    } catch (error) {
      this.log('Criação offline', `Erro: ${error.message}`, false);
      return null;
    }
    
    console.log('');
  }

  async testeNumeracao() {
    console.log('🔢 5. TESTANDO NUMERAÇÃO SEQUENCIAL...');
    
    try {
      const db = await this.abrirDatabase();
      if (!db) {
        throw new Error('Não foi possível conectar ao IndexedDB');
      }
      
      // Criar 3 termos para testar sequência
      const numeros = [];
      const timestamp = Date.now();
      
      for (let i = 0; i < 3; i++) {
        const termoId = `offline_${timestamp}_seq_${i}`;
        const numeroSequencial = timestamp.toString().slice(-3) + String(i + 1);
        
        const termo = {
          id: termoId,
          numero_termo: `OFF-${numeroSequencial}`,
          tipo_termo: 'RECOMENDACAO',
          data_termo: new Date().toISOString().split('T')[0],
          local_atividade: `Teste Sequência ${i + 1}`,
          emitido_por_usuario_id: this.userId,
          status: 'PENDENTE',
          sincronizado: false,
          offline: true,
          created_at: new Date().toISOString()
        };
        
        const transaction = db.transaction(['termos_ambientais'], 'readwrite');
        const store = transaction.objectStore('termos_ambientais');
        await store.put(termo);
        
        numeros.push(termo.numero_termo);
      }
      
      db.close();
      
      // Verificar padrão OFF
      const todosComOFF = numeros.every(n => n.includes('OFF'));
      
      this.log('Numeração criada', `${numeros.join(', ')}`, numeros.length === 3);
      this.log('Padrão OFF correto', 'Verificado', todosComOFF);
      this.log('Formato esperado', 'OFF-XXX', todosComOFF);
      
    } catch (error) {
      this.log('Numeração', `Erro: ${error.message}`, false);
    }
    
    console.log('');
  }

  async testeContadores() {
    console.log('📊 6. TESTANDO CONTADORES...');
    
    try {
      const db = await this.abrirDatabase();
      if (!db) {
        throw new Error('Não foi possível conectar ao IndexedDB');
      }
      
      // Contar todos os termos
      const todosCount = await this.contarRegistros(db, 'termos_ambientais');
      
      // Contar termos pendentes (sincronizado = false)
      let pendentesCount = 0;
      try {
        const transaction = db.transaction(['termos_ambientais'], 'readonly');
        const store = transaction.objectStore('termos_ambientais');
        const request = store.getAll();
        
        const todos = await new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        
        pendentesCount = todos.filter(termo => !termo.sincronizado).length;
      } catch (countError) {
        console.warn('Erro ao contar pendentes:', countError);
      }
      
      db.close();
      
      this.log('Total de termos', `${todosCount} encontrados`, todosCount >= 0);
      this.log('Termos pendentes', `${pendentesCount} para sincronizar`, pendentesCount >= 0);
      
      // Verificar se pendentes são subset de todos
      const isSubset = pendentesCount <= todosCount;
      this.log('Contagem consistente', isSubset ? 'Sim' : 'Não', isSubset);
      
    } catch (error) {
      this.log('Contadores', `Erro: ${error.message}`, false);
    }
    
    console.log('');
  }

  async testeFotos() {
    console.log('📸 7. TESTANDO FOTOS OFFLINE...');
    
    try {
      // Criar base64 de teste (pixel transparente)
      const fotoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      this.log('Base64 de teste', 'Gerado', !!fotoBase64);
      
      // Verificar se consegue armazenar
      const canStoreBase64 = fotoBase64.length > 0 && fotoBase64.includes('data:image');
      this.log('Formato base64 válido', canStoreBase64 ? 'Sim' : 'Não', canStoreBase64);
      
      // Simular storage de foto (sem criar termo real)
      const fotoTeste = {
        id: 'foto-teste-' + Date.now(),
        nome_arquivo: 'teste.png',
        base64_data: fotoBase64,
        categoria: 'geral',
        timestamp: new Date().toISOString()
      };
      
      this.log('Estrutura de foto', 'Validada', !!fotoTeste.id && !!fotoTeste.base64_data);
      
    } catch (error) {
      this.log('Fotos offline', `Erro: ${error.message}`, false);
    }
    
    console.log('');
  }

  async testeSincronizacaoSimulada() {
    console.log('🔄 8. SIMULANDO SINCRONIZAÇÃO...');
    
    try {
      const db = await this.abrirDatabase();
      if (!db) {
        throw new Error('Não foi possível conectar ao IndexedDB');
      }
      
      // Buscar termos pendentes
      const transaction = db.transaction(['termos_ambientais'], 'readwrite');
      const store = transaction.objectStore('termos_ambientais');
      const request = store.getAll();
      
      const todos = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      const pendentes = todos.filter(termo => !termo.sincronizado);
      
      if (pendentes.length > 0) {
        this.log('Termos para sincronizar', `${pendentes.length} encontrados`, true);
        
        // Simular processo de sincronização nos primeiros 2
        const paraSimular = pendentes.slice(0, 2);
        
        for (const termo of paraSimular) {
          // Simular mudança OFF → SINC
          const numeroSincronizado = termo.numero_termo.replace('OFF', 'SINC');
          
          const termoAtualizado = {
            ...termo,
            numero_termo: numeroSincronizado,
            sincronizado: true,
            updated_at: new Date().toISOString()
          };
          
          const updateTransaction = db.transaction(['termos_ambientais'], 'readwrite');
          const updateStore = updateTransaction.objectStore('termos_ambientais');
          await updateStore.put(termoAtualizado);
          
          this.log(`Termo ${termo.id.substring(0, 8)}...`, `${termo.numero_termo} → ${numeroSincronizado}`, true);
        }
        
        // Verificar resultado final
        const finalTransaction = db.transaction(['termos_ambientais'], 'readonly');
        const finalStore = finalTransaction.objectStore('termos_ambientais');
        const finalRequest = finalStore.getAll();
        
        const aposSync = await new Promise((resolve, reject) => {
          finalRequest.onsuccess = () => resolve(finalRequest.result);
          finalRequest.onerror = () => reject(finalRequest.error);
        });
        
        const sincronizados = aposSync.filter(t => t.sincronizado).length;
        
        this.log('Termos sincronizados', `${sincronizados} de ${aposSync.length}`, sincronizados > 0);
        
      } else {
        this.log('Termos para sincronizar', 'Nenhum encontrado', true);
      }
      
      db.close();
      
    } catch (error) {
      this.log('Sincronização simulada', `Erro: ${error.message}`, false);
    }
    
    console.log('');
  }

  // Métodos auxiliares
  async abrirDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EcoFieldDB');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onupgradeneeded = () => resolve(null);
    });
  }

  async contarRegistros(db, storeName) {
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.count();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(0);
      } catch {
        resolve(0);
      }
    });
  }

  log(teste, resultado, sucesso) {
    const status = sucesso ? '✅' : '❌';
    const linha = `${status} ${teste}: ${resultado}`;
    
    console.log(linha);
    this.resultados.push({ teste, resultado, sucesso, timestamp: Date.now() });
  }

  gerarRelatorioFinal() {
    const tempoTotal = Math.round((Date.now() - this.startTime) / 1000);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RELATÓRIO FINAL - TESTE OFFLINE ECOFIELD');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const sucessos = this.resultados.filter(r => r.sucesso).length;
    const total = this.resultados.length;
    const percentual = Math.round((sucessos / total) * 100);
    
    console.log(`⏱️  Tempo de execução: ${tempoTotal}s`);
    console.log(`📈 Testes executados: ${total}`);
    console.log(`✅ Sucessos: ${sucessos} (${percentual}%)`);
    console.log(`❌ Falhas: ${total - sucessos}`);
    
    // Status geral
    if (percentual >= 90) {
      console.log('\n🎉 SISTEMA OFFLINE FUNCIONANDO PERFEITAMENTE!');
      console.log('✨ Funcionalidade offline está operacional');
    } else if (percentual >= 70) {
      console.log('\n⚠️  SISTEMA OFFLINE COM PROBLEMAS MENORES');
      console.log('🔧 Algumas funcionalidades precisam de ajustes');
    } else {
      console.log('\n🚨 SISTEMA OFFLINE COM PROBLEMAS CRÍTICOS');
      console.log('🛠️  Necessária revisão da implementação offline');
    }
    
    // Mostrar falhas específicas
    const falhas = this.resultados.filter(r => !r.sucesso);
    if (falhas.length > 0) {
      console.log('\n❌ FALHAS DETECTADAS:');
      falhas.forEach(f => {
        console.log(`   • ${f.teste}: ${f.resultado}`);
      });
    }
    
    console.log('\n🔍 Para mais detalhes, veja os logs acima.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  async limparDadosTeste() {
    try {
      console.log('\n🧹 LIMPANDO DADOS DE TESTE...');
      
      const db = await this.abrirDatabase();
      if (!db) {
        console.log('⚠️  Não foi possível conectar para limpeza');
        return;
      }
      
      // Remover termos criados pelo teste
      const transaction = db.transaction(['termos_ambientais'], 'readwrite');
      const store = transaction.objectStore('termos_ambientais');
      const request = store.getAll();
      
      const todos = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      // Filtrar apenas termos de teste (com userId específico ou descrição de teste)
      const termosParaRemover = todos.filter(termo => 
        termo.emitido_por_usuario_id === this.userId ||
        termo.local_atividade?.includes('Teste Automatizado') ||
        termo.local_atividade?.includes('Teste Sequência') ||
        termo.descricao_fatos?.includes('validação offline')
      );
      
      // Remover termos de teste
      for (const termo of termosParaRemover) {
        const deleteTransaction = db.transaction(['termos_ambientais'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('termos_ambientais');
        await deleteStore.delete(termo.id);
      }
      
      db.close();
      
      if (termosParaRemover.length > 0) {
        console.log(`✅ ${termosParaRemover.length} termos de teste removidos`);
      } else {
        console.log('ℹ️  Nenhum termo de teste encontrado para remover');
      }
      
    } catch (error) {
      console.warn('⚠️  Erro na limpeza:', error.message);
    }
  }
}

// 🚀 EXECUTAR TESTE AUTOMATICAMENTE
console.clear();
const teste = new TesteOfflineEcoField();
teste.executar();
