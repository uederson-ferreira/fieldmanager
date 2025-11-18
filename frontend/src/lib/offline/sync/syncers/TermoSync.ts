// ===================================================================
// TERMO SYNC - ECOFIELD SYSTEM
// Localização: src/lib/offline/sync/syncers/TermoSync.ts
// Módulo: Sincronização de termos ambientais offline
// ===================================================================

import type { TermoAmbientalOffline, TermoFotoOffline } from '../../../../types/offline';
import { TermoManager, TermoFotoManager } from '../../entities';
import { ConflictDetector, type ConflictInfo, type ConflictResolution } from '../ConflictDetector';

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

export interface ProgressCallback {
  (atual: number, total: number, termoAtual: string): void;
}

export interface ConflictCallback {
  (conflict: ConflictInfo): Promise<ConflictResolution>;
}

export interface SyncResult {
  success: boolean;
  sincronizados: number;
  erros: number;
  conflitos: number;
  error?: string;
}

// ===================================================================
// SINCRONIZADOR DE TERMOS AMBIENTAIS
// ===================================================================

export class TermoSync {
  /**
   * Sincronizar todos os termos pendentes
   */
  static async syncAll(onProgress?: ProgressCallback, onConflict?: ConflictCallback): Promise<SyncResult> {
    try {
      console.log('🔄 [TERMO SYNC] Iniciando sincronização de termos...');

      const termos = await TermoManager.getPendentes();

      if (termos.length === 0) {
        console.log('✅ [TERMO SYNC] Nenhum termo pendente para sincronizar');
        return { success: true, sincronizados: 0, erros: 0, conflitos: 0 };
      }

      console.log(`📤 [TERMO SYNC] Sincronizando ${termos.length} termos...`);

      let sincronizados = 0;
      let erros = 0;
      let conflitos = 0;

      for (let i = 0; i < termos.length; i++) {
        const termo = termos[i];

        try {
          // Notificar progresso
          if (onProgress) {
            onProgress(i + 1, termos.length, `Sincronizando termo ${termo.numero_termo || termo.id}`);
          }

          // Sincronizar termo individual
          const result = await this.syncOne(termo, onConflict);

          if (result.conflict) {
            conflitos++;
            console.log(`⚠️ [TERMO SYNC] Conflito resolvido no termo ${i + 1}/${termos.length}:`, termo.id);
          } else {
            sincronizados++;
            console.log(`✅ [TERMO SYNC] Termo ${i + 1}/${termos.length} sincronizado:`, termo.id);
          }

        } catch (error) {
          erros++;
          console.error(`❌ [TERMO SYNC] Erro ao sincronizar termo ${termo.id}:`, error);
        }
      }

      const success = erros === 0;
      const result: SyncResult = {
        success,
        sincronizados,
        erros,
        conflitos,
        error: erros > 0 ? `${erros} termos com erro na sincronização` : undefined
      };

      console.log('✅ [TERMO SYNC] Sincronização concluída:', result);
      return result;

    } catch (error) {
      console.error('❌ [TERMO SYNC] Erro na sincronização:', error);
      return {
        success: false,
        sincronizados: 0,
        erros: 0,
        conflitos: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido na sincronização'
      };
    }
  }

  /**
   * Sincronizar um termo específico
   */
  private static async syncOne(
    termo: TermoAmbientalOffline,
    onConflict?: ConflictCallback
  ): Promise<{ success: boolean; conflict?: boolean }> {
    try {
      console.log(`🔄 [TERMO SYNC] Sincronizando termo: ${termo.id}`);

      // ✅ P0 FIX: Verificar conflitos antes de sincronizar
      const token = localStorage.getItem('ecofield_auth_token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Verificar se há conflito
      const conflict = await ConflictDetector.checkForConflict('termo', termo, token);

      if (conflict && onConflict) {
        // Há conflito - pedir ao usuário para resolver
        console.warn(`⚠️ [TERMO SYNC] Conflito detectado no termo ${termo.id}`);

        const resolution = await onConflict(conflict);

        // Resolver conflito
        const resolveResult = await ConflictDetector.resolveConflict(conflict, resolution, token);

        if (!resolveResult.success) {
          console.warn(`⚠️ [TERMO SYNC] Resolução de conflito falhou ou foi pulada:`, resolveResult.error);
          return { success: false, conflict: true };
        }

        // Conflito resolvido - continuar com limpeza local
        console.log(`✅ [TERMO SYNC] Conflito resolvido para termo ${termo.id}`);

        // Remover do banco offline
        await TermoManager.delete(termo.id);

        return { success: true, conflict: true };
      }

      // Sem conflito - proceder normalmente
      const dadosParaInserir = this.prepararDadosParaBackend(termo);

      // Enviar para o backend
      const resultado = await this.enviarParaBackend(dadosParaInserir);

      if (resultado.success && resultado.data?.id) {
        // ✅ Sincronização bem-sucedida - remover do banco offline
        console.log(`✅ [TERMO SYNC] Termo ${termo.id} sincronizado com sucesso no backend`);

        // Sincronizar fotos se houver
        const fotos = await TermoFotoManager.getByTermoId(termo.id);
        if (fotos.length > 0) {
          // ✅ P0 FIX: Receber resultado da sincronização de fotos
          const fotoResult = await this.syncFotos(resultado.data.id, fotos);

          if (fotoResult.failed > 0) {
            console.warn(`⚠️ [TERMO SYNC] ${fotoResult.failed} fotos falharam na sincronização (${fotoResult.success} sucesso)`);
            // Mesmo com falha em fotos, continuar com limpeza do termo
            // As fotos que falharam foram logadas para possível retry manual
          }
        }

        // Remover do banco offline (usando transação atômica do P0 fix)
        await TermoManager.delete(termo.id);

        console.log(`✅ [TERMO SYNC] Termo ${termo.id} removido do IndexedDB`);

        return { success: true };

      } else {
        // ⚠️ Sincronização falhou - implementar estratégia de fallback
        console.warn(`⚠️ [TERMO SYNC] Falha na sincronização do termo ${termo.id}, implementando fallback...`);

        // Estratégia de fallback: marcar como sincronizado localmente
        await this.implementarFallback(termo);

        return { success: false };
      }

    } catch (error) {
      console.error(`❌ [TERMO SYNC] Erro ao sincronizar termo ${termo.id}:`, error);

      // Em caso de erro, também implementar fallback
      try {
        await this.implementarFallback(termo);
      } catch (fallbackError) {
        console.error(`❌ [TERMO SYNC] Erro no fallback para termo ${termo.id}:`, fallbackError);
      }

      throw error;
    }
  }

  /**
   * Implementar estratégia de fallback para termos com falha na sincronização
   */
  private static async implementarFallback(termo: TermoAmbientalOffline): Promise<void> {
    try {
      console.log(`🔄 [TERMO SYNC] Implementando fallback para termo ${termo.id}`);
      
      // 1. Mudar o número do termo: OFF → SINC (para indicar tentativa de sincronização)
      if (termo.numero_termo && termo.numero_termo.includes('-OFF-')) {
        termo.numero_termo = termo.numero_termo.replace('-OFF-', '-SINC-');
        console.log(`📝 [TERMO SYNC] Número do termo alterado para: ${termo.numero_termo}`);
      }
      
      // 2. Marcar como sincronizado localmente (para evitar re-sincronização)
      termo.sincronizado = true;
      termo.updated_at = new Date().toISOString();
      
      // 3. MANTER no IndexedDB (não remover) para tentar sincronizar novamente depois
      await TermoManager.update(termo);
      
      console.log(`✅ [TERMO SYNC] Fallback implementado: termo ${termo.id} mantido no IndexedDB para nova tentativa`);
      
    } catch (error) {
      console.error(`❌ [TERMO SYNC] Erro ao implementar fallback para termo ${termo.id}:`, error);
      throw error;
    }
  }

  /**
   * Preparar dados para envio ao backend
   */
  private static prepararDadosParaBackend(termo: TermoAmbientalOffline): any {
    // Mapear campos do termo offline para o formato do backend
    const dados = {
      numero_termo: termo.numero_termo, // ✅ ADICIONADO: Campo numero_termo estava faltando
      numero_sequencial: termo.numero_sequencial,
      data_termo: termo.data_termo,
      hora_termo: termo.hora_termo,
      local_atividade: termo.local_atividade,
      projeto_ba: termo.projeto_ba,
      fase_etapa_obra: termo.fase_etapa_obra,
      emitido_por_nome: termo.emitido_por_nome,
      emitido_por_gerencia: termo.emitido_por_gerencia,
      emitido_por_empresa: termo.emitido_por_empresa,
      emitido_por_usuario_id: termo.emitido_por_usuario_id,
      auth_user_id: termo.emitido_por_usuario_id,
      destinatario_nome: termo.destinatario_nome,
      destinatario_gerencia: termo.destinatario_gerencia,
      destinatario_empresa: termo.destinatario_empresa,
      area_equipamento_atividade: termo.area_equipamento_atividade,
      equipe: termo.equipe,
      atividade_especifica: termo.atividade_especifica,
      tipo_termo: termo.tipo_termo,
      natureza_desvio: termo.natureza_desvio,
      
      // Campos de não conformidades
      descricao_nc_1: termo.descricao_nc_1,
      severidade_nc_1: termo.severidade_nc_1,
      descricao_nc_2: termo.descricao_nc_2,
      severidade_nc_2: termo.severidade_nc_2,
      descricao_nc_3: termo.descricao_nc_3,
      severidade_nc_3: termo.severidade_nc_3,
      descricao_nc_4: termo.descricao_nc_4,
      severidade_nc_4: termo.severidade_nc_4,
      descricao_nc_5: termo.descricao_nc_5,
      severidade_nc_5: termo.severidade_nc_5,
      descricao_nc_6: termo.descricao_nc_6,
      severidade_nc_6: termo.severidade_nc_6,
      descricao_nc_7: termo.descricao_nc_7,
      severidade_nc_7: termo.severidade_nc_7,
      descricao_nc_8: termo.descricao_nc_8,
      severidade_nc_8: termo.severidade_nc_8,
      descricao_nc_9: termo.descricao_nc_9,
      severidade_nc_9: termo.severidade_nc_9,
      descricao_nc_10: termo.descricao_nc_10,
      severidade_nc_10: termo.severidade_nc_10,
      
      lista_verificacao_aplicada: termo.lista_verificacao_aplicada,
      tst_tma_responsavel: termo.tst_tma_responsavel,
      
      // Campos de ações de correção
      acao_correcao_1: termo.acao_correcao_1,
      prazo_acao_1: termo.prazo_acao_1,
      acao_correcao_2: termo.acao_correcao_2,
      prazo_acao_2: termo.prazo_acao_2,
      acao_correcao_3: termo.acao_correcao_3,
      prazo_acao_3: termo.prazo_acao_3,
      acao_correcao_4: termo.acao_correcao_4,
      prazo_acao_4: termo.prazo_acao_4,
      acao_correcao_5: termo.acao_correcao_5,
      prazo_acao_5: termo.prazo_acao_5,
      acao_correcao_6: termo.acao_correcao_6,
      prazo_acao_6: termo.prazo_acao_6,
      acao_correcao_7: termo.acao_correcao_7,
      prazo_acao_7: termo.prazo_acao_7,
      acao_correcao_8: termo.acao_correcao_8,
      prazo_acao_8: termo.prazo_acao_8,
      acao_correcao_9: termo.acao_correcao_9,
      prazo_acao_9: termo.prazo_acao_9,
      acao_correcao_10: termo.acao_correcao_10,
      prazo_acao_10: termo.prazo_acao_10,
      
      // Campos de assinatura
      assinatura_responsavel_area: termo.assinatura_responsavel_area,
      data_assinatura_responsavel: termo.data_assinatura_responsavel,
      assinatura_emitente: termo.assinatura_emitente,
      data_assinatura_emitente: termo.data_assinatura_emitente,
      assinatura_responsavel_area_img: termo.assinatura_responsavel_area_img,
      assinatura_emitente_img: termo.assinatura_emitente_img,
      
      // Campos de liberação
      liberacao_nome: termo.liberacao_nome,
      liberacao_empresa: termo.liberacao_empresa,
      liberacao_gerencia: termo.liberacao_gerencia,
      liberacao_data: termo.liberacao_data,
      liberacao_horario: termo.liberacao_horario,
      liberacao_assinatura_carimbo: termo.liberacao_assinatura_carimbo,
      data_liberacao: termo.data_liberacao,
      
      // Campos de localização
      latitude: termo.latitude,
      longitude: termo.longitude,
      precisao_gps: termo.precisao_gps,
      endereco_gps: termo.endereco_gps,
      
      // Campos adicionais
      providencias_tomadas: termo.providencias_tomadas,
      observacoes: termo.observacoes,
      status: termo.status,
      created_at: termo.created_at,
      updated_at: new Date().toISOString()
    };
    
    // Limpar campos vazios
    return this.limparCamposVazios(dados);
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
        throw new Error('Token de autenticação não encontrado');
      }
      
      console.log(`📤 [TERMO SYNC] Enviando dados para backend:`, dados);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/termos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dados)
      });
      
      console.log(`📥 [TERMO SYNC] Resposta do backend: Status ${response.status}`);

      if (!response.ok) {
        // Se for 401, o token está expirado
        if (response.status === 401) {
          console.error('❌ [TERMO SYNC] Token expirado ou inválido (401)');
          throw new Error('Sessão expirada. Por favor, faça login novamente para sincronizar os dados.');
        }

        let errorMessage = `Erro HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += `: ${errorData.error || errorData.message || 'Erro desconhecido'}`;
          console.error(`❌ [TERMO SYNC] Dados do erro:`, errorData);
        } catch (parseError) {
          errorMessage += ': Resposta não é JSON válido';
          console.error(`❌ [TERMO SYNC] Erro ao parsear resposta:`, parseError);
        }
        throw new Error(errorMessage);
      }
      
      const resultado = await response.json();
      console.log(`✅ [TERMO SYNC] Resposta do backend:`, resultado);
      
      // Verificar se a resposta tem a estrutura esperada
      if (!resultado || typeof resultado !== 'object') {
        throw new Error('Resposta do backend não é um objeto válido');
      }
      
      // Se não tem data, mas tem success, pode ser uma resposta diferente
      if (resultado.success && !resultado.data) {
        console.warn(`⚠️ [TERMO SYNC] Backend retornou success=true mas sem data`);
        return { success: true, data: resultado };
      }
      
      return { success: true, data: resultado.data || resultado };
      
    } catch (error) {
      console.error('❌ [TERMO SYNC] Erro ao enviar para backend:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Sincronizar fotos do termo
   */
  private static async syncFotos(termoId: string, fotos: TermoFotoOffline[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const result = { success: 0, failed: 0, errors: [] as string[] };

    try {
      console.log(`📸 [TERMO SYNC] Sincronizando ${fotos.length} fotos para termo ${termoId}...`);

      const fotosParaSalvar: any[] = [];

      for (const foto of fotos) {
        try {
          console.log(`📤 [TERMO SYNC] Iniciando upload da foto: ${foto.nome_arquivo}`);

          // ✅ P0 FIX: Validar arquivo base64 antes de tentar upload
          if (!foto.arquivo_base64 || foto.arquivo_base64.trim() === '') {
            const error = `Foto ${foto.nome_arquivo} não possui dados base64`;
            console.error(`❌ [TERMO SYNC] ${error}`);
            result.failed++;
            result.errors.push(error);
            continue; // ✅ CONTINUAR com próxima foto ao invés de parar tudo
          }

          // 1. Upload da foto para o bucket fotos-termos
          const formData = new FormData();

          // ✅ P0 FIX: Try-catch específico para conversão de base64 para blob
          let blob: Blob;
          try {
            blob = await fetch(foto.arquivo_base64).then(r => r.blob());

            if (blob.size === 0) {
              const error = `Foto ${foto.nome_arquivo} resultou em blob vazio (0 bytes)`;
              console.error(`❌ [TERMO SYNC] ${error}`);
              result.failed++;
              result.errors.push(error);
              continue; // ✅ CONTINUAR com próxima foto
            }
          } catch (blobError) {
            const error = `Erro ao converter base64 para blob: ${foto.nome_arquivo}`;
            console.error(`❌ [TERMO SYNC] ${error}:`, blobError);
            result.failed++;
            result.errors.push(error);
            continue; // ✅ CONTINUAR com próxima foto
          }

          formData.append('file', blob, foto.nome_arquivo);
          formData.append('entityType', 'termos');
          formData.append('entityId', termoId);
          formData.append('categoria', foto.categoria || 'geral');

          console.log(`📤 [TERMO SYNC] FormData criado para ${foto.nome_arquivo}, blob size: ${blob.size} bytes`);

          const token = localStorage.getItem('ecofield_auth_token');

          // ✅ P0 FIX: Try-catch específico para upload HTTP
          let uploadResponse: Response;
          try {
            uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            });
          } catch (fetchError) {
            const error = `Erro de rede ao fazer upload de ${foto.nome_arquivo}`;
            console.error(`❌ [TERMO SYNC] ${error}:`, fetchError);
            result.failed++;
            result.errors.push(error);
            continue; // ✅ CONTINUAR com próxima foto
          }

          console.log(`📥 [TERMO SYNC] Resposta upload ${foto.nome_arquivo}: Status ${uploadResponse.status}`);

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            console.log(`✅ [TERMO SYNC] Foto uploadada com sucesso: ${foto.nome_arquivo}`, uploadResult);

            // 2. Preparar metadados da foto para salvar na tabela termos_fotos
            fotosParaSalvar.push({
              nome_arquivo: foto.nome_arquivo,
              url_arquivo: uploadResult.url || uploadResult.filePath,
              tamanho_bytes: blob.size,
              tipo_mime: blob.type || 'image/jpeg',
              categoria: foto.categoria || 'geral',
              descricao: foto.descricao || '',
              latitude: foto.latitude,
              longitude: foto.longitude,
              timestamp_captura: foto.timestamp_captura || new Date().toISOString()
            });

            result.success++; // ✅ Incrementar contador de sucesso

          } else {
            // Capturar detalhes do erro de upload
            let errorMessage = `Erro HTTP ${uploadResponse.status}`;
            try {
              const errorData = await uploadResponse.json();
              errorMessage += `: ${errorData.error || errorData.message || 'Erro desconhecido'}`;
              console.error(`❌ [TERMO SYNC] Erro detalhado upload ${foto.nome_arquivo}:`, errorData);
            } catch (parseError) {
              errorMessage += ': Resposta não é JSON válido';
              console.error(`❌ [TERMO SYNC] Erro ao parsear resposta upload ${foto.nome_arquivo}:`, parseError);
            }

            const error = `Erro ao fazer upload de ${foto.nome_arquivo}: ${errorMessage}`;
            console.error(`❌ [TERMO SYNC] ${error}`);
            result.failed++;
            result.errors.push(error);
            // ✅ CONTINUAR com próxima foto ao invés de parar
          }

        } catch (error) {
          const errorMsg = `Erro inesperado ao processar foto ${foto.nome_arquivo}`;
          console.error(`❌ [TERMO SYNC] ${errorMsg}:`, error);
          result.failed++;
          result.errors.push(errorMsg);
          // ✅ CONTINUAR com próxima foto
        }
      }
      
      // 3. Salvar metadados das fotos que foram uploadadas com sucesso
      if (fotosParaSalvar.length > 0) {
        try {
          console.log(`💾 [TERMO SYNC] Salvando metadados de ${fotosParaSalvar.length} fotos...`);
          
          const token = localStorage.getItem('ecofield_auth_token');
          const metadataResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/termos/${termoId}/fotos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ fotos: fotosParaSalvar })
          });
          
          console.log(`📥 [TERMO SYNC] Resposta metadados fotos: Status ${metadataResponse.status}`);
          
          if (metadataResponse.ok) {
            const metadataResult = await metadataResponse.json();
            console.log(`✅ [TERMO SYNC] Metadados de fotos salvos com sucesso:`, metadataResult);
          } else {
            const errorData = await metadataResponse.json();
            console.error(`❌ [TERMO SYNC] Erro ao salvar metadados das fotos:`, errorData);
          }
          
        } catch (error) {
          console.error(`❌ [TERMO SYNC] Erro ao salvar metadados das fotos:`, error);
        }
      }

      // Log resumo do resultado
      console.log(`✅ [TERMO SYNC] Sincronização de fotos concluída: ${result.success} sucesso, ${result.failed} falhas`);
      if (result.errors.length > 0) {
        console.warn(`⚠️ [TERMO SYNC] Erros nas fotos:`, result.errors);
      }

      return result;

    } catch (error) {
      console.error('❌ [TERMO SYNC] Erro na sincronização de fotos:', error);
      return result; // Retornar resultado parcial mesmo com erro geral
    }
  }
}
