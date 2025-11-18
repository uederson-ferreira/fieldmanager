// ===================================================================
// PHOTO MIGRATION - P1 #1 IMPLEMENTATION
// Localização: src/lib/offline/utils/photoMigration.ts
// Módulo: Migração de fotos base64 para Blob comprimido
// ===================================================================

import { compressImage, base64ToBlob } from './imageCompression';
import { offlineDB } from '../database';

export interface PhotoMigrationResult {
  total: number;
  migrated: number;
  failed: number;
  spaceSavedKB: number;
  errors: string[];
}

/**
 * Migrar todas as fotos de base64 para blob comprimido
 */
export async function migrateAllPhotosToBlob(): Promise<PhotoMigrationResult> {
  console.log('🔄 [PHOTO MIGRATION] Iniciando migração de fotos...');

  const result: PhotoMigrationResult = {
    total: 0,
    migrated: 0,
    failed: 0,
    spaceSavedKB: 0,
    errors: []
  };

  try {
    // Migrar fotos de termos
    const termosResult = await migrateTermosFotos();
    result.migrated += termosResult.migrated;
    result.failed += termosResult.failed;
    result.total += termosResult.total;
    result.spaceSavedKB += termosResult.spaceSavedKB;
    result.errors.push(...termosResult.errors);

    // TODO: Migrar fotos de LVs
    // TODO: Migrar fotos de rotinas
    // TODO: Migrar fotos de inspeções

    console.log('✅ [PHOTO MIGRATION] Migração concluída:', result);

    return result;
  } catch (error) {
    console.error('❌ [PHOTO MIGRATION] Erro na migração:', error);
    throw error;
  }
}

/**
 * Migrar fotos de termos
 */
async function migrateTermosFotos(): Promise<PhotoMigrationResult> {
  const result: PhotoMigrationResult = {
    total: 0,
    migrated: 0,
    failed: 0,
    spaceSavedKB: 0,
    errors: []
  };

  try {
    const fotos = await offlineDB.termos_fotos.toArray();
    result.total = fotos.length;

    console.log(`📦 [PHOTO MIGRATION] ${fotos.length} fotos de termos para migrar`);

    for (const foto of fotos) {
      // Pular se não tem base64 ou já foi migrado
      if (!foto.arquivo_base64 || foto.arquivo_blob) {
        continue;
      }

      try {
        // Converter base64 para blob
        const originalBlob = await base64ToBlob(foto.arquivo_base64);
        const originalSizeKB = originalBlob.size / 1024;

        // Comprimir
        const compressed = await compressImage(originalBlob, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.8,
          targetSizeKB: 500
        });

        // Calcular economia
        const savedKB = (foto.arquivo_base64.length - compressed.blob.size) / 1024;
        result.spaceSavedKB += savedKB;

        // Atualizar no banco
        await offlineDB.termos_fotos.update(foto.id, {
          arquivo_blob: compressed.blob,
          comprimido: true,
          tamanho_original: originalBlob.size,
          // Manter base64 por compatibilidade (será removido na próxima versão)
          arquivo_base64: foto.arquivo_base64
        });

        result.migrated++;

        console.log(
          `✅ [PHOTO MIGRATION] Foto migrada: ${foto.nome_arquivo} (economia: ${savedKB.toFixed(2)} KB)`
        );
      } catch (error: any) {
        result.failed++;
        result.errors.push(`Erro em ${foto.nome_arquivo}: ${error.message}`);
        console.error(`❌ [PHOTO MIGRATION] Erro ao migrar ${foto.nome_arquivo}:`, error);
      }
    }

    return result;
  } catch (error) {
    console.error('❌ [PHOTO MIGRATION] Erro ao migrar fotos de termos:', error);
    throw error;
  }
}

/**
 * Limpar base64 de fotos já migradas (economizar espaço)
 */
export async function cleanupBase64Data(): Promise<number> {
  console.log('🗑️ [PHOTO MIGRATION] Limpando dados base64...');

  let cleaned = 0;

  try {
    // Limpar termos_fotos
    const termosFotos = await offlineDB.termos_fotos
      .filter(foto => foto.arquivo_blob !== undefined && foto.arquivo_base64 !== undefined)
      .toArray();

    for (const foto of termosFotos) {
      await offlineDB.termos_fotos.update(foto.id, {
        arquivo_base64: undefined // Remover base64
      });
      cleaned++;
    }

    console.log(`✅ [PHOTO MIGRATION] ${cleaned} fotos limpas`);

    return cleaned;
  } catch (error) {
    console.error('❌ [PHOTO MIGRATION] Erro ao limpar base64:', error);
    throw error;
  }
}

/**
 * Verificar status da migração
 */
export async function getMigrationStatus(): Promise<{
  total: number;
  migrated: number;
  usingBase64: number;
  usingBlob: number;
  estimatedSavingsKB: number;
}> {
  const fotos = await offlineDB.termos_fotos.toArray();

  const status = {
    total: fotos.length,
    migrated: 0,
    usingBase64: 0,
    usingBlob: 0,
    estimatedSavingsKB: 0
  };

  for (const foto of fotos) {
    if (foto.arquivo_blob) {
      status.usingBlob++;
      if (foto.comprimido) {
        status.migrated++;
      }
    }

    if (foto.arquivo_base64) {
      status.usingBase64++;
      // Estimar economia (base64 tem 33% overhead)
      const base64Bytes = foto.arquivo_base64.length;
      const estimatedBlobBytes = base64Bytes / 1.33;
      status.estimatedSavingsKB += (base64Bytes - estimatedBlobBytes) / 1024;
    }
  }

  return status;
}
