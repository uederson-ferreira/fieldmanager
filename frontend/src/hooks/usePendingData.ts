// ===================================================================
// USE PENDING DATA - ECOFIELD SYSTEM
// Localização: src/hooks/usePendingData.ts
// Hook: Verificar dados pendentes de sincronização
// ===================================================================

import { useState, useEffect, useCallback } from 'react';
import { TermoManager } from '../lib/offline/entities/managers/TermoManager';
import { LVManager } from '../lib/offline/entities/managers/LVManager';
import { AtividadeRotinaManager } from '../lib/offline/entities/managers/AtividadeRotinaManager';
import { InspecaoManager } from '../lib/offline/entities/managers/InspecaoManager';

export interface PendingSyncData {
  termos: number;
  lvs: number;
  rotinas: number;
  inspecoes: number;
  total: number;
  hasData: boolean;
}

/**
 * Hook para verificar dados pendentes de sincronização no IndexedDB
 */
export const usePendingData = () => {
  const [pending, setPending] = useState<PendingSyncData>({
    termos: 0,
    lvs: 0,
    rotinas: 0,
    inspecoes: 0,
    total: 0,
    hasData: false
  });

  const [loading, setLoading] = useState(true);

  /**
   * Verificar contagem de dados pendentes
   */
  const checkPending = useCallback(async () => {
    try {
      setLoading(true);

      // ✅ UNIFICAÇÃO: LVManager agora inclui todos os tipos de LV (incluindo resíduos)
      // Buscar contagem de cada tipo de entidade pendente
      const [termos, lvs, rotinas, inspecoes] = await Promise.all([
        TermoManager.countPendentes(),
        LVManager.countPendentes(), // Agora inclui LVs de resíduos com tipo_lv='residuos'
        AtividadeRotinaManager.countPendentes(),
        InspecaoManager.countPendentes()
      ]);

      const total = termos + lvs + rotinas + inspecoes;

      const newPending: PendingSyncData = {
        termos,
        lvs,
        rotinas,
        inspecoes,
        total,
        hasData: total > 0
      };

      setPending(newPending);

      console.log('📊 [PENDING DATA] Contagem de dados pendentes:', newPending);

      return newPending;
    } catch (error) {
      console.error('❌ [PENDING DATA] Erro ao verificar dados pendentes:', error);
      return pending;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar na montagem
  useEffect(() => {
    checkPending();
  }, [checkPending]);

  /**
   * Obter mensagem formatada dos dados pendentes
   */
  const getPendingMessage = (): string => {
    if (!pending.hasData) {
      return 'Não há dados pendentes de sincronização';
    }

    const parts: string[] = [];

    if (pending.termos > 0) {
      parts.push(`${pending.termos} termo${pending.termos > 1 ? 's' : ''}`);
    }
    if (pending.lvs > 0) {
      // ✅ UNIFICAÇÃO: LVs agora incluem todos os tipos (incluindo resíduos)
      parts.push(`${pending.lvs} LV${pending.lvs > 1 ? 's' : ''}`);
    }
    if (pending.rotinas > 0) {
      parts.push(`${pending.rotinas} atividade${pending.rotinas > 1 ? 's' : ''} de rotina`);
    }
    if (pending.inspecoes > 0) {
      parts.push(`${pending.inspecoes} inspeç${pending.inspecoes > 1 ? 'ões' : 'ão'}`);
    }

    if (parts.length === 0) {
      return 'Não há dados pendentes de sincronização';
    }

    if (parts.length === 1) {
      return `Você tem ${parts[0]} pendente${pending.total > 1 ? 's' : ''} de sincronização`;
    }

    const lastPart = parts.pop();
    return `Você tem ${parts.join(', ')} e ${lastPart} pendentes de sincronização`;
  };

  /**
   * Verificar se é seguro fazer logout
   */
  const canLogout = (): { safe: boolean; message?: string } => {
    if (!pending.hasData) {
      return { safe: true };
    }

    return {
      safe: false,
      message: `${getPendingMessage()}. Se fizer logout agora, esses dados serão perdidos. Deseja sincronizar antes de sair?`
    };
  };

  return {
    pending,
    loading,
    checkPending,
    getPendingMessage,
    canLogout
  };
};
