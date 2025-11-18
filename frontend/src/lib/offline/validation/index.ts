// ===================================================================
// VALIDATION MODULE - P2 #1 IMPLEMENTATION
// Localização: src/lib/offline/validation/index.ts
// Módulo: Sistema de validação para dados offline
// ===================================================================

export * from './schemas';

import type { ValidationResult } from './schemas';
import { schemas, type SchemaType } from './schemas';

/**
 * Classe de erro de validação
 */
export class ValidationError extends Error {
  public errors: string[];

  constructor(errors: string[]) {
    super(`Validação falhou: ${errors.join(', ')}`);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Validar dados antes de salvar no IndexedDB
 */
export function validateData<T>(
  data: Partial<T>,
  schemaType: SchemaType
): ValidationResult {
  const schema = schemas[schemaType];

  if (!schema) {
    throw new Error(`Schema não encontrado: ${schemaType}`);
  }

  const result = schema.validate(data);

  if (!result.valid) {
    console.warn(`⚠️ [VALIDATION] Dados inválidos para ${schemaType}:`, result.errors);
  }

  return result;
}

/**
 * Validar e lançar exceção se inválido
 */
export function validateOrThrow<T>(
  data: Partial<T>,
  schemaType: SchemaType
): void {
  const result = validateData(data, schemaType);

  if (!result.valid) {
    throw new ValidationError(result.errors);
  }
}

/**
 * Validar múltiplos itens
 */
export function validateBatch<T>(
  items: Partial<T>[],
  schemaType: SchemaType
): {
  valid: Partial<T>[];
  invalid: Array<{ item: Partial<T>; errors: string[] }>;
} {
  const valid: Partial<T>[] = [];
  const invalid: Array<{ item: Partial<T>; errors: string[] }> = [];

  for (const item of items) {
    const result = validateData(item, schemaType);

    if (result.valid) {
      valid.push(item);
    } else {
      invalid.push({ item, errors: result.errors });
    }
  }

  return { valid, invalid };
}

/**
 * Sanitizar dados (remover campos inválidos)
 */
export function sanitizeData<T extends Record<string, any>>(
  data: T,
  allowedFields: (keyof T)[]
): Partial<T> {
  const sanitized: Partial<T> = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      sanitized[field] = data[field];
    }
  }

  return sanitized;
}

/**
 * Normalizar dados (aplicar transformações padrão)
 */
export function normalizeData<T extends Record<string, any>>(data: T): T {
  const normalized = { ...data };

  // Trim strings
  for (const key in normalized) {
    if (typeof normalized[key] === 'string') {
      normalized[key] = normalized[key].trim() as any;
    }
  }

  // Converter datas para ISO string
  for (const key in normalized) {
    if (normalized[key] instanceof Date) {
      normalized[key] = normalized[key].toISOString() as any;
    }
  }

  return normalized;
}

/**
 * Estatísticas de validação
 */
export interface ValidationStats {
  totalValidations: number;
  successCount: number;
  failureCount: number;
  errorsByType: Record<string, number>;
  lastValidationAt?: string;
}

class ValidationStatsTracker {
  private stats: ValidationStats = {
    totalValidations: 0,
    successCount: 0,
    failureCount: 0,
    errorsByType: {}
  };

  track(schemaType: string, result: ValidationResult): void {
    this.stats.totalValidations++;
    this.stats.lastValidationAt = new Date().toISOString();

    if (result.valid) {
      this.stats.successCount++;
    } else {
      this.stats.failureCount++;

      // Contar tipos de erro
      for (const error of result.errors) {
        const key = error.split(':')[0] || 'unknown';
        this.stats.errorsByType[key] = (this.stats.errorsByType[key] || 0) + 1;
      }
    }

    console.log(`📊 [VALIDATION STATS] ${schemaType}:`, {
      success: this.stats.successCount,
      failure: this.stats.failureCount,
      total: this.stats.totalValidations
    });
  }

  getStats(): ValidationStats {
    return { ...this.stats };
  }

  reset(): void {
    this.stats = {
      totalValidations: 0,
      successCount: 0,
      failureCount: 0,
      errorsByType: {}
    };
  }
}

export const validationStats = new ValidationStatsTracker();

/**
 * Helper para validar com tracking de estatísticas
 */
export function validateWithStats<T>(
  data: Partial<T>,
  schemaType: SchemaType
): ValidationResult {
  const result = validateData(data, schemaType);
  validationStats.track(schemaType, result);
  return result;
}
