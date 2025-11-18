import { useEffect, useState, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { offlineDB } from '../lib/offline/database';
import { syncTermosAmbientaisOffline, syncAtividadesRotinaOffline } from '../lib/offline';
import { LVSync } from '../lib/offline/sync/syncers/LVSync';
import { useAuth } from './useAuth';

export function useLVSyncStatus() {
  const isOnline = useOnlineStatus();
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [termosPendentes, setTermosPendentes] = useState(0);
  const [rotinasPendentes, setRotinasPendentes] = useState(0);
  const [lvsPendentes, setLvsPendentes] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<{ total: number; sincronizados: number; erros: number; detalhes: Array<{ lvId: string; error?: unknown; status?: string }> } | null>(null);

  // ✅ Atualiza a contagem de pendências - TERMOS + ROTINAS + LVs DO USUÁRIO ATUAL
  const updatePendingCount = useCallback(async () => {
    try {
      if (!user?.id) {
        setPendingCount(0);
        return;
      }

      // ✅ Contar termos pendentes DO USUÁRIO ATUAL
      const termosCount = await offlineDB.termos_ambientais
        .filter(termo => termo.sincronizado === false)
        .count();

      // ✅ Contar rotinas pendentes DO USUÁRIO ATUAL
      const rotinasCount = await offlineDB.atividades_rotina
        .filter(atividade => atividade.sincronizado === false)
        .count();

      // ✅ Contar LVs pendentes DO USUÁRIO ATUAL
      const lvsCount = await offlineDB.lvs
        .filter(lv => lv.sincronizado === false)
        .count();

      const totalPendentes = termosCount + rotinasCount + lvsCount;

      console.log(`📊 [SYNC STATUS] Pendentes: ${termosCount} termos + ${rotinasCount} rotinas + ${lvsCount} LVs = ${totalPendentes} total`);
      console.log(`📊 [SYNC STATUS] Usuário atual: ${user.id}`);
      
      // Debug detalhado
      if (termosCount > 0) {
        const termosDetalhes = await offlineDB.termos_ambientais
          .filter(termo => termo.sincronizado === false)
          .toArray();
        console.log('🔍 [SYNC STATUS] Termos pendentes detalhes:', termosDetalhes.map(t => ({
          id: t.id,
          sincronizado: t.sincronizado,
          offline: t.offline
        })));
      }
      
      if (rotinasCount > 0) {
        const rotinasDetalhes = await offlineDB.atividades_rotina
          .filter(atividade => atividade.sincronizado === false)
          .toArray();
        console.log('🔍 [SYNC STATUS] Rotinas pendentes detalhes:', rotinasDetalhes.map(r => ({
          id: r.id,
          sincronizado: r.sincronizado,
          offline: r.offline
        })));
      }

      if (lvsCount > 0) {
        const lvsDetalhes = await offlineDB.lvs
          .filter(lv => lv.sincronizado === false)
          .toArray();
        console.log('🔍 [SYNC STATUS] LVs pendentes detalhes:', lvsDetalhes.map(lv => ({
          id: lv.id,
          tipo_lv: lv.tipo_lv,
          nome_lv: lv.nome_lv,
          sincronizado: lv.sincronizado,
          offline: lv.offline
        })));
      }

      setPendingCount(totalPendentes);
      setTermosPendentes(termosCount);
      setRotinasPendentes(rotinasCount);
      setLvsPendentes(lvsCount);
    } catch (error) {
      console.error('❌ [SYNC STATUS] Erro ao contar pendências:', error);
      setPendingCount(0);
    }
  }, [user?.id]);

  // ✅ Sincronização manual - TERMOS + ROTINAS + LVs
  const syncNow = useCallback(async () => {
    setSyncing(true);
    try {
      console.log('🔄 [SYNC STATUS] Iniciando sincronização completa (TERMOS + ROTINAS + LVs)...');

      let totalSincronizados = 0;
      let totalErros = 0;

      // ✅ Sincronizar termos ambientais
      const termosResult = await syncTermosAmbientaisOffline();
      if (termosResult.success) {
        totalSincronizados += termosResult.sincronizados;
        console.log(`✅ [SYNC STATUS] Termos sincronizados: ${termosResult.sincronizados}`);
      } else {
        totalErros += 1;
        console.error('❌ [SYNC STATUS] Erro ao sincronizar termos:', termosResult.error);
      }

      // ✅ Sincronizar atividades de rotina
      const rotinasResult = await syncAtividadesRotinaOffline();
      if (rotinasResult.success) {
        totalSincronizados += rotinasResult.sincronizados;
        console.log(`✅ [SYNC STATUS] Rotinas sincronizadas: ${rotinasResult.sincronizados}`);
      } else {
        totalErros += 1;
        console.error('❌ [SYNC STATUS] Erro ao sincronizar rotinas:', rotinasResult.error);
      }

      // ✅ Sincronizar LVs
      const lvsResult = await LVSync.syncAll();
      if (lvsResult.success) {
        totalSincronizados += lvsResult.sincronizadas;
        console.log(`✅ [SYNC STATUS] LVs sincronizadas: ${lvsResult.sincronizadas}`);
      } else {
        totalErros += 1;
        console.error('❌ [SYNC STATUS] Erro ao sincronizar LVs:', lvsResult.error);
      }

      setLastSyncResult({
        total: pendingCount,
        sincronizados: totalSincronizados,
        erros: totalErros,
        detalhes: []
      });
      await updatePendingCount();

      // Forçar atualização das listas
      window.dispatchEvent(new Event('termoSincronizado'));
      window.dispatchEvent(new Event('rotinaSincronizada'));
      window.dispatchEvent(new Event('lvSincronizada'));

      console.log('✅ [SYNC STATUS] Sincronização completa finalizada');
      return { 
        total: pendingCount, 
        sincronizados: totalSincronizados, 
        erros: totalErros, 
        detalhes: [] 
      };
    } catch (error) {
      console.error('❌ [SYNC STATUS] Erro na sincronização:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  }, [updatePendingCount, pendingCount]);

  // ❌ REMOVIDO: Sincronização automática ao voltar online (causava duplicação)
  // useEffect(() => {
  //   if (isOnline && pendingCount > 0) {
  //     console.log('🔄 [SYNC STATUS] Volta online detectada, sincronizando TERMOS automaticamente...');
  //     syncNow();
  //   }
  // }, [isOnline, pendingCount, syncNow]);

  // Atualiza contagem ao montar e após sincronizar
  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  return {
    isOnline,
    pendingCount,
    termosPendentes,
    rotinasPendentes,
    lvsPendentes,
    syncing,
    lastSyncResult,
    syncNow,
    updatePendingCount,
  };
} 