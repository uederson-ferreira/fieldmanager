// ===================================================================
// ÍNDICE DE PLUGINS PARA LVs - ECOFIELD SYSTEM
// Localização: src/components/lv/plugins/index.ts
// ===================================================================

import { pluginManager } from './PluginManager';
import { ResiduosPlugin } from './ResiduosPlugin';
import InspecaoPlugin from './InspecaoPlugin';

export function registerDefaultPlugins() {
  pluginManager.registerPlugin(ResiduosPlugin);
  pluginManager.registerPlugin(InspecaoPlugin);
}

export { pluginManager };

// Tipos
export type { LVPlugin, PluginManager, PluginContext } from './types';

// Plugins Específicos
export { ResiduosPlugin } from './ResiduosPlugin';
export { default as InspecaoPlugin } from './InspecaoPlugin'; 