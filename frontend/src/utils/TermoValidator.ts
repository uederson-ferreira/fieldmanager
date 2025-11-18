// ===================================================================
// MÓDULO: Termos - Validação
// Localização: src/utils/TermoValidator.ts
// ===================================================================

import { TermoFormData } from '../types/termos';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export class TermoValidator {
  /**
   * Valida dados do formulário de termo
   */
  static validarFormulario(dados: TermoFormData): ValidationResult {
    console.log(`🔍 [TERMO VALIDATOR] Iniciando validação do formulário`);
    
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // 1. Validações obrigatórias (erros)
    
    // Identificação básica
    if (!dados.data_termo) {
      errors.push({
        field: 'data_termo',
        message: 'Data do termo é obrigatória',
        severity: 'error'
      });
    }

    if (!dados.hora_termo) {
      errors.push({
        field: 'hora_termo',
        message: 'Hora do termo é obrigatória',
        severity: 'error'
      });
    }

    if (!dados.local_atividade?.trim()) {
      errors.push({
        field: 'local_atividade',
        message: 'Local da atividade é obrigatório',
        severity: 'error'
      });
    }

    // Emissor
    if (!dados.emitido_por_nome?.trim()) {
      errors.push({
        field: 'emitido_por_nome',
        message: 'Nome do emissor é obrigatório',
        severity: 'error'
      });
    }

    if (!dados.emitido_por_usuario_id) {
      errors.push({
        field: 'emitido_por_usuario_id',
        message: 'ID do usuário emissor é obrigatório',
        severity: 'error'
      });
    }

    // Destinatário
    if (!dados.destinatario_nome?.trim()) {
      errors.push({
        field: 'destinatario_nome',
        message: 'Nome do destinatário é obrigatório',
        severity: 'error'
      });
    }

    // Localização
    if (!dados.area_equipamento_atividade?.trim()) {
      errors.push({
        field: 'area_equipamento_atividade',
        message: 'Área/equipamento/atividade é obrigatório',
        severity: 'error'
      });
    }

    // Tipo e natureza
    if (!dados.tipo_termo) {
      errors.push({
        field: 'tipo_termo',
        message: 'Tipo do termo é obrigatório',
        severity: 'error'
      });
    }

    if (!dados.natureza_desvio) {
      errors.push({
        field: 'natureza_desvio',
        message: 'Natureza do desvio é obrigatória',
        severity: 'error'
      });
    }

    // 2. Validações de conteúdo (warnings)

    // Verificar se há pelo menos uma não conformidade
    if (!dados.nao_conformidades || dados.nao_conformidades.length === 0) {
      warnings.push({
        field: 'nao_conformidades',
        message: 'Recomenda-se adicionar pelo menos uma não conformidade',
        severity: 'warning'
      });
    }

    // Verificar se há pelo menos uma ação de correção
    if (!dados.acoes_correcao || dados.acoes_correcao.length === 0) {
      warnings.push({
        field: 'acoes_correcao',
        message: 'Recomenda-se adicionar pelo menos uma ação de correção',
        severity: 'warning'
      });
    }

    // Verificar se há observações
    if (!dados.observacoes?.trim()) {
      warnings.push({
        field: 'observacoes',
        message: 'Recomenda-se adicionar observações gerais',
        severity: 'warning'
      });
    }

    // Verificar se há fotos
    const totalFotos = Object.values(dados.fotos).reduce((total, fotosCategoria) => total + fotosCategoria.length, 0);
    if (totalFotos === 0) {
      warnings.push({
        field: 'fotos',
        message: 'Recomenda-se adicionar pelo menos uma foto como evidência',
        severity: 'warning'
      });
    }

    // 3. Validações específicas por tipo de termo

    if (dados.tipo_termo === 'PARALIZACAO_TECNICA') {
      // Para paralização técnica, verificar se há dados de liberação
      if (!dados.liberacao?.nome?.trim()) {
        warnings.push({
          field: 'liberacao.nome',
          message: 'Para paralização técnica, recomenda-se preencher dados de liberação',
          severity: 'warning'
        });
      }
    }

    // 4. Validações de formato

    // Validar formato de data
    if (dados.data_termo && !this.validarFormatoData(dados.data_termo)) {
      errors.push({
        field: 'data_termo',
        message: 'Formato de data inválido (use DD/MM/AAAA)',
        severity: 'error'
      });
    }

    // Validar formato de hora
    if (dados.hora_termo && !this.validarFormatoHora(dados.hora_termo)) {
      errors.push({
        field: 'hora_termo',
        message: 'Formato de hora inválido (use HH:MM)',
        severity: 'error'
      });
    }

    // 5. Validações de prazo

    // Verificar se prazos de ações são futuros
    if (dados.acoes_correcao) {
      dados.acoes_correcao.forEach((acao, index) => {
        if (acao.prazo && !this.validarPrazoFuturo(acao.prazo)) {
          warnings.push({
            field: `acoes_correcao[${index}].prazo`,
            message: `Prazo da ação ${index + 1} deve ser uma data futura`,
            severity: 'warning'
          });
        }
      });
    }

    const isValid = errors.length === 0;
    
    console.log(`📊 [TERMO VALIDATOR] Resultado da validação:`, {
      isValid,
      totalErrors: errors.length,
      totalWarnings: warnings.length
    });

    return {
      isValid,
      errors,
      warnings
    };
  }

  /**
   * Valida formato de data (aceita DD/MM/AAAA ou YYYY-MM-DD)
   */
  private static validarFormatoData(data: string): boolean {
    // Aceita DD/MM/AAAA
    const regexBR = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    // Aceita YYYY-MM-DD
    const regexISO = /^\d{4}-\d{2}-\d{2}$/;
    if (regexBR.test(data)) {
      const [dia, mes, ano] = data.split('/').map(Number);
      const dataObj = new Date(ano, mes - 1, dia);
      return dataObj.getDate() === dia && 
             dataObj.getMonth() === mes - 1 && 
             dataObj.getFullYear() === ano;
    }
    if (regexISO.test(data)) {
      const [ano, mes, dia] = data.split('-').map(Number);
      const dataObj = new Date(ano, mes - 1, dia);
      return dataObj.getDate() === dia && 
             dataObj.getMonth() === mes - 1 && 
             dataObj.getFullYear() === ano;
    }
    return false;
  }

  /**
   * Valida formato de hora (HH:MM)
   */
  private static validarFormatoHora(hora: string): boolean {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(hora);
  }

  /**
   * Valida se uma data é futura
   */
  private static validarPrazoFuturo(prazo: string): boolean {
    if (!this.validarFormatoData(prazo)) return false;
    
    const [dia, mes, ano] = prazo.split('/').map(Number);
    const dataPrazo = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    return dataPrazo > hoje;
  }

  /**
   * Valida dados de GPS
   */
  static validarGPS(latitude?: number, longitude?: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (latitude !== undefined && longitude !== undefined) {
      // Validar range de latitude (-90 a 90)
      if (latitude < -90 || latitude > 90) {
        errors.push({
          field: 'latitude',
          message: 'Latitude deve estar entre -90 e 90',
          severity: 'error'
        });
      }

      // Validar range de longitude (-180 a 180)
      if (longitude < -180 || longitude > 180) {
        errors.push({
          field: 'longitude',
          message: 'Longitude deve estar entre -180 e 180',
          severity: 'error'
        });
      }

      // Verificar se as coordenadas fazem sentido para o Brasil
      if (latitude < -34 || latitude > 6 || longitude < -74 || longitude > -34) {
        warnings.push({
          field: 'gps',
          message: 'Coordenadas fora da área geográfica do Brasil',
          severity: 'warning'
        });
      }
    } else {
      warnings.push({
        field: 'gps',
        message: 'Coordenadas GPS não foram obtidas',
        severity: 'warning'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valida arquivo de foto
   */
  static validarArquivoFoto(file: File): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Verificar tipo de arquivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(file.type)) {
      errors.push({
        field: 'tipo_arquivo',
        message: `Tipo de arquivo não suportado. Use: ${tiposPermitidos.join(', ')}`,
        severity: 'error'
      });
    }

    // Verificar tamanho (máximo 10MB)
    const tamanhoMaximo = 10 * 1024 * 1024; // 10MB
    if (file.size > tamanhoMaximo) {
      errors.push({
        field: 'tamanho_arquivo',
        message: `Arquivo muito grande. Máximo: ${(tamanhoMaximo / (1024 * 1024)).toFixed(1)}MB`,
        severity: 'error'
      });
    }

    // Aviso para arquivos muito pequenos (possível corrupção)
    if (file.size < 1024) { // Menos de 1KB
      warnings.push({
        field: 'tamanho_arquivo',
        message: 'Arquivo muito pequeno, pode estar corrompido',
        severity: 'warning'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Obtém mensagens de erro formatadas
   */
  static obterMensagensErro(resultado: ValidationResult): string[] {
    return resultado.errors.map(error => `${error.field}: ${error.message}`);
  }

  /**
   * Obtém mensagens de aviso formatadas
   */
  static obterMensagensAviso(resultado: ValidationResult): string[] {
    return resultado.warnings.map(warning => `${warning.field}: ${warning.message}`);
  }
} 