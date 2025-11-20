import React from 'react';
import { RefreshCw, Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useLVSyncStatus } from '../../hooks/useLVSyncStatus';

interface SyncButtonProps {
  className?: string;
  showDetails?: boolean;
}

export const SyncButton: React.FC<SyncButtonProps> = ({
  className = '',
  showDetails = true
}) => {
  const {
    isOnline,
    pendingCount,
    termosPendentes,
    rotinasPendentes,
    lvsPendentes,
    syncing,
    lastSyncResult,
    syncNow
  } = useLVSyncStatus();

  const handleSync = async () => {
    if (syncing || !isOnline) return;

    try {
      const result = await syncNow();

      // Se houve erro de autenticação, avisar o usuário
      if (result && result.erros > 0) {
        alert('⚠️ Alguns itens não puderam ser sincronizados.\n\nSe você vê a mensagem "Sessão expirada", faça logout e login novamente para atualizar sua sessão.');
      }
    } catch (error) {
      console.error('❌ [SYNC BUTTON] Erro na sincronização:', error);

      // Se for erro de sessão expirada, mostrar mensagem específica
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Sessão expirada') || errorMessage.includes('401')) {
        alert('🔒 Sessão Expirada\n\nSua sessão expirou. Por favor, faça logout e login novamente para sincronizar seus dados.');
      } else {
        alert(`❌ Erro na sincronização:\n\n${errorMessage}`);
      }
    }
  };

  // Se não há nada pendente e não está sincronizando, não mostrar nada
  if (pendingCount === 0 && !syncing && !lastSyncResult) {
    return null;
  }

  return (
    <div className={`${className}`}>
      {/* Botão principal de sincronização */}
      <button
        onClick={handleSync}
        disabled={syncing || !isOnline}
        className={`
          relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium
          transition-all duration-200 shadow-sm
          ${syncing || !isOnline
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : pendingCount > 0
              ? 'bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700'
              : 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700'
          }
        `}
      >
        {/* Ícone de status */}
        {!isOnline ? (
          <WifiOff className="h-5 w-5" />
        ) : syncing ? (
          <RefreshCw className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
        ) : pendingCount > 0 ? (
          <AlertCircle className="h-5 w-5" />
        ) : (
          <CheckCircle className="h-5 w-5" />
        )}

        {/* Texto do botão */}
        <span className="text-sm font-semibold">
          {!isOnline ? (
            'Offline'
          ) : syncing ? (
            'Sincronizando...'
          ) : pendingCount > 0 ? (
            `Sincronizar (${pendingCount})`
          ) : (
            'Sincronizado'
          )}
        </span>

        {/* Badge de pendências */}
        {pendingCount > 0 && !syncing && isOnline && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-yellow-600 text-white text-xs items-center justify-center font-bold">
              {pendingCount}
            </span>
          </span>
        )}
      </button>

      {/* Detalhes da sincronização */}
      {showDetails && pendingCount > 0 && isOnline && (
        <div className="mt-2 text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Aguardando sincronização:</span>
                <span className="font-bold text-yellow-600">{pendingCount} itens</span>
              </div>

              {/* Breakdown por tipo */}
              <div className="mt-1 space-y-0.5 text-gray-500">
                {termosPendentes > 0 && (
                  <div className="flex justify-between">
                    <span>• Termos Ambientais:</span>
                    <span className="font-medium">{termosPendentes}</span>
                  </div>
                )}
                {rotinasPendentes > 0 && (
                  <div className="flex justify-between">
                    <span>• Atividades de Rotina:</span>
                    <span className="font-medium">{rotinasPendentes}</span>
                  </div>
                )}
                {lvsPendentes > 0 && (
                  <div className="flex justify-between">
                    <span>• Listas de Verificação:</span>
                    <span className="font-medium">{lvsPendentes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resultado da última sincronização */}
      {lastSyncResult && lastSyncResult.sincronizados > 0 && (
        <div className="mt-2 text-xs bg-green-50 border border-green-200 rounded-lg p-2 flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-green-800 font-medium">
              Sincronização concluída!
            </p>
            <p className="text-green-600 mt-0.5">
              {lastSyncResult.sincronizados} item(ns) enviado(s) ao servidor
            </p>
            {lastSyncResult.erros > 0 && (
              <p className="text-red-600 mt-0.5">
                {lastSyncResult.erros} erro(s) encontrado(s)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Status offline */}
      {!isOnline && (
        <div className="mt-2 text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 flex items-start gap-2">
          <WifiOff className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-gray-700 font-medium">
              Modo offline
            </p>
            <p className="text-gray-600 mt-0.5">
              Os dados serão sincronizados quando a conexão for restaurada
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
