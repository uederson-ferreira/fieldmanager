// ===================================================================
// HOOK PARA CONTROLE DE VERSÃO DO APP - ECOFIELD
// Localização: src/hooks/useAppVersion.ts
// Módulo: Sistema de verificação e notificação de atualizações
// ===================================================================

import { useState, useEffect, useCallback } from 'react';
import { getCurrentVersion, updateVersion } from '../config/version';

interface AppVersion {
  current: string;
  latest: string;
  buildDate: string;
  changelog?: string;
}

interface UseAppVersionOptions {
  checkInterval?: number; // em milissegundos
  autoCheck?: boolean;
  showNotification?: boolean;
}

export const useAppVersion = (options: UseAppVersionOptions = {}) => {
  const {
    //checkInterval = 30 * 60 * 1000, // 30 minutos (aumentado para reduzir spam)
    //autoCheck = false, // DESABILITADO para evitar loop
    showNotification = true
  } = options;

  const [version, setVersion] = useState<AppVersion | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Versão atual do app
  const currentVersion = getCurrentVersion();
  const buildDate = import.meta.env.VITE_APP_BUILD_DATE || new Date().toISOString();

  // Verificar se há atualização disponível
  const checkForUpdates = useCallback(async (force: boolean = false) => {
    if (checking && !force) return;

    setChecking(true);
    // Log reduzido - apenas em desenvolvimento
    // if (import.meta.env.DEV) {
    //   console.log('🔍 [APP VERSION] Verificando atualizações...');
    // }

    try {
      // Determinar URL da API baseada no ambiente
      const apiUrl = import.meta.env.DEV 
        ? `${import.meta.env.VITE_API_URL}/api/version`
        : '/api/version';

      // Buscar versão mais recente do servidor
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'x-client-version': currentVersion
        }
      });

      if (response.ok) {
        const latestVersion: AppVersion = await response.json();
        
        const isUpdateAvailable = latestVersion.latest !== currentVersion;
        
        setVersion({
          current: currentVersion,
          latest: latestVersion.latest,
          buildDate: buildDate,
          changelog: latestVersion.changelog
        });
        
        setUpdateAvailable(isUpdateAvailable);
        setLastCheck(new Date());

        if (isUpdateAvailable && showNotification) {
          showUpdateNotification(latestVersion);
        }

        // Log reduzido - apenas em desenvolvimento
        // if (import.meta.env.DEV) {
        //   console.log(`✅ [APP VERSION] Verificação concluída - Atualização ${isUpdateAvailable ? 'disponível' : 'não disponível'}`);
        // }
      } else {
        // Apenas log de erro em desenvolvimento
        // if (import.meta.env.DEV) {
        //   console.warn('⚠️ [APP VERSION] Erro ao verificar versão:', response.status);
        // }
      }
    } catch (error) {
      // Log silencioso em produção
      // if (import.meta.env.DEV) {
      //   console.log('ℹ️ [APP VERSION] API de versão não disponível - continuando normalmente');
      // }
    } finally {
      setChecking(false);
    }
  }, [currentVersion, buildDate, checking, showNotification]);

  // Mostrar notificação de atualização
  const showUpdateNotification = useCallback((latestVersion: AppVersion) => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      // Verificar permissão de notificação
      if (Notification.permission === 'granted') {
        new Notification('EcoField - Nova Versão Disponível!', {
          body: `Versão ${latestVersion.latest} está disponível. Clique para atualizar.`,
          icon: '/icon.png',
          tag: 'app-update',
          requireInteraction: true
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            showUpdateNotification(latestVersion);
          }
        });
      }
    }

    // Mostrar toast/banner na interface
    showUpdateBanner(latestVersion);
  }, []);

  // Forçar atualização do app
  const forceUpdate = useCallback(() => {
    console.log('🔄 [APP VERSION] Forçando atualização...');
    
    // Mostrar loading
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'update-loading';
    loadingDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        color: white;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="text-align: center;">
          <div style="
            width: 50px;
            height: 50px;
            border: 3px solid #10b981;
            border-top: 3px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          "></div>
          <h3 style="margin: 0 0 10px; font-size: 18px;">Atualizando EcoField...</h3>
          <p style="margin: 0; opacity: 0.8; font-size: 14px;">Aguarde enquanto baixamos a nova versão</p>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(loadingDiv);
    
    // Limpar todos os caches
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      });
    }

    // Limpar localStorage (exceto dados críticos)
    const criticalKeys = ['ecofield_auth', 'ecofield_user'];
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && !criticalKeys.some(critical => key.includes(critical))) {
        localStorage.removeItem(key);
      }
    }

    // Marcar que foi atualizado
    localStorage.setItem('ecofield_last_update', Date.now().toString());
    updateVersion('1.4.1'); // Simular atualização da versão
    
    // Limpar dados de autenticação para forçar novo login
    localStorage.removeItem('ecofield_auth_v2');
    localStorage.removeItem('ecofield_last_auth_check');
    localStorage.removeItem('ecofield_last_auth_event');
    
    // Aguardar um pouco e recarregar página
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }, []);

  // Mostrar banner de atualização na interface
  const showUpdateBanner = useCallback((latestVersion: AppVersion) => {
    // Verificar se já foi mostrado nesta sessão
    const bannerShown = sessionStorage.getItem('ecofield_update_banner_shown');
    if (bannerShown === latestVersion.latest) {
      console.log('🔄 [APP VERSION] Banner já mostrado para esta versão');
      return;
    }
    
    // Marcar que foi mostrado
    sessionStorage.setItem('ecofield_update_banner_shown', latestVersion.latest);
    
    // Remover banner existente se houver
    const existingBanner = document.getElementById('app-update-banner');
    if (existingBanner) {
      existingBanner.remove();
    }

    // Criar banner de atualização
    const banner = document.createElement('div');
    banner.id = 'app-update-banner';
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 12px 16px;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        font-family: system-ui, -apple-system, sans-serif;
        animation: slideDown 0.3s ease-out;
      ">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-weight: 600;">🔄 Nova versão disponível!</span>
          <span style="font-size: 14px; opacity: 0.9;">v${latestVersion.latest}</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="update-now" style="
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
          " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">Atualizar Agora</button>
          <button id="update-later" style="
            background: transparent;
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
          " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">Depois</button>
        </div>
      </div>
      <style>
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
      </style>
    `;

    document.body.appendChild(banner);

    // Event listeners com melhor tratamento
    const updateNowBtn = document.getElementById('update-now');
    const updateLaterBtn = document.getElementById('update-later');

    if (updateNowBtn) {
      updateNowBtn.addEventListener('click', () => {
        console.log('🔄 [APP VERSION] Usuário clicou em "Atualizar Agora"');
        forceUpdate();
      });
    }

    if (updateLaterBtn) {
      updateLaterBtn.addEventListener('click', () => {
        console.log('🔄 [APP VERSION] Usuário clicou em "Depois"');
        banner.remove();
      });
    }

    // Auto-remover após 30 segundos
    setTimeout(() => {
      if (document.getElementById('app-update-banner')) {
        banner.remove();
      }
    }, 30000);
  }, [forceUpdate]);

  // Verificação inicial ao carregar o app
  useEffect(() => {
    // ✅ DESABILITADO DURANTE LOGIN PARA EVITAR CONFLITOS
    console.log('🔄 [APP VERSION] Verificação de versão desabilitada durante login');
  }, []); // Array vazio = executa apenas uma vez

  // Listener para atualizações do Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 [APP VERSION] Service Worker atualizado');
        setUpdateAvailable(false);
        // Recarregar após um breve delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      });
    }
  }, []);

  // Função manual para testar atualização
  const testUpdate = useCallback(() => {
    console.log('🧪 [APP VERSION] Testando atualização manualmente...');
    checkForUpdates(true);
  }, [checkForUpdates]);

  return {
    version,
    updateAvailable,
    checking,
    lastCheck,
    currentVersion,
    checkForUpdates,
    forceUpdate,
    showUpdateBanner,
    testUpdate // Exportar função de teste
  };
};

  // Hook simplificado para componentes
  export const useVersionCheck = () => {
    const { updateAvailable, forceUpdate, checkForUpdates, currentVersion, testUpdate } = useAppVersion({
      autoCheck: false, // DESABILITADO para evitar loop
      showNotification: true // REABILITADO com proteção contra loop
    });

    return { updateAvailable, forceUpdate, checkForUpdates, currentVersion, testUpdate };
  }; 