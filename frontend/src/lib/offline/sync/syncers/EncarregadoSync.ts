import { EncarregadoManager } from '../../entities';
import type { EncarregadoOffline } from '../../../../types/offline';
import type { ProgressCallback, SyncResult } from './TermoSync';

/**
 * Sincronizador de encarregados offline
 * Responsável por sincronizar encarregados com o backend
 */
export class EncarregadoSync {
  /**
   * Sincroniza todos os encarregados pendentes
   */
  static async syncAll(onProgress?: ProgressCallback): Promise<SyncResult> {
    const startTime = Date.now();
    let total = 0;
    let success = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    try {
      console.log('🔄 [ENCARREGADO SYNC] Iniciando sincronização...');
      
      // Buscar encarregados pendentes
      const encarregados = await EncarregadoManager.getPendentes();
      total = encarregados.length;
      
      if (total === 0) {
        console.log('✅ [ENCARREGADO SYNC] Nenhum encarregado pendente para sincronizar');
        return { success: true, sincronizados: 0, erros: 0 };
      }

      console.log(`🔄 [ENCARREGADO SYNC] Sincronizando ${total} encarregados...`);

      // Sincronizar cada encarregado
      for (let i = 0; i < encarregados.length; i++) {
        const encarregado = encarregados[i];
        
        try {
          await this.syncOne(encarregado);
          success++;
          
          if (onProgress) {
            onProgress(i + 1, total, `Sincronizando encarregado ${encarregado.nome_completo}`);
          }
          
          console.log(`✅ [ENCARREGADO SYNC] Encarregado ${encarregado.nome_completo} sincronizado (${i + 1}/${total})`);
        } catch (error) {
          errors++;
          const errorMsg = `Erro ao sincronizar encarregado ${encarregado.nome_completo}: ${error}`;
          errorDetails.push(errorMsg);
          console.error(`❌ [ENCARREGADO SYNC] ${errorMsg}`);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`✅ [ENCARREGADO SYNC] Sincronização concluída: ${success} sucessos, ${errors} erros em ${duration}ms`);

      return {
        success: errors === 0,
        sincronizados: success,
        erros: errors,
        error: errors > 0 ? `${errors} encarregados com erro na sincronização` : undefined
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ [ENCARREGADO SYNC] Erro geral na sincronização:', error);
      
      return {
        success: false,
        sincronizados: success,
        erros: errors + 1,
        error: `Erro geral na sincronização: ${error}`
      };
    }
  }

  /**
   * Sincroniza um encarregado específico
   */
  private static async syncOne(encarregado: EncarregadoOffline): Promise<void> {
    try {
      console.log(`🔄 [ENCARREGADO SYNC] Sincronizando encarregado: ${encarregado.nome_completo}`);

      // Preparar dados para o backend
      const dados = this.prepararDadosParaBackend(encarregado);
      
      // Enviar para o backend
      const resultado = await this.enviarParaBackend(dados);
      
      if (!resultado.success) {
        throw new Error(resultado.error || 'Erro desconhecido no backend');
      }

      // Marcar como sincronizado
      await EncarregadoManager.marcarSincronizado(encarregado.id);
      
      console.log(`✅ [ENCARREGADO SYNC] Encarregado ${encarregado.nome_completo} sincronizado com sucesso`);

    } catch (error) {
      console.error(`❌ [ENCARREGADO SYNC] Erro ao sincronizar encarregado ${encarregado.nome_completo}:`, error);
      throw error;
    }
  }

  /**
   * Prepara dados do encarregado para envio ao backend
   */
  private static prepararDadosParaBackend(encarregado: EncarregadoOffline): any {
    const dados = { ...encarregado };
    
    // Remover campos específicos do offline
    delete (dados as any).sincronizado;
    delete (dados as any).offline;
    
    // Converter datas se necessário
    if (dados.created_at) {
      dados.created_at = new Date(dados.created_at).toISOString();
    }
    
    if (dados.updated_at) {
      dados.updated_at = new Date(dados.updated_at).toISOString();
    }

    // Limpar campos vazios
    const dadosLimpos = this.limparCamposVazios(dados);

    console.log(`📤 [ENCARREGADO SYNC] Dados preparados para backend:`, dadosLimpos);
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
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/encarregados/${dados.id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/encarregados`;

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
      console.log(`✅ [ENCARREGADO SYNC] Dados enviados com sucesso para backend:`, result);
      
      return { success: true, data: result };

    } catch (error) {
      console.error(`❌ [ENCARREGADO SYNC] Erro ao enviar para backend:`, error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Sincroniza encarregados específicos por IDs
   */
  static async syncByIds(ids: string[], onProgress?: ProgressCallback): Promise<SyncResult> {
    const startTime = Date.now();
    let total = ids.length;
    let success = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    try {
      console.log(`🔄 [ENCARREGADO SYNC] Sincronizando ${total} encarregados específicos...`);

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        
        try {
          const encarregado = await EncarregadoManager.getById(id);
          if (encarregado) {
            await this.syncOne(encarregado);
            success++;
          } else {
            errors++;
            errorDetails.push(`Encarregado com ID ${id} não encontrado`);
          }
          
          if (onProgress) {
            onProgress(i + 1, total, `Sincronizando encarregado ${id}`);
          }
          
        } catch (error) {
          errors++;
          const errorMsg = `Erro ao sincronizar encarregado ${id}: ${error}`;
          errorDetails.push(errorMsg);
          console.error(`❌ [ENCARREGADO SYNC] ${errorMsg}`);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`✅ [ENCARREGADO SYNC] Sincronização por IDs concluída: ${success} sucessos, ${errors} erros em ${duration}ms`);

      return {
        success: errors === 0,
        sincronizados: success,
        erros: errors,
        error: errors > 0 ? `${errors} encarregados com erro na sincronização` : undefined
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ [ENCARREGADO SYNC] Erro geral na sincronização por IDs:', error);
      
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
  static async getStatus(): Promise<{ total: number; pendentes: number; sincronizados: number }> {
    try {
      const total = await EncarregadoManager.count();
      const pendentes = await EncarregadoManager.countPendentes();
      const sincronizados = total - pendentes;

      return { total, pendentes, sincronizados };
    } catch (error) {
      console.error('❌ [ENCARREGADO SYNC] Erro ao obter status:', error);
      return { total: 0, pendentes: 0, sincronizados: 0 };
    }
  }
}
