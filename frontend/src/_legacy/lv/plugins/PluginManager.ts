// ===================================================================
// GERENCIADOR DE PLUGINS PARA LVs - ECOFIELD SYSTEM
// Localização: src/components/lv/plugins/PluginManager.ts
// ===================================================================

import type { LVPlugin, PluginManager } from './types';
import type { LVFormData, LVConfig, LVBase } from '../types/lv';

class LVPluginManager implements PluginManager {
  private plugins: Map<string, LVPlugin> = new Map();

  // ===================================================================
  // REGISTRO DE PLUGINS
  // ===================================================================

  registerPlugin(plugin: LVPlugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`⚠️ [PluginManager] Plugin ${plugin.id} já registrado. Substituindo...`);
    }
    
    this.plugins.set(plugin.id, plugin);
    console.log(`✅ [PluginManager] Plugin ${plugin.name} (${plugin.id}) registrado`);
  }

  unregisterPlugin(pluginId: string): void {
    if (this.plugins.has(pluginId)) {
      this.plugins.delete(pluginId);
      console.log(`🗑️ [PluginManager] Plugin ${pluginId} removido`);
    } else {
      console.warn(`⚠️ [PluginManager] Plugin ${pluginId} não encontrado`);
    }
  }

  // ===================================================================
  // SELEÇÃO DE PLUGINS
  // ===================================================================

  getPluginsForLV(tipo_lv: string): LVPlugin[] {
    const plugins: LVPlugin[] = [];
    
    for (const plugin of this.plugins.values()) {
      if (!plugin.enabled) continue;
      
      if (Array.isArray(plugin.tipo_lv)) {
        if (plugin.tipo_lv.includes(tipo_lv)) {
          plugins.push(plugin);
        }
      } else if (plugin.tipo_lv === tipo_lv) {
        plugins.push(plugin);
      }
    }
    
    return plugins.sort((a, b) => a.name.localeCompare(b.name));
  }

  // ===================================================================
  // EXECUÇÃO DE HOOKS
  // ===================================================================

  async executeHook(hookName: string, tipo_lv: string, ...args: any[]): Promise<any> {
    const plugins = this.getPluginsForLV(tipo_lv);
    let result = args[0]; // Primeiro argumento é o resultado base
    
    console.log(`🔌 [PluginManager] Executando hook '${hookName}' para LV ${tipo_lv} com ${plugins.length} plugins`);
    
    for (const plugin of plugins) {
      try {
        const hook = plugin[hookName as keyof LVPlugin];
        
        if (typeof hook === 'function') {
          console.log(`🔌 [PluginManager] Executando ${hookName} do plugin ${plugin.name}`);
          
          if (hookName === 'onBeforeSave' || hookName === 'onAfterLoad') {
            result = await hook(result, args[1]); // formData, config
          } else if (hookName === 'onAfterSave') {
            await hook(args[0], args[1]); // lv, formData
          } else if (hookName === 'onBeforeLoad') {
            result = await hook(result, args[1]); // lv, config
          }
          
          console.log(`✅ [PluginManager] Hook ${hookName} do plugin ${plugin.name} executado com sucesso`);
        }
      } catch (error) {
        console.error(`❌ [PluginManager] Erro no hook ${hookName} do plugin ${plugin.name}:`, error);
        // Não interromper a execução por erro em um plugin
      }
    }
    
    return result;
  }

  // ===================================================================
  // VALIDAÇÕES CUSTOMIZADAS
  // ===================================================================

  async validateFormWithPlugins(formData: LVFormData, config: LVConfig, tipo_lv: string): Promise<{ isValid: boolean; errors: string[] }> {
    const plugins = this.getPluginsForLV(tipo_lv);
    const errors: string[] = [];
    
    for (const plugin of plugins) {
      if (plugin.validateForm) {
        try {
          const validation = plugin.validateForm(formData, config);
          if (!validation.isValid) {
            errors.push(`[${plugin.name}] ${validation.errors.join(', ')}`);
          }
        } catch (error) {
          console.error(`❌ [PluginManager] Erro na validação do plugin ${plugin.name}:`, error);
          errors.push(`[${plugin.name}] Erro na validação`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ===================================================================
  // RENDERIZAÇÃO CUSTOMIZADA
  // ===================================================================

  renderCustomFields(formData: LVFormData, setFormData: (data: LVFormData) => void, tipo_lv: string): any[] {
    const plugins = this.getPluginsForLV(tipo_lv);
    const customFields: any[] = [];
    
    for (const plugin of plugins) {
      if (plugin.renderCustomFields) {
        try {
          const fields = plugin.renderCustomFields(formData, setFormData);
          if (fields) {
            customFields.push({
              pluginId: plugin.id,
              pluginName: plugin.name,
              fields: fields
            });
          }
        } catch (error) {
          console.error(`❌ [PluginManager] Erro ao renderizar campos do plugin ${plugin.name}:`, error);
        }
      }
    }
    
    return customFields;
  }

  renderCustomStats(lv: LVBase, stats: any, tipo_lv: string): any[] {
    const plugins = this.getPluginsForLV(tipo_lv);
    const customStats: any[] = [];
    
    for (const plugin of plugins) {
      if (plugin.renderCustomStats) {
        try {
          const statsComponent = plugin.renderCustomStats(lv, stats);
          if (statsComponent) {
            customStats.push({
              pluginId: plugin.id,
              pluginName: plugin.name,
              stats: statsComponent
            });
          }
        } catch (error) {
          console.error(`❌ [PluginManager] Erro ao renderizar estatísticas do plugin ${plugin.name}:`, error);
        }
      }
    }
    
    return customStats;
  }

  // ===================================================================
  // EXPORTAÇÃO DE DADOS
  // ===================================================================

  async exportDataWithPlugins(lv: LVBase, tipo_lv: string): Promise<any> {
    const plugins = this.getPluginsForLV(tipo_lv);
    const exportData: any = {};
    
    for (const plugin of plugins) {
      if (plugin.exportData) {
        try {
          const data = await plugin.exportData(lv);
          exportData[plugin.id] = data;
        } catch (error) {
          console.error(`❌ [PluginManager] Erro na exportação do plugin ${plugin.name}:`, error);
        }
      }
    }
    
    return exportData;
  }

  // ===================================================================
  // UTILITÁRIOS
  // ===================================================================

  getPluginInfo(tipo_lv: string): { total: number; enabled: number; plugins: string[] } {
    const plugins = this.getPluginsForLV(tipo_lv);
    return {
      total: plugins.length,
      enabled: plugins.filter(p => p.enabled).length,
      plugins: plugins.map(p => p.name)
    };
  }

  listAllPlugins(): LVPlugin[] {
    return Array.from(this.plugins.values());
  }
}

// Instância singleton do gerenciador
export const pluginManager = new LVPluginManager();
export default pluginManager; 