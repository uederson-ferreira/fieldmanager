// ===================================================================
// PLUGIN GENÉRICO PARA LVs DE INSPEÇÃO - ECOFIELD SYSTEM
// Localização: src/components/lv/plugins/InspecaoPlugin.ts
// ===================================================================

import { CheckCircle, AlertCircle, Clock, Target, TrendingUp } from 'lucide-react';
import type { LVPlugin } from './types';
import type { LVFormData, LVConfig, LVBase } from '../types/lv';

const InspecaoPlugin: LVPlugin = {
  id: 'inspecao-plugin',
  name: 'Plugin de Inspeção',
  description: 'Funcionalidades genéricas para Listas de Verificação de Inspeção',
  version: '1.0.0',
  tipo_lv: ['02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
  enabled: true,

  // ===================================================================
  // VALIDAÇÕES CUSTOMIZADAS
  // ===================================================================

  validateForm: (formData: LVFormData, config: LVConfig) => {
    const errors: string[] = [];
    
    // Validações básicas para inspeções
    if (!formData.responsavel_tecnico || formData.responsavel_tecnico.trim() === '') {
      errors.push('Responsável técnico é obrigatório');
    }
    
    if (!formData.inspetor_principal || formData.inspetor_principal.trim() === '') {
      errors.push('Inspetor principal é obrigatório');
    }
    
    // Verificar se pelo menos 80% dos itens foram avaliados
    const totalItens = config.itens?.length || 0;
    const itensAvaliados = Object.keys(formData.avaliacoes).length;
    const percentualAvaliado = totalItens > 0 ? (itensAvaliados / totalItens) * 100 : 0;
    
    if (percentualAvaliado < 80) {
      errors.push(`Pelo menos 80% dos itens devem ser avaliados (atual: ${Math.round(percentualAvaliado)}%)`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // ===================================================================
  // CAMPOS CUSTOMIZADOS
  // ===================================================================

  renderCustomFields: (formData: LVFormData, setFormData: (data: LVFormData) => void) => {
    return (
      <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-800">
            Campos de Qualidade - Inspeção
          </h3>
        </div>
        
        {/* Criticidade da Inspeção */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Criticidade da Inspeção
          </label>
          <select
            value={formData.customFields?.criticidade || ''}
            onChange={(e) => setFormData({
              ...formData,
              customFields: {
                ...formData.customFields,
                criticidade: e.target.value
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecione a criticidade...</option>
            <option value="baixa">Baixa - Rotina</option>
            <option value="media">Média - Importante</option>
            <option value="alta">Alta - Crítica</option>
            <option value="critica">Crítica - Urgente</option>
          </select>
        </div>

        {/* Tipo de Inspeção */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Inspeção
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="tipoInspecao"
                value="preventiva"
                checked={formData.customFields?.tipoInspecao === 'preventiva'}
                onChange={(e) => setFormData({
                  ...formData,
                  customFields: {
                    ...formData.customFields,
                    tipoInspecao: e.target.value
                  }
                })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Preventiva</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="tipoInspecao"
                value="corretiva"
                checked={formData.customFields?.tipoInspecao === 'corretiva'}
                onChange={(e) => setFormData({
                  ...formData,
                  customFields: {
                    ...formData.customFields,
                    tipoInspecao: e.target.value
                  }
                })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Corretiva</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="tipoInspecao"
                value="auditoria"
                checked={formData.customFields?.tipoInspecao === 'auditoria'}
                onChange={(e) => setFormData({
                  ...formData,
                  customFields: {
                    ...formData.customFields,
                    tipoInspecao: e.target.value
                  }
                })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Auditoria</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="tipoInspecao"
                value="verificacao"
                checked={formData.customFields?.tipoInspecao === 'verificacao'}
                onChange={(e) => setFormData({
                  ...formData,
                  customFields: {
                    ...formData.customFields,
                    tipoInspecao: e.target.value
                  }
                })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Verificação</span>
            </label>
          </div>
        </div>

        {/* Tempo Estimado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tempo Estimado da Inspeção (minutos)
          </label>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <input
              type="number"
              min="5"
              max="480"
              value={formData.customFields?.tempoEstimado || ''}
              onChange={(e) => setFormData({
                ...formData,
                customFields: {
                  ...formData.customFields,
                  tempoEstimado: parseInt(e.target.value) || 0
                }
              })}
              placeholder="30"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-sm text-gray-500">min</span>
          </div>
        </div>

        {/* Condições Ambientais */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condições Ambientais
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.customFields?.condicoesAdversas || false}
                onChange={(e) => setFormData({
                  ...formData,
                  customFields: {
                    ...formData.customFields,
                    condicoesAdversas: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Condições Adversas (chuva, vento, etc.)</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.customFields?.inspecaoNoturna || false}
                onChange={(e) => setFormData({
                  ...formData,
                  customFields: {
                    ...formData.customFields,
                    inspecaoNoturna: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Inspeção Noturna</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.customFields?.equipamentoEspecial || false}
                onChange={(e) => setFormData({
                  ...formData,
                  customFields: {
                    ...formData.customFields,
                    equipamentoEspecial: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Equipamento Especial Necessário</span>
            </label>
          </div>
        </div>
      </div>
    );
  },

  // ===================================================================
  // ESTATÍSTICAS CUSTOMIZADAS
  // ===================================================================

  renderCustomStats: (lv: LVBase, stats: any) => {
    const customData = lv.customFields || {};
    
    return (
      <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-800">
            Métricas de Qualidade
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {customData.criticidade || 'N/A'}
            </div>
            <div className="text-xs text-blue-700">Criticidade</div>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {customData.tempoEstimado || 0}
            </div>
            <div className="text-xs text-blue-700">min Estimados</div>
          </div>
        </div>

        {/* Indicadores de Qualidade */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Tipo de Inspeção:</span>
            <span className="font-medium text-blue-800">
              {customData.tipoInspecao || 'Não definido'}
            </span>
          </div>
          
          {customData.condicoesAdversas && (
            <div className="flex items-center space-x-2 text-sm">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-orange-700">Condições adversas detectadas</span>
            </div>
          )}
          
          {customData.inspecaoNoturna && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-blue-700">Inspeção noturna realizada</span>
            </div>
          )}
          
          {customData.equipamentoEspecial && (
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-700">Equipamento especial utilizado</span>
            </div>
          )}
        </div>
      </div>
    );
  },

  // ===================================================================
  // PROCESSAMENTO DE DADOS
  // ===================================================================

  onBeforeSave: async (formData: LVFormData, config: LVConfig) => {
    console.log('🔌 [InspecaoPlugin] Processando dados antes de salvar...');
    
    // Calcular métricas de qualidade
    const totalItens = config.itens?.length || 0;
    const itensAvaliados = Object.keys(formData.avaliacoes).length;
    const percentualAvaliado = totalItens > 0 ? (itensAvaliados / totalItens) * 100 : 0;
    
    const enhancedFormData = {
      ...formData,
      metadata: {
        ...formData.metadata,
        plugin: 'inspecao-plugin',
        version: '1.0.0',
        processedAt: new Date().toISOString(),
        qualityMetrics: {
          percentualAvaliado,
          totalItens,
          itensAvaliados,
          criticidade: formData.customFields?.criticidade || 'unknown',
          tipoInspecao: formData.customFields?.tipoInspecao || 'unknown'
        }
      }
    };
    
    return enhancedFormData;
  },

  onAfterSave: async (lv: LVBase, formData: LVFormData) => {
    console.log('🔌 [InspecaoPlugin] Processando após salvar...');
    
    // Aqui poderíamos integrar com sistemas de qualidade
    // como ISO 9001, Six Sigma, etc.
    
    if (formData.customFields?.criticidade === 'critica') {
      console.log('🚨 [InspecaoPlugin] Inspeção crítica detectada - notificar gestores');
    }
  },

  // ===================================================================
  // EXPORTAÇÃO DE DADOS
  // ===================================================================

  exportData: async (lv: LVBase) => {
    const customData = lv.customFields || {};
    
    return {
      criticidade: customData.criticidade,
      tipoInspecao: customData.tipoInspecao,
      tempoEstimado: customData.tempoEstimado,
      condicoesAmbientais: {
        adversas: customData.condicoesAdversas,
        noturna: customData.inspecaoNoturna,
        equipamentoEspecial: customData.equipamentoEspecial
      },
      metadata: lv.metadata
    };
  }
};

export default InspecaoPlugin; 