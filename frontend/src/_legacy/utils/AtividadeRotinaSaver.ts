// ===================================================================
// ATIVIDADE ROTINA SAVER - ECOFIELD SYSTEM
// ===================================================================

import { rotinasAPI } from '../lib/rotinasAPI';
import type { AtividadeRotinaOffline, FotoRotinaOffline } from '../types/offline';

export interface SaveResult {
  success: boolean;
  atividadeId?: string;
  fotosSalvas?: number;
  error?: string;
  warnings?: string[];
}

export interface SaveOptions {
  validarAntes?: boolean;
  salvarFotos?: boolean;
  modoOffline?: boolean;
}

export interface AtividadeRotinaFormData {
  data_atividade: string;
  hora_inicio: string;
  hora_fim: string;
  area_id: string;
  atividade: string;
  descricao: string;
  km_percorrido: string;
  tma_responsavel_id: string;
  encarregado_id: string;
  empresa_contratada_id: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  foto: File | string | null;
}

export class AtividadeRotinaSaver {
  /**
   * Salva uma atividade de rotina
   */
  static async salvarAtividade(
    dados: AtividadeRotinaFormData,
    user: { id: string } | null,
    options: SaveOptions = {}
  ): Promise<SaveResult> {
    try {
      console.log(`💾 [ATIVIDADE ROTINA SAVER] Iniciando salvamento:`, {
        atividade: dados.atividade,
        area: dados.area_id,
        responsavel: dados.tma_responsavel_id,
        opcoes: options
      });

      // 1. Validação (se solicitada)
      if (options.validarAntes !== false) {
        console.log(`🔍 [ATIVIDADE ROTINA SAVER] Validando dados...`);
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
        console.log(`📱 [ATIVIDADE ROTINA SAVER] Modo offline detectado, salvando no IndexedDB...`);
        
        try {
          // Importar funções do IndexedDB
          const { AtividadeRotinaManager, FotoRotinaManager } = await import('../lib/offline/entities/managers/AtividadeRotinaManager');
          
          // Gerar ID único para atividade offline
          const atividadeId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Preparar dados da atividade para IndexedDB
          const atividadeOffline: AtividadeRotinaOffline = {
            id: atividadeId,
            ...this.prepararDadosAtividade(dados),
            // tma_responsavel_id já está definido nos dados do formulário
            auth_user_id: user?.id || '',
            offline: true,
            sincronizado: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Salvar atividade no IndexedDB
          await AtividadeRotinaManager.save(atividadeOffline);
          
          // Salvar foto se houver
          let totalFotos = 0;
          if (dados.foto && dados.foto instanceof File) {
            const fotoOffline: FotoRotinaOffline = {
              id: `foto_offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              atividade_id: atividadeId,
              nome_arquivo: dados.foto.name,
              // url_arquivo será gerado quando sincronizar online
              arquivo_base64: await this.fileToBase64(dados.foto),
              descricao: `Foto da atividade - ${dados.foto.name}`,
              offline: true,
              sincronizado: false,
              created_at: new Date().toISOString()
            };
            
            await FotoRotinaManager.save(fotoOffline);
            totalFotos = 1;
          }

          console.log(`✅ [ATIVIDADE ROTINA SAVER] Atividade salva no IndexedDB:`, {
            atividadeId,
            fotosSalvas: totalFotos
          });

          // Disparar evento para atualizar metas no dashboard
          window.dispatchEvent(new CustomEvent('meta:atualizar'));
          console.log('🔔 [ATIVIDADE ROTINA SAVER] Evento meta:atualizar disparado');

          return {
            success: true,
            atividadeId,
            fotosSalvas: totalFotos
          };
        } catch (error) {
          console.error(`❌ [ATIVIDADE ROTINA SAVER] Erro ao salvar offline:`, error);
          return {
            success: false,
            error: `Erro ao salvar offline: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          };
        }
      }
      
      // Modo online - usar rotinasAPI
      console.log(`💾 [ATIVIDADE ROTINA SAVER] Salvando atividade via API...`);
      
      // Preparar dados da atividade
      const dadosAtividade = this.prepararDadosAtividade(dados);
      
      // Adicionar auth_user_id para RLS
      dadosAtividade.auth_user_id = user?.id || null;
      dadosAtividade.emitido_por_usuario_id = user?.id || null;

      // Salvar atividade via rotinasAPI
      const resultado = await rotinasAPI.create(dadosAtividade);

      if (!resultado.success || !resultado.data) {
        console.error(`❌ [ATIVIDADE ROTINA SAVER] Erro ao salvar atividade:`, resultado.error);
        return {
          success: false,
          error: `Erro ao salvar atividade: ${resultado.error || 'Erro desconhecido'}`
        };
      }

      const atividadeId = resultado.data.id;
      let totalFotos = 0;

      // Salvar foto se houver
      if (options.salvarFotos !== false && dados.foto instanceof File) {
        console.log(`📤 [ATIVIDADE ROTINA SAVER] Uploading foto para rotina...`);
        
        try {
          // 1. Upload da foto para o bucket fotos-rotina
          const token = localStorage.getItem('ecofield_auth_token');
          const formData = new FormData();
          formData.append('file', dados.foto);
          formData.append('entityType', 'rotina');
          formData.append('entityId', atividadeId);
          
          const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          
          if (!uploadResponse.ok) {
            console.error(`❌ [ATIVIDADE ROTINA SAVER] Erro no upload da foto:`, uploadResponse.status);
          } else {
            const uploadResult = await uploadResponse.json();
            console.log(`📸 [ATIVIDADE ROTINA SAVER] Foto uploaded:`, uploadResult.url);
            
            // 2. Salvar metadados da foto na tabela fotos_rotina
            const fotoMetadata = {
              nome_arquivo: dados.foto.name,
              url_arquivo: uploadResult.url,
              descricao: `Foto da atividade - ${dados.foto.name}`
            };
            
            const fotosResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/rotinas/${atividadeId}/fotos`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ fotos: [fotoMetadata] })
            });
            
            if (fotosResponse.ok) {
              totalFotos = 1;
              console.log(`✅ [ATIVIDADE ROTINA SAVER] Foto salva com sucesso`);
            } else {
              console.error(`❌ [ATIVIDADE ROTINA SAVER] Erro ao salvar metadados da foto:`, fotosResponse.status);
            }
          }
        } catch (error) {
          console.error(`❌ [ATIVIDADE ROTINA SAVER] Erro no upload da foto:`, error);
        }
      }

      console.log(`✅ [ATIVIDADE ROTINA SAVER] Atividade salva via API:`, {
        atividadeId,
        fotosSalvas: totalFotos
      });

      // Disparar evento para atualizar metas no dashboard
      window.dispatchEvent(new CustomEvent('meta:atualizar'));
      console.log('🔔 [ATIVIDADE ROTINA SAVER] Evento meta:atualizar disparado');

      return {
        success: true,
        atividadeId,
        fotosSalvas: totalFotos
      };
    } catch (error) {
      console.error(`❌ [ATIVIDADE ROTINA SAVER] Erro no salvamento:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no salvamento'
      };
    }
  }

  /**
   * Valida os dados da atividade
   */
  private static async validarDados(dados: AtividadeRotinaFormData): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validações básicas
    if (!dados.data_atividade) errors.push('Data da atividade é obrigatória');
    if (!dados.area_id) errors.push('Área é obrigatória');
    if (!dados.atividade) errors.push('Nome da atividade é obrigatório');
    if (!dados.tma_responsavel_id) errors.push('TMA responsável é obrigatório');
    if (!dados.encarregado_id) errors.push('Encarregado é obrigatório');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Prepara dados da atividade para envio
   */
  static prepararDadosAtividade(dados: AtividadeRotinaFormData): Record<string, unknown> {
    return {
      data_atividade: dados.data_atividade,
      hora_inicio: dados.hora_inicio || null,
      hora_fim: dados.hora_fim || null,
      area_id: dados.area_id,
      atividade: dados.atividade,
      descricao: dados.descricao || '',
      km_percorrido: dados.km_percorrido ? parseFloat(dados.km_percorrido) : null,
      tma_responsavel_id: dados.tma_responsavel_id,
      encarregado_id: dados.encarregado_id,
      empresa_contratada_id: dados.empresa_contratada_id || null,
      status: dados.status || 'Planejada',
      latitude: dados.latitude,
      longitude: dados.longitude
    };
  }

  /**
   * Converte File para Base64
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}
