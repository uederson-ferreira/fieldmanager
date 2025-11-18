/**
 * 🔍 DEBUG SINCRONIZAÇÃO DE FOTOS
 * Execute no console do navegador para diagnosticar problemas de fotos
 */

class DebugFotosSync {
  async executar() {
    console.clear();
    console.log('🔍 DEBUG SINCRONIZAÇÃO DE FOTOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
      await this.verificarIndexedDB();
      await this.verificarBackend();
      await this.verificarLogs();
    } catch (error) {
      console.error('💥 ERRO CRÍTICO:', error);
    }
  }

  async verificarIndexedDB() {
    console.log('📱 1. VERIFICANDO INDEXEDDB...');
    
    try {
      const db = await this.abrirDatabase();
      if (!db) {
        console.log('❌ Não foi possível conectar ao IndexedDB');
        return;
      }

      // Verificar termos offline
      const termosTransaction = db.transaction(['termos_ambientais'], 'readonly');
      const termosStore = termosTransaction.objectStore('termos_ambientais');
      const termosRequest = termosStore.getAll();
      
      const termos = await new Promise((resolve, reject) => {
        termosRequest.onsuccess = () => resolve(termosRequest.result);
        termosRequest.onerror = () => reject(termosRequest.error);
      });

      console.log(`📝 Termos no IndexedDB: ${termos.length}`);
      
      if (termos.length > 0) {
        console.log('📝 Primeiros 3 termos:');
        termos.slice(0, 3).forEach((termo, i) => {
          console.log(`  ${i + 1}. ID: ${termo.id}`);
          console.log(`     Número: ${termo.numero_termo}`);
          console.log(`     Sincronizado: ${termo.sincronizado}`);
          console.log(`     Offline: ${termo.offline}`);
        });
      }

      // Verificar fotos offline
      const fotosTransaction = db.transaction(['termos_fotos'], 'readonly');
      const fotosStore = fotosTransaction.objectStore('termos_fotos');
      const fotosRequest = fotosStore.getAll();
      
      const fotos = await new Promise((resolve, reject) => {
        fotosRequest.onsuccess = () => resolve(fotosRequest.result);
        fotosRequest.onerror = () => reject(fotosRequest.error);
      });

      console.log(`📸 Fotos no IndexedDB: ${fotos.length}`);
      
      if (fotos.length > 0) {
        console.log('📸 Primeiras 3 fotos:');
        fotos.slice(0, 3).forEach((foto, i) => {
          console.log(`  ${i + 1}. Nome: ${foto.nome_arquivo}`);
          console.log(`     Termo ID: ${foto.termo_id}`);
          console.log(`     Categoria: ${foto.categoria}`);
          console.log(`     Sincronizado: ${foto.sincronizado}`);
          console.log(`     Base64 presente: ${!!foto.arquivo_base64}`);
          console.log(`     Tamanho Base64: ${foto.arquivo_base64?.length || 0} chars`);
        });

        // Contar fotos por termo
        const fotosPorTermo = {};
        fotos.forEach(foto => {
          fotosPorTermo[foto.termo_id] = (fotosPorTermo[foto.termo_id] || 0) + 1;
        });
        
        console.log('📊 Fotos por termo:');
        Object.entries(fotosPorTermo).forEach(([termoId, count]) => {
          console.log(`  ${termoId}: ${count} fotos`);
        });
      }

      db.close();
      console.log('');
      
    } catch (error) {
      console.error('❌ Erro ao verificar IndexedDB:', error);
    }
  }

  async verificarBackend() {
    console.log('🌐 2. VERIFICANDO BACKEND...');
    
    try {
      const token = localStorage.getItem('ecofield_auth_token');
      if (!token) {
        console.log('❌ Token de autenticação não encontrado');
        return;
      }

      // Buscar termos do backend
      const termosResponse = await fetch(`${window.location.origin.replace('3000', '3001')}/api/termos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!termosResponse.ok) {
        console.log(`❌ Erro ao buscar termos: Status ${termosResponse.status}`);
        return;
      }

      const termos = await termosResponse.json();
      console.log(`📝 Termos no backend: ${termos.length}`);

      if (termos.length > 0) {
        console.log('📝 Últimos 3 termos sincronizados:');
        termos.slice(-3).forEach((termo, i) => {
          console.log(`  ${i + 1}. ID: ${termo.id}`);
          console.log(`     Número: ${termo.numero_termo}`);
          console.log(`     Data: ${termo.data_termo}`);
          console.log(`     Local: ${termo.local_atividade}`);
        });

        // Verificar fotos de alguns termos
        for (const termo of termos.slice(-2)) {
          console.log(`\n📸 Verificando fotos do termo ${termo.id}:`);
          
          try {
            const fotosResponse = await fetch(`${window.location.origin.replace('3000', '3001')}/api/termos/${termo.id}/fotos`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (fotosResponse.ok) {
              const fotos = await fotosResponse.json();
              console.log(`  📸 Fotos encontradas: ${fotos.length}`);
              
              if (fotos.length > 0) {
                fotos.forEach((foto, i) => {
                  console.log(`    ${i + 1}. ${foto.nome_arquivo} (${foto.categoria})`);
                  console.log(`       URL: ${foto.url_arquivo}`);
                  console.log(`       Tamanho: ${foto.tamanho_bytes} bytes`);
                });
              }
            } else {
              console.log(`  ❌ Erro ao buscar fotos: Status ${fotosResponse.status}`);
            }
          } catch (error) {
            console.log(`  ❌ Erro ao buscar fotos: ${error.message}`);
          }
        }
      }

      console.log('');
      
    } catch (error) {
      console.error('❌ Erro ao verificar backend:', error);
    }
  }

  async verificarLogs() {
    console.log('📋 3. ANÁLISE DE LOGS...');
    
    // Verificar se há termos pendentes para sincronização
    try {
      const db = await this.abrirDatabase();
      if (!db) return;

      const transaction = db.transaction(['termos_ambientais'], 'readonly');
      const store = transaction.objectStore('termos_ambientais');
      const request = store.getAll();
      
      const todos = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const pendentes = todos.filter(termo => !termo.sincronizado);
      const sincronizados = todos.filter(termo => termo.sincronizado);

      console.log(`📊 Termos pendentes: ${pendentes.length}`);
      console.log(`📊 Termos sincronizados: ${sincronizados.length}`);

      if (pendentes.length > 0) {
        console.log('\n⚠️ TERMOS PENDENTES DE SINCRONIZAÇÃO:');
        pendentes.forEach((termo, i) => {
          console.log(`  ${i + 1}. ${termo.numero_termo} - ${termo.local_atividade}`);
        });
        
        console.log('\n🔧 Para sincronizar, execute:');
        console.log('   1. Vá para "Lista de Termos"');
        console.log('   2. Clique no botão "Sincronizar Termos"');
        console.log('   3. Acompanhe os logs no console');
      }

      if (sincronizados.length > 0) {
        console.log('\n✅ ÚLTIMOS TERMOS SINCRONIZADOS:');
        sincronizados.slice(-3).forEach((termo, i) => {
          console.log(`  ${i + 1}. ${termo.numero_termo} - ${termo.local_atividade}`);
        });
      }

      db.close();
      
    } catch (error) {
      console.error('❌ Erro ao verificar logs:', error);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 DIAGNÓSTICO CONCLUÍDO');
    console.log('💡 Se houver termos pendentes, sincronize-os primeiro');
    console.log('💡 Se não houver fotos no backend, o problema está na sincronização');
    console.log('💡 Se houver fotos no backend mas não aparecem, o problema é no frontend');
  }

  async abrirDatabase() {
    return new Promise((resolve) => {
      const request = indexedDB.open('EcoFieldDB');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onupgradeneeded = () => resolve(null);
    });
  }
}

// 🚀 EXECUTAR AUTOMATICAMENTE
const debug = new DebugFotosSync();
debug.executar();
