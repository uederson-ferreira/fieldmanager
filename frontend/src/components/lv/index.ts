// ===================================================================
// ÍNDICE UNIFICADO PARA LVs - ECOFIELD SYSTEM
// Localização: src/components/lv/index.ts
// ===================================================================

// Componente Principal
export { default as LVContainer } from './LVContainer';

// Componentes Especializados
export { default as LVForm } from './components/LVForm';
export { default as LVList } from './components/LVList';
export { default as LVPhotoUpload } from './components/LVPhotoUpload';

// Hooks Especializados
export { useLV } from './hooks/useLV';
export { useLVPhotos } from './hooks/useLVPhotos';

// Sistema de Plugins
export { pluginManager, registerDefaultPlugins } from './plugins';
export type { LVPlugin, PluginManager, PluginContext } from './plugins/types';

// Tipos
export type {
  LVBase,
  LVFormData,
  LVFoto,
  LVAvaliacao,
  LVItem,
  LVConfig,
  LVStats,
  LVContainerProps,
  LVPlugin as LVPluginType,
  LVState,
  LVActions
} from './types/lv'; 