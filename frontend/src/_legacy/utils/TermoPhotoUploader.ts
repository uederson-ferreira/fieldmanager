// ===================================================================
// MÓDULO: Termos - Upload de Fotos
// Localização: src/utils/TermoPhotoUploader.ts
// ===================================================================

import { getAuthToken } from './authUtils';

const API_URL = import.meta.env.VITE_API_URL;
import type { ProcessedPhotoData } from './TermoPhotoProcessor';

export interface UploadResult {
  success: boolean;
  url?: string;
  filePath?: string;
  error?: string;
}

export interface BatchUploadResult {
  success: boolean;
  totalFotos: number;
  fotosSalvas: number;
  erros: string[];
  resultados: UploadResult[];
}

export class TermoPhotoUploader {
  private static readonly BACKEND_URL = `${API_URL}/api`;

  /**
   * Faz upload de uma foto individual
   */
  static async uploadFoto(
    foto: ProcessedPhotoData,
    termoId: string,
    categoria: string
  ): Promise<UploadResult> {
          console.log(`📤 [UPLOAD] Iniciando upload de foto:`, {
        termoId,
        categoria,
        nomeArquivo: foto.nome,
        tamanho: foto.tamanho
      });

    try {
      // Primeiro, tentar via backend
      const backendResult = await this.tentarUploadBackend(foto, termoId, categoria);
      if (backendResult.success) {
        return backendResult;
      }

      // Se falhar, retornar erro
      console.log(`🔄 [UPLOAD] Backend falhou, retornando erro...`);
      return {
        success: false,
        error: 'Upload via backend falhou'
      };

    } catch (error: unknown) {
      console.error(`❌ [UPLOAD] Erro no upload:`, error);
      
      return {
        success: false,
        error: `Upload falhou: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  /**
   * Tenta upload via backend
   */
  private static async tentarUploadBackend(
    foto: ProcessedPhotoData,
    termoId: string,
    categoria: string
  ): Promise<UploadResult> {
    try {
      // Criar FormData para envio
      const formData = new FormData();
      formData.append('file', foto.arquivo, foto.nome || 'foto.jpg');
      formData.append('entityType', 'termos');
      formData.append('entityId', termoId);
      formData.append('categoria', categoria);

      // ✅ TIMEOUT PARA EVITAR TRAVAMENTOS
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

      // Fazer upload via backend
      const response = await fetch(`${this.BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [UPLOAD BACKEND] Erro HTTP ${response.status}:`, errorText);
        return {
          success: false,
          error: `Erro HTTP ${response.status}: ${errorText}`
        };
      }

      const result = await response.json();
      
      if (result.error) {
        console.error(`❌ [UPLOAD BACKEND] Erro do servidor:`, result.error);
        return {
          success: false,
          error: result.error
        };
      }

      console.log(`✅ [UPLOAD BACKEND] Foto enviada com sucesso:`, {
        url: result.url,
        filePath: result.filePath
      });

      return {
        success: true,
        url: result.url,
        filePath: result.filePath
      };

    } catch (error: unknown) {
      // ✅ TRATAMENTO ESPECÍFICO PARA TIMEOUT
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`⏰ [UPLOAD BACKEND] Timeout no upload via backend`);
        return {
          success: false,
          error: 'Timeout no upload via backend'
        };
      }
      
      console.error(`❌ [UPLOAD BACKEND] Erro no upload via backend:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no backend'
      };
    }
  }



  /**
   * Faz upload de múltiplas fotos em lote
   */
  static async uploadFotosEmLote(
    fotos: { [categoria: string]: ProcessedPhotoData[] },
    termoId: string
  ): Promise<BatchUploadResult> {
    console.log(`📤 [UPLOAD LOTE] Iniciando upload em lote:`, {
      termoId,
      categorias: Object.keys(fotos),
      totalFotos: Object.values(fotos).reduce((total, fotos) => total + fotos.length, 0)
    });

    const resultados: UploadResult[] = [];
    const erros: string[] = [];
    let fotosSalvas = 0;

    // Processar cada categoria
    for (const [categoria, fotosCategoria] of Object.entries(fotos)) {
      console.log(`📤 [UPLOAD LOTE] Processando categoria: ${categoria} (${fotosCategoria.length} fotos)`);
      
      // Processar cada foto da categoria
      for (const foto of fotosCategoria) {
        const resultado = await this.uploadFoto(foto, termoId, categoria);
        resultados.push(resultado);
        
        if (resultado.success) {
          fotosSalvas++;
        } else {
          erros.push(`Categoria ${categoria}: ${resultado.error}`);
        }
      }
    }

    const sucesso = fotosSalvas > 0;
    const totalFotos = resultados.length;

    console.log(`📊 [UPLOAD LOTE] Resultado do lote:`, {
      sucesso,
      totalFotos,
      fotosSalvas,
      erros: erros.length
    });

    return {
      success: sucesso,
      totalFotos,
      fotosSalvas,
      erros,
      resultados
    };
  }

  /**
   * Salva metadados das fotos no banco de dados
   */
  static async salvarMetadadosFotos(
    termoId: string,
    fotos: { [categoria: string]: ProcessedPhotoData[] },
    uploadResults: UploadResult[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`💾 [METADADOS] Salvando metadados de ${uploadResults.length} fotos`);

      // Criar array plano de todas as fotos para mapeamento correto
      const todasFotos: Array<{ foto: ProcessedPhotoData; categoria: string }> = [];
      for (const [categoria, fotosCategoria] of Object.entries(fotos)) {
        for (const foto of fotosCategoria) {
          todasFotos.push({ foto, categoria });
        }
      }

      console.log(`📊 [METADADOS] Total de fotos processadas:`, {
        totalFotos: todasFotos.length,
        uploadResults: uploadResults.length,
        fotosSucesso: uploadResults.filter(r => r.success).length
      });

      // Organizar fotos por categoria para enviar ao backend
      const fotosPorCategoria: { [categoria: string]: any[] } = {};
      
      uploadResults
        .filter(result => result.success)
        .forEach((result, index) => {
          const fotoInfo = todasFotos[index];
          
          if (!fotoInfo) {
            console.warn(`⚠️ [METADADOS] Foto não encontrada para índice ${index}`);
            return;
          }

          const { foto, categoria } = fotoInfo;

          console.log(`📸 [METADADOS] Processando foto ${index + 1}:`, {
            nomeArquivo: foto.nome,
            categoria,
            url: result.url,
            tamanho: foto.tamanho
          });

          if (!fotosPorCategoria[categoria]) {
            fotosPorCategoria[categoria] = [];
          }

          fotosPorCategoria[categoria].push({
            nome: foto.nome,
            url: result.url || '',
            tamanho: foto.tamanho,
            tipo: foto.tipo,
            descricao: `Foto da categoria ${categoria}`,
            latitude: foto.latitude,
            longitude: foto.longitude,
            accuracy: foto.accuracy,
            endereco: foto.endereco,
            timestamp: foto.timestamp ? new Date(foto.timestamp).toISOString().slice(0, 19).replace('T', ' ') : null
          });
        });

      const totalFotos = Object.values(fotosPorCategoria).reduce((total, fotos) => total + fotos.length, 0);
      
      if (totalFotos === 0) {
        console.log(`⚠️ [METADADOS] Nenhuma foto para salvar metadados`);
        return { success: true };
      }

      console.log(`💾 [METADADOS] Preparando para salvar ${totalFotos} metadados:`, 
        Object.entries(fotosPorCategoria).map(([categoria, fotos]) => 
          fotos.map(f => ({ nome: f.nome, categoria }))
        ).flat()
      );

      // Enviar metadados para o backend via API
      const token = getAuthToken();
      if (!token) {
        console.error(`❌ [METADADOS] Token de autenticação não encontrado`);
        return {
          success: false,
          error: 'Token de autenticação não encontrado'
        };
      }

      const response = await fetch(`${this.BACKEND_URL}/termos/salvar-fotos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          termoId: termoId,
          fotos: fotosPorCategoria
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [METADADOS] Erro ao salvar metadados:`, errorText);
        return {
          success: false,
          error: `Erro HTTP ${response.status}: ${errorText}`
        };
      }

      const result = await response.json();
      console.log(`✅ [METADADOS] Metadados salvos com sucesso: ${totalFotos} fotos`);
      return { success: true };

    } catch (error: unknown) {
      console.error(`❌ [METADADOS] Erro ao salvar metadados:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Compara fotos atuais com fotos originais do termo
   */
  static async compararFotos(
    fotosAtuais: { [categoria: string]: ProcessedPhotoData[] },
    termoId: string
  ): Promise<{
    temModificacoes: boolean;
    adicionadas: { [categoria: string]: ProcessedPhotoData[] };
    removidas: { id: string; categoria: string; nome_arquivo: string }[];
    mantidas: { id: string; categoria: string; nome_arquivo: string }[];
  }> {
    try {
      console.log('🔍 [UPLOAD] Comparando fotos atuais com originais...');
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Buscar fotos originais do termo
      const response = await fetch(`${this.BACKEND_URL}/termos/${termoId}/fotos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar fotos originais: ${response.status}`);
      }

      const fotosOriginais = await response.json();
      console.log('📸 [UPLOAD] Fotos originais encontradas:', fotosOriginais.length);

      // Identificar fotos removidas (estavam nas originais mas não estão nas atuais)
      const removidas = fotosOriginais.filter((fotoOriginal: { categoria: string; nome_arquivo: string; id: string }) => {
        const categoria = fotoOriginal.categoria;
        const fotosCategoriaAtual = fotosAtuais[categoria] || [];
        return !fotosCategoriaAtual.some(fotoAtual => 
          fotoAtual.nome === fotoOriginal.nome_arquivo
        );
      });

      // Identificar fotos mantidas (estão nas originais e nas atuais)
      const mantidas = fotosOriginais.filter((fotoOriginal: { categoria: string; nome_arquivo: string; id: string }) => {
        const categoria = fotoOriginal.categoria;
        const fotosCategoriaAtual = fotosAtuais[categoria] || [];
        return fotosCategoriaAtual.some(fotoAtual => 
          fotoAtual.nome === fotoOriginal.nome_arquivo
        );
      });

      // Identificar fotos adicionadas (estão nas atuais mas não estavam nas originais)
      const adicionadas: { [categoria: string]: ProcessedPhotoData[] } = {};
      Object.keys(fotosAtuais).forEach(categoria => {
        const fotosCategoriaAtual = fotosAtuais[categoria] || [];
        const fotosOriginaisCategoria = fotosOriginais.filter((f: { categoria: string; nome_arquivo: string; id: string }) => f.categoria === categoria);
        
        const fotosNovas = fotosCategoriaAtual.filter(fotoAtual => 
          !fotosOriginaisCategoria.some(fotoOriginal => 
            fotoOriginal.nome_arquivo === fotoAtual.nome
          )
        );
        
        if (fotosNovas.length > 0) {
          adicionadas[categoria] = fotosNovas;
        }
      });

      const temModificacoes = removidas.length > 0 || Object.keys(adicionadas).length > 0;
      
      console.log('🔍 [UPLOAD] Resultado da comparação:', {
        total: fotosOriginais.length,
        mantidas: mantidas.length,
        removidas: removidas.length,
        adicionadas: Object.values(adicionadas).reduce((total, fotos) => total + fotos.length, 0),
        temModificacoes
      });

      return {
        temModificacoes,
        adicionadas,
        removidas: removidas.map(f => ({ id: f.id, categoria: f.categoria, nome_arquivo: f.nome_arquivo })),
        mantidas: mantidas.map(f => ({ id: f.id, categoria: f.categoria, nome_arquivo: f.nome_arquivo }))
      };
    } catch (error) {
      console.error('❌ [UPLOAD] Erro ao comparar fotos:', error);
      throw error;
    }
  }

  /**
   * Remove fotos específicas do termo
   */
  static async removerFotosEspecificas(
    termoId: string,
    fotosParaRemover: { id: string; categoria: string; nome_arquivo: string }[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ [UPLOAD] Removendo fotos específicas:', fotosParaRemover.length);
      
      const token = getAuthToken();
      if (!token) {
        return { success: false, error: 'Token de autenticação não encontrado' };
      }

      // Remover metadados das fotos específicas
      const response = await fetch(`${this.BACKEND_URL}/termos/${termoId}/fotos/especificas`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fotos: fotosParaRemover })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [UPLOAD] Erro ao remover fotos específicas:', errorText);
        return { success: false, error: `Erro HTTP ${response.status}: ${errorText}` };
      }

      console.log('✅ [UPLOAD] Fotos específicas removidas com sucesso');
      return { success: true };
    } catch (error) {
      console.error('❌ [UPLOAD] Erro ao remover fotos específicas:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Limpa fotos existentes do termo (bucket e metadados)
   */
  static async limparFotosExistentes(termoId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🧹 [UPLOAD] Limpando fotos existentes do termo:`, termoId);
      
      const token = getAuthToken();
      if (!token) {
        return { success: false, error: 'Token de autenticação não encontrado' };
      }

      // ✅ LIMPAR METADADOS DA TABELA termos_fotos
      const response = await fetch(`${this.BACKEND_URL}/termos/${termoId}/fotos`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [UPLOAD] Erro ao limpar metadados:`, errorText);
        return { success: false, error: `Erro HTTP ${response.status}: ${errorText}` };
      }

      console.log(`✅ [UPLOAD] Fotos existentes limpas com sucesso`);
      return { success: true };
    } catch (error) {
      console.error(`❌ [UPLOAD] Erro ao limpar fotos existentes:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Processa upload completo com metadados
   */
  static async processarUploadCompleto(
    fotos: { [categoria: string]: ProcessedPhotoData[] },
    termoId: string
  ): Promise<{ success: boolean; fotosSalvas: number; error?: string }> {
    try {
      console.log(`🔄 [UPLOAD COMPLETO] Iniciando processamento:`, {
        termoId,
        totalFotos: Object.values(fotos).reduce((total, fotos) => total + fotos.length, 0),
        categorias: Object.keys(fotos)
      });

      // Fazer upload das fotos
      const uploadResult = await this.uploadFotosEmLote(fotos, termoId);

      console.log(`📊 [UPLOAD COMPLETO] Resultado do upload:`, {
        sucesso: uploadResult.success,
        totalFotos: uploadResult.totalFotos,
        fotosSalvas: uploadResult.fotosSalvas,
        erros: uploadResult.erros.length
      });

      if (!uploadResult.success) {
        console.error(`❌ [UPLOAD COMPLETO] Falha no upload:`, uploadResult.erros);
        return {
          success: false,
          fotosSalvas: 0,
          error: `Falha no upload: ${uploadResult.erros.join(', ')}`
        };
      }

      // Salvar metadados
      console.log(`💾 [UPLOAD COMPLETO] Iniciando salvamento de metadados...`);
      const metadadosResult = await this.salvarMetadadosFotos(termoId, fotos, uploadResult.resultados);

      console.log(`📊 [UPLOAD COMPLETO] Resultado dos metadados:`, {
        sucesso: metadadosResult.success,
        error: metadadosResult.error
      });

      if (!metadadosResult.success) {
        console.warn(`⚠️ [UPLOAD COMPLETO] Fotos enviadas mas metadados falharam:`, metadadosResult.error);
        // Retornar sucesso mesmo se metadados falharem, pois as fotos foram enviadas
      }

      return {
        success: true,
        fotosSalvas: uploadResult.fotosSalvas
      };

    } catch (error) {
      console.error(`❌ [UPLOAD COMPLETO] Erro no processamento completo:`, error);
      return {
        success: false,
        fotosSalvas: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
} 