import { InspecaoManager, RespostaInspecaoManager, FotoInspecaoManager } from '../../entities';
import type { InspecaoOffline, RespostaInspecaoOffline, FotoInspecaoOffline } from '../../../../types/offline';
import type { ProgressCallback, SyncResult } from './TermoSync';

/**
 * Sincronizador de inspeções offline
 * Responsável por sincronizar inspeções, respostas e fotos com o backend
 */
export class InspecaoSync {
  /**
   * Sincroniza todas as inspeções pendentes
   */
  static async syncAll(onProgress?: ProgressCallback): Promise<SyncResult> {
    const startTime = Date.now();
    let total = 0;
    let success = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    try {
      console.log('🔄 [INSPECAO SYNC] Iniciando sincronização...');
      
      // Buscar inspeções pendentes
      const inspecoes = await InspecaoManager.getPendentes();
      total = inspecoes.length;
      
      if (total === 0) {
        console.log('✅ [INSPECAO SYNC] Nenhuma inspeção pendente para sincronizar');
        return { success: true, sincronizados: 0, erros: 0 };
      }

      console.log(`🔄 [INSPECAO SYNC] Sincronizando ${total} inspeções...`);

      // Sincronizar cada inspeção
      for (let i = 0; i < inspecoes.length; i++) {
        const inspecao = inspecoes[i];
        
        try {
          await this.syncOne(inspecao);
          success++;
          
          if (onProgress) {
            onProgress(i + 1, total, `Sincronizando inspeção ${inspecao.id}`);
          }
          
          console.log(`✅ [INSPECAO SYNC] Inspeção ${inspecao.id} sincronizada (${i + 1}/${total})`);
        } catch (error) {
          errors++;
          const errorMsg = `Erro ao sincronizar inspeção ${inspecao.id}: ${error}`;
          errorDetails.push(errorMsg);
          console.error(`❌ [INSPECAO SYNC] ${errorMsg}`);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`✅ [INSPECAO SYNC] Sincronização concluída: ${success} sucessos, ${errors} erros em ${duration}ms`);

      return {
        success: errors === 0,
        sincronizados: success,
        erros: errors,
        error: errors > 0 ? `${errors} inspeções com erro na sincronização` : undefined
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ [INSPECAO SYNC] Erro geral na sincronização:', error);
      
      return {
        success: false,
        sincronizados: success,
        erros: errors + 1,
        error: `Erro geral na sincronização: ${error}`
      };
    }
  }

  /**
   * Sincroniza uma inspeção específica
   */
  private static async syncOne(inspecao: InspecaoOffline): Promise<void> {
    try {
      console.log(`🔄 [INSPECAO SYNC] Sincronizando inspeção: ${inspecao.id}`);

      // Preparar dados para o backend
      const dados = this.prepararDadosParaBackend(inspecao);
      
      // Enviar para o backend
      const resultado = await this.enviarParaBackend(dados);
      
      if (!resultado.success) {
        throw new Error(resultado.error || 'Erro desconhecido no backend');
      }

      // Sincronizar respostas da inspeção
      const respostas = await RespostaInspecaoManager.getByInspecaoId(inspecao.id);
      if (respostas.length > 0) {
        await this.syncRespostas(inspecao.id, respostas);
      }

      // Sincronizar fotos da inspeção
      const fotos = await FotoInspecaoManager.getByInspecaoId(inspecao.id);
      if (fotos.length > 0) {
        await this.syncFotos(inspecao.id, fotos);
      }

      // Marcar como sincronizada
      await InspecaoManager.marcarSincronizada(inspecao.id);
      
      console.log(`✅ [INSPECAO SYNC] Inspeção ${inspecao.id} sincronizada com sucesso`);

    } catch (error) {
      console.error(`❌ [INSPECAO SYNC] Erro ao sincronizar inspeção ${inspecao.id}:`, error);
      throw error;
    }
  }

  /**
   * Prepara dados da inspeção para envio ao backend
   */
  private static prepararDadosParaBackend(inspecao: InspecaoOffline): any {
    const dados = { ...inspecao };
    
    // Remover campos específicos do offline
    delete (dados as any).sincronizado;
    delete (dados as any).offline;
    
    // Converter datas se necessário
    if (dados.created_at) {
      dados.created_at = new Date(dados.created_at).toISOString();
    }
    
    if (dados.data_inspecao) {
      dados.data_inspecao = new Date(dados.data_inspecao).toISOString();
    }

    // Limpar campos vazios
    const dadosLimpos = this.limparCamposVazios(dados);

    console.log(`📤 [INSPECAO SYNC] Dados preparados para backend:`, dadosLimpos);
    return dadosLimpos;
  }

  /**
   * Limpa campos vazios ou undefined
   */
  private static limparCamposVazios(dados: any): any {
    const dadosLimpos: any = {};
    
    for (const [key, value] of Object.entries(dados)) {
      if (value !== null && value !== undefined && value !== '') {
        dadosLimpos[key] = value;
      }
    }
    
    return dadosLimpos;
  }

  /**
   * Envia dados para o backend
   */
  private static async enviarParaBackend(dados: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Verificar se é criação ou atualização
      const method = dados.id ? 'PUT' : 'POST';
      const url = dados.id 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/inspecoes/${dados.id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/inspecoes`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dados)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ [INSPECAO SYNC] Dados enviados com sucesso para backend:`, result);
      
      return { success: true, data: result };

    } catch (error) {
      console.error(`❌ [INSPECAO SYNC] Erro ao enviar para backend:`, error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Sincroniza respostas de uma inspeção
   */
  private static async syncRespostas(inspecaoId: string, respostas: RespostaInspecaoOffline[]): Promise<void> {
    try {
      console.log(`🔄 [INSPECAO SYNC] Sincronizando ${respostas.length} respostas da inspeção ${inspecaoId}`);

      for (const resposta of respostas) {
        try {
          // Preparar dados da resposta
          const dadosResposta = { ...resposta };
          delete (dadosResposta as any).sincronizado;
          delete (dadosResposta as any).offline;

          // Enviar resposta para o backend
          const resultado = await this.enviarRespostaParaBackend(dadosResposta, inspecaoId);
          
          if (resultado.success) {
            await RespostaInspecaoManager.marcarSincronizada(resposta.id);
            console.log(`✅ [INSPECAO SYNC] Resposta ${resposta.id} sincronizada`);
          } else {
            console.error(`❌ [INSPECAO SYNC] Erro ao sincronizar resposta ${resposta.id}:`, resultado.error);
          }
        } catch (error) {
          console.error(`❌ [INSPECAO SYNC] Erro ao sincronizar resposta ${resposta.id}:`, error);
        }
      }

    } catch (error) {
      console.error(`❌ [INSPECAO SYNC] Erro geral ao sincronizar respostas da inspeção ${inspecaoId}:`, error);
    }
  }

  /**
   * Envia uma resposta para o backend
   */
  private static async enviarRespostaParaBackend(dadosResposta: any, inspecaoId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/respostas-inspecao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...dadosResposta,
          inspecao_id: inspecaoId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return { success: true };

    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Sincroniza fotos de uma inspeção
   */
  private static async syncFotos(inspecaoId: string, fotos: FotoInspecaoOffline[]): Promise<void> {
    try {
      console.log(`🔄 [INSPECAO SYNC] Sincronizando ${fotos.length} fotos da inspeção ${inspecaoId}`);

      for (const foto of fotos) {
        try {
          // Preparar dados da foto
          const dadosFoto = { ...foto };
          delete (dadosFoto as any).sincronizado;
          delete (dadosFoto as any).offline;
          delete (dadosFoto as any).arquivo_base64;

          // Enviar foto para o backend
          const resultado = await this.enviarFotoParaBackend(dadosFoto, inspecaoId);
          
          if (resultado.success) {
            await FotoInspecaoManager.marcarSincronizada(foto.id);
            console.log(`✅ [INSPECAO SYNC] Foto ${foto.id} sincronizada`);
          } else {
            console.error(`❌ [INSPECAO SYNC] Erro ao sincronizar foto ${foto.id}:`, resultado.error);
          }
        } catch (error) {
          console.error(`❌ [INSPECAO SYNC] Erro ao sincronizar foto ${foto.id}:`, error);
        }
      }

    } catch (error) {
      console.error(`❌ [INSPECAO SYNC] Erro geral ao sincronizar fotos da inspeção ${inspecaoId}:`, error);
    }
  }

  /**
   * Envia uma foto para o backend
   */
  private static async enviarFotoParaBackend(dadosFoto: any, inspecaoId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/fotos-inspecao`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...dadosFoto,
          inspecao_id: inspecaoId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return { success: true };

    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Sincroniza inspeções específicas por IDs
   */
  static async syncByIds(ids: string[], onProgress?: ProgressCallback): Promise<SyncResult> {
    const startTime = Date.now();
    let total = ids.length;
    let success = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    try {
      console.log(`🔄 [INSPECAO SYNC] Sincronizando ${total} inspeções específicas...`);

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        
        try {
          const inspecao = await InspecaoManager.getById(id);
          if (inspecao) {
            await this.syncOne(inspecao);
            success++;
          } else {
            errors++;
            errorDetails.push(`Inspeção com ID ${id} não encontrada`);
          }
          
          if (onProgress) {
            onProgress(i + 1, total, `Sincronizando inspeção ${id}`);
          }
          
        } catch (error) {
          errors++;
          const errorMsg = `Erro ao sincronizar inspeção ${id}: ${error}`;
          errorDetails.push(errorMsg);
          console.error(`❌ [INSPECAO SYNC] ${errorMsg}`);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`✅ [INSPECAO SYNC] Sincronização por IDs concluída: ${success} sucessos, ${errors} erros em ${duration}ms`);

      return {
        success: errors === 0,
        sincronizados: success,
        erros: errors,
        error: errors > 0 ? `${errors} inspeções com erro na sincronização` : undefined
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ [INSPECAO SYNC] Erro geral na sincronização por IDs:', error);
      
      return {
        success: false,
        sincronizados: success,
        erros: errors + 1,
        error: `Erro geral na sincronização: ${error}`
      };
    }
  }

  /**
   * Verifica status de sincronização
   */
  static async getStatus(): Promise<{ total: number; pendentes: number; sincronizadas: number }> {
    try {
      const total = await InspecaoManager.count();
      const pendentes = await InspecaoManager.countPendentes();
      const sincronizadas = total - pendentes;

      return { total, pendentes, sincronizadas };
    } catch (error) {
      console.error('❌ [INSPECAO SYNC] Erro ao obter status:', error);
      return { total: 0, pendentes: 0, sincronizadas: 0 };
    }
  }
}
