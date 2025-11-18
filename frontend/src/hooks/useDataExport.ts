// ===================================================================
// USE DATA EXPORT - P3 #2 IMPLEMENTATION
// Localização: src/hooks/useDataExport.ts
// Hook: Hook React para exportação de dados
// ===================================================================

import { useState, useCallback } from 'react';
import {
  DataExport,
  type ExportResult,
  type ExportOptions,
  type ImportResult
} from '../lib/offline/export/DataExport';

export interface UseDataExportResult {
  isExporting: boolean;
  isImporting: boolean;
  lastExport: ExportResult | null;
  lastImport: ImportResult | null;
  exportData: (options?: ExportOptions) => Promise<ExportResult>;
  exportAndDownload: (options?: ExportOptions) => Promise<ExportResult>;
  shareViaEmail: (options?: ExportOptions) => Promise<void>;
  importFromFile: (file: File) => Promise<ImportResult>;
  createSnapshot: () => Promise<ExportResult>;
  getStats: () => Promise<{
    pending: number;
    synced: number;
    deleted: number;
    total: number;
    estimated_size_mb: number;
  }>;
}

/**
 * Hook para exportação e importação de dados
 */
export const useDataExport = (): UseDataExportResult => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastExport, setLastExport] = useState<ExportResult | null>(null);
  const [lastImport, setLastImport] = useState<ImportResult | null>(null);

  /**
   * Exportar dados
   */
  const exportData = useCallback(async (options?: ExportOptions): Promise<ExportResult> => {
    setIsExporting(true);

    try {
      const result = await DataExport.exportPendingData(options);
      setLastExport(result);

      if (result.success) {
        console.log('✅ [USE DATA EXPORT] Exportação concluída:', result);
      } else {
        console.error('❌ [USE DATA EXPORT] Exportação falhou:', result.error);
      }

      return result;
    } catch (error) {
      console.error('❌ [USE DATA EXPORT] Erro na exportação:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  /**
   * Exportar e baixar
   */
  const exportAndDownload = useCallback(async (options?: ExportOptions): Promise<ExportResult> => {
    setIsExporting(true);

    try {
      const result = await DataExport.exportAndDownload(options);
      setLastExport(result);
      return result;
    } catch (error) {
      console.error('❌ [USE DATA EXPORT] Erro ao exportar e baixar:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  /**
   * Compartilhar via email
   */
  const shareViaEmail = useCallback(async (options?: ExportOptions): Promise<void> => {
    setIsExporting(true);

    try {
      await DataExport.shareViaEmail(options);
      console.log('📧 [USE DATA EXPORT] Email preparado');
    } catch (error) {
      console.error('❌ [USE DATA EXPORT] Erro ao preparar email:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  /**
   * Importar de arquivo
   */
  const importFromFile = useCallback(async (file: File): Promise<ImportResult> => {
    setIsImporting(true);

    try {
      const result = await DataExport.importFromFile(file);
      setLastImport(result);

      if (result.success) {
        console.log('✅ [USE DATA EXPORT] Importação concluída:', result);
      } else {
        console.error('❌ [USE DATA EXPORT] Importação falhou:', result.errors);
      }

      return result;
    } catch (error) {
      console.error('❌ [USE DATA EXPORT] Erro na importação:', error);
      throw error;
    } finally {
      setIsImporting(false);
    }
  }, []);

  /**
   * Criar snapshot completo
   */
  const createSnapshot = useCallback(async (): Promise<ExportResult> => {
    setIsExporting(true);

    try {
      const result = await DataExport.createFullSnapshot();
      setLastExport(result);

      if (result.success) {
        DataExport.downloadExport(result);
      }

      return result;
    } catch (error) {
      console.error('❌ [USE DATA EXPORT] Erro ao criar snapshot:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  /**
   * Obter estatísticas
   */
  const getStats = useCallback(async () => {
    return DataExport.getExportStats();
  }, []);

  return {
    isExporting,
    isImporting,
    lastExport,
    lastImport,
    exportData,
    exportAndDownload,
    shareViaEmail,
    importFromFile,
    createSnapshot,
    getStats
  };
};
