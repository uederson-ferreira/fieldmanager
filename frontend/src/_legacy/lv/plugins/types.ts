// ===================================================================
// TIPOS PARA SISTEMA DE PLUGINS DE LV - ECOFIELD SYSTEM
// Localização: src/components/lv/plugins/types.ts
// ===================================================================

import type { LVFormData, LVConfig, LVBase } from '../types/lv';

export interface LVPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  tipo_lv: string | string[]; // Tipos de LV que suporta
  enabled: boolean;
  
  // Hooks do plugin
  onBeforeSave?: (formData: LVFormData, config: LVConfig) => Promise<LVFormData>;
  onAfterSave?: (lv: LVBase, formData: LVFormData) => Promise<void>;
  onBeforeLoad?: (lv: LVBase) => Promise<LVBase>;
  onAfterLoad?: (lv: LVBase, formData: LVFormData) => Promise<LVFormData>;
  
  // Validações customizadas
  validateForm?: (formData: LVFormData, config: LVConfig) => { isValid: boolean; errors: string[] };
  
  // UI customizada
  renderCustomFields?: (formData: LVFormData, setFormData: (data: LVFormData) => void) => React.ReactNode;
  renderCustomStats?: (lv: LVBase, stats: any) => React.ReactNode;
  
  // Processamento de dados
  processData?: (data: any) => any;
  exportData?: (lv: LVBase) => Promise<any>;
}

export interface PluginManager {
  registerPlugin: (plugin: LVPlugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  getPluginsForLV: (tipo_lv: string) => LVPlugin[];
  executeHook: (hookName: string, tipo_lv: string, ...args: any[]) => Promise<any>;
}

export interface PluginContext {
  plugins: LVPlugin[];
  manager: PluginManager;
} 