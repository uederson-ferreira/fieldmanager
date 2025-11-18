// ===================================================================
// TERMO SAVER - ECOFIELD SYSTEM
// ===================================================================

import { termosAPI } from '../lib/termosAPI';
import { TermoPhotoUploader } from './TermoPhotoUploader';
import type { TermoFormData } from '../types/termos';
import type { ProcessedPhotoData } from './TermoPhotoProcessor';

export interface SaveResult {
  success: boolean;
  termoId?: string;
  fotosSalvas?: number;
  error?: string;
  warnings?: string[];
}

export interface SaveOptions {
  validarAntes?: boolean;
  salvarFotos?: boolean;
  modoOffline?: boolean;
}

export class TermoSaver {
  /**
   * Salva um termo ambiental
   */
  static async salvarTermo(
    dados: TermoFormData,
    fotos: { [categoria: string]: ProcessedPhotoData[] },
    user: { id: string } | null,
    options: SaveOptions = {}
  ): Promise<SaveResult> {
    try {
      console.log(`💾 [TERMO SAVER] Iniciando salvamento:`, {
        tipoTermo: dados.tipo_termo,
        emitidoPor: dados.emitido_por_nome,
        destinatario: dados.destinatario_nome,
        totalFotos: Object.values(fotos).reduce((total, fotos) => total + fotos.length, 0),
        opcoes: options
      });

      // 1. Validação (se solicitada)
      if (options.validarAntes !== false) {
        console.log(`🔍 [TERMO SAVER] Validando dados...`);
        const validacao = await this.validarDados(dados);
        if (!validacao.isValid) {
          return {
            success: false,
            error: `Dados inválidos: ${validacao.errors.join(', ')}`
          };
        }
      }

      // 2. Verificar modo offline
      if (options.modoOffline || !navigator.onLine) {
        console.log(`📱 [TERMO SAVER] Modo offline detectado, salvando no IndexedDB...`);
        
        try {
          // Importar funções do IndexedDB
          const { saveTermoAmbientalOffline, saveTermoFotoOffline } = await import('../lib/offline');
          
          // Gerar ID único para termo offline
          const termoId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Usar ID único como numero_termo
          const numeroTermo = termoId;
          
          // Preparar dados do termo para IndexedDB
          const termoOffline = {
            id: termoId,
            ...this.prepararDadosTermo(dados),
            numero_termo: numeroTermo,
            offline: true,
            sincronizado: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Salvar termo no IndexedDB
          await saveTermoAmbientalOffline({
            ...termoOffline,
            // Campos obrigatórios da interface base TermoAmbiental
            titulo: `Termo ${dados.tipo_termo} - ${dados.area_equipamento_atividade}`,
            descricao_fatos: dados.observacoes || 'Descrição não fornecida',
            area_id: 'area_default',
            // Campos específicos do termo
            data_termo: dados.data_termo,
            hora_termo: dados.hora_termo,
            local_atividade: dados.local_atividade,
            emitido_por_nome: dados.emitido_por_nome,
            emitido_por_gerencia: dados.emitido_por_gerencia,
            emitido_por_empresa: dados.emitido_por_empresa,
            emitido_por_usuario_id: user?.id || '', // ✅ SEMPRE usar o user.id atual para termos offline
            destinatario_nome: dados.destinatario_nome,
            destinatario_gerencia: dados.destinatario_gerencia, 
            destinatario_empresa: dados.destinatario_empresa,
            area_equipamento_atividade: dados.area_equipamento_atividade,
            equipe: dados.equipe,
            atividade_especifica: dados.atividade_especifica,
            tipo_termo: dados.tipo_termo,
            natureza_desvio: dados.natureza_desvio,
            projeto_ba: dados.projeto_ba,
            fase_etapa_obra: dados.fase_etapa_obra,
            // ✅ Mapear não conformidades do array para campos individuais (como no banco)
            descricao_nc_1: dados.nao_conformidades?.[0]?.descricao || '',
            severidade_nc_1: dados.nao_conformidades?.[0]?.severidade || 'M',
            descricao_nc_2: dados.nao_conformidades?.[1]?.descricao || '',
            severidade_nc_2: dados.nao_conformidades?.[1]?.severidade || 'M',
            descricao_nc_3: dados.nao_conformidades?.[2]?.descricao || '',
            severidade_nc_3: dados.nao_conformidades?.[2]?.severidade || 'M',
            descricao_nc_4: dados.nao_conformidades?.[3]?.descricao || '',
            severidade_nc_4: dados.nao_conformidades?.[3]?.severidade || 'M',
            descricao_nc_5: dados.nao_conformidades?.[4]?.descricao || '',
            severidade_nc_5: dados.nao_conformidades?.[4]?.severidade || 'M',
            lista_verificacao_aplicada: dados.lista_verificacao_aplicada,
            tst_tma_responsavel: dados.tst_tma_responsavel,
            // ✅ Mapear ações de correção do array para campos individuais (como no banco)
            acao_correcao_1: dados.acoes_correcao?.[0]?.descricao || '',
            prazo_acao_1: dados.acoes_correcao?.[0]?.prazo || '',
            acao_correcao_2: dados.acoes_correcao?.[1]?.descricao || '',
            prazo_acao_2: dados.acoes_correcao?.[1]?.prazo || '',
            acao_correcao_3: dados.acoes_correcao?.[2]?.descricao || '',
            prazo_acao_3: dados.acoes_correcao?.[2]?.prazo || '',
            acao_correcao_4: dados.acoes_correcao?.[3]?.descricao || '',
            prazo_acao_4: dados.acoes_correcao?.[3]?.prazo || '',
            acao_correcao_5: dados.acoes_correcao?.[4]?.descricao || '',
            prazo_acao_5: dados.acoes_correcao?.[4]?.prazo || '',
            assinatura_responsavel_area: dados.assinatura_responsavel_area,
            data_assinatura_responsavel: dados.data_assinatura_responsavel,
            assinatura_emitente: dados.assinatura_emitente,
            data_assinatura_emitente: dados.data_assinatura_emitente,
            // ✅ Assinaturas base64 (como no banco)
            assinatura_responsavel_area_img: dados.assinatura_responsavel_area_img,
            assinatura_emitente_img: dados.assinatura_emitente_img,
            providencias_tomadas: dados.providencias_tomadas,
            observacoes: dados.observacoes,
            // ✅ Mapear liberação do objeto para campos individuais (como no banco)
            liberacao_nome: dados.liberacao?.nome || '',
            liberacao_empresa: dados.liberacao?.empresa || '',
            liberacao_gerencia: dados.liberacao?.gerencia || '',
            liberacao_data: dados.liberacao?.data || '',
            liberacao_horario: dados.liberacao?.horario || '',
            liberacao_assinatura_carimbo: dados.liberacao?.assinatura_carimbo || false,
            data_liberacao: dados.liberacao?.data || '',
            status: dados.status || 'PENDENTE',
            latitude: dados.latitude,
            longitude: dados.longitude,
            precisao_gps: dados.precisao_gps,
            endereco_gps: dados.endereco_gps,
            // ✅ Campos que existem no banco
            numero_termo: numeroTermo, // ✅ Usar o número offline gerado
            auth_user_id: user?.id || '', // ✅ Usar o user.id atual
          });
          
          // Salvar fotos no IndexedDB
          let totalFotos = 0;
          for (const [categoria, fotosCategoria] of Object.entries(fotos)) {
            for (const foto of fotosCategoria) {
              const fotoOffline = {
                id: `foto_offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                termo_id: termoOffline.id,
                nome_arquivo: foto.arquivo?.name || 'foto.jpg',
                url_arquivo: '', // Vazio para offline, será preenchido após upload
                arquivo_base64: foto.base64Data || '', // ✅ CORRETO: Campo específico para base64 offline
                tamanho_bytes: foto.tamanho,
                tipo_mime: foto.tipo,
                categoria: categoria,
                descricao: `Foto ${categoria} - ${foto.arquivo?.name || 'foto.jpg'}`,
                latitude: foto.latitude,
                longitude: foto.longitude,
                timestamp_captura: foto.timestamp ? new Date(foto.timestamp).toISOString() : null,
                offline: true,
                sincronizado: false,
                created_at: new Date().toISOString()
              };
              await saveTermoFotoOffline({
                ...fotoOffline,
                timestamp_captura: foto.timestamp ? new Date(foto.timestamp).toISOString() : undefined,
                updated_at: new Date().toISOString() // Campo obrigatório da interface base
              });
              totalFotos++;
            }
          }

          console.log(`✅ [TERMO SAVER] Termo salvo no IndexedDB:`, {
            termoId: termoOffline.id,
            fotosSalvas: totalFotos
          });

          return {
            success: true,
            termoId: termoOffline.id,
            fotosSalvas: totalFotos
          };
        } catch (error) {
          console.error(`❌ [TERMO SAVER] Erro ao salvar offline:`, error);
          return {
            success: false,
            error: `Erro ao salvar offline: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          };
        }
      }
      
      // Modo online - usar termosAPI
      console.log(`💾 [TERMO SAVER] Salvando termo via API...`);
      
      // Preparar dados do termo
      const dadosTermo = this.prepararDadosTermo(dados);

      // Salvar termo via termosAPI
      const resultado = await termosAPI.criarTermo(dadosTermo);

      if (!resultado.success || !resultado.data) {
        console.error(`❌ [TERMO SAVER] Erro ao salvar termo:`, resultado.error);
        return {
          success: false,
          error: `Erro ao salvar termo: ${resultado.error || 'Erro desconhecido'}`
        };
      }

      const termoId = resultado.data.id;
      let totalFotos = 0;

      // 3. Upload de fotos (se houver)
      if (options.salvarFotos !== false && Object.keys(fotos).length > 0) {
        console.log(`📤 [TERMO SAVER] Iniciando upload de fotos com termoId...`);
        
        // Usar processarUploadCompleto para garantir que metadados sejam salvos
        const uploadCompletoResult = await TermoPhotoUploader.processarUploadCompleto(fotos, termoId);
        
        if (!uploadCompletoResult.success) {
          return {
            success: true, // termo já salvo
            termoId,
            fotosSalvas: 0,
            error: `Termo salvo, mas falha no upload das fotos: ${uploadCompletoResult.error}`
          };
        }

        totalFotos = uploadCompletoResult.fotosSalvas;
        
        console.log(`📊 [TERMO SAVER] Upload completo realizado:`, {
          fotosSalvas: totalFotos,
          sucesso: uploadCompletoResult.success
        });
      }

      console.log(`✅ [TERMO SAVER] Termo salvo via API:`, {
        termoId,
        numeroTermo: resultado.data.numero_termo,
        fotosSalvas: totalFotos
      });

      return {
        success: true,
        termoId,
        fotosSalvas: totalFotos
      };
    } catch (error) {
      console.error(`❌ [TERMO SAVER] Erro no salvamento:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no salvamento'
      };
    }
  }

  /**
   * Valida os dados do termo
   */
  private static async validarDados(dados: TermoFormData): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validações básicas
    if (!dados.tipo_termo) errors.push('Tipo do termo é obrigatório');
    if (!dados.destinatario_nome) errors.push('Destinatário é obrigatório');
    if (!dados.local_atividade) errors.push('Local da atividade é obrigatório');
    if (!dados.area_equipamento_atividade) errors.push('Área/equipamento é obrigatório');
    if (!dados.natureza_desvio) errors.push('Natureza do desvio é obrigatória');

    return {
      isValid: errors.length === 0,
      errors
    };
  }



  /**
   * Prepara dados do termo para envio
   */
  static prepararDadosTermo(dados: TermoFormData): Record<string, unknown> {
    return {
      // Identificação básica
      numero_termo: dados.numero_termo, // ✅ INCLUIR numero_termo
      data_termo: dados.data_termo,
      hora_termo: dados.hora_termo,
      local_atividade: dados.local_atividade,
      projeto_ba: dados.projeto_ba,
      fase_etapa_obra: dados.fase_etapa_obra,
      
      // Emissor
      emitido_por_nome: dados.emitido_por_nome,
      emitido_por_gerencia: dados.emitido_por_gerencia,
      emitido_por_empresa: dados.emitido_por_empresa,
      emitido_por_usuario_id: dados.emitido_por_usuario_id,
      
      // Destinatário
      destinatario_nome: dados.destinatario_nome,
      destinatario_gerencia: dados.destinatario_gerencia,
      destinatario_empresa: dados.destinatario_empresa,
      
      // Localização
      area_equipamento_atividade: dados.area_equipamento_atividade,
      equipe: dados.equipe,
      atividade_especifica: dados.atividade_especifica,
      
      // Tipo e natureza
      tipo_termo: dados.tipo_termo,
      natureza_desvio: dados.natureza_desvio,
      
      // Lista de verificação
      lista_verificacao_aplicada: dados.lista_verificacao_aplicada,
      tst_tma_responsavel: dados.tst_tma_responsavel,
      
      // Assinaturas
      assinatura_responsavel_area: dados.assinatura_responsavel_area,
      assinatura_emitente: dados.assinatura_emitente,
      
      // Datas de assinatura
      data_assinatura_responsavel: dados.data_assinatura_responsavel,
      data_assinatura_emitente: dados.data_assinatura_emitente,
      
      // Assinaturas base64 (imagens)
      assinatura_responsavel_area_img: dados.assinatura_responsavel_area_img,
      assinatura_emitente_img: dados.assinatura_emitente_img,
      
      // Textos
      providencias_tomadas: dados.providencias_tomadas,
      observacoes: dados.observacoes,
      
      // GPS
      latitude: dados.latitude,
      longitude: dados.longitude,
      precisao_gps: dados.precisao_gps,
      endereco_gps: dados.endereco_gps,
      
      // ✅ Mapear não conformidades para campos individuais (como no banco)
      ...(dados.nao_conformidades && Array.isArray(dados.nao_conformidades) ? 
        dados.nao_conformidades.reduce((acc, nc, index) => {
          if (index < 10) {
            acc[`descricao_nc_${index + 1}`] = nc.descricao;
            acc[`severidade_nc_${index + 1}`] = nc.severidade;
          }
          return acc;
        }, {} as Record<string, unknown>) : {}),
      
      // ✅ Mapear ações de correção para campos individuais (como no banco)
      ...(dados.acoes_correcao && Array.isArray(dados.acoes_correcao) ? 
        dados.acoes_correcao.reduce((acc, acao, index) => {
          if (index < 10) {
            acc[`acao_correcao_${index + 1}`] = acao.descricao;
            acc[`prazo_acao_${index + 1}`] = acao.prazo;
          }
          return acc;
        }, {} as Record<string, unknown>) : {}),
      
      // ✅ Mapear liberação para campos individuais (como no banco)
      ...(dados.liberacao ? {
        liberacao_nome: dados.liberacao.nome,
        liberacao_empresa: dados.liberacao.empresa,
        liberacao_gerencia: dados.liberacao.gerencia,
        liberacao_data: dados.liberacao.data,
        liberacao_horario: dados.liberacao.horario,
        liberacao_assinatura_carimbo: dados.liberacao.assinatura_carimbo,
        data_liberacao: dados.liberacao.data
      } : {}),
      
      // Status inicial
      status: 'PENDENTE',
      sincronizado: true,
      offline: false
    };
  }

  /**
   * Sincroniza termos offline
   */
  static async sincronizarTermosOffline(): Promise<{ success: boolean; sincronizados: number; error?: string }> {
    console.log(`🔄 [TERMO SAVER] Iniciando sincronização de termos offline...`);
    
    try {
          const { syncTermosAmbientaisOffline } = await import('../lib/offline');
    const resultado = await syncTermosAmbientaisOffline();
      
      console.log(`✅ [TERMO SAVER] Sincronização concluída:`, resultado);
      return resultado;
    } catch (error) {
      console.error(`❌ [TERMO SAVER] Erro na sincronização:`, error);
      return {
        success: false,
        sincronizados: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido na sincronização'
      };
    }
  }
} 