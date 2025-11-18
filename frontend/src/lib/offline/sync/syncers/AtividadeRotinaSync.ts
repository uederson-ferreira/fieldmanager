import { AtividadeRotinaManager, FotoRotinaManager } from '../../entities';
import type { AtividadeRotinaOffline, FotoRotinaOffline } from '../../../../types/offline';
import type { ProgressCallback, SyncResult } from './TermoSync';

/**
 * Sincronizador de atividades de rotina offline
 * Responsável por sincronizar atividades e suas fotos com o backend
 */
export class AtividadeRotinaSync {
  /**
   * Sincroniza todas as atividades pendentes
   */
  static async syncAll(onProgress?: ProgressCallback): Promise<SyncResult> {
    const startTime = Date.now();
    let total = 0;
    let success = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    try {
      console.log('🔄 [ATIVIDADE ROTINA SYNC] Iniciando sincronização...');
      
      // Buscar atividades pendentes
      const atividades = await AtividadeRotinaManager.getPendentes();
      total = atividades.length;
      
      if (total === 0) {
        console.log('✅ [ATIVIDADE ROTINA SYNC] Nenhuma atividade pendente para sincronizar');
        return { success: true, sincronizados: 0, erros: 0 };
      }

      console.log(`🔄 [ATIVIDADE ROTINA SYNC] Sincronizando ${total} atividades...`);

      // Sincronizar cada atividade
      for (let i = 0; i < atividades.length; i++) {
        const atividade = atividades[i];
        
        try {
          await this.syncOne(atividade);
          success++;
          
          if (onProgress) {
            onProgress(i + 1, total, `Sincronizando atividade ${atividade.id}`);
          }
          
          console.log(`✅ [ATIVIDADE ROTINA SYNC] Atividade ${atividade.id} sincronizada (${i + 1}/${total})`);
        } catch (error) {
          errors++;
          const errorMsg = `Erro ao sincronizar atividade ${atividade.id}: ${error}`;
          errorDetails.push(errorMsg);
          console.error(`❌ [ATIVIDADE ROTINA SYNC] ${errorMsg}`);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`✅ [ATIVIDADE ROTINA SYNC] Sincronização concluída: ${success} sucessos, ${errors} erros em ${duration}ms`);

      return {
        success: errors === 0,
        sincronizados: success,
        erros: errors,
        error: errors > 0 ? `${errors} atividades com erro na sincronização` : undefined
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ [ATIVIDADE ROTINA SYNC] Erro geral na sincronização:', error);
      
      return {
        success: false,
        sincronizados: success,
        erros: errors + 1,
        error: `Erro geral na sincronização: ${error}`
      };
    }
  }

  /**
   * Sincroniza uma atividade específica
   */
  private static async syncOne(atividade: AtividadeRotinaOffline): Promise<void> {
    try {
      console.log(`🔄 [ATIVIDADE ROTINA SYNC] Sincronizando atividade: ${atividade.id}`);

      // Preparar dados para o backend
      const dados = this.prepararDadosParaBackend(atividade);
      
      // Enviar para o backend
      const resultado = await this.enviarParaBackend(dados);
      
      if (resultado.success && resultado.data?.id) {
        // ✅ Sincronização bem-sucedida
        console.log(`✅ [ATIVIDADE ROTINA SYNC] Atividade ${atividade.id} sincronizada com sucesso no backend`);
        
        // Sincronizar fotos da atividade
        const fotos = await FotoRotinaManager.getByAtividadeId(atividade.id);
        if (fotos.length > 0) {
          await this.syncFotos(resultado.data.id, fotos);
        }
        
        // Remover do banco offline
        await AtividadeRotinaManager.delete(atividade.id);
        await FotoRotinaManager.deleteByAtividadeId(atividade.id);
        
        console.log(`✅ [ATIVIDADE ROTINA SYNC] Atividade ${atividade.id} removida do IndexedDB`);
        
      } else {
        // ⚠️ Sincronização falhou - NÃO deletar dados
        console.warn(`⚠️ [ATIVIDADE ROTINA SYNC] Falha na sincronização da atividade ${atividade.id}`);
        console.warn(`⚠️ [ATIVIDADE ROTINA SYNC] Mantendo dados offline para nova tentativa`);
        
        // NÃO implementar fallback - manter dados originais
        // await this.implementarFallback(atividade);
      }

    } catch (error) {
      console.error(`❌ [ATIVIDADE ROTINA SYNC] Erro ao sincronizar atividade ${atividade.id}:`, error);
      
      // Em caso de erro, NÃO deletar dados - manter para nova tentativa
      console.warn(`⚠️ [ATIVIDADE ROTINA SYNC] Mantendo atividade ${atividade.id} offline para nova tentativa`);
      
      throw error;
    }
  }

  /**
   * Prepara dados da atividade para envio ao backend
   */
  private static prepararDadosParaBackend(atividade: AtividadeRotinaOffline): any {
    const dados = { ...atividade };
    
    // ✅ REMOVER ID OFFLINE - O Supabase vai gerar um novo UUID
    delete (dados as any).id;
    
    // Remover campos específicos do offline
    delete (dados as any).sincronizado;
    delete (dados as any).offline;
    delete (dados as any).offline_created;
    
    // ✅ Garantir que auth_user_id está presente
    if (!(dados as any).auth_user_id) {
      console.warn(`⚠️ [ATIVIDADE ROTINA SYNC] auth_user_id não encontrado na atividade ${atividade.id}, usando tma_responsavel_id`);
      (dados as any).auth_user_id = dados.tma_responsavel_id;
    }
    
    // Converter datas se necessário
    if (dados.created_at) {
      dados.created_at = new Date(dados.created_at).toISOString();
    }
    
    if (dados.updated_at) {
      dados.updated_at = new Date(dados.updated_at).toISOString();
    }

    console.log(`📤 [ATIVIDADE ROTINA SYNC] Dados preparados para backend:`, dados);
    return dados;
  }

  /**
   * Envia dados para o backend
   */
  private static async enviarParaBackend(dados: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = localStorage.getItem('ecofield_auth_token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/rotinas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dados)
      });

      if (!response.ok) {
        // Se for 401, o token está expirado
        if (response.status === 401) {
          console.error('❌ [ATIVIDADE ROTINA SYNC] Token expirado ou inválido (401)');
          throw new Error('Sessão expirada. Por favor, faça login novamente para sincronizar os dados.');
        }

        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ [ATIVIDADE ROTINA SYNC] Dados enviados com sucesso para backend:`, result);
      
      return { success: true, data: result };

    } catch (error) {
      console.error(`❌ [ATIVIDADE ROTINA SYNC] Erro ao enviar para backend:`, error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Sincroniza fotos de uma atividade
   */
  private static async syncFotos(atividadeId: string, fotos: FotoRotinaOffline[]): Promise<void> {
    try {
      console.log(`🔄 [ATIVIDADE ROTINA SYNC] Sincronizando ${fotos.length} fotos da atividade ${atividadeId}`);

      for (const foto of fotos) {
        try {
          // Preparar dados da foto
          const dadosFoto = { ...foto };
          delete (dadosFoto as any).sincronizado;
          delete (dadosFoto as any).offline;

          // Enviar foto para o backend
          const resultado = await this.enviarFotoParaBackend(dadosFoto, atividadeId);
          
          if (resultado.success) {
            await FotoRotinaManager.marcarSincronizada(foto.id);
            console.log(`✅ [ATIVIDADE ROTINA SYNC] Foto ${foto.id} sincronizada`);
          } else {
            console.error(`❌ [ATIVIDADE ROTINA SYNC] Erro ao sincronizar foto ${foto.id}:`, resultado.error);
          }
        } catch (error) {
          console.error(`❌ [ATIVIDADE ROTINA SYNC] Erro ao sincronizar foto ${foto.id}:`, error);
        }
      }

    } catch (error) {
      console.error(`❌ [ATIVIDADE ROTINA SYNC] Erro geral ao sincronizar fotos da atividade ${atividadeId}:`, error);
    }
  }

  /**
   * Envia uma foto para o backend
   */
  private static async enviarFotoParaBackend(dadosFoto: any, atividadeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = localStorage.getItem('ecofield_auth_token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // ✅ 1. Primeiro fazer upload da foto para o bucket fotos-rotina
      if (dadosFoto.arquivo_base64) {
        console.log(`📤 [ATIVIDADE ROTINA SYNC] Uploading foto ${dadosFoto.nome_arquivo} para bucket fotos-rotina...`);
        
        const formData = new FormData();
        const blob = await fetch(dadosFoto.arquivo_base64).then(r => r.blob());
        formData.append('file', blob, dadosFoto.nome_arquivo);
        formData.append('entityType', 'rotina');
        formData.append('entityId', atividadeId);
        
        const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Erro no upload da foto: HTTP ${uploadResponse.status}: ${errorText}`);
        }
        
        const uploadResult = await uploadResponse.json();
        console.log(`✅ [ATIVIDADE ROTINA SYNC] Foto ${dadosFoto.nome_arquivo} enviada para bucket:`, uploadResult.url);
        
        // Atualizar URL da foto com o resultado do upload
        dadosFoto.url_arquivo = uploadResult.url;
      }

      // ✅ 2. Salvar metadados da foto na tabela fotos_rotina
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/rotinas/${atividadeId}/fotos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fotos: [{
            nome_arquivo: dadosFoto.nome_arquivo,
            url_arquivo: dadosFoto.url_arquivo,
            descricao: dadosFoto.descricao || '',
            latitude: dadosFoto.latitude,
            longitude: dadosFoto.longitude
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log(`✅ [ATIVIDADE ROTINA SYNC] Metadados da foto ${dadosFoto.nome_arquivo} salvos na tabela fotos_rotina`);
      return { success: true };

    } catch (error) {
      console.error(`❌ [ATIVIDADE ROTINA SYNC] Erro ao enviar foto para backend:`, error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Implementar estratégia de fallback para atividades com falha na sincronização
   */
  private static async implementarFallback(atividade: AtividadeRotinaOffline): Promise<void> {
    try {
      console.log(`⚠️ [ATIVIDADE ROTINA SYNC] Implementando fallback para atividade ${atividade.id}`);
      
      // ❌ NÃO marcar como sincronizada quando há erro real
      // Manter como offline para permitir nova tentativa
      const atividadeAtualizada: AtividadeRotinaOffline = {
        ...atividade,
        sincronizado: false, // Manter como não sincronizada
        updated_at: new Date().toISOString()
      };
      
      // Atualizar atividade mantendo o mesmo ID
      await AtividadeRotinaManager.save(atividadeAtualizada);
      
      console.log(`⚠️ [ATIVIDADE ROTINA SYNC] Atividade ${atividade.id} mantida como offline para nova tentativa`);
      
    } catch (error) {
      console.error(`❌ [ATIVIDADE ROTINA SYNC] Erro ao implementar fallback:`, error);
      throw error;
    }
  }
}
