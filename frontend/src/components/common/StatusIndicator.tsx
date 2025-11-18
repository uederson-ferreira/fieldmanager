import React, { useState, useEffect, memo } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

interface StatusIndicatorProps {
  className?: string;
  showSyncStatus?: boolean;
}

interface NetworkStatus {
  online: boolean;
  lastCheck: Date;
  syncStatus: 'synced' | 'syncing' | 'error' | 'offline';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = memo(({ 
  className = '',
  showSyncStatus = true 
}) => {
  const [status, setStatus] = useState<NetworkStatus>({
    online: navigator.onLine,
    lastCheck: new Date(),
    syncStatus: navigator.onLine ? 'synced' : 'offline'
  });

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({
        ...prev,
        online: true,
        lastCheck: new Date(),
        syncStatus: 'syncing'
      }));
      
      // Simular sincronização
      setTimeout(() => {
        setStatus(prev => ({
          ...prev,
          syncStatus: 'synced'
        }));
      }, 2000);
    };

    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        online: false,
        lastCheck: new Date(),
        syncStatus: 'offline'
      }));
    };

    // Verificar conectividade periodicamente
    const checkConnectivity = async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        if (response.ok) {
          setStatus(prev => ({
            ...prev,
            online: true,
            lastCheck: new Date(),
            syncStatus: prev.syncStatus === 'offline' ? 'syncing' : prev.syncStatus
          }));
        } else {
          throw new Error('Server error');
        }
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          online: false,
          lastCheck: new Date(),
          syncStatus: 'error'
        }));
      }
    };

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificação periódica
    const interval = setInterval(checkConnectivity, 30000); // 30 segundos

    // Verificação inicial
    checkConnectivity();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = () => {
    if (!status.online) return 'text-red-600 bg-red-50 border-red-200';
    if (status.syncStatus === 'error') return 'text-orange-600 bg-orange-50 border-orange-200';
    if (status.syncStatus === 'syncing') return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusIcon = () => {
    if (!status.online) return <WifiOff className="h-4 w-4" />;
    if (status.syncStatus === 'error') return <AlertCircle className="h-4 w-4" />;
    if (status.syncStatus === 'syncing') return <Wifi className="h-4 w-4 animate-pulse" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!status.online) return 'Offline';
    if (status.syncStatus === 'error') return 'Erro de Conexão';
    if (status.syncStatus === 'syncing') return 'Sincronizando...';
    return 'Online';
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor()} ${className}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      
      {showSyncStatus && status.syncStatus === 'syncing' && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <span className="text-xs">Sync</span>
        </div>
      )}
    </div>
  );
});

StatusIndicator.displayName = 'StatusIndicator';

export default StatusIndicator; 