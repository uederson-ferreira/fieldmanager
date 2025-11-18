// ===================================================================
// SISTEMA DE CACHE UNIFICADO - ECOFIELD (MIGRADO PARA AUTH)
// Localização: src/lib/unifiedCache.ts
// Módulo: Cache centralizado e otimizado (substitui múltiplas camadas)
// ===================================================================

import { offlineDB } from './offline/database';

interface CacheConfig {
  key: string;
  ttl: number; // Time to live em milissegundos
  priority: 'high' | 'medium' | 'low';
  storage: 'indexeddb' | 'localstorage' | 'memory';
  compress?: boolean;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  version: string;
  checksum?: string;
}

class UnifiedCache {
  clear() {
    throw new Error('Method not implemented.');
  }
  private static instance: UnifiedCache;
  private memoryCache = new Map<string, CacheItem<any>>();
  private configs = new Map<string, CacheConfig>();

  // Configurações padrão
  private readonly DEFAULT_CONFIGS: CacheConfig[] = [
    // Dados críticos - sempre no IndexedDB
    {
      key: 'areas',
      ttl: 24 * 60 * 60 * 1000, // 24 horas
      priority: 'high',
      storage: 'indexeddb'
    },
    {
      key: 'usuarios',
      ttl: 24 * 60 * 60 * 1000, // 24 horas
      priority: 'high',
      storage: 'indexeddb'
    },
    {
      key: 'empresas_contratadas',
      ttl: 24 * 60 * 60 * 1000, // 24 horas
      priority: 'high',
      storage: 'indexeddb'
    },
    {
      key: 'encarregados',
      ttl: 24 * 60 * 60 * 1000, // 24 horas
      priority: 'high',
      storage: 'indexeddb'
    },
    {
      key: 'categorias_lv',
      ttl: 24 * 60 * 60 * 1000, // 24 horas
      priority: 'high',
      storage: 'indexeddb'
    },
    // Dados médios - localStorage
    {
      key: 'perfis',
      ttl: 12 * 60 * 60 * 1000, // 12 horas
      priority: 'medium',
      storage: 'localstorage'
    },
    {
      key: 'versoes_lv',
      ttl: 12 * 60 * 60 * 1000, // 12 horas
      priority: 'medium',
      storage: 'localstorage'
    },
    // Dados temporários - memória
    {
      key: 'temp_data',
      ttl: 5 * 60 * 1000, // 5 minutos
      priority: 'low',
      storage: 'memory'
    },
    // Estatísticas do dashboard - localStorage (dados médios)
    {
      key: 'dashboard_stats',
      ttl: 5 * 60 * 1000, // 5 minutos
      priority: 'medium',
      storage: 'localstorage'
    },
    // Estatísticas do dashboard por usuário - localStorage (dados médios)
    {
      key: 'dashboard_stats_*', // Wildcard para qualquer ID de usuário
      ttl: 5 * 60 * 1000, // 5 minutos
      priority: 'medium',
      storage: 'localstorage'
    },
    // Rotinas - localStorage (dados médios)
    {
      key: 'rotinas',
      ttl: 12 * 60 * 60 * 1000, // 12 horas
      priority: 'medium',
      storage: 'localstorage'
    }
  ];

  private constructor() {
    this.initializeConfigs();
    this.startCleanupInterval();
  }

  static getInstance(): UnifiedCache {
    if (!UnifiedCache.instance) {
      UnifiedCache.instance = new UnifiedCache();
    }
    return UnifiedCache.instance;
  }

  private initializeConfigs() {
    this.DEFAULT_CONFIGS.forEach(config => {
      this.configs.set(config.key, config);
    });
  }

  /**
   * Buscar dados do cache unificado
   */
  async get<T>(key: string): Promise<T | null> {
    // ✅ BUSCAR CONFIGURAÇÃO COM SUPORTE A WILDCARDS
    let config = this.configs.get(key);
    
    // Se não encontrar, tentar com wildcard
    if (!config) {
      // Buscar configuração com wildcard (ex: dashboard_stats_*)
      for (const [configKey, configValue] of this.configs.entries()) {
        if (configKey.endsWith('*')) {
          const wildcardPrefix = configKey.slice(0, -1); // Remove o *
          if (key.startsWith(wildcardPrefix)) {
            config = configValue;
            break;
          }
        }
      }
    }
    
    if (!config) {
      console.warn(`⚠️ [UNIFIED CACHE] Configuração não encontrada para: ${key}`);
      return null;
    }

    try {
      let data: CacheItem<T> | null = null;

      // Buscar da camada apropriada
      switch (config.storage) {
        case 'memory':
          data = this.memoryCache.get(key) || null;
          break;
        case 'localstorage':
          data = this.getFromLocalStorage<T>(key);
          break;
        case 'indexeddb':
          data = await this.getFromIndexedDB<T>(key);
          break;
      }

      if (!data) {
        console.log(`📭 [UNIFIED CACHE] ${key} não encontrado no cache`);
        return null;
      }

      // Verificar se expirou
      if (this.isExpired(data.timestamp, config.ttl)) {
        console.log(`⏰ [UNIFIED CACHE] ${key} expirado, removendo...`);
        await this.delete(key);
        return null;
      }

      console.log(`✅ [UNIFIED CACHE] ${key} encontrado no cache`);
      return data.data;
    } catch (error) {
      console.error(`❌ [UNIFIED CACHE] Erro ao buscar ${key}:`, error);
      return null;
    }
  }

  /**
   * Salvar dados no cache unificado
   */
  async set<T>(key: string, data: T): Promise<void> {
    // ✅ BUSCAR CONFIGURAÇÃO COM SUPORTE A WILDCARDS
    let config = this.configs.get(key);
    
    // Se não encontrar, tentar com wildcard
    if (!config) {
      // Buscar configuração com wildcard (ex: dashboard_stats_*)
      for (const [configKey, configValue] of this.configs.entries()) {
        if (configKey.endsWith('*')) {
          const wildcardPrefix = configKey.slice(0, -1); // Remove o *
          if (key.startsWith(wildcardPrefix)) {
            config = configValue;
            break;
          }
        }
      }
    }
    
    if (!config) {
      console.warn(`⚠️ [UNIFIED CACHE] Configuração não encontrada para: ${key}`);
      return;
    }

    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        version: '1.0',
        checksum: this.generateChecksum(data)
      };

      // Salvar na camada apropriada
      switch (config.storage) {
        case 'memory':
          this.memoryCache.set(key, cacheItem);
          break;
        case 'localstorage':
          this.saveToLocalStorage(key, cacheItem);
          break;
        case 'indexeddb':
          await this.saveToIndexedDB(key, cacheItem);
          break;
      }

      console.log(`💾 [UNIFIED CACHE] ${key} salvo no cache`);
    } catch (error) {
      console.error(`❌ [UNIFIED CACHE] Erro ao salvar ${key}:`, error);
    }
  }

  /**
   * Deletar dados do cache
   */
  async delete(key: string): Promise<void> {
    const config = this.configs.get(key);
    if (!config) return;

    try {
      switch (config.storage) {
        case 'memory':
          this.memoryCache.delete(key);
          break;
        case 'localstorage':
          localStorage.removeItem(`ecofield_cache_${key}`);
          break;
        case 'indexeddb':
          await this.deleteFromIndexedDB(key);
          break;
      }

      console.log(`🗑️ [UNIFIED CACHE] ${key} removido do cache`);
    } catch (error) {
      console.error(`❌ [UNIFIED CACHE] Erro ao deletar ${key}:`, error);
    }
  }

  /**
   * Limpar cache expirado
   */
  async cleanup(): Promise<void> {
    console.log('🧹 [UNIFIED CACHE] Iniciando limpeza...');

    // Limpar memória
    for (const [key, item] of this.memoryCache.entries()) {
      const config = this.configs.get(key);
      if (config && this.isExpired(item.timestamp, config.ttl)) {
        this.memoryCache.delete(key);
      }
    }

    // Limpar localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith('ecofield_cache_')) {
        try {
          const cacheKey = key.replace('ecofield_cache_', '');
          const config = this.configs.get(cacheKey);
          if (config) {
            const item = JSON.parse(localStorage.getItem(key) || '{}');
            if (this.isExpired(item.timestamp, config.ttl)) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          console.error('❌ [UNIFIED CACHE] Erro ao limpar localStorage:', error);
        }
      }
    }

    // Limpar IndexedDB
    try {
      await this.cleanupIndexedDB();
    } catch (error) {
      console.error('❌ [UNIFIED CACHE] Erro ao limpar IndexedDB:', error);
    }

    console.log('✅ [UNIFIED CACHE] Limpeza concluída');
  }

  /**
   * Forçar atualização de todos os caches
   */
  async refreshAll(): Promise<void> {
    console.log('🔄 [UNIFIED CACHE] Atualizando todos os caches...');
    
    // Limpar memória
    this.memoryCache.clear();
    
    // Limpar localStorage (exceto dados críticos)
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith('ecofield_cache_')) {
        localStorage.removeItem(key);
      }
    }
    
    // Limpar IndexedDB
    try {
      await this.cleanupIndexedDB();
    } catch (error) {
      console.error('❌ [UNIFIED CACHE] Erro ao limpar IndexedDB:', error);
    }
    
    console.log('✅ [UNIFIED CACHE] Todos os caches atualizados');
  }

  async getCachedData<T>(key: string, fetchFn?: () => Promise<T>): Promise<T> {
    console.log(`🔍 [UNIFIED CACHE] Buscando dados para: ${key}`);
    
    // Verificar se está online
    const isOnline = navigator.onLine;
    
    // Caso especial para usuários (MIGRADO: usar Backend API com dados completos)
    if (key === 'usuarios') {
      console.log(`👥 [UNIFIED CACHE] Buscando usuários completos via Backend API`);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/perfis/usuarios-completos`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log(`✅ [UNIFIED CACHE] Usuários completos carregados: ${result.usuarios?.length || 0}`);
        
        // Salvar no cache
        await this.set(key, result.usuarios);
        return result.usuarios as T;
      } catch (error) {
        console.error(`❌ [UNIFIED CACHE] Erro ao buscar usuários completos:`, error);
        return [] as T;
      }
    }
    
    // Primeiro tentar buscar do cache
    const cachedData = await this.get<T>(key);
    
    if (cachedData) {
      console.log(`✅ [UNIFIED CACHE] Dados encontrados no cache: ${key}`);
      return cachedData;
    }
    
    // Se não encontrou no cache e tem função de fetch E está online, buscar e salvar
    if (fetchFn && isOnline) {
      console.log(`🌐 [UNIFIED CACHE] Buscando dados online: ${key}`);
      try {
        const freshData = await fetchFn();
        await this.set(key, freshData);
        return freshData;
      } catch (error) {
        console.error(`❌ [UNIFIED CACHE] Erro ao buscar dados online: ${key}`, error);
        return [] as T;
      }
    }
    
    // Se offline ou não tem função de fetch, retornar array vazio
    if (!isOnline) {
      console.log(`📱 [UNIFIED CACHE] Offline - dados não encontrados no cache: ${key}`);
    } else {
      console.log(`❌ [UNIFIED CACHE] Dados não encontrados: ${key}`);
    }
    return [] as T;
  }

  async refreshCache(key: string): Promise<void> {
    console.log(`🔄 [UNIFIED CACHE] Atualizando cache: ${key}`);
    await this.delete(key);
  }

  // Métodos auxiliares
  private isExpired(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp > ttl;
  }

  private generateChecksum(data: any): string {
    return btoa(JSON.stringify(data)).slice(0, 8);
  }

  private getFromLocalStorage<T>(key: string): CacheItem<T> | null {
    try {
      const data = localStorage.getItem(`ecofield_cache_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`❌ [UNIFIED CACHE] Erro ao ler localStorage:`, error);
      return null;
    }
  }

  private saveToLocalStorage<T>(key: string, item: CacheItem<T>): void {
    try {
      localStorage.setItem(`ecofield_cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.error(`❌ [UNIFIED CACHE] Erro ao salvar localStorage:`, error);
    }
  }

  private async getFromIndexedDB<T>(key: string): Promise<CacheItem<T> | null> {
    try {
      // Verificar se o banco está disponível
      if (!offlineDB) {
        console.warn(`⚠️ [UNIFIED CACHE] IndexedDB não inicializado para ${key}`);
        return null;
      }

      // Tentar abrir o banco se não estiver aberto
      if (!offlineDB.isOpen()) {
        try {
          await offlineDB.open();
        } catch (error) {
          console.warn(`⚠️ [UNIFIED CACHE] Não foi possível abrir IndexedDB para ${key}:`, error);
          return null;
        }
      }

      // Usar tabela apropriada baseada na key
      switch (key) {
        case 'areas': {
          const areas = await offlineDB.areas.toArray();
          return areas.length > 0 ? {
            data: areas as T,
            timestamp: Date.now(),
            version: '1.0'
          } : null;
        }
        case 'usuarios': {
          // MIGRADO: Usuários agora vêm do Auth do Supabase
          console.log('⚠️ [UNIFIED CACHE] Usuários migrados para Auth - usando API');
          return null;
        }
        case 'empresas_contratadas': {
          const empresas = await offlineDB.empresas_contratadas.toArray();
          return empresas.length > 0 ? {
            data: empresas as T,
            timestamp: Date.now(),
            version: '1.0'
          } : null;
        }
        case 'categorias_lv': {
          const categorias = await offlineDB.categorias_lv.toArray();
          return categorias.length > 0 ? {
            data: categorias as T,
            timestamp: Date.now(),
            version: '1.0'
          } : null;
        }
        case 'encarregados': {
          const encarregados = await offlineDB.encarregados.toArray();
          return encarregados.length > 0 ? {
            data: encarregados as T,
            timestamp: Date.now(),
            version: '1.0'
          } : null;
        }
        default:
          return null;
      }
    } catch (error) {
      console.error(`❌ [UNIFIED CACHE] Erro ao ler IndexedDB:`, error);
      return null;
    }
  }

  private async saveToIndexedDB<T>(key: string, item: CacheItem<T>): Promise<void> {
    try {
      // Verificar se o banco está disponível
      if (!offlineDB) {
        console.warn(`⚠️ [UNIFIED CACHE] IndexedDB não inicializado para ${key}`);
        return;
      }

      // Tentar abrir o banco se não estiver aberto
      if (!offlineDB.isOpen()) {
        try {
          await offlineDB.open();
        } catch (error) {
          console.warn(`⚠️ [UNIFIED CACHE] Não foi possível abrir IndexedDB para ${key}:`, error);
          return;
        }
      }

      // Limpar dados existentes e inserir novos
      switch (key) {
        case 'areas':
          await offlineDB.areas.clear();
          if (Array.isArray(item.data)) {
            await offlineDB.areas.bulkAdd(item.data as any[]);
          }
          break;
        case 'usuarios':
          // MIGRADO: Usuários agora vêm do Auth do Supabase
          console.log('⚠️ [UNIFIED CACHE] Usuários migrados para Auth - ignorando salvamento local');
          break;
        case 'empresas_contratadas':
          await offlineDB.empresas_contratadas.clear();
          if (Array.isArray(item.data)) {
            await offlineDB.empresas_contratadas.bulkAdd(item.data as any[]);
          }
          break;
        case 'categorias_lv':
          await offlineDB.categorias_lv.clear();
          if (Array.isArray(item.data)) {
            await offlineDB.categorias_lv.bulkAdd(item.data as any[]);
          }
          break;
        case 'encarregados':
          await offlineDB.encarregados.clear();
          if (Array.isArray(item.data)) {
            await offlineDB.encarregados.bulkAdd(item.data as any[]);
          }
          break;
        default:
          console.warn(`⚠️ [UNIFIED CACHE] Chave não suportada para IndexedDB: ${key}`);
      }
    } catch (error) {
      console.error(`❌ [UNIFIED CACHE] Erro ao salvar IndexedDB:`, error);
      // Não re-throw para evitar quebrar o fluxo
    }
  }

  private async deleteFromIndexedDB(key: string): Promise<void> {
    try {
      // Verificar se o banco está disponível
      if (!offlineDB) {
        console.warn(`⚠️ [UNIFIED CACHE] IndexedDB não inicializado para ${key}`);
        return;
      }

      // Tentar abrir o banco se não estiver aberto
      if (!offlineDB.isOpen()) {
        try {
          await offlineDB.open();
        } catch (error) {
          console.warn(`⚠️ [UNIFIED CACHE] Não foi possível abrir IndexedDB para ${key}:`, error);
          return;
        }
      }

      switch (key) {
        case 'areas':
          await offlineDB.areas.clear();
          break;
        case 'usuarios':
          // MIGRADO: Usuários agora vêm do Auth do Supabase
          console.log('⚠️ [UNIFIED CACHE] Usuários migrados para Auth - ignorando limpeza local');
          break;
        case 'empresas_contratadas':
          await offlineDB.empresas_contratadas.clear();
          break;
        case 'categorias_lv':
          await offlineDB.categorias_lv.clear();
          break;
        case 'encarregados':
          await offlineDB.encarregados.clear();
          break;
      }
    } catch (error) {
      console.error(`❌ [UNIFIED CACHE] Erro ao deletar do IndexedDB:`, error);
    }
  }

  private async cleanupIndexedDB(): Promise<void> {
    try {
      await offlineDB.areas.clear();
      // MIGRADO: Usuários agora vêm do Auth do Supabase
      await offlineDB.empresas_contratadas.clear();
      await offlineDB.categorias_lv.clear();
      await offlineDB.encarregados.clear();
    } catch (error) {
      console.error('❌ [UNIFIED CACHE] Erro ao limpar IndexedDB:', error);
    }
  }

  private startCleanupInterval(): void {
    // Limpar cache a cada hora
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }
}

// Instância singleton
export const unifiedCache = UnifiedCache.getInstance();

// Funções de conveniência
export const getCachedData = <T>(key: string): Promise<T | null> => {
  return unifiedCache.get<T>(key);
};

export const setCachedData = <T>(key: string, data: T): Promise<void> => {
  return unifiedCache.set<T>(key, data);
};

export const clearCache = (key?: string): Promise<void> => {
  if (key) {
    return unifiedCache.delete(key);
  } else {
    return unifiedCache.refreshAll();
  }
}; 