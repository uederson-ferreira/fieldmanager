// ===================================================================
// DATA EXPORT - P3 #2 IMPLEMENTATION
// Localização: src/lib/offline/export/DataExport.ts
// Módulo: Sistema de exportação e backup de dados offline
// ===================================================================

import { offlineDB } from '../database';
import type {
  TermoAmbientalOffline,
  TermoFotoOffline,
  LVOffline,
  AtividadeRotinaOffline
} from '../../../types/offline';

/**
 * Formato de exportação
 */
export type ExportFormat = 'json' | 'csv';

/**
 * Opções de exportação
 */
export interface ExportOptions {
  format?: ExportFormat;
  includeSynced?: boolean;
  includeDeleted?: boolean;
  includePhotos?: boolean;
  compress?: boolean;
}

/**
 * Resultado da exportação
 */
export interface ExportResult {
  success: boolean;
  filename: string;
  size_bytes: number;
  entities_count: {
    termos: number;
    lvs: number;
    rotinas: number;
    fotos: number;
    total: number;
  };
  exported_at: string;
  download_url?: string;
  error?: string;
}

/**
 * Dados de exportação
 */
export interface ExportData {
  metadata: {
    exported_at: string;
    app_version: string;
    format: ExportFormat;
    total_entities: number;
  };
  termos: TermoAmbientalOffline[];
  termos_fotos: TermoFotoOffline[];
  lvs: LVOffline[];
  atividades_rotina: AtividadeRotinaOffline[];
}

/**
 * Resultado de importação
 */
export interface ImportResult {
  success: boolean;
  imported_count: {
    termos: number;
    lvs: number;
    rotinas: number;
    fotos: number;
    total: number;
  };
  skipped_count: number;
  errors: string[];
}

/**
 * Classe principal de exportação de dados
 */
export class DataExport {
  /**
   * Exportar dados pendentes (não sincronizados)
   */
  static async exportPendingData(options: ExportOptions = {}): Promise<ExportResult> {
    const {
      format = 'json',
      includeSynced = false,
      includeDeleted = false,
      includePhotos = true,
      compress = false
    } = options;

    try {
      console.log('📦 [DATA EXPORT] Iniciando exportação de dados pendentes...');

      // Buscar dados
      let termos = await offlineDB.termos_ambientais.toArray();
      let lvs = await offlineDB.lvs.toArray();
      let rotinas = await offlineDB.atividades_rotina.toArray();
      let fotos: TermoFotoOffline[] = [];

      // Filtrar não sincronizados
      if (!includeSynced) {
        termos = termos.filter(t => !t.sincronizado);
        lvs = lvs.filter(l => !l.sincronizado);
        rotinas = rotinas.filter(r => !r.sincronizado);
      }

      // Filtrar deletados
      if (!includeDeleted) {
        termos = termos.filter(t => !t.deleted);
        lvs = lvs.filter(l => !l.deleted);
        rotinas = rotinas.filter(r => !r.deleted);
      }

      // Incluir fotos se necessário
      if (includePhotos) {
        const termoIds = termos.map(t => t.id);
        fotos = await offlineDB.termos_fotos
          .filter(f => termoIds.includes(f.termo_id))
          .toArray();

        if (!includeSynced) {
          fotos = fotos.filter(f => !f.sincronizado);
        }
      }

      // Preparar dados de exportação
      const exportData: ExportData = {
        metadata: {
          exported_at: new Date().toISOString(),
          app_version: import.meta.env.VITE_APP_VERSION || '1.0.0',
          format,
          total_entities: termos.length + lvs.length + rotinas.length + fotos.length
        },
        termos,
        termos_fotos: fotos,
        lvs,
        atividades_rotina: rotinas
      };

      // Converter para formato desejado
      let content: string;
      let mimeType: string;
      let extension: string;

      if (format === 'json') {
        content = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      } else {
        // CSV - converter cada entidade para CSV
        content = this.convertToCSV(exportData);
        mimeType = 'text/csv';
        extension = 'csv';
      }

      // Gerar nome do arquivo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `ecofield-backup-${timestamp}.${extension}`;

      // Criar blob
      const blob = new Blob([content], { type: mimeType });
      const download_url = URL.createObjectURL(blob);

      const result: ExportResult = {
        success: true,
        filename,
        size_bytes: blob.size,
        entities_count: {
          termos: termos.length,
          lvs: lvs.length,
          rotinas: rotinas.length,
          fotos: fotos.length,
          total: exportData.metadata.total_entities
        },
        exported_at: exportData.metadata.exported_at,
        download_url
      };

      console.log('✅ [DATA EXPORT] Exportação concluída:', result);

      return result;
    } catch (error: any) {
      console.error('❌ [DATA EXPORT] Erro na exportação:', error);

      return {
        success: false,
        filename: '',
        size_bytes: 0,
        entities_count: {
          termos: 0,
          lvs: 0,
          rotinas: 0,
          fotos: 0,
          total: 0
        },
        exported_at: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Baixar arquivo de exportação
   */
  static downloadExport(result: ExportResult): void {
    if (!result.success || !result.download_url) {
      console.error('❌ [DATA EXPORT] Nenhum arquivo para download');
      return;
    }

    // Criar link de download
    const link = document.createElement('a');
    link.href = result.download_url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`✅ [DATA EXPORT] Download iniciado: ${result.filename}`);
  }

  /**
   * Exportar e baixar em uma operação
   */
  static async exportAndDownload(options: ExportOptions = {}): Promise<ExportResult> {
    const result = await this.exportPendingData(options);

    if (result.success) {
      this.downloadExport(result);
    }

    return result;
  }

  /**
   * Importar dados de arquivo JSON
   */
  static async importFromJSON(jsonString: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported_count: {
        termos: 0,
        lvs: 0,
        rotinas: 0,
        fotos: 0,
        total: 0
      },
      skipped_count: 0,
      errors: []
    };

    try {
      console.log('📥 [DATA IMPORT] Iniciando importação...');

      // Parse JSON
      const data: ExportData = JSON.parse(jsonString);

      // Validar estrutura
      if (!data.metadata || !data.termos || !data.lvs || !data.atividades_rotina) {
        throw new Error('Estrutura de dados inválida');
      }

      console.log(`📊 [DATA IMPORT] ${data.metadata.total_entities} entidades para importar`);

      // Importar termos
      for (const termo of data.termos) {
        try {
          // Verificar se já existe
          const existing = await offlineDB.termos_ambientais.get(termo.id);

          if (existing) {
            result.skipped_count++;
            console.log(`⏭️ [DATA IMPORT] Termo ${termo.id} já existe, pulando`);
          } else {
            await offlineDB.termos_ambientais.add(termo);
            result.imported_count.termos++;
          }
        } catch (error: any) {
          result.errors.push(`Termo ${termo.id}: ${error.message}`);
        }
      }

      // Importar fotos
      for (const foto of data.termos_fotos || []) {
        try {
          const existing = await offlineDB.termos_fotos.get(foto.id);

          if (existing) {
            result.skipped_count++;
          } else {
            await offlineDB.termos_fotos.add(foto);
            result.imported_count.fotos++;
          }
        } catch (error: any) {
          result.errors.push(`Foto ${foto.id}: ${error.message}`);
        }
      }

      // Importar LVs
      for (const lv of data.lvs) {
        try {
          const existing = await offlineDB.lvs.get(lv.id);

          if (existing) {
            result.skipped_count++;
          } else {
            await offlineDB.lvs.add(lv);
            result.imported_count.lvs++;
          }
        } catch (error: any) {
          result.errors.push(`LV ${lv.id}: ${error.message}`);
        }
      }

      // Importar rotinas
      for (const rotina of data.atividades_rotina) {
        try {
          const existing = await offlineDB.atividades_rotina.get(rotina.id);

          if (existing) {
            result.skipped_count++;
          } else {
            await offlineDB.atividades_rotina.add(rotina);
            result.imported_count.rotinas++;
          }
        } catch (error: any) {
          result.errors.push(`Rotina ${rotina.id}: ${error.message}`);
        }
      }

      result.imported_count.total =
        result.imported_count.termos +
        result.imported_count.lvs +
        result.imported_count.rotinas +
        result.imported_count.fotos;

      result.success = result.imported_count.total > 0;

      console.log(`✅ [DATA IMPORT] Importação concluída:`, result);

      return result;
    } catch (error: any) {
      console.error('❌ [DATA IMPORT] Erro na importação:', error);
      result.errors.push(error.message);
      return result;
    }
  }

  /**
   * Importar dados de arquivo
   */
  static async importFromFile(file: File): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const result = await this.importFromJSON(content);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Gerar email com backup
   */
  static generateBackupEmail(result: ExportResult): string {
    const subject = encodeURIComponent('EcoField - Backup de Dados Offline');

    const body = encodeURIComponent(`
Olá,

Segue em anexo o backup dos dados offline do EcoField.

Informações do Backup:
- Data: ${new Date(result.exported_at).toLocaleString('pt-BR')}
- Arquivo: ${result.filename}
- Tamanho: ${(result.size_bytes / 1024).toFixed(2)} KB
- Entidades:
  * Termos: ${result.entities_count.termos}
  * LVs: ${result.entities_count.lvs}
  * Rotinas: ${result.entities_count.rotinas}
  * Fotos: ${result.entities_count.fotos}
  * TOTAL: ${result.entities_count.total}

Por favor, guarde este backup em local seguro.

---
Enviado automaticamente pelo EcoField v${import.meta.env.VITE_APP_VERSION || '1.0.0'}
    `.trim());

    return `mailto:?subject=${subject}&body=${body}`;
  }

  /**
   * Compartilhar backup via email
   */
  static async shareViaEmail(options: ExportOptions = {}): Promise<void> {
    const result = await this.exportPendingData(options);

    if (!result.success) {
      throw new Error('Falha ao gerar backup');
    }

    // Baixar arquivo primeiro
    this.downloadExport(result);

    // Abrir cliente de email
    const mailtoUrl = this.generateBackupEmail(result);
    window.location.href = mailtoUrl;

    console.log('📧 [DATA EXPORT] Email de backup preparado');
  }

  /**
   * Converter dados para CSV
   */
  private static convertToCSV(data: ExportData): string {
    let csv = '';

    // Header
    csv += `EcoField Data Export\n`;
    csv += `Exported at: ${data.metadata.exported_at}\n`;
    csv += `Version: ${data.metadata.app_version}\n`;
    csv += `Total entities: ${data.metadata.total_entities}\n\n`;

    // Termos
    if (data.termos.length > 0) {
      csv += `\n=== TERMOS AMBIENTAIS (${data.termos.length}) ===\n`;
      const termoKeys = Object.keys(data.termos[0]);
      csv += termoKeys.join(',') + '\n';

      data.termos.forEach(termo => {
        const values = termoKeys.map(key => {
          const value = (termo as any)[key];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value).replace(/,/g, ';');
        });
        csv += values.join(',') + '\n';
      });
    }

    // LVs
    if (data.lvs.length > 0) {
      csv += `\n=== LVS (${data.lvs.length}) ===\n`;
      const lvKeys = Object.keys(data.lvs[0]);
      csv += lvKeys.join(',') + '\n';

      data.lvs.forEach(lv => {
        const values = lvKeys.map(key => {
          const value = (lv as any)[key];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value).replace(/,/g, ';');
        });
        csv += values.join(',') + '\n';
      });
    }

    // Rotinas
    if (data.atividades_rotina.length > 0) {
      csv += `\n=== ATIVIDADES ROTINA (${data.atividades_rotina.length}) ===\n`;
      const rotinaKeys = Object.keys(data.atividades_rotina[0]);
      csv += rotinaKeys.join(',') + '\n';

      data.atividades_rotina.forEach(rotina => {
        const values = rotinaKeys.map(key => {
          const value = (rotina as any)[key];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value).replace(/,/g, ';');
        });
        csv += values.join(',') + '\n';
      });
    }

    return csv;
  }

  /**
   * Criar snapshot completo do banco
   */
  static async createFullSnapshot(): Promise<ExportResult> {
    return this.exportPendingData({
      format: 'json',
      includeSynced: true,
      includeDeleted: true,
      includePhotos: true
    });
  }

  /**
   * Estatísticas de exportação
   */
  static async getExportStats(): Promise<{
    pending: number;
    synced: number;
    deleted: number;
    total: number;
    estimated_size_mb: number;
  }> {
    const [termos, lvs, rotinas, fotos] = await Promise.all([
      offlineDB.termos_ambientais.toArray(),
      offlineDB.lvs.toArray(),
      offlineDB.atividades_rotina.toArray(),
      offlineDB.termos_fotos.toArray()
    ]);

    const allEntities = [...termos, ...lvs, ...rotinas];

    const pending = allEntities.filter(e => !e.sincronizado).length;
    const synced = allEntities.filter(e => e.sincronizado).length;
    const deleted = allEntities.filter(e => (e as any).deleted).length;
    const total = allEntities.length + fotos.length;

    // Estimar tamanho
    const sampleJSON = JSON.stringify({ termos, lvs, rotinas, fotos });
    const estimated_size_mb = new Blob([sampleJSON]).size / (1024 * 1024);

    return {
      pending,
      synced,
      deleted,
      total,
      estimated_size_mb
    };
  }
}
