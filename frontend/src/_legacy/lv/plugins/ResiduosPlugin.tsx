// ===================================================================
// PLUGIN ESPECÍFICO PARA LV DE RESÍDUOS - ECOFIELD SYSTEM
// Localização: src/components/lv/plugins/ResiduosPlugin.ts
// ===================================================================

import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import type { LVFormData, LVConfig, LVBase } from '../types/lv';
import type { LVPlugin } from './types';

// Plugin principal - apenas propriedades que existem em LVPlugin
export const ResiduosPlugin: LVPlugin = {
  id: 'residuos-plugin',
  name: 'Plugin de Resíduos',
  description: 'Funcionalidades específicas para Lista de Verificação de Resíduos',
  version: '1.0.0',
  tipo_lv: 'residuos',
  enabled: true,
  
  // Funções que existem em LVPlugin
  validateForm: (formData: LVFormData, _config: LVConfig) => {
    const errors: string[] = [];
    
    // Validações específicas para resíduos
    if (!formData.area || formData.area === '') {
      errors.push('Área de verificação é obrigatória para resíduos');
    }
    
    // Verificar se há pelo menos uma foto de cada item não conforme
    const naoConformes = Object.entries(formData.avaliacoes)
      .filter(([_, avaliacao]) => avaliacao === 'NC')
      .map(([itemId]) => parseInt(itemId));
    
    naoConformes.forEach(itemId => {
      const fotosDoItem = formData.fotos[itemId] || [];
      if (fotosDoItem.length === 0) {
        errors.push(`Item ${itemId} não conforme deve ter pelo menos uma foto`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Componente de formulário customizado
  renderCustomFields: (formData: LVFormData, setFormData: (data: LVFormData) => void) => {
    return (
      <div className="space-y-6">
        {/* Tipo de Resíduo Principal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Resíduo Principal
          </label>
          <select
            value={formData.customFields?.tipoResiduo ?? ''}
            onChange={e => setFormData({
              ...formData,
              customFields: {
                ...(formData.customFields ?? {}),
                tipoResiduo: e.target.value
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Selecione o tipo...</option>
            <option value="classe1">Classe I - Perigoso</option>
            <option value="classe2">Classe II A - Não Inerte</option>
            <option value="classe3">Classe II B - Inerte</option>
            <option value="classe4">Classe III - Inerte</option>
          </select>
        </div>

        {/* Volume Estimado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Volume Estimado (m³)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={formData.customFields?.volumeEstimado ?? ''}
            onChange={e => setFormData({
              ...formData,
              customFields: {
                ...(formData.customFields ?? {}),
                volumeEstimado: e.target.value === '' ? undefined : Number(e.target.value)
              }
            })}
            placeholder="0.0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Condições Especiais */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condições Especiais
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!!formData.customFields?.residuoPerigoso}
                onChange={e => setFormData({
                  ...formData,
                  customFields: {
                    ...(formData.customFields ?? {}),
                    residuoPerigoso: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Resíduo Perigoso</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!!formData.customFields?.residuoInfectante}
                onChange={e => setFormData({
                  ...formData,
                  customFields: {
                    ...(formData.customFields ?? {}),
                    residuoInfectante: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Resíduo Infectante</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!!formData.customFields?.residuoRadioativo}
                onChange={e => setFormData({
                  ...formData,
                  customFields: {
                    ...(formData.customFields ?? {}),
                    residuoRadioativo: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Resíduo Radioativo</span>
            </label>
          </div>
        </div>

        {/* Temperatura */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Temperatura (°C)
          </label>
          <input
            type="number"
            min="-50"
            max="100"
            step="0.1"
            value={formData.customFields?.temperatura ?? ''}
            onChange={e => setFormData({
              ...formData,
              customFields: {
                ...(formData.customFields ?? {}),
                temperatura: e.target.value === '' ? undefined : Number(e.target.value)
              }
            })}
            placeholder="25.0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>
    );
  },

  // Função para renderizar estatísticas customizadas
  renderCustomStats: (lv: LVBase, _stats: any) => {
    const customData = lv.customFields || {};
    return (
      <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-orange-800">
            Estatísticas de Resíduos
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {(customData.volumeEstimado as number) || 0}
            </div>
            <div className="text-xs text-orange-700">m³ Estimados</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {(customData.tipoResiduo as string) || 'N/A'}
            </div>
            <div className="text-xs text-orange-700">Tipo Principal</div>
          </div>
        </div>
        {/* Alertas de Segurança */}
        {((customData.residuoPerigoso as boolean) || (customData.residuoInfectante as boolean) || (customData.residuoRadioativo as boolean)) ? (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Resíduo com Condições Especiais
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {(customData.residuoPerigoso as boolean) && (
                <div className="text-xs text-red-700">⚠️ Resíduo Perigoso</div>
              )}
              {(customData.residuoInfectante as boolean) && (
                <div className="text-xs text-red-700">⚠️ Resíduo Infectante</div>
              )}
              {(customData.residuoRadioativo as boolean) && (
                <div className="text-xs text-red-700">⚠️ Resíduo Radioativo</div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
  },

  // Função para processar dados antes de salvar
  onBeforeSave: async (formData: LVFormData, _config: LVConfig) => {
    const enhancedFormData = {
      ...formData,
      metadata: {
        ...(formData.metadata || {}),
        plugin: 'residuos-plugin',
        version: '1.0.0',
        processedAt: new Date().toISOString(),
        residuoType: formData.customFields?.tipoResiduo || 'unknown',
        hasSpecialConditions: !!(formData.customFields?.residuoPerigoso || 
                               formData.customFields?.residuoInfectante || 
                               formData.customFields?.residuoRadioativo)
      }
    };
    return enhancedFormData;
  },

  // Função para processar dados após salvar
  onAfterSave: async (lv: LVBase, formData: LVFormData) => {
    console.log('🔌 [ResiduosPlugin] Processando após salvar...');
    
    // Aqui poderíamos enviar dados para sistemas externos
    // como controle de resíduos, relatórios ambientais, etc.
    
    if (formData.customFields?.residuoPerigoso) {
      console.log('⚠️ [ResiduosPlugin] Resíduo perigoso detectado - notificar autoridades');
    }
  },

  // Função para exportar dados
  exportData: async (lv: LVBase) => {
    const customData = lv.customFields || {};
    
    return {
      tipoResiduo: customData.tipoResiduo,
      volumeEstimado: customData.volumeEstimado,
      temperatura: customData.temperatura,
      condicoesEspeciais: {
        perigoso: customData.residuoPerigoso,
        infectante: customData.residuoInfectante,
        radioativo: customData.residuoRadioativo
      },
      metadata: lv.metadata || null
    };
  }
};

// Funções customizadas exportadas separadamente
export const ResiduosPluginUtils = {
  // Função para gerar termo específico de resíduos
  gerarTermo: async (_lv: LVBase) => {
    console.log('🗑️ [ResiduosPlugin] Gerando termo para resíduos');
    // TODO: Implementar geração de termo específico para resíduos
  },

  // Função para obter dados específicos de resíduos
  obterDadosEspecificos: (formData: LVFormData, _config: LVConfig) => {
    return {
      tipoResiduo: formData.customFields?.tipoResiduo,
      volumeEstimado: formData.customFields?.volumeEstimado,
      temperatura: formData.customFields?.temperatura,
      residuoPerigoso: formData.customFields?.residuoPerigoso,
      residuoInfectante: formData.customFields?.residuoInfectante,
      residuoRadioativo: formData.customFields?.residuoRadioativo
    };
  },

  // Função para processar dados específicos de resíduos
  processarDadosEspecificos: (dados: Record<string, unknown>, _lv: LVBase) => {
    console.log('🗑️ [ResiduosPlugin] Processando dados específicos:', dados);
    // TODO: Implementar processamento específico para resíduos
  }
}; 