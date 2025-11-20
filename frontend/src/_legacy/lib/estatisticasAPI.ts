// ===================================================================
// API DE ESTATÍSTICAS VIA BACKEND - ECOFIELD SYSTEM
// Localização: src/lib/estatisticasAPI.ts
// ===================================================================


import { EcoFieldDB } from './offline/database';
import type { UserData } from '../types/entities';
import { getAuthToken } from '../utils/authUtils';

const API_URL = import.meta.env.VITE_API_URL;

export interface DashboardStats {
  // LVs (Listas de Verificação)
  lvsPendentes: number;
  lvsCompletas: number;
  lvsNaoConformes: number;
  lvsPercentualConformidade: number;
  
  // Termos Ambientais
  total_termos: number;
  termosPendentes: number;
  termosCorrigidos: number;
  paralizacoes: number;
  notificacoes: number;
  total_recomendacoes: number;
  
  // Rotinas/Atividades
  rotinasHoje: number;
  rotinasMes: number;
  itensEmitidos: number;
  tempoMedio: number;
  
  loading: boolean;
  lastUpdated?: string;
  isOffline?: boolean;
}

export const estatisticasAPI = {
  // Buscar estatísticas do dashboard
  async buscarEstatisticasDashboard(user: UserData): Promise<DashboardStats> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/estatisticas/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const stats = await response.json();
      console.log('✅ [ESTATÍSTICAS API] Estatísticas carregadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ [ESTATÍSTICAS API] Erro ao buscar estatísticas:', error);
      
      // Fallback para dados offline se disponível
      try {
        const db = new EcoFieldDB();
        const cachedStats = await db.get('dashboard_stats', user.id);
        if (cachedStats) {
          console.log('📱 [ESTATÍSTICAS API] Usando dados em cache');
          return {
            ...cachedStats,
            isOffline: true,
            lastUpdated: new Date().toISOString()
          };
        }
      } catch (cacheError) {
        console.warn('⚠️ [ESTATÍSTICAS API] Erro ao buscar cache:', cacheError);
      }

      // Retornar estatísticas vazias em caso de erro
      return {
        lvsPendentes: 0,
        lvsCompletas: 0,
        lvsNaoConformes: 0,
        lvsPercentualConformidade: 0,
        total_termos: 0,
        termosPendentes: 0,
        termosCorrigidos: 0,
        paralizacoes: 0,
        notificacoes: 0,
        total_recomendacoes: 0,
        rotinasHoje: 0,
        rotinasMes: 0,
        itensEmitidos: 0,
        tempoMedio: 0,
        loading: false,
        isOffline: true,
        lastUpdated: new Date().toISOString()
      };
    }
  },

  // Buscar estatísticas específicas de LVs
  async buscarEstatisticasLVs(user: UserData, tipo_lv?: string): Promise<any> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const params = new URLSearchParams();
      if (tipo_lv) {
        params.append('tipo_lv', tipo_lv);
      }

      const response = await fetch(`${API_URL}/api/estatisticas/lvs?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const stats = await response.json();
      console.log('✅ [ESTATÍSTICAS API] Estatísticas de LVs carregadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ [ESTATÍSTICAS API] Erro ao buscar estatísticas de LVs:', error);
      return {
        total: 0,
        pendentes: 0,
        completas: 0,
        naoConformes: 0,
        percentualConformidade: 0
      };
    }
  },

  // Buscar estatísticas específicas de Termos
  async buscarEstatisticasTermos(user: UserData, status?: string, tipo_termo?: string): Promise<any> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const params = new URLSearchParams();
      if (status) {
        params.append('status', status);
      }
      if (tipo_termo) {
        params.append('tipo_termo', tipo_termo);
      }

      const response = await fetch(`${API_URL}/api/estatisticas/termos?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const stats = await response.json();
      console.log('✅ [ESTATÍSTICAS API] Estatísticas de Termos carregadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ [ESTATÍSTICAS API] Erro ao buscar estatísticas de Termos:', error);
      return {
        total: 0,
        pendentes: 0,
        corrigidos: 0,
        paralizacoes: 0,
        notificacoes: 0,
        recomendacoes: 0
      };
    }
  },

  // Buscar estatísticas específicas de Rotinas
  async buscarEstatisticasRotinas(user: UserData, data_inicio?: string, data_fim?: string): Promise<any> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const params = new URLSearchParams();
      if (data_inicio) {
        params.append('data_inicio', data_inicio);
      }
      if (data_fim) {
        params.append('data_fim', data_fim);
      }

      const response = await fetch(`${API_URL}/api/estatisticas/rotinas?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const stats = await response.json();
      console.log('✅ [ESTATÍSTICAS API] Estatísticas de Rotinas carregadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ [ESTATÍSTICAS API] Erro ao buscar estatísticas de Rotinas:', error);
      return {
        total: 0,
        hoje: 0,
        itensEmitidos: 0,
        tempoMedio: 0
      };
    }
  }
}; 