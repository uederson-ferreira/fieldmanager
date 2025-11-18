// ===================================================================
// LV SYNC - ECOFIELD SYSTEM
// Localização: src/lib/offline/sync/syncers/LVSync.ts
// Módulo: Sincronização de LVs offline
// ===================================================================

import type { LV, LVAvaliacao, LVFoto } from '../../../../types/lv';
import { LVManager, LVAvaliacaoManager, LVFotoManager } from '../../entities';

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

export interface LVProgressCallback {
  (atual: number, total: number, lvAtual: string): void;
}

export interface LVSyncResult {
  success: boolean;
  sincronizadas: number;
  erros: number;
  error?: string;
}

// ===================================================================
// SINCRONIZADOR DE LVs
// ===================================================================

export class LVSync {
  /**
   * Sincronizar todas as LVs pendentes
   */
  static async syncAll(onProgress?: LVProgressCallback): Promise<LVSyncResult> {
    try {
      console.log('🔄 [LV SYNC] Iniciando sincronização de LVs...');
      
      const lvs = await LVManager.getPendentes();
      
      if (lvs.length === 0) {
        console.log('✅ [LV SYNC] Nenhuma LV pendente para sincronizar');
        return { success: true, sincronizadas: 0, erros: 0 };
      }
      
      console.log(`📤 [LV SYNC] Sincronizando ${lvs.length} LVs...`);
      
      let sincronizadas = 0;
      let erros = 0;
      
      for (let i = 0; i < lvs.length; i++) {
        const lv = lvs[i];
        
        try {
          // Notificar progresso
          if (onProgress) {
            onProgress(i + 1, lvs.length, `Sincronizando LV ${lv.tipo_lv} - ${lv.nome_lv}`);
          }
          
          // Sincronizar LV individual
          await this.syncOne(lv);
          sincronizadas++;
          
          console.log(`✅ [LV SYNC] LV ${i + 1}/${lvs.length} sincronizada:`, lv.id);
          
        } catch (error) {
          erros++;
          console.error(`❌ [LV SYNC] Erro ao sincronizar LV ${lv.id}:`, error);
        }
      }
      
      const success = erros === 0;
      const result: LVSyncResult = {
        success,
        sincronizadas,
        erros,
        error: erros > 0 ? `${erros} LVs com erro na sincronização` : undefined
      };
      
      console.log('✅ [LV SYNC] Sincronização concluída:', result);
      return result;
      
    } catch (error) {
      console.error('❌ [LV SYNC] Erro na sincronização:', error);
      return {
        success: false,
        sincronizadas: 0,
        erros: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido na sincronização'
      };
    }
  }

  /**
   * Sincronizar uma LV específica
   */
  private static async syncOne(lv: LV): Promise<void> {
    try {
      console.log(`🔄 [LV SYNC] Sincronizando LV: ${lv.id}`);
      console.log(`📋 [LV SYNC] Tipo: ${lv.tipo_lv}, Nome: ${lv.nome_lv}`);

      // Preparar dados para inserção no backend
      const dadosParaInserir = this.prepararDadosParaBackend(lv);
      console.log(`📤 [LV SYNC] Dados preparados:`, dadosParaInserir);

      // Enviar para o backend
      const resultado = await this.enviarParaBackend(dadosParaInserir);

      console.log(`📥 [LV SYNC] Resultado do backend:`, {
        success: resultado.success,
        hasData: !!resultado.data,
        dataId: resultado.data?.id,
        error: resultado.error
      });

      if (!resultado.success) {
        throw new Error(`Falha ao criar LV no backend: ${resultado.error || 'Erro desconhecido'}`);
      }

      if (!resultado.data?.id) {
        throw new Error(`Backend não retornou ID da LV criada. Resposta: ${JSON.stringify(resultado)}`);
      }
      
      // Sincronizar avaliações se houver
      const avaliacoes = await LVAvaliacaoManager.getByLVId(lv.id);
      if (avaliacoes.length > 0) {
        await this.syncAvaliacoes(resultado.data.id, avaliacoes);
      }
      
      // Sincronizar fotos se houver
      const fotos = await LVFotoManager.getByLVId(lv.id);
      if (fotos.length > 0) {
        await this.syncFotos(resultado.data.id, fotos);
      }
      
      // Marcar como sincronizada e remover do banco offline
      await LVManager.delete(lv.id);
      await LVAvaliacaoManager.deleteByLVId(lv.id);
      await LVFotoManager.deleteByLVId(lv.id);
      
      console.log(`✅ [LV SYNC] LV ${lv.id} sincronizada com sucesso`);
      
    } catch (error) {
      console.error(`❌ [LV SYNC] Erro ao sincronizar LV ${lv.id}:`, error);
      throw error;
    }
  }

  /**
   * Preparar dados para envio ao backend
   */
  private static prepararDadosParaBackend(lv: LV): any {
    // Mapear campos da LV offline para o formato do backend
    // O backend espera 'titulo' como campo obrigatório para criação
    const dados = {
      tipo_lv: lv.tipo_lv,
      titulo: lv.nome_lv, // Backend espera 'titulo' e mapeia para 'nome_lv'
      nome_lv: lv.nome_lv,
      usuario_id: lv.usuario_id,
      usuario_nome: lv.usuario_nome,
      usuario_matricula: lv.usuario_matricula,
      usuario_email: lv.usuario_email,
      data_inspecao: lv.data_inspecao,
      data_preenchimento: lv.data_preenchimento,
      area: lv.area,
      area_id: lv.area_id,
      responsavel_area: lv.responsavel_area,
      responsavel_tecnico: lv.responsavel_tecnico,
      responsavel_empresa: lv.responsavel_empresa,
      inspetor_principal: lv.inspetor_principal,
      inspetor_secundario: lv.inspetor_secundario,
      inspetor_secundario_matricula: lv.inspetor_secundario_matricula,
      latitude: lv.latitude,
      longitude: lv.longitude,
      gps_precisao: lv.gps_precisao,
      endereco_gps: lv.endereco_gps,
      observacoes_gerais: lv.observacoes_gerais,
      total_fotos: lv.total_fotos,
      total_conformes: lv.total_conformes,
      total_nao_conformes: lv.total_nao_conformes,
      total_nao_aplicaveis: lv.total_nao_aplicaveis,
      percentual_conformidade: lv.percentual_conformidade,
      status: lv.status,
      numero_sequencial: lv.numero_sequencial,
      created_at: lv.created_at,
      updated_at: new Date().toISOString()
    };
    
    // Limpar campos vazios e remover campos offline
    const dadosLimpos = this.limparCamposVazios(dados);
    // Remover campo 'offline' explicitamente (já removido pelo limparCamposVazios se undefined)
    delete dadosLimpos.offline;
    return dadosLimpos;
  }

  /**
   * Limpar campos vazios dos dados
   */
  private static limparCamposVazios(dados: any): any {
    const dadosLimpos: any = {};
    
    Object.entries(dados).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        dadosLimpos[key] = value;
      }
    });
    
    return dadosLimpos;
  }

  /**
   * Enviar dados para o backend
   */
  private static async enviarParaBackend(dados: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = localStorage.getItem('ecofield_auth_token');
      if (!token) {
        console.error('❌ [LV SYNC] Token de autenticação não encontrado no localStorage');
        console.log('🔍 [LV SYNC] Chaves disponíveis no localStorage:', Object.keys(localStorage));
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }

      console.log(`🔑 [LV SYNC] Token encontrado (primeiros 20 chars): ${token.substring(0, 20)}...`);
      console.log(`📡 [LV SYNC] Enviando para: ${import.meta.env.VITE_API_URL}/api/lvs`);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lvs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dados)
      });

      console.log(`📥 [LV SYNC] Status da resposta: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        // Se for 401, o token está expirado
        if (response.status === 401) {
          console.error('❌ [LV SYNC] Token expirado ou inválido (401)');
          throw new Error('Sessão expirada. Por favor, faça login novamente para sincronizar os dados.');
        }

        let errorMessage = 'Erro desconhecido';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
        } catch {
          errorMessage = await response.text();
        }

        throw new Error(`Erro HTTP ${response.status}: ${errorMessage}`);
      }
      
      const resultado = await response.json();

      // O backend pode retornar de duas formas:
      // 1. Diretamente o objeto LV: { id: '...', tipo_lv: '...', ... }
      // 2. Dentro de um wrapper: { data: { id: '...', ... } }
      const lvCriada = resultado.data || resultado;

      console.log(`✅ [LV SYNC] LV criada no backend com ID: ${lvCriada.id}`);

      return { success: true, data: lvCriada };
      
    } catch (error) {
      console.error('❌ [LV SYNC] Erro ao enviar para backend:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Sincronizar avaliações da LV
   */
  private static async syncAvaliacoes(lvId: string, avaliacoes: LVAvaliacao[]): Promise<void> {
    try {
      console.log(`📊 [LV SYNC] Sincronizando ${avaliacoes.length} avaliações...`);
      
      if (avaliacoes.length === 0) {
        console.log('✅ [LV SYNC] Nenhuma avaliação para sincronizar');
        return;
      }

      // Preparar dados das avaliações (array)
      const avaliacoesArray = avaliacoes.map(avaliacao => ({
        item_id: avaliacao.item_id,
        item_codigo: avaliacao.item_codigo,
        item_pergunta: avaliacao.item_pergunta,
        avaliacao: avaliacao.avaliacao,
        observacao: avaliacao.observacao
      }));
      
      // Enviar todas as avaliações de uma vez usando o endpoint correto
      const token = localStorage.getItem('ecofield_auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lvs/${lvId}/avaliacoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avaliacoes: avaliacoesArray })
      });
      
      if (response.ok) {
        console.log(`✅ [LV SYNC] ${avaliacoes.length} avaliações sincronizadas`);
      } else {
        const errorText = await response.text();
        console.error(`❌ [LV SYNC] Erro ao sincronizar avaliações:`, errorText);
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }
      
    } catch (error) {
      console.error('❌ [LV SYNC] Erro na sincronização de avaliações:', error);
      throw error;
    }
  }

  /**
   * Sincronizar fotos da LV
   */
  private static async syncFotos(lvId: string, fotos: LVFoto[]): Promise<void> {
    try {
      console.log(`📸 [LV SYNC] Sincronizando ${fotos.length} fotos...`);
      
      if (fotos.length === 0) {
        console.log('✅ [LV SYNC] Nenhuma foto para sincronizar');
        return;
      }

      const token = localStorage.getItem('ecofield_auth_token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Converter fotos base64 para File e enviar via FormData
      const formData = new FormData();
      
      for (let i = 0; i < fotos.length; i++) {
        const foto = fotos[i];
        
        try {
          // Converter base64 para blob
          let blob: Blob;
          if (foto.url_arquivo.startsWith('data:image/')) {
            // É base64, converter para blob
            const response = await fetch(foto.url_arquivo);
            blob = await response.blob();
          } else {
            // É URL, fazer fetch
            blob = await fetch(foto.url_arquivo).then(r => r.blob());
          }

          // Adicionar ao FormData
          formData.append('fotos', blob, foto.nome_arquivo);
          formData.append(`item_id_${i}`, foto.item_id); // item_id já é string (UUID)
          
          // Adicionar metadados opcionais se existirem
          if (foto.descricao) {
            formData.append(`descricao_${i}`, foto.descricao);
          }
          if (foto.latitude !== undefined && foto.latitude !== null) {
            formData.append(`latitude_${i}`, foto.latitude.toString());
          }
          if (foto.longitude !== undefined && foto.longitude !== null) {
            formData.append(`longitude_${i}`, foto.longitude.toString());
          }
        } catch (error) {
          console.error(`❌ [LV SYNC] Erro ao processar foto ${foto.nome_arquivo}:`, error);
          // Continuar com as outras fotos
        }
      }

      // Enviar todas as fotos de uma vez usando o endpoint correto
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lvs/${lvId}/fotos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        console.log(`✅ [LV SYNC] ${fotos.length} fotos sincronizadas`);
      } else {
        const errorText = await response.text();
        console.error(`❌ [LV SYNC] Erro ao sincronizar fotos:`, errorText);
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }
      
    } catch (error) {
      console.error('❌ [LV SYNC] Erro na sincronização de fotos:', error);
      throw error;
    }
  }
}
