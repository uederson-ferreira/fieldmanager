// ===================================================================
// VALIDATION SCHEMAS - P2 #1 IMPLEMENTATION
// Localização: src/lib/offline/validation/schemas.ts
// Módulo: Schemas de validação para dados offline
// ===================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ValidationRule<T> {
  field: keyof T;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'date' | 'uuid' | 'email';
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null; // Retorna erro ou null se válido
}

/**
 * Classe base para validação de dados
 */
export class Validator<T> {
  private rules: ValidationRule<T>[];

  constructor(rules: ValidationRule<T>[]) {
    this.rules = rules;
  }

  /**
   * Validar objeto
   */
  validate(data: Partial<T>): ValidationResult {
    const errors: string[] = [];

    for (const rule of this.rules) {
      const value = data[rule.field];
      const fieldName = String(rule.field);

      // Verificar required
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`Campo ${fieldName} é obrigatório`);
        continue;
      }

      // Se não é required e está vazio, pular outras validações
      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Verificar tipo
      if (rule.type) {
        const typeError = this.validateType(value, rule.type, fieldName);
        if (typeError) {
          errors.push(typeError);
          continue;
        }
      }

      // Verificar min/max para números
      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push(`Campo ${fieldName} deve ser >= ${rule.min}`);
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push(`Campo ${fieldName} deve ser <= ${rule.max}`);
        }
      }

      // Verificar min/max para strings (length)
      if (typeof value === 'string') {
        if (rule.min !== undefined && value.length < rule.min) {
          errors.push(`Campo ${fieldName} deve ter no mínimo ${rule.min} caracteres`);
        }
        if (rule.max !== undefined && value.length > rule.max) {
          errors.push(`Campo ${fieldName} deve ter no máximo ${rule.max} caracteres`);
        }
      }

      // Verificar pattern
      if (rule.pattern && typeof value === 'string') {
        if (!rule.pattern.test(value)) {
          errors.push(`Campo ${fieldName} tem formato inválido`);
        }
      }

      // Validação customizada
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          errors.push(customError);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar tipo de valor
   */
  private validateType(value: any, type: string, fieldName: string): string | null {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return `Campo ${fieldName} deve ser string`;
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return `Campo ${fieldName} deve ser número válido`;
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          return `Campo ${fieldName} deve ser boolean`;
        }
        break;

      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return `Campo ${fieldName} deve ser data válida`;
        }
        break;

      case 'uuid':
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(value)) {
          return `Campo ${fieldName} deve ser UUID válido`;
        }
        break;

      case 'email':
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          return `Campo ${fieldName} deve ser email válido`;
        }
        break;
    }

    return null;
  }
}

// ===================================================================
// SCHEMAS ESPECÍFICOS
// ===================================================================

/**
 * Schema para Termo Ambiental
 */
export const termoSchema = new Validator([
  { field: 'id', required: true, type: 'uuid' },
  { field: 'numero_termo', required: true, type: 'string', min: 3, max: 50 },
  { field: 'titulo', required: true, type: 'string', min: 5, max: 200 },
  { field: 'data_termo', required: true, type: 'date' },
  { field: 'emitido_por_usuario_id', required: true, type: 'uuid' },
  { field: 'emitido_por_nome', required: true, type: 'string', min: 3, max: 100 },
  { field: 'descricao_fatos', required: true, type: 'string', min: 10 },
  { field: 'status', required: true, type: 'string' },
  { field: 'tipo_termo', required: true, type: 'string' },
  { field: 'area_id', required: true, type: 'uuid' },
  { field: 'sincronizado', required: true, type: 'boolean' },
  { field: 'offline', required: true, type: 'boolean' }
]);

/**
 * Schema para LV
 */
export const lvSchema = new Validator([
  { field: 'id', required: true, type: 'uuid' },
  { field: 'tipo_lv', required: true, type: 'string', min: 2, max: 50 },
  { field: 'usuario_id', required: true, type: 'uuid' },
  { field: 'area', required: true, type: 'string', min: 2 },
  { field: 'data_inspecao', required: true, type: 'date' },
  { field: 'status', required: true, type: 'string' },
  { field: 'sincronizado', required: true, type: 'boolean' },
  { field: 'offline', required: true, type: 'boolean' }
]);

/**
 * Schema para Atividade de Rotina
 */
export const atividadeRotinaSchema = new Validator([
  { field: 'id', required: true, type: 'uuid' },
  { field: 'data_atividade', required: true, type: 'date' },
  { field: 'area_id', required: true, type: 'uuid' },
  { field: 'atividade', required: true, type: 'string', min: 5 },
  { field: 'tma_responsavel_id', required: true, type: 'uuid' },
  { field: 'encarregado_id', required: true, type: 'uuid' },
  { field: 'status', required: true, type: 'string' },
  { field: 'sincronizado', required: true, type: 'boolean' },
  { field: 'offline', required: true, type: 'boolean' },
  {
    field: 'km_percorrido',
    type: 'number',
    min: 0,
    max: 10000,
    custom: (value) => {
      if (value !== undefined && value !== null && value < 0) {
        return 'Km percorrido não pode ser negativo';
      }
      return null;
    }
  }
]);

/**
 * Schema para Inspeção
 */
export const inspecaoSchema = new Validator([
  { field: 'id', required: true, type: 'uuid' },
  { field: 'data_inspecao', required: true, type: 'date' },
  { field: 'area_id', required: true, type: 'uuid' },
  { field: 'categoria_id', required: true, type: 'uuid' },
  { field: 'versao_id', required: true, type: 'uuid' },
  { field: 'responsavel_id', required: true, type: 'uuid' },
  { field: 'tma_contratada_id', required: true, type: 'uuid' },
  { field: 'sincronizado', required: true, type: 'boolean' },
  { field: 'offline', required: true, type: 'boolean' }
]);

/**
 * Schema para Encarregado
 */
export const encarregadoSchema = new Validator([
  { field: 'id', required: true, type: 'uuid' },
  { field: 'nome_completo', required: true, type: 'string', min: 3, max: 100 },
  { field: 'ativo', required: true, type: 'boolean' }
]);

/**
 * Schema para Foto (genérico)
 */
export const fotoSchema = new Validator([
  { field: 'id', required: true, type: 'uuid' },
  { field: 'nome_arquivo', required: true, type: 'string', min: 3 },
  { field: 'sincronizado', required: true, type: 'boolean' },
  { field: 'offline', required: true, type: 'boolean' },
  {
    field: 'arquivo_base64',
    custom: (value) => {
      // Se tem arquivo_base64, deve ser data URL válida
      if (value && typeof value === 'string') {
        if (!value.startsWith('data:image/')) {
          return 'arquivo_base64 deve ser data URL válida';
        }
      }
      return null;
    }
  },
  {
    field: 'arquivo_blob',
    custom: (value) => {
      // Se tem arquivo_blob, deve ser Blob
      if (value && !(value instanceof Blob)) {
        return 'arquivo_blob deve ser do tipo Blob';
      }
      return null;
    }
  }
]);

/**
 * Schema para SyncQueueItem
 */
export const syncQueueSchema = new Validator([
  { field: 'id', required: true, type: 'uuid' },
  { field: 'entity_type', required: true, type: 'string' },
  { field: 'entity_id', required: true, type: 'uuid' },
  { field: 'operation', required: true, type: 'string' },
  { field: 'priority', required: true, type: 'number', min: 0 },
  { field: 'retries', required: true, type: 'number', min: 0 },
  { field: 'max_retries', required: true, type: 'number', min: 1, max: 10 },
  { field: 'created_at', required: true, type: 'date' },
  {
    field: 'entity_type',
    custom: (value) => {
      const validTypes = ['termo', 'lv', 'rotina', 'inspecao', 'encarregado'];
      if (!validTypes.includes(value)) {
        return `entity_type deve ser um de: ${validTypes.join(', ')}`;
      }
      return null;
    }
  },
  {
    field: 'operation',
    custom: (value) => {
      const validOps = ['create', 'update', 'delete'];
      if (!validOps.includes(value)) {
        return `operation deve ser um de: ${validOps.join(', ')}`;
      }
      return null;
    }
  }
]);

/**
 * Mapa de schemas por tipo de entidade
 */
export const schemas = {
  termo: termoSchema,
  lv: lvSchema,
  rotina: atividadeRotinaSchema,
  inspecao: inspecaoSchema,
  encarregado: encarregadoSchema,
  foto: fotoSchema,
  syncQueue: syncQueueSchema
} as const;

export type SchemaType = keyof typeof schemas;
