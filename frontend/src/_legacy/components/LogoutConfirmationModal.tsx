// ===================================================================
// LOGOUT CONFIRMATION MODAL - ECOFIELD SYSTEM
// Localização: src/components/common/LogoutConfirmationModal.tsx
// Componente: Modal de confirmação de logout com dados pendentes
// ===================================================================

import React from 'react';
import type { PendingSyncData } from '../../hooks/usePendingData';

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  pendingData: PendingSyncData;
  onConfirmLogout: () => void;
  onSyncFirst: () => void;
  onCancel: () => void;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  isOpen,
  pendingData,
  onConfirmLogout,
  onSyncFirst,
  onCancel
}) => {
  if (!isOpen) return null;

  const getPendingItems = () => {
    const items: Array<{ label: string; count: number }> = [];

    if (pendingData.termos > 0) {
      items.push({ label: 'Termos Ambientais', count: pendingData.termos });
    }
    if (pendingData.lvs > 0) {
      // ✅ UNIFICAÇÃO: LVs agora incluem todos os tipos (incluindo resíduos)
      items.push({ label: 'Listas de Verificação', count: pendingData.lvs });
    }
    if (pendingData.rotinas > 0) {
      items.push({ label: 'Atividades de Rotina', count: pendingData.rotinas });
    }
    if (pendingData.inspecoes > 0) {
      items.push({ label: 'Inspeções', count: pendingData.inspecoes });
    }

    return items;
  };

  const pendingItems = getPendingItems();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-red-500 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Dados Pendentes de Sincronização
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-gray-700 font-medium mb-2">
              ⚠️ Você possui dados que ainda não foram sincronizados:
            </p>

            {/* Pending Items List */}
            <ul className="space-y-1 ml-4">
              {pendingItems.map((item, index) => (
                <li key={index} className="text-gray-700">
                  <span className="font-semibold">{item.count}</span> {item.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>ATENÇÃO:</strong> Se você fizer logout agora sem sincronizar, esses dados
              serão <strong className="text-red-600">perdidos permanentemente</strong>.
            </p>
          </div>

          {/* Recommendation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Recomendação:</strong> Sincronize seus dados antes de sair para garantir que
              tudo seja salvo no servidor.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-col gap-2">
          {/* Primary Action - Sync First (Recommended) */}
          <button
            onClick={onSyncFirst}
            className="w-full px-4 py-3 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Sincronizar Agora (Recomendado)
          </button>

          {/* Secondary Actions */}
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmLogout}
              className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Sair Mesmo Assim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
