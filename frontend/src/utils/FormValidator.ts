// ===================================================================
// VALIDADOR GENÉRICO DE FORMULÁRIOS - ECOFIELD
// Localização: src/utils/FormValidator.ts
// Módulo: Validação reutilizável para todos os formulários do sistema
// ===================================================================

// ===================================================================
// INTERFACES
// ===================================================================

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  summary: {
    totalErrors: number;
    totalWarnings: number;
    criticalErrors: number;
  };
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'minLength' | 'maxLength' | 'email' | 'url' | 'pattern' | 'custom';
  value?: any;
  message?: string;
  severity?: 'error' | 'warning';
  customValidator?: (value: any, data: any) => boolean | string;
}

export interface FormValidationConfig {
  rules: ValidationRule[];
  customValidators?: { [key: string]: (value: any, data: any) => boolean | string };
  allowWarnings?: boolean;
  stopOnFirstError?: boolean;
}

// ===================================================================
// CLASSE PRINCIPAL
// ===================================================================

export class FormValidator {
  private static readonly DEFAULT_CONFIG: Partial<FormValidationConfig> = {
    allowWarnings: true,
    stopOnFirstError: false
  };

  /**
   * Validar formulário genérico
   */
  static validateForm(
    data: any,
    config: FormValidationConfig
  ): ValidationResult {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    console.log(`🔍 [FORM VALIDATOR] Iniciando validação do formulário`);

    for (const rule of finalConfig.rules) {
      const value = this.getNestedValue(data, rule.field);
      const result = this.validateField(value, rule, data, finalConfig);

      if (result.isValid === false) {
        const error: ValidationError = {
          field: rule.field,
          message: result.message || rule.message || `Campo ${rule.field} inválido`,
          severity: rule.severity || 'error',
          code: rule.type
        };

        if (error.severity === 'error') {
          errors.push(error);
          if (finalConfig.stopOnFirstError) break;
        } else if (finalConfig.allowWarnings) {
          warnings.push(error);
        }
      }
    }

    const summary = {
      totalErrors: errors.length,
      totalWarnings: warnings.length,
      criticalErrors: errors.filter(e => e.severity === 'error').length
    };

    console.log(`✅ [FORM VALIDATOR] Validação concluída:`, summary);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary
    };
  }

  /**
   * Validar campo específico
   */
  static validateField(
    value: any,
    rule: ValidationRule,
    data: any,
    config: FormValidationConfig
  ): { isValid: boolean; message?: string } {
    switch (rule.type) {
      case 'required':
        return this.validateRequired(value, rule.message);

      case 'minLength':
        return this.validateMinLength(value, rule.value, rule.message);

      case 'maxLength':
        return this.validateMaxLength(value, rule.value, rule.message);

      case 'email':
        return this.validateEmail(value, rule.message);

      case 'url':
        return this.validateUrl(value, rule.message);

      case 'pattern':
        return this.validatePattern(value, rule.value, rule.message);

      case 'custom':
        return this.validateCustom(value, rule, data, config);

      default:
        return { isValid: true };
    }
  }

  /**
   * Validar campo obrigatório
   */
  private static validateRequired(value: any, message?: string): { isValid: boolean; message?: string } {
    const isValid = value !== null && value !== undefined && value !== '';
    return {
      isValid,
      message: message || 'Campo obrigatório'
    };
  }

  /**
   * Validar comprimento mínimo
   */
  private static validateMinLength(value: any, minLength: number, message?: string): { isValid: boolean; message?: string } {
    if (!value) return { isValid: true };
    
    const isValid = String(value).length >= minLength;
    return {
      isValid,
      message: message || `Mínimo de ${minLength} caracteres`
    };
  }

  /**
   * Validar comprimento máximo
   */
  private static validateMaxLength(value: any, maxLength: number, message?: string): { isValid: boolean; message?: string } {
    if (!value) return { isValid: true };
    
    const isValid = String(value).length <= maxLength;
    return {
      isValid,
      message: message || `Máximo de ${maxLength} caracteres`
    };
  }

  /**
   * Validar email
   */
  private static validateEmail(value: any, message?: string): { isValid: boolean; message?: string } {
    if (!value) return { isValid: true };
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(String(value));
    
    return {
      isValid,
      message: message || 'Email inválido'
    };
  }

  /**
   * Validar URL
   */
  private static validateUrl(value: any, message?: string): { isValid: boolean; message?: string } {
    if (!value) return { isValid: true };
    
    try {
      new URL(String(value));
      return { isValid: true };
    } catch {
      return {
        isValid: false,
        message: message || 'URL inválida'
      };
    }
  }

  /**
   * Validar padrão (regex)
   */
  private static validatePattern(value: any, pattern: RegExp, message?: string): { isValid: boolean; message?: string } {
    if (!value) return { isValid: true };
    
    const isValid = pattern.test(String(value));
    return {
      isValid,
      message: message || 'Formato inválido'
    };
  }

  /**
   * Validar customizada
   */
  private static validateCustom(
    value: any,
    rule: ValidationRule,
    data: any,
    config: FormValidationConfig
  ): { isValid: boolean; message?: string } {
    if (!rule.customValidator) {
      return { isValid: true };
    }

    const result = rule.customValidator(value, data);
    
    if (typeof result === 'boolean') {
      return {
        isValid: result,
        message: rule.message || 'Validação customizada falhou'
      };
    } else {
      return {
        isValid: false,
        message: result
      };
    }
  }

  /**
   * Obter valor aninhado do objeto
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Validar dados de LV
   */
  static validateLV(data: any): ValidationResult {
    const config: FormValidationConfig = {
      rules: [
        { field: 'area', type: 'required', message: 'Área é obrigatória' },
        { field: 'responsavel_tecnico', type: 'required', message: 'Responsável técnico é obrigatório' },
        { field: 'data_inspecao', type: 'required', message: 'Data da inspeção é obrigatória' },
        { field: 'avaliacoes', type: 'custom', customValidator: (value) => {
          return Object.keys(value || {}).length > 0;
        }, message: 'Pelo menos uma avaliação é obrigatória' }
      ],
      customValidators: {
        gps: (value, data) => {
          if (!data.latitude || !data.longitude) {
            return 'Localização GPS é obrigatória';
          }
          return true;
        }
      }
    };

    return this.validateForm(data, config);
  }

  /**
   * Validar dados de Termo
   */
  static validateTermo(data: any): ValidationResult {
    const config: FormValidationConfig = {
      rules: [
        { field: 'data_termo', type: 'required', message: 'Data do termo é obrigatória' },
        { field: 'hora_termo', type: 'required', message: 'Hora do termo é obrigatória' },
        { field: 'local_atividade', type: 'required', message: 'Local da atividade é obrigatório' },
        { field: 'emitido_por_nome', type: 'required', message: 'Nome do emissor é obrigatório' },
        { field: 'destinatario_nome', type: 'required', message: 'Nome do destinatário é obrigatório' },
        { field: 'area_equipamento_atividade', type: 'required', message: 'Área/equipamento/atividade é obrigatório' },
        { field: 'tipo_termo', type: 'required', message: 'Tipo do termo é obrigatório' },
        { field: 'descricao_fatos', type: 'required', message: 'Descrição dos fatos é obrigatória' },
        { field: 'descricao_fatos', type: 'minLength', value: 10, message: 'Descrição deve ter pelo menos 10 caracteres' }
      ],
      customValidators: {
        prazo: (value, data) => {
          if (data.tipo_termo === 'notificacao' && !value) {
            return 'Prazo é obrigatório para notificações';
          }
          return true;
        }
      }
    };

    return this.validateForm(data, config);
  }

  /**
   * Validar dados de Atividade
   */
  static validateAtividade(data: any): ValidationResult {
    const config: FormValidationConfig = {
      rules: [
        { field: 'data_atividade', type: 'required', message: 'Data da atividade é obrigatória' },
        { field: 'hora_inicio', type: 'required', message: 'Hora de início é obrigatória' },
        { field: 'hora_fim', type: 'required', message: 'Hora de fim é obrigatória' },
        { field: 'descricao_atividade', type: 'required', message: 'Descrição da atividade é obrigatória' },
        { field: 'responsavel_atividade', type: 'required', message: 'Responsável pela atividade é obrigatório' }
      ],
      customValidators: {
        horario: (value, data) => {
          if (data.hora_inicio && data.hora_fim) {
            const inicio = new Date(`2000-01-01T${data.hora_inicio}`);
            const fim = new Date(`2000-01-01T${data.hora_fim}`);
            if (inicio >= fim) {
              return 'Hora de fim deve ser posterior à hora de início';
            }
          }
          return true;
        }
      }
    };

    return this.validateForm(data, config);
  }

  /**
   * Validar arquivo de foto
   */
  static validatePhoto(file: File): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Verificar tipo
    if (!file.type.startsWith('image/')) {
      errors.push({
        field: 'file',
        message: 'Arquivo deve ser uma imagem',
        severity: 'error',
        code: 'invalid_type'
      });
    }

    // Verificar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      errors.push({
        field: 'file',
        message: 'Arquivo muito grande (máximo 10MB)',
        severity: 'error',
        code: 'file_too_large'
      });
    }

    // Verificar extensão
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      errors.push({
        field: 'file',
        message: 'Formato de arquivo não suportado',
        severity: 'error',
        code: 'invalid_extension'
      });
    }

    // Aviso para arquivos grandes
    if (file.size > 5 * 1024 * 1024) {
      warnings.push({
        field: 'file',
        message: 'Arquivo grande pode demorar para carregar',
        severity: 'warning',
        code: 'large_file'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalErrors: errors.length,
        totalWarnings: warnings.length,
        criticalErrors: errors.length
      }
    };
  }

  /**
   * Obter mensagens de erro
   */
  static getErrorMessages(result: ValidationResult): string[] {
    return result.errors.map(error => error.message);
  }

  /**
   * Obter mensagens de aviso
   */
  static getWarningMessages(result: ValidationResult): string[] {
    return result.warnings.map(warning => warning.message);
  }

  /**
   * Verificar se há erros críticos
   */
  static hasCriticalErrors(result: ValidationResult): boolean {
    return result.errors.some(error => error.severity === 'error');
  }

  /**
   * Obter primeiro erro
   */
  static getFirstError(result: ValidationResult): ValidationError | null {
    return result.errors[0] || null;
  }

  /**
   * Obter erros por campo
   */
  static getErrorsByField(result: ValidationResult): { [field: string]: ValidationError[] } {
    const errorsByField: { [field: string]: ValidationError[] } = {};
    
    result.errors.forEach(error => {
      if (!errorsByField[error.field]) {
        errorsByField[error.field] = [];
      }
      errorsByField[error.field].push(error);
    });

    return errorsByField;
  }
}

// ===================================================================
// EXPORTS PARA COMPATIBILIDADE
// ===================================================================

export const validateForm = (data: any, config: FormValidationConfig) => {
  return FormValidator.validateForm(data, config);
};

export const validateLV = (data: any) => {
  return FormValidator.validateLV(data);
};

export const validateTermo = (data: any) => {
  return FormValidator.validateTermo(data);
};

export const validateAtividade = (data: any) => {
  return FormValidator.validateAtividade(data);
};

export const validatePhoto = (file: File) => {
  return FormValidator.validatePhoto(file);
};

export const getErrorMessages = (result: ValidationResult) => {
  return FormValidator.getErrorMessages(result);
};

export const getWarningMessages = (result: ValidationResult) => {
  return FormValidator.getWarningMessages(result);
};

export const hasCriticalErrors = (result: ValidationResult) => {
  return FormValidator.hasCriticalErrors(result);
}; 