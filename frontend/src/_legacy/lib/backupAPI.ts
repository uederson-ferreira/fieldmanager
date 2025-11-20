// ===================================================================
// API DE BACKUP VIA BACKEND - ECOFIELD SYSTEM
// Localização: src/lib/backupAPI.ts
// ===================================================================

import { getAuthToken } from '../utils/authUtils';

const API_URL = import.meta.env.VITE_API_URL;

export interface BackupTabela {
  nome: string;
  registros: number;
  tamanho: string;
}

export interface BackupCompleto {
  timestamp: string;
  tabelas: Record<string, any[]>;
  total_registros: number;
  tamanho_total: string;
}

export const backupAPI = {
  // Listar tabelas disponíveis para backup
  async listarTabelas(): Promise<{ success: boolean; data?: BackupTabela[]; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/backup/tabelas`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [BACKUP API] Tabelas listadas:', data.length);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [BACKUP API] Erro ao listar tabelas:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Exportar dados de uma tabela específica
  async exportarTabela(tabela: string, formato: 'csv' | 'json'): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/backup/${tabela}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ [BACKUP API] Tabela exportada:', tabela, 'registros:', result.dados?.length || 0);
      return { success: true, data: result.dados || [] };
    } catch (error) {
      console.error('❌ [BACKUP API] Erro ao exportar tabela:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Restaurar dados em uma tabela
  async restaurarTabela(tabela: string, dados: any[]): Promise<{ success: boolean; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/backup/${tabela}/restaurar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dados })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      console.log('✅ [BACKUP API] Tabela restaurada:', tabela);
      return { success: true };
    } catch (error) {
      console.error('❌ [BACKUP API] Erro ao restaurar tabela:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  // Backup completo do sistema
  async backupCompleto(): Promise<{ success: boolean; data?: BackupCompleto; error?: string }> {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_URL}/api/backup/completo/sistema`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [BACKUP API] Backup completo gerado:', data.timestamp);
      return { success: true, data };
    } catch (error) {
      console.error('❌ [BACKUP API] Erro ao gerar backup completo:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }
}; 